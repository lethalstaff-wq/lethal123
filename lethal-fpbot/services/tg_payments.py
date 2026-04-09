"""Telegram Payments — нативные платежи прямо в боте.

Пользователь жмёт "Купить Pro" → бот выставляет invoice через
bot.send_invoice → Telegram показывает нативную оплату картой →
pre_checkout_query → successful_payment → бот активирует тариф.

Требует PROVIDER_TOKEN от @BotFather (/mybots → Payments).
Если не задан — fallback на ручной режим (admin approve).

Также поддерживает Telegram Stars (XTR currency) — для этого
provider_token = "" и currency="XTR", prices указываются в звёздах.
"""

from __future__ import annotations

import logging
import os

from aiogram import Bot
from aiogram.types import LabeledPrice

from config import TIER_NAMES, TIER_PRICES

logger = logging.getLogger(__name__)


PROVIDER_TOKEN = os.getenv("TG_PAYMENT_PROVIDER_TOKEN", "")
PAYMENT_CURRENCY = os.getenv("TG_PAYMENT_CURRENCY", "RUB")

# Для Telegram Stars: ставим STARS_ENABLED=1 и STARS_PRICES_* в окружении
STARS_ENABLED = os.getenv("TG_STARS_ENABLED", "0") == "1"
STARS_PRICES: dict[str, int] = {
    "starter": int(os.getenv("TG_STARS_STARTER", "50")),
    "standard": int(os.getenv("TG_STARS_STANDARD", "100")),
    "pro": int(os.getenv("TG_STARS_PRO", "150")),
}


def is_native_payments_enabled() -> bool:
    return bool(PROVIDER_TOKEN) or STARS_ENABLED


async def send_tier_invoice(
    bot: Bot, chat_id: int, tier: str, user_id: int, *, use_stars: bool = False
) -> bool:
    """Шлёт invoice за подписку. Возвращает True если получилось.

    payload = f"sub:{user_id}:{tier}" — приходит назад в
    pre_checkout_query и successful_payment.
    """
    if tier not in TIER_PRICES:
        return False

    title = f"{TIER_NAMES.get(tier, tier)} · 30 дней"
    description = {
        "starter": "1 аккаунт FunPay · автоподнятие · автовыдача · автоответы",
        "standard": "До 5 аккаунтов · чат в ТГ · антискам · кросселл",
        "pro": "До 10 аккаунтов · ИИ ответы · арбитраж · воронка · дэшборд",
    }.get(tier, "Подписка Lethal Bot")

    payload = f"sub:{user_id}:{tier}"

    try:
        if use_stars and STARS_ENABLED:
            stars_amount = STARS_PRICES.get(tier, 100)
            await bot.send_invoice(
                chat_id=chat_id,
                title=title,
                description=description,
                payload=payload,
                currency="XTR",
                prices=[LabeledPrice(label=title, amount=stars_amount)],
                provider_token="",  # Stars не требует provider token
                start_parameter=f"sub_{tier}",
            )
        else:
            if not PROVIDER_TOKEN:
                return False
            amount_kopecks = TIER_PRICES[tier] * 100
            await bot.send_invoice(
                chat_id=chat_id,
                title=title,
                description=description,
                payload=payload,
                provider_token=PROVIDER_TOKEN,
                currency=PAYMENT_CURRENCY,
                prices=[LabeledPrice(label=title, amount=amount_kopecks)],
                start_parameter=f"sub_{tier}",
                need_name=False,
                need_phone_number=False,
                need_email=False,
                is_flexible=False,
                protect_content=True,
            )
        return True
    except Exception:  # noqa: BLE001
        logger.exception("send_tier_invoice failed")
        return False


def parse_payload(payload: str) -> tuple[int, str] | None:
    """Парсит payload 'sub:USER_ID:TIER' → (user_id, tier)."""
    if not payload or not payload.startswith("sub:"):
        return None
    parts = payload.split(":")
    if len(parts) < 3:
        return None
    try:
        return int(parts[1]), parts[2]
    except ValueError:
        return None
