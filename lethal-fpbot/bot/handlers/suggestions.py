"""Хендлер для Smart Suggestions — /suggest.

Показывает персональные советы с кнопками «Сделать сейчас».
"""

from __future__ import annotations

from aiogram import F, Router
from aiogram.filters import Command
from aiogram.types import (
    CallbackQuery,
    InlineKeyboardButton,
    InlineKeyboardMarkup,
    Message,
)

from database.models import get_or_create_user
from services.smart_suggestions import (
    format_suggestions_message,
    generate_suggestions,
)

router = Router(name="suggestions")


def _suggestions_kb(suggestions: list) -> InlineKeyboardMarkup:
    rows = []
    for s in suggestions:
        if s.action_label and s.action_callback:
            rows.append(
                [
                    InlineKeyboardButton(
                        text=f"{s.emoji} {s.action_label}",
                        callback_data=s.action_callback,
                    )
                ]
            )
    rows.append(
        [
            InlineKeyboardButton(
                text="🔄 Обновить", callback_data="sugg:refresh"
            ),
        ]
    )
    return InlineKeyboardMarkup(inline_keyboard=rows)


@router.message(Command("suggest"))
@router.message(Command("tips"))
async def cmd_suggest(message: Message) -> None:
    if not message.from_user:
        return
    user = await get_or_create_user(message.from_user.id, message.from_user.username)
    suggestions = await generate_suggestions(user["id"])
    await message.answer(
        format_suggestions_message(suggestions),
        reply_markup=_suggestions_kb(suggestions) if suggestions else None,
    )


@router.callback_query(F.data == "sugg:refresh")
async def cb_refresh(call: CallbackQuery) -> None:
    if not call.from_user or not isinstance(call.message, Message):
        return
    user = await get_or_create_user(call.from_user.id, call.from_user.username)
    suggestions = await generate_suggestions(user["id"])
    try:
        await call.message.edit_text(
            format_suggestions_message(suggestions),
            reply_markup=_suggestions_kb(suggestions) if suggestions else None,
        )
    except Exception:  # noqa: BLE001
        pass
    await call.answer("Обновлено")
