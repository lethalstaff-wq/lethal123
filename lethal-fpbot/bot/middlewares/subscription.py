"""Middleware проверки подписки.

Не блокирует ВСЁ — иначе пользователь даже /start не сможет нажать.
Блокируем только конкретные кнопки/коллбэки, требующие подписку или
определённый тариф (Standard / Pro).

Каждый хендлер при необходимости вызывает helper `require_tier(...)`.
А этот middleware просто гарантирует что user в БД есть и положен
в data['db_user'], чтобы хендлеры могли брать его одной строкой.
"""

from __future__ import annotations

from typing import Any, Awaitable, Callable

from aiogram import BaseMiddleware
from aiogram.types import CallbackQuery, Message, TelegramObject

from config import TIER_NAMES, TIER_PRO, TIER_STANDARD, TIER_STARTER
from database.models import get_or_create_user
from utils.helpers import now_ts


_TIER_RANK = {None: 0, TIER_STARTER: 1, TIER_STANDARD: 2, TIER_PRO: 3}


def has_tier(user: dict, required: str) -> bool:
    expires = user.get("subscription_expires") or 0
    tier = user.get("subscription_tier")
    if expires < now_ts():
        tier = None
    return _TIER_RANK.get(tier, 0) >= _TIER_RANK.get(required, 0)


class EnsureUserMiddleware(BaseMiddleware):
    """Создаёт запись users при первом контакте, кладёт в data['db_user']."""

    async def __call__(
        self,
        handler: Callable[[TelegramObject, dict[str, Any]], Awaitable[Any]],
        event: TelegramObject,
        data: dict[str, Any],
    ) -> Any:
        tg_user = data.get("event_from_user")
        if tg_user:
            db_user = await get_or_create_user(
                telegram_id=tg_user.id,
                username=tg_user.username,
            )
            data["db_user"] = db_user
        return await handler(event, data)


async def require_tier(
    event: Message | CallbackQuery, db_user: dict, required: str
) -> bool:
    """Проверяет, что у пользователя достаточный тариф.

    Возвращает True если ок, иначе шлёт alert/сообщение и возвращает False.
    """
    if has_tier(db_user, required):
        return True

    msg = (
        f"🔒 Эта функция доступна с тарифа {TIER_NAMES.get(required, required)}.\n"
        f"Перейди в «💳 Биллинг» чтобы оформить."
    )
    if isinstance(event, CallbackQuery):
        await event.answer(msg, show_alert=True)
    else:
        await event.answer(msg)
    return False
