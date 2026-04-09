"""Применение промокодов при покупке тарифа.

Логика:
  • Промокод существует?
  • Не истёк по valid_until?
  • Лимит использований не превышен?
  • Конкретный пользователь его уже не активировал?
Если все ок — пересчитываем сумму, инкрементим used_count, фиксируем
запись в promo_redemptions.
"""

from __future__ import annotations

import logging

from database.models import (
    get_promo_by_code,
    has_redeemed_promo,
    redeem_promo,
)
from utils.helpers import now_ts

logger = logging.getLogger(__name__)


async def apply_promo(
    code: str, amount: int, user_id: int
) -> tuple[int, int, bool]:
    """Возвращает (новая_сумма, процент_скидки, успех)."""
    if not code:
        return amount, 0, False

    promo = await get_promo_by_code(code)
    if not promo:
        return amount, 0, False

    if promo.get("valid_until") and promo["valid_until"] < now_ts():
        return amount, 0, False

    if promo.get("max_uses") and promo["used_count"] >= promo["max_uses"]:
        return amount, 0, False

    if await has_redeemed_promo(promo["id"], user_id):
        return amount, 0, False

    percent = int(promo["discount_percent"])
    discount = amount * percent // 100
    new_amount = max(0, amount - discount)
    ok = await redeem_promo(promo["id"], user_id)
    if not ok:
        return amount, 0, False
    logger.info(
        "Promo %s applied for user %s: %d -> %d (-%d%%)",
        code,
        user_id,
        amount,
        new_amount,
        percent,
    )
    return new_amount, percent, True
