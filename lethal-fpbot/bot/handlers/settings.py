"""Хендлеры раздела настроек.

Обычные булевы тоглы рендерим из SETTING_LABELS, всё работает через
один callback set:toggle:<key>. Для числовых полей и текстов —
отдельные FSM, по необходимости.
"""

from __future__ import annotations

from aiogram import F, Router
from aiogram.filters import StateFilter
from aiogram.fsm.context import FSMContext
from aiogram.fsm.state import State, StatesGroup
from aiogram.types import CallbackQuery, Message

from bot.keyboards.kb import (
    BTN_SETTINGS,
    SETTING_LABELS,
    cancel_inline,
    settings_menu,
)
from database.models import (
    get_or_create_user,
    get_settings,
    update_setting,
)

router = Router(name="settings")


class SetInterval(StatesGroup):
    waiting_value = State()


async def _render(message: Message, user_id: int) -> None:
    settings = await get_settings(user_id)
    text = (
        "⚙️ <b>Настройки</b>\n\n"
        "Тыкай по тоглам ниже чтобы вкл/выкл функции. "
        "Зелёный 🟢 — включено, серый ⚪️ — выключено."
    )
    await message.answer(text, reply_markup=settings_menu(settings))


@router.message(F.text == BTN_SETTINGS)
async def open_(message: Message, state: FSMContext) -> None:
    await state.clear()
    if not message.from_user:
        return
    user = await get_or_create_user(message.from_user.id, message.from_user.username)
    await _render(message, user["id"])


@router.callback_query(F.data.startswith("set:toggle:"))
async def cb_toggle(call: CallbackQuery) -> None:
    if not call.from_user or not isinstance(call.message, Message):
        return
    key = call.data.split(":", 2)[2]  # type: ignore[union-attr]
    if key not in SETTING_LABELS:
        await call.answer()
        return
    user = await get_or_create_user(call.from_user.id, call.from_user.username)
    settings = await get_settings(user["id"])
    new_val = 0 if settings.get(key) else 1
    await update_setting(user["id"], key, new_val)
    settings[key] = new_val
    await call.message.edit_reply_markup(reply_markup=settings_menu(settings))
    await call.answer("✅" if new_val else "⚪️")


@router.callback_query(F.data == "set:raise_interval")
async def cb_interval(call: CallbackQuery, state: FSMContext) -> None:
    if not isinstance(call.message, Message):
        return
    await state.set_state(SetInterval.waiting_value)
    await call.message.answer(
        "⏱ Пришли интервал автоподнятия в <b>минутах</b> (например 240).",
        reply_markup=cancel_inline(),
    )
    await call.answer()


@router.message(StateFilter(SetInterval.waiting_value))
async def step_interval(message: Message, state: FSMContext) -> None:
    if not message.text or not message.from_user:
        return
    if not message.text.isdigit():
        await message.answer("❌ Нужно число минут.")
        return
    val = int(message.text)
    if val < 5 or val > 1440:
        await message.answer("❌ От 5 до 1440 минут.")
        return
    user = await get_or_create_user(message.from_user.id, message.from_user.username)
    await update_setting(user["id"], "raise_interval", val)
    await state.clear()
    await message.answer(f"✅ Интервал автоподнятия: {val} минут")
