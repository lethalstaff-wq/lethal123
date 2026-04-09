"""Дэшборд — графики продаж прямо в Telegram-чат.

Красиво, минималистично, одной командой /dashboard. Пользователь
видит 5 графиков: выручка по дням, топ лотов, активность по часам,
воронка, сегменты CRM. Каждый — как фото с кратким подписом.

Если matplotlib не установлен — fallback на текстовую сводку.
"""

from __future__ import annotations

import logging

from aiogram import F, Router
from aiogram.filters import Command
from aiogram.types import (
    BufferedInputFile,
    CallbackQuery,
    InlineKeyboardButton,
    InlineKeyboardMarkup,
    Message,
)

from database.models import get_or_create_user, stats_summary
from database.models_crm import count_by_segment
from services.dashboard import (
    collect_funnel,
    collect_hours_activity,
    collect_revenue_by_day,
    collect_top_lots,
    funnel_chart,
    hours_activity_chart,
    revenue_by_day,
    segments_donut,
    top_lots_chart,
)
from utils.helpers import now_ts

router = Router(name="dashboard")
logger = logging.getLogger(__name__)


def _dashboard_kb() -> InlineKeyboardMarkup:
    return InlineKeyboardMarkup(
        inline_keyboard=[
            [
                InlineKeyboardButton(text="💰 7 дней", callback_data="dash:rev:7"),
                InlineKeyboardButton(text="💰 30 дней", callback_data="dash:rev:30"),
            ],
            [
                InlineKeyboardButton(text="🏆 Топ лотов", callback_data="dash:top"),
                InlineKeyboardButton(text="⏰ Часы", callback_data="dash:hours"),
            ],
            [
                InlineKeyboardButton(text="🎯 Воронка", callback_data="dash:funnel"),
                InlineKeyboardButton(text="📇 Сегменты", callback_data="dash:seg"),
            ],
            [
                InlineKeyboardButton(
                    text="📸 Всё одним залпом", callback_data="dash:all"
                )
            ],
        ]
    )


def _format_money(amount: int | float) -> str:
    return f"{int(amount):,}".replace(",", " ") + "₽"


async def _render_home(message: Message, user_id: int) -> None:
    # Краткая сводка сверху
    day = await stats_summary(user_id, now_ts() - 86400)
    week = await stats_summary(user_id, now_ts() - 7 * 86400)
    month = await stats_summary(user_id, now_ts() - 30 * 86400)

    text = (
        "📊 <b>Дэшборд продаж</b>\n\n"
        f"🕐 День:   <b>{_format_money(day['total'])}</b> · {day['count']} зак.\n"
        f"📅 Неделя: <b>{_format_money(week['total'])}</b> · {week['count']} зак.\n"
        f"📆 Месяц:  <b>{_format_money(month['total'])}</b> · {month['count']} зак.\n\n"
        "👇 Выбери график:"
    )
    await message.answer(text, reply_markup=_dashboard_kb())


@router.message(Command("dashboard"))
async def cmd_dashboard(message: Message) -> None:
    if not message.from_user:
        return
    user = await get_or_create_user(message.from_user.id, message.from_user.username)
    await _render_home(message, user["id"])


@router.message(F.text == "📊 Дэшборд")
async def btn_dashboard(message: Message) -> None:
    await cmd_dashboard(message)


async def _send_photo_or_fallback(
    call: CallbackQuery, png: bytes | None, fallback_text: str, caption: str
) -> None:
    if not isinstance(call.message, Message):
        await call.answer()
        return
    if png:
        await call.message.answer_photo(
            BufferedInputFile(png, filename="chart.png"),
            caption=caption,
        )
    else:
        await call.message.answer(
            f"{caption}\n\n{fallback_text}\n\n"
            "<i>matplotlib не установлен — графики недоступны. "
            "Поставь: <code>pip install matplotlib</code></i>"
        )
    await call.answer()


@router.callback_query(F.data.startswith("dash:rev:"))
async def cb_revenue(call: CallbackQuery) -> None:
    if not call.from_user:
        return
    try:
        days = int((call.data or "").split(":")[2])
    except ValueError:
        days = 7
    user = await get_or_create_user(call.from_user.id, call.from_user.username)
    data = await collect_revenue_by_day(user["id"], days)
    png = revenue_by_day(data, days=days)

    total = sum(v for _, v in data)
    fallback = "\n".join(f"{d[-5:]}: {v}₽" for d, v in data)

    await _send_photo_or_fallback(
        call,
        png,
        fallback_text=fallback,
        caption=f"💰 <b>Выручка за {days} дней</b> · {_format_money(total)}",
    )


@router.callback_query(F.data == "dash:top")
async def cb_top_lots(call: CallbackQuery) -> None:
    if not call.from_user:
        return
    user = await get_or_create_user(call.from_user.id, call.from_user.username)
    data = await collect_top_lots(user["id"], days=30, limit=5)
    png = top_lots_chart(data)

    fallback = "\n".join(f"{name}: {val}₽" for name, val in data) or "Нет данных"
    await _send_photo_or_fallback(
        call,
        png,
        fallback_text=fallback,
        caption="🏆 <b>Топ лотов за 30 дней</b>",
    )


@router.callback_query(F.data == "dash:hours")
async def cb_hours(call: CallbackQuery) -> None:
    if not call.from_user:
        return
    user = await get_or_create_user(call.from_user.id, call.from_user.username)
    hours_map = await collect_hours_activity(user["id"], days=30)
    png = hours_activity_chart(hours_map)

    if hours_map:
        peak = max(hours_map, key=hours_map.get)
        fallback = f"Пик активности: {peak}:00 UTC"
    else:
        fallback = "Нет данных"

    await _send_photo_or_fallback(
        call,
        png,
        fallback_text=fallback,
        caption="⏰ <b>Активность покупателей по часам</b>",
    )


@router.callback_query(F.data == "dash:funnel")
async def cb_funnel(call: CallbackQuery) -> None:
    if not call.from_user:
        return
    user = await get_or_create_user(call.from_user.id, call.from_user.username)
    data = await collect_funnel(user["id"], days=30)
    png = funnel_chart(data)

    fallback = "\n".join(f"{name}: {val}" for name, val in data)
    await _send_photo_or_fallback(
        call,
        png,
        fallback_text=fallback,
        caption="🎯 <b>Воронка продаж за 30 дней</b>",
    )


@router.callback_query(F.data == "dash:seg")
async def cb_segments(call: CallbackQuery) -> None:
    if not call.from_user:
        return
    user = await get_or_create_user(call.from_user.id, call.from_user.username)
    segs = await count_by_segment(user["id"])
    png = segments_donut(segs)

    fallback = "\n".join(f"{k}: {v}" for k, v in segs.items()) if segs else "Нет данных"
    await _send_photo_or_fallback(
        call,
        png,
        fallback_text=fallback,
        caption="📇 <b>Сегменты клиентов</b>",
    )


@router.callback_query(F.data == "dash:all")
async def cb_all(call: CallbackQuery) -> None:
    if not call.from_user or not isinstance(call.message, Message):
        return
    user = await get_or_create_user(call.from_user.id, call.from_user.username)
    await call.answer("Рисую графики…")

    # Все 5 графиков последовательно
    for coro, caption in [
        (
            collect_revenue_by_day(user["id"], 7),
            "💰 Выручка за 7 дней",
        ),
        (
            collect_top_lots(user["id"], days=30, limit=5),
            "🏆 Топ лотов",
        ),
        (
            collect_hours_activity(user["id"], days=30),
            "⏰ Активность по часам",
        ),
        (
            collect_funnel(user["id"], days=30),
            "🎯 Воронка",
        ),
    ]:
        try:
            data = await coro
            png = None
            if caption.startswith("💰"):
                png = revenue_by_day(data, days=7)
            elif caption.startswith("🏆"):
                png = top_lots_chart(data)
            elif caption.startswith("⏰"):
                png = hours_activity_chart(data)
            elif caption.startswith("🎯"):
                png = funnel_chart(data)
            if png:
                await call.message.answer_photo(
                    BufferedInputFile(png, filename="chart.png"),
                    caption=caption,
                )
        except Exception:  # noqa: BLE001
            logger.exception("dash:all chart failed")

    # Сегменты отдельно (другой источник данных)
    try:
        segs = await count_by_segment(user["id"])
        png = segments_donut(segs)
        if png:
            await call.message.answer_photo(
                BufferedInputFile(png, filename="segments.png"),
                caption="📇 Сегменты CRM",
            )
    except Exception:  # noqa: BLE001
        logger.exception("dash:all segments failed")
