"""Авто-кросселл после покупки (Standard+).

Реактивный сервис — функцию `send` дёргает order_watcher после
успешной автовыдачи / нового заказа.
"""

from __future__ import annotations

import logging

from funpay.api import send_chat_message

logger = logging.getLogger(__name__)


async def send(sess, acc: dict, order, settings: dict) -> bool:
    text = settings.get("cross_sell_text") or (
        "Кстати, у меня есть ещё крутые лоты — загляни в профиль 😉"
    )
    try:
        await send_chat_message(sess, order.buyer or "", text)
        return True
    except Exception:  # noqa: BLE001
        logger.exception("cross_sell send failed")
        return False
