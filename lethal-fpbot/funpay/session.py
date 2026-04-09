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

from .parser import find_form_field, parse_self_profile

logger = logging.getLogger(__name__)


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
        except asyncio.TimeoutError as exc:
            raise FunPayNetworkError("timeout") from exc

    async def get(self, path: str, **kwargs) -> tuple[int, str]:
        return await self.request("GET", path, **kwargs)

    async def post(self, path: str, **kwargs) -> tuple[int, str]:
        return await self.request("POST", path, **kwargs)

    # ---------------------------------------------------------------- AUTH
    async def login_with_password(self) -> SessionInfo:
        """Логинится логином+паролем, возвращает свежий golden_key."""
        async with self._lock:
            # 1. GET /account/login — забираем csrf
            status, html = await self.get("/account/login")
            if status >= 500:
                raise FunPayNetworkError(f"FunPay вернул {status}")

            csrf = find_form_field(html, "_csrf_token")
            if not csrf:
                raise FunPayAuthError(
                    "Не удалось получить CSRF-токен на странице логина"
                )

            # 2. POST /account/login
            payload = {
                "_csrf_token": csrf,
                "login": self.login,
                "password": self.password,
            }
            status, _ = await self.post(
                "/account/login", data=payload, allow_redirects=False
            )

            if status not in (302, 303):
                # Перепроверим — может уже залогинены
                info = await self._refresh_self_info()
                if info:
                    return info
                raise FunPayAuthError(
                    "Неверный логин/пароль или требуется капча"
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

    # ---------------------- внутренние свойства -----------------------------
    _csrf: str | None = None
    _user_id: int | None = None
    _username: str | None = None

    @property
    def csrf(self) -> str | None:
        return self._csrf

    @property
    def user_id(self) -> int | None:
        return self._user_id

    @property
    def username(self) -> str | None:
        return self._username
