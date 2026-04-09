"""Менеджер HTTP-сессий FunPay.

Каждый ФП-аккаунт = своя aiohttp.ClientSession с собственными куками,
прокси и user-agent. Класс умеет:
  • логиниться по логину/паролю и доставать golden_key из cookies;
  • восстанавливать сессию из сохранённого golden_key;
  • переиспользовать соединение для всех запросов одного аккаунта.

Сами действия (поднять лот, написать в чат и т.д.) живут в funpay.api.
"""

from __future__ import annotations

import asyncio
import logging
from dataclasses import dataclass

import aiohttp
from yarl import URL

from config import FP_BASE_URL, FP_DEFAULT_UA, FP_REQUEST_TIMEOUT
from utils.helpers import parse_proxy, proxy_to_url

from .parser import parse_self_profile

logger = logging.getLogger(__name__)


def _dump_debug_html(html: str, tag: str) -> None:
    """Сохраняет HTML в .fp_debug_<tag>.html для разбора на что FunPay ответил.

    Тихо игнорирует ошибки записи.
    """
    try:
        from pathlib import Path

        path = Path(__file__).resolve().parents[1] / f".fp_debug_{tag}.html"
        path.write_text(html[:200_000], encoding="utf-8")
        logger.info("FP debug HTML dumped: %s", path)
    except Exception:  # noqa: BLE001
        pass


class FunPayAuthError(Exception):
    """Не удалось залогиниться (неверные креды/капча/блок IP)."""


class FunPayNetworkError(Exception):
    """Сетевая ошибка / прокси не работает."""


@dataclass
class SessionInfo:
    golden_key: str
    user_id: int | None
    username: str | None


class FunPaySession:
    """Обёртка над aiohttp.ClientSession для одного ФП-аккаунта."""

    def __init__(
        self,
        login: str,
        password: str,
        proxy: str | None = None,
        golden_key: str | None = None,
        user_agent: str | None = None,
    ) -> None:
        self.login = login
        self.password = password
        self.proxy_raw = proxy
        self.proxy = parse_proxy(proxy) if proxy else None
        self.proxy_url = proxy_to_url(self.proxy)
        self.golden_key = golden_key
        self.user_agent = user_agent or FP_DEFAULT_UA
        self._session: aiohttp.ClientSession | None = None
        self._lock = asyncio.Lock()
        self._csrf: str | None = None
        self._user_id: int | None = None
        self._username: str | None = None

    # ---------------------------------------------------------------- HTTP
    async def _ensure_session(self) -> aiohttp.ClientSession:
        if self._session and not self._session.closed:
            return self._session

        jar = aiohttp.CookieJar(unsafe=True)
        if self.golden_key:
            # Сразу подсовываем golden_key — это и есть PHPSESSID FunPay
            jar.update_cookies(
                {"golden_key": self.golden_key},
                response_url=URL(FP_BASE_URL),
            )

        timeout = aiohttp.ClientTimeout(total=FP_REQUEST_TIMEOUT)
        headers = {
            "User-Agent": self.user_agent,
            "Accept-Language": "ru,en;q=0.9",
            "Accept": (
                "text/html,application/xhtml+xml,application/xml;q=0.9,"
                "*/*;q=0.8"
            ),
        }
        self._session = aiohttp.ClientSession(
            cookie_jar=jar,
            timeout=timeout,
            headers=headers,
        )
        return self._session

    async def close(self) -> None:
        if self._session and not self._session.closed:
            await self._session.close()
        self._session = None

    async def request(
        self,
        method: str,
        path: str,
        *,
        data: dict | None = None,
        params: dict | None = None,
        allow_redirects: bool = True,
    ) -> tuple[int, str]:
        sess = await self._ensure_session()
        url = path if path.startswith("http") else f"{FP_BASE_URL}{path}"
        try:
            async with sess.request(
                method,
                url,
                data=data,
                params=params,
                proxy=self.proxy_url,
                allow_redirects=allow_redirects,
            ) as resp:
                text = await resp.text(errors="replace")
                return resp.status, text
        except aiohttp.ClientError as exc:
            raise FunPayNetworkError(str(exc)) from exc
        except TimeoutError as exc:
            raise FunPayNetworkError("timeout") from exc

    async def get(self, path: str, **kwargs) -> tuple[int, str]:
        return await self.request("GET", path, **kwargs)

    async def post(self, path: str, **kwargs) -> tuple[int, str]:
        return await self.request("POST", path, **kwargs)

    # ---------------------------------------------------------------- AUTH
    async def login_with_password(self) -> SessionInfo:
        """Логинится логином+паролем, возвращает свежий golden_key."""
        async with self._lock:
            from .parser import detect_cloudflare_block, extract_csrf

            # 0. Сначала GET / — получить стартовые cookies (FunPay их ставит
            #    на главной). Без этого страница логина иногда не отдаёт
            #    корректный csrf.
            status0, html0 = await self.get("/")
            cf_reason = detect_cloudflare_block(html0)
            if cf_reason:
                _dump_debug_html(html0, "fp_home")
                raise FunPayAuthError(
                    f"Cloudflare заблокировал FunPay ({cf_reason}). "
                    f"Попробуй без прокси или другой прокси (резидент РФ). "
                    f"HTML дампнут в .fp_debug_fp_home.html"
                )

            # Если на главной уже виден csrf — сразу используем его
            csrf = extract_csrf(html0)

            # 1. GET /account/login — форма
            status, html = await self.get("/account/login")
            if status >= 500:
                raise FunPayNetworkError(f"FunPay вернул {status}")

            cf_reason = detect_cloudflare_block(html)
            if cf_reason:
                _dump_debug_html(html, "fp_login")
                raise FunPayAuthError(
                    f"Cloudflare блокирует /account/login ({cf_reason}). "
                    f"Нужен другой прокси. HTML дампнут в .fp_debug_fp_login.html"
                )

            # Пытаемся достать csrf из страницы логина, если ещё не нашли
            if not csrf:
                csrf = extract_csrf(html)

            if not csrf:
                _dump_debug_html(html, "fp_login_no_csrf")
                logger.warning(
                    "CSRF not found. status=%s html_len=%d preview=%r",
                    status, len(html), html[:300].replace("\n", " "),
                )
                raise FunPayAuthError(
                    f"Не удалось найти CSRF-токен на странице логина "
                    f"(размер ответа: {len(html)} байт). "
                    f"Скорее всего прокси блокируется FunPay или вернулась "
                    f"не та страница. HTML дампнут в "
                    f".fp_debug_fp_login_no_csrf.html — посмотри что там."
                )

            # 2. POST /account/login
            # FunPay ожидает поле "csrf_token" (без подчёркивания) в payload.
            payload = {
                "csrf_token": csrf,
                "login": self.login,
                "password": self.password,
                "next": "/",
                "locale": "ru",
            }
            status, body = await self.post(
                "/account/login", data=payload, allow_redirects=False
            )

            if status not in (302, 303):
                # Может быть 200 с ошибкой в HTML, или 200 т.к. уже залогинены
                info = await self._refresh_self_info()
                if info:
                    return info

                # Достаём текст ошибки из формы
                from .parser import iter_error_messages

                errors = list(iter_error_messages(body))
                if errors:
                    raise FunPayAuthError(
                        f"FunPay вернул ошибку: {'; '.join(errors)}"
                    )

                _dump_debug_html(body, "fp_login_post")
                raise FunPayAuthError(
                    f"Неверный логин/пароль или нужна капча "
                    f"(статус ответа: {status}). Дамп в "
                    f".fp_debug_fp_login_post.html"
                )

            # 3. Достаём golden_key из cookies
            jar = self._session.cookie_jar if self._session else None
            golden = None
            if jar:
                for cookie in jar:
                    if cookie.key == "golden_key":
                        golden = cookie.value
                        break
            if not golden:
                raise FunPayAuthError(
                    "FunPay не отдал golden_key — возможно, нужна 2FA"
                )
            self.golden_key = golden

            info = await self._refresh_self_info()
            if not info:
                raise FunPayAuthError(
                    "Логин принят, но не удалось загрузить профиль"
                )
            return info

    async def restore(self) -> SessionInfo | None:
        """Пробует подцепиться по сохранённому golden_key.

        Возвращает SessionInfo если сессия живая, иначе None — вызывающий
        код должен дёрнуть login_with_password().
        """
        if not self.golden_key:
            return None
        return await self._refresh_self_info()

    async def _refresh_self_info(self) -> SessionInfo | None:
        status, html = await self.get("/")
        if status != 200:
            return None
        profile = parse_self_profile(html)
        self._csrf = None
        # Кэшируем csrf для последующих POST'ов
        from .parser import parse_csrf_token

        token = parse_csrf_token(html)
        if token:
            self._csrf = token
        if not profile.is_online or not profile.user_id:
            return None
        self._user_id = profile.user_id
        self._username = profile.username
        if not self.golden_key:
            jar = self._session.cookie_jar if self._session else None
            if jar:
                for cookie in jar:
                    if cookie.key == "golden_key":
                        self.golden_key = cookie.value
                        break
        return SessionInfo(
            golden_key=self.golden_key or "",
            user_id=profile.user_id,
            username=profile.username,
        )

    # ---------------------- свойства ----------------------------------------
    @property
    def csrf(self) -> str | None:
        return self._csrf

    @property
    def user_id(self) -> int | None:
        return self._user_id

    @property
    def username(self) -> str | None:
        return self._username
