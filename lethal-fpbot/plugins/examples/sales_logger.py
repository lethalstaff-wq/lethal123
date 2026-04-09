"""Пример плагина: пишет каждую продажу в отдельный текстовый лог.

Полезно для бухгалтерии — потом можно скриптом распарсить JSONL.
"""

from __future__ import annotations

import json
from datetime import datetime

from config import BASE_DIR
from plugins import Plugin

PLUGIN = Plugin(
    name="sales_logger",
    description="Пишет каждую продажу в JSONL для бухгалтерии",
)

LOG_PATH = BASE_DIR / "sales.jsonl"


@PLUGIN.hook("on_new_order")
async def on_order(bot, account, order):
    record = {
        "ts": datetime.utcnow().isoformat(),
        "account": account["login"],
        "order_id": order.order_id,
        "buyer": order.buyer,
        "amount": order.amount,
        "currency": order.currency,
        "lot": order.lot_name,
    }
    LOG_PATH.parent.mkdir(parents=True, exist_ok=True)
    with LOG_PATH.open("a", encoding="utf-8") as f:
        f.write(json.dumps(record, ensure_ascii=False) + "\n")
    return None
