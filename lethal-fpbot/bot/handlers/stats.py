"""Статистика продаж."""

from __future__ import annotations

from aiogram import F, Router
from aiogram.types import CallbackQuery, Message

from bot.keyboards.kb import BTN_STATS, stats_menu
from database.models import get_or_create_user, stats_summary, stats_top_lots
from utils.helpers import escape_html, now_ts

router = Router(name="stats")


_PERIODS = {
    "day": 24 * 3600,
    "week": 7 * 24 * 3600,
    "month": 30 * 24 * 3600,
    "all": 10 * 365 * 24 * 3600,
}
_PERIOD_NAMES = {
    "day": "день",
    "week": "неделю",
    "month": "месяц",
    "all": "всё время",
}


async def _render(message_or_call, user_id: int, period: str) -> None:
    since = now_ts() - _PERIODS[period]
    summary = await stats_summary(user_id, since)
    tops = await stats_top_lots(user_id, since)
    lines = [
        f"📊 <b>Статистика за {_PERIOD_NAMES[period]}</b>",
        "",
        f"💰 Выручка: <b>{summary['total']}₽</b>",
        f"🛒 Заказов: <b>{summary['count']}</b>",
    ]
    if tops:
        lines.append("")
        lines.append("🔥 <b>Топ лотов:</b>")
        for t in tops:
            lines.append(
                f"• {escape_html(t['lot_name'] or '—')} — "
                f"{t['cnt']} шт · {int(t['total'] or 0)}₽"
            )
    text = "\n".join(lines)

    if isinstance(message_or_call, CallbackQuery):
        if isinstance(message_or_call.message, Message):
            await message_or_call.message.edit_text(text, reply_markup=stats_menu())
        await message_or_call.answer()
    else:
        await message_or_call.answer(text, reply_markup=stats_menu())


@router.message(F.text == BTN_STATS)
async def open_(message: Message) -> None:
    if not message.from_user:
        return
    user = await get_or_create_user(message.from_user.id, message.from_user.username)
    await _render(message, user["id"], "day")


@router.callback_query(F.data.startswith("stats:"))
async def cb_period(call: CallbackQuery) -> None:
    if not call.from_user:
        return
    period = call.data.split(":", 1)[1]  # type: ignore[union-attr]
    if period not in _PERIODS:
        await call.answer()
        return
    user = await get_or_create_user(call.from_user.id, call.from_user.username)
    await _render(call, user["id"], period)
