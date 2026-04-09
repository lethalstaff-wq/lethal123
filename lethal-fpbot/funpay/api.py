"""Высокоуровневое API FunPay.

Объединяет FunPaySession + парсеры. Хендлеры/фоновые сервисы должны
работать только с этим модулем — менеджер сессий и HTML-парсеры
держим как имплементационную деталь.

ВАЖНО про эндпоинты: FunPay не публикует API. Точные пути для
действий (поднять лот, написать в чат и т.д.) подсмотрены из
известных open-source ботов и могут меняться. Если что-то ломается —
лезть сюда и подправлять URL/payload.
"""

from __future__ import annotations

import json as _json
import logging
import re
from dataclasses import dataclass

from .parser import (
    FpBuyerProfile,
    FpChatPreview,
    FpLot,
    FpOrder,
    FpReview,
    parse_buyer_profile,
    parse_chat_messages,
    parse_chats,
    parse_lots,
    parse_orders,
    parse_reviews,
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


# ----------------------------- ACTIONS -------------------------------------


async def send_chat_message(
    session: FunPaySession, chat_id: str, text: str
) -> bool:
    """Отправляет сообщение в чат FunPay.

    Использует POST /runner/ — это long-poll эндпоинт FunPay для
    клиент-серверной коммуникации. Формат payload:
        objects = [{"type":"chat_message","data":{"node":<id>,"content":<text>}}]
        request = {"action":"chat_message","data":{"node":<id>,"last_message":-1,"content":<text>}}
    Точные поля могут отличаться — здесь компромисс из публичных примеров.
    """
    if not session.csrf:
        # Освежим csrf перед отправкой
        await session.get("/")
    csrf = session.csrf or ""
    payload = {
        "action": "chat_message",
        "data": _json.dumps(
            {"node": chat_id, "last_message": -1, "content": text},
            ensure_ascii=False,
        ),
    }
    headers_extra = {"x-requested-with": "XMLHttpRequest"}
    sess = await session._ensure_session()  # noqa: SLF001
    sess.headers.update(headers_extra)
    if csrf:
        sess.headers["x-csrf-token"] = csrf

    status, body = await session.post("/runner/", data=payload)
    return status == 200 and "error" not in body.lower()[:200]


async def raise_lots(session: FunPaySession, game_id: int, node_id: int) -> bool:
    """Поднимает лоты в категории.

    POST /lots/raise с payload {game_id, node_id}. Возвращает JSON с
    msg/error. На FunPay поднимать чаще чем раз в N часов нельзя —
    эта проверка на стороне FunPay.
    """
    payload = {"game_id": game_id, "node_id": node_id}
    status, body = await session.post("/lots/raise", data=payload)
    if status != 200:
        return False
    try:
        data = _json.loads(body)
        return bool(data.get("msg") or data.get("success"))
    except _json.JSONDecodeError:
        return False


async def get_orders(session: FunPaySession) -> list[FpOrder]:
    status, html = await session.get("/orders/trade")
    if status != 200:
        return []
    return parse_orders(html)


async def get_self_reviews(session: FunPaySession) -> list[FpReview]:
    if not session.user_id:
        await session.restore()
    if not session.user_id:
        return []
    status, html = await session.get(f"/users/{session.user_id}/")
    if status != 200:
        return []
    return parse_reviews(html)


async def reply_to_review(
    session: FunPaySession, order_id: str, text: str
) -> bool:
    """Оставить ответ на отзыв. Эндпоинт: POST /orders/reviews/reply."""
    if not session.csrf:
        await session.get("/")
    payload = {
        "csrf_token": session.csrf or "",
        "order_id": order_id,
        "text": text,
    }
    status, _ = await session.post("/orders/reviews/reply", data=payload)
    return status == 200


async def file_complaint(
    session: FunPaySession, order_id: str, text: str
) -> bool:
    """Открыть спор/жалобу по заказу."""
    if not session.csrf:
        await session.get("/")
    payload = {
        "csrf_token": session.csrf or "",
        "order_id": order_id,
        "reason": text,
    }
    status, _ = await session.post(f"/orders/{order_id}/complaint", data=payload)
    return status == 200


async def get_buyer_profile(
    session: FunPaySession, username: str
) -> FpBuyerProfile | None:
    """Загружает профиль покупателя по нику."""
    status, html = await session.get(f"/users/{username}/")
    if status != 200:
        return None
    return parse_buyer_profile(html)


# Парсим из лота game_id и node_id для авто-поднятия
_OFFER_RE = re.compile(r"/lots/(\d+)/")


def detect_node_from_lot_url(url: str) -> int | None:
    m = _OFFER_RE.search(url)
    return int(m.group(1)) if m else None
