"""Биллинг — покупка тарифа.

Phase 6 в простом виде: пользователь жмёт «Купить Pro», бот создаёт
запись pending_payments и шлёт админам уведомление с кнопкой
«Подтвердить» / «Отклонить». Админ подтверждает руками после получения
оплаты любым удобным способом (СБП/крипта/что угодно).

Полноценный платёжный шлюз ЮKassa/Telegram Payments — отдельная история.
"""

from __future__ import annotations

import logging

from aiogram import Bot, F, Router
from aiogram.types import CallbackQuery, Message

from bot.keyboards.kb import BTN_BILLING, billing_menu, payment_review
from config import (
    ADMIN_IDS,
    TIER_NAMES,
    TIER_PRICES,
    TIER_PRO,
    TIER_STANDARD,
    TIER_STARTER,
)
from database.models import create_payment, get_or_create_user

router = Router(name="billing")
logger = logging.getLogger(__name__)


WELCOME = (
    "💳 <b>Биллинг</b>\n\n"
    "🥉 <b>Starter</b> — 500₽/мес\n"
    "  • 1 ФП-аккаунт + автоподнятие, автовыдача, автоответы\n\n"
    "🥈 <b>Standard</b> — 1000₽/мес\n"
    "  • До 5 аккаунтов + чат через ТГ, антискам, кросселл, бичевка\n\n"
    "🥇 <b>Pro</b> — 1500₽/мес\n"
    "  • До 10 аккаунтов + ИИ ответы, арбитраж-ассистент, воронка, "
    "смарт-прайсинг, дэшборд\n\n"
    "👇 Выбери тариф ниже. После клика админ свяжется для оплаты."
)


@router.message(F.text == BTN_BILLING)
async def open_(message: Message) -> None:
    await message.answer(WELCOME, reply_markup=billing_menu())


@router.callback_query(F.data == "bill:open")
async def cb_open(call: CallbackQuery) -> None:
    if isinstance(call.message, Message):
        await call.message.answer(WELCOME, reply_markup=billing_menu())
    await call.answer()


@router.callback_query(F.data.startswith("bill:buy:"))
async def cb_buy(call: CallbackQuery, bot: Bot) -> None:
    if not call.from_user or not isinstance(call.message, Message):
        return
    tier = (call.data or "").split(":")[2]
    if tier not in {TIER_STARTER, TIER_STANDARD, TIER_PRO}:
        await call.answer()
        return
    user = await get_or_create_user(call.from_user.id, call.from_user.username)
    amount = TIER_PRICES[tier]
    payment_id = await create_payment(user["id"], tier, amount)

    await call.message.answer(
        f"✅ Заявка #{payment_id} создана.\n"
        f"Тариф: <b>{TIER_NAMES[tier]}</b> · {amount}₽\n\n"
        "Админ получит уведомление и свяжется для оплаты."
    )
    await call.answer()

    # Уведомляем админов
    for admin_id in ADMIN_IDS:
        try:
            await bot.send_message(
                admin_id,
                (
                    f"💳 <b>Новая заявка #{payment_id}</b>\n"
                    f"👤 @{call.from_user.username or call.from_user.id}\n"
                    f"📋 Тариф: {TIER_NAMES[tier]}\n"
                    f"💰 Сумма: {amount}₽"
                ),
                reply_markup=payment_review(payment_id),
            )
        except Exception:  # noqa: BLE001
            logger.warning("Не получилось уведомить админа %s", admin_id)
