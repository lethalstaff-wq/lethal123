"""Хендлер прогноза продаж."""

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
from services.sales_forecast import forecast, format_forecast

router = Router(name="forecast")


def _forecast_kb() -> InlineKeyboardMarkup:
    return InlineKeyboardMarkup(
        inline_keyboard=[
            [
                InlineKeyboardButton(text="7 дней", callback_data="fc:7"),
                InlineKeyboardButton(text="14 дней", callback_data="fc:14"),
                InlineKeyboardButton(text="30 дней", callback_data="fc:30"),
            ]
        ]
    )


@router.message(Command("forecast"))
async def cmd_forecast(message: Message) -> None:
    if not message.from_user:
        return
    user = await get_or_create_user(message.from_user.id, message.from_user.username)
    f = await forecast(user["id"], history_days=30, forecast_days=7)
    if f is None:
        await message.answer("Недостаточно данных для прогноза.")
        return
    await message.answer(format_forecast(f, 7), reply_markup=_forecast_kb())


@router.callback_query(F.data.startswith("fc:"))
async def cb_period(call: CallbackQuery) -> None:
    if not call.from_user:
        return
    try:
        days = int((call.data or "").split(":")[1])
    except ValueError:
        days = 7

    user = await get_or_create_user(call.from_user.id, call.from_user.username)
    f = await forecast(user["id"], history_days=30, forecast_days=days)
    if f is None:
        await call.answer()
        return

    if isinstance(call.message, Message):
        try:
            await call.message.edit_text(
                format_forecast(f, days), reply_markup=_forecast_kb()
            )
        except Exception:  # noqa: BLE001
            pass
    await call.answer()
