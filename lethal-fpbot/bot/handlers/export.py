"""Экспорт статистики в файлы."""

from __future__ import annotations

from aiogram import F, Router
from aiogram.filters import Command
from aiogram.types import (
    BufferedInputFile,
    CallbackQuery,
    InlineKeyboardButton,
    InlineKeyboardMarkup,
    Message,
)

from database.models import get_or_create_user
from services.stats_exporter import (
    export_all_json,
    export_customers_csv,
    export_stats_csv,
    generate_tax_report,
)
from utils.helpers import now_ts

router = Router(name="export")


def _export_menu() -> InlineKeyboardMarkup:
    return InlineKeyboardMarkup(
        inline_keyboard=[
            [
                InlineKeyboardButton(
                    text="📊 Продажи CSV (30д)", callback_data="exp:sales:30"
                ),
                InlineKeyboardButton(
                    text="📊 Продажи CSV (год)", callback_data="exp:sales:365"
                ),
            ],
            [
                InlineKeyboardButton(
                    text="📇 Клиенты CSV", callback_data="exp:customers"
                )
            ],
            [
                InlineKeyboardButton(
                    text="💼 Налоговый отчёт", callback_data="exp:tax"
                )
            ],
            [
                InlineKeyboardButton(
                    text="📦 Полный дамп JSON", callback_data="exp:full"
                )
            ],
        ]
    )


@router.message(Command("export"))
async def cmd_export(message: Message) -> None:
    await message.answer(
        "📥 <b>Экспорт данных</b>\n\n"
        "Скачай свою статистику и клиентов в удобном формате. "
        "Работает для налоговой, бухгалтерии, Excel, собственной аналитики.",
        reply_markup=_export_menu(),
    )


@router.callback_query(F.data.startswith("exp:sales:"))
async def cb_sales(call: CallbackQuery) -> None:
    if not call.from_user or not isinstance(call.message, Message):
        return
    try:
        days = int((call.data or "").split(":")[2])
    except ValueError:
        days = 30

    user = await get_or_create_user(call.from_user.id, call.from_user.username)
    end = now_ts()
    start = end - days * 86400

    data = await export_stats_csv(user["id"], start, end)
    await call.message.answer_document(
        BufferedInputFile(data, filename=f"sales-{days}d.csv"),
        caption=f"📊 Продажи за {days} дней",
    )
    await call.answer()


@router.callback_query(F.data == "exp:customers")
async def cb_customers(call: CallbackQuery) -> None:
    if not call.from_user or not isinstance(call.message, Message):
        return
    user = await get_or_create_user(call.from_user.id, call.from_user.username)
    data = await export_customers_csv(user["id"])
    await call.message.answer_document(
        BufferedInputFile(data, filename="customers.csv"),
        caption="📇 Все клиенты CRM",
    )
    await call.answer()


@router.callback_query(F.data == "exp:tax")
async def cb_tax(call: CallbackQuery) -> None:
    if not call.from_user or not isinstance(call.message, Message):
        return
    user = await get_or_create_user(call.from_user.id, call.from_user.username)
    end = now_ts()
    start = end - 365 * 86400

    data = await generate_tax_report(user["id"], start, end)
    await call.message.answer_document(
        BufferedInputFile(data, filename="tax_report.txt"),
        caption="💼 Налоговый отчёт за 12 месяцев",
    )
    await call.answer()


@router.callback_query(F.data == "exp:full")
async def cb_full(call: CallbackQuery) -> None:
    if not call.from_user or not isinstance(call.message, Message):
        return
    user = await get_or_create_user(call.from_user.id, call.from_user.username)
    data = await export_all_json(user["id"])
    await call.message.answer_document(
        BufferedInputFile(data, filename="full_export.json"),
        caption="📦 Полный дамп (JSON)",
    )
    await call.answer()
