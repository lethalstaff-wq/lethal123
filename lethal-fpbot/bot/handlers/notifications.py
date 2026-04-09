"""Хендлер настроек уведомлений в Telegram-боте."""

from __future__ import annotations

from aiogram import F, Router
from aiogram.filters import StateFilter
from aiogram.fsm.context import FSMContext
from aiogram.fsm.state import State, StatesGroup
from aiogram.types import (
    CallbackQuery,
    InlineKeyboardButton,
    InlineKeyboardMarkup,
    Message,
)

from database.models import (
    get_notification_prefs,
    get_or_create_user,
    update_notification_pref,
)

router = Router(name="notifications")


class QuietHours(StatesGroup):
    waiting = State()


_FIELDS = [
    ("notify_new_order", "🛒 Новые заказы"),
    ("notify_new_message", "💬 Новые сообщения"),
    ("notify_new_review", "⭐️ Новые отзывы"),
    ("notify_session_lost", "⚠️ Сессия протухла"),
    ("notify_payment", "💳 Платежи"),
]


def _kb(prefs: dict) -> InlineKeyboardMarkup:
    rows = [
        [
            InlineKeyboardButton(
                text=f"{'🟢' if prefs.get(key) else '⚪️'} {label}",
                callback_data=f"notif:t:{key}",
            )
        ]
        for key, label in _FIELDS
    ]
    qstart = prefs.get("quiet_hours_start") or 0
    qend = prefs.get("quiet_hours_end") or 0
    rows.append(
        [
            InlineKeyboardButton(
                text=f"🌙 Тихие часы: {qstart:02d}:00–{qend:02d}:00",
                callback_data="notif:quiet",
            )
        ]
    )
    return InlineKeyboardMarkup(inline_keyboard=rows)


@router.message(F.text == "/notifications")
async def open_(message: Message) -> None:
    if not message.from_user:
        return
    user = await get_or_create_user(message.from_user.id, message.from_user.username)
    prefs = await get_notification_prefs(user["id"])
    await message.answer(
        "🔔 <b>Настройки уведомлений</b>\n\n"
        "Выбери что хочешь получать в Telegram. Тихие часы — "
        "период когда уведомления не приходят (кроме критичных).",
        reply_markup=_kb(prefs),
    )


@router.callback_query(F.data.startswith("notif:t:"))
async def cb_toggle(call: CallbackQuery) -> None:
    if not call.from_user or not isinstance(call.message, Message):
        return
    key = (call.data or "").split(":")[2]
    user = await get_or_create_user(call.from_user.id, call.from_user.username)
    prefs = await get_notification_prefs(user["id"])
    new_val = 0 if prefs.get(key) else 1
    await update_notification_pref(user["id"], key, new_val)
    prefs[key] = new_val
    await call.message.edit_reply_markup(reply_markup=_kb(prefs))
    await call.answer()


@router.callback_query(F.data == "notif:quiet")
async def cb_quiet(call: CallbackQuery, state: FSMContext) -> None:
    if not isinstance(call.message, Message):
        return
    await state.set_state(QuietHours.waiting)
    await call.message.answer(
        "🌙 Введи диапазон тихих часов (UTC) в формате <code>HH-HH</code>.\n"
        "Например: <code>23-7</code> для тишины с 23:00 до 7:00.\n"
        "Чтобы выключить — отправь <code>0-0</code>."
    )
    await call.answer()


@router.message(StateFilter(QuietHours.waiting))
async def step_quiet(message: Message, state: FSMContext) -> None:
    if not message.text or not message.from_user:
        return
    parts = message.text.strip().split("-")
    if len(parts) != 2:
        await message.answer("Формат: HH-HH")
        return
    try:
        start = int(parts[0])
        end = int(parts[1])
    except ValueError:
        await message.answer("Числа должны быть целыми")
        return
    if not (0 <= start <= 23 and 0 <= end <= 23):
        await message.answer("Часы 0-23")
        return
    user = await get_or_create_user(message.from_user.id, message.from_user.username)
    await update_notification_pref(user["id"], "quiet_hours_start", start)
    await update_notification_pref(user["id"], "quiet_hours_end", end)
    await state.clear()
    await message.answer(f"✅ Тихие часы: {start:02d}:00–{end:02d}:00")
