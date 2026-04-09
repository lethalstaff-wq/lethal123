"""Автовыдача товаров.

Здесь нет своего цикла — функцию `deliver` дёргает order_watcher
при появлении нового оплаченного заказа. Берём правило из БД по
названию лота, поп'аем следующий item и отправляем покупателю.
"""

from __future__ import annotations

import asyncio
import logging

from aiogram import Bot

from database.models import (
    find_delivery_for_lot,
    pop_auto_delivery_item,
)
from funpay.api import send_chat_message

logger = logging.getLogger(__name__)


async def run(bot: Bot) -> None:
    """Сервис не имеет полл-цикла — он реактивный.

    Цикл нужен только чтобы services.start_all мог запустить его и
    держать «живым» (например, когда-нибудь добавим повторную выдачу).
    """
    while True:
        await asyncio.sleep(3600)


async def deliver(sess, acc: dict, order, order_row: dict) -> bool:
    rule = await find_delivery_for_lot(
        user_id=acc["user_id"],
        lot_name=order.lot_name or "",
        fp_account_id=acc["id"],
    )
    if not rule:
        logger.info("Нет правила автовыдачи для %s", order.lot_name)
        return False

    item = await pop_auto_delivery_item(rule["id"])
    if not item:
        logger.warning("Закончились товары в правиле %s", rule["lot_name"])
        return False

    template = rule.get("template") or "Спасибо за покупку! Ваш товар:\n{item}"
    text = template.replace("{item}", item).replace(
        "{lot}", order.lot_name or ""
    )

    try:
        await send_chat_message(sess, order.buyer or "", text)
        return True
    except Exception:  # noqa: BLE001
        logger.exception("send_chat_message in deliver failed")
        return False
