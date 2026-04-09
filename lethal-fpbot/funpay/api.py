"""Высокоуровневое API FunPay.

Объединяет FunPaySession + парсеры. Хендлеры/фоновые сервисы должны
работать только с этим модулем — менеджер сессий и HTML-парсеры
держим как имплементационную деталь.

В Phase 1 нам нужны:
  • login(login, password, proxy) → SessionInfo (для добавления аккаунта);
  • verify_session(golden_key, proxy) → bool;
  • Базовая обвязка для будущих фаз: get_lots, get_chats и т.д.
"""

from __future__ import annotations

import logging
from dataclasses import dataclass

from .parser import (
    FpChatPreview,
    FpLot,
    parse_chat_messages,
    parse_chats,
    parse_lots,
)
from .session import (
    FunPayAuthError,
    FunPayNetworkError,
    FunPaySession,
    SessionInfo,
)

logger = logging.getLogger(__name__)


@dataclass
class LoginResult:
    ok: bool
    info: SessionInfo | None
    error: str | None = None


async def login(
    login_: str,
    password: str,
    proxy: str | None = None,
    user_agent: str | None = None,
) -> LoginResult:
    """Логинится по логину/паролю и возвращает golden_key + профиль."""
    sess = FunPaySession(login_, password, proxy=proxy, user_agent=user_agent)
    try:
        info = await sess.login_with_password()
        return LoginResult(ok=True, info=info)
    except FunPayAuthError as exc:
        return LoginResult(ok=False, info=None, error=str(exc))
    except FunPayNetworkError as exc:
        return LoginResult(
            ok=False, info=None, error=f"Сетевая ошибка: {exc}"
        )
    except Exception as exc:  # pragma: no cover - страховка
        logger.exception("Неожиданная ошибка логина FunPay")
        return LoginResult(ok=False, info=None, error=f"Ошибка: {exc}")
    finally:
        await sess.close()


async def verify_session(
    golden_key: str,
    proxy: str | None = None,
    user_agent: str | None = None,
) -> SessionInfo | None:
    """Проверяет, что golden_key всё ещё валиден."""
    sess = FunPaySession(
        login_="", password="", proxy=proxy,
        golden_key=golden_key, user_agent=user_agent,
    )
    try:
        return await sess.restore()
    except FunPayNetworkError as exc:
        logger.warning("Не удалось проверить сессию: %s", exc)
        return None
    finally:
        await sess.close()


# --- заготовки для Phase 2/3, но их удобно иметь сразу --------------------

async def get_lots(session: FunPaySession, user_id: int) -> list[FpLot]:
    status, html = await session.get(f"/users/{user_id}/")
    if status != 200:
        return []
    return parse_lots(html)


async def get_chats(session: FunPaySession) -> list[FpChatPreview]:
    status, html = await session.get("/chat/")
    if status != 200:
        return []
    return parse_chats(html)


async def get_chat_messages(session: FunPaySession, chat_id: str) -> list[dict]:
    status, html = await session.get(f"/chat/?node={chat_id}")
    if status != 200:
        return []
    return parse_chat_messages(html)
