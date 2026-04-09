"""Биллинг — покупка тарифа.

Два режима работы:
  1. Telegram Payments (нативные карты) — если задан TG_PAYMENT_PROVIDER_TOKEN
     или включен TG_STARS_ENABLED=1 (для Stars). Бот выставляет invoice,
     пользователь платит картой/звёздами, тариф активируется моментально.
  2. Ручной режим — заявка в pending_payments, админ подтверждает руками.

При наличии нативных платежей fallback на ручной режим всегда доступен
через кнопку "Оплатить иначе" (на случай проблем с картой).
"""

from __future__ import annotations

import logging

from aiogram import Bot, F, Router
from aiogram.types import (
    CallbackQuery,
    InlineKeyboardButton,
    InlineKeyboardMarkup,
    Message,
    PreCheckoutQuery,
    SuccessfulPayment,
)

from bot.keyboards.kb import BTN_BILLING, billing_menu, payment_review
from config import (
    ADMIN_IDS,
    TIER_NAMES,
    TIER_PRICES,
    TIER_PRO,
    TIER_STANDARD,
    TIER_STARTER,
)
from database.models import (
    create_payment,
    get_or_create_user,
    get_user_by_id,
    update_user_subscription,
)
from services.tg_payments import (
    STARS_ENABLED,
    is_native_payments_enabled,
    parse_payload,
    send_tier_invoice,
)
from utils.helpers import now_ts

router = Router(name="billing")
logger = logging.getLogger(__name__)


def _tier_choice_keyboard(tier: str) -> InlineKeyboardMarkup:
    """После выбора тарифа — предложить способ оплаты."""
    rows = []
    if is_native_payments_enabled():
        rows.append(
            [
                InlineKeyboardButton(
                    text="💳 Картой (моментально)",
                    callback_data=f"bill:card:{tier}",
                )
            ]
        )
        if STARS_ENABLED:
            rows.append(
                [
                    InlineKeyboardButton(
                        text="⭐️ Telegram Stars",
                        callback_data=f"bill:stars:{tier}",
                    )
                ]
            )
    rows.append(
        [
            InlineKeyboardButton(
                text="📞 Оплатить иначе (через админа)",
                callback_data=f"bill:manual:{tier}",
            )
        ]
    )
    rows.append(
        [InlineKeyboardButton(text="« Назад", callback_data="bill:open")]
    )
    return InlineKeyboardMarkup(inline_keyboard=rows)


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

    # Если включены нативные платежи — показываем выбор способа оплаты,
    # иначе сразу создаём ручную заявку.
    if is_native_payments_enabled():
        await call.message.answer(
            f"💎 <b>{TIER_NAMES[tier]}</b>\n"
            f"Сумма: <b>{TIER_PRICES[tier]}₽</b> / 30 дней\n\n"
            "Выбери способ оплаты:",
            reply_markup=_tier_choice_keyboard(tier),
        )
        await call.answer()
        return

    # Fallback: ручной режим
    await _create_manual_payment(call, bot, tier)


@router.callback_query(F.data.startswith("bill:manual:"))
async def cb_manual(call: CallbackQuery, bot: Bot) -> None:
    tier = (call.data or "").split(":")[2]
    await _create_manual_payment(call, bot, tier)


async def _create_manual_payment(call: CallbackQuery, bot: Bot, tier: str) -> None:
    if not call.from_user or not isinstance(call.message, Message):
        return
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


# ------------------------ Telegram Payments flow ---------------------------


@router.callback_query(F.data.startswith("bill:card:"))
async def cb_pay_card(call: CallbackQuery, bot: Bot) -> None:
    if not call.from_user or not isinstance(call.message, Message):
        return
    tier = (call.data or "").split(":")[2]
    user = await get_or_create_user(call.from_user.id, call.from_user.username)
    ok = await send_tier_invoice(
        bot, call.message.chat.id, tier, user["id"], use_stars=False
    )
    if ok:
        await call.answer("Открываю оплату…")
    else:
        await call.answer("Ошибка. Попробуй оплату через админа.", show_alert=True)


@router.callback_query(F.data.startswith("bill:stars:"))
async def cb_pay_stars(call: CallbackQuery, bot: Bot) -> None:
    if not call.from_user or not isinstance(call.message, Message):
        return
    tier = (call.data or "").split(":")[2]
    user = await get_or_create_user(call.from_user.id, call.from_user.username)
    ok = await send_tier_invoice(
        bot, call.message.chat.id, tier, user["id"], use_stars=True
    )
    if ok:
        await call.answer("Открываю Stars…")
    else:
        await call.answer("Stars недоступны", show_alert=True)


@router.pre_checkout_query()
async def pre_checkout(query: PreCheckoutQuery, bot: Bot) -> None:
    """Telegram ждёт OK прежде чем списать деньги."""
    payload = parse_payload(query.invoice_payload)
    if not payload:
        await bot.answer_pre_checkout_query(
            query.id, ok=False, error_message="Invalid payload"
        )
        return
    user_id, tier = payload
    if tier not in {TIER_STARTER, TIER_STANDARD, TIER_PRO}:
        await bot.answer_pre_checkout_query(
            query.id, ok=False, error_message="Unknown tier"
        )
        return
    await bot.answer_pre_checkout_query(query.id, ok=True)


@router.message(F.successful_payment)
async def on_successful_payment(message: Message, bot: Bot) -> None:
    """Деньги пришли — активируем тариф."""
    payment: SuccessfulPayment | None = message.successful_payment
    if not payment:
        return
    payload = parse_payload(payment.invoice_payload)
    if not payload:
        return
    user_db_id, tier = payload

    expires = now_ts() + 30 * 24 * 3600
    await update_user_subscription(user_db_id, tier, expires)

    user = await get_user_by_id(user_db_id)
    if user:
        try:
            await bot.send_message(
                user["telegram_id"],
                f"✅ <b>Оплата прошла!</b>\n\n"
                f"Тариф <b>{TIER_NAMES.get(tier, tier)}</b> активен 30 дней.\n"
                f"Сумма: {payment.total_amount / 100:.0f} {payment.currency}\n\n"
                f"Спасибо за покупку! 🎉",
            )
        except Exception:  # noqa: BLE001
            pass

    # Уведомляем админов
    for admin_id in ADMIN_IDS:
        try:
            await bot.send_message(
                admin_id,
                f"💰 <b>Оплата прошла автоматически</b>\n"
                f"👤 user_id={user_db_id}\n"
                f"📋 {TIER_NAMES.get(tier, tier)}\n"
                f"💰 {payment.total_amount / 100:.0f} {payment.currency}",
            )
        except Exception:  # noqa: BLE001
            pass
