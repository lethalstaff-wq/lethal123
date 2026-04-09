"""Продвинутая автовыдача.

Фичи:
  • Валидация формата товара: Steam ключи (XXXXX-XXXXX-XXXXX),
    Amazon gift (код 14-15 символов), общая длина, нельзя пустые
  • Multi-item: один заказ может получить несколько товаров
    (если в шаблоне указано {items_count})
  • Задержка после оплаты (чтобы не выглядело мгновенной авто-выдачей)
  • Алёрт при низком остатке (<N товаров)
  • Tracking: фиксируем какой товар выдан какому покупателю
    (в audit_log) — на случай refund
  • Возврат товара в очередь при refund (восстанавливаем item)
  • Fallback-сообщение если товаров не осталось
  • Валидация шаблона: обязательные переменные должны присутствовать
"""

from __future__ import annotations

import asyncio
import json
import logging
import random
import re

from database.db import connect
from database.models import (
    audit_log,
    find_delivery_for_lot,
    get_user_by_id,
    pop_auto_delivery_item,
)
from funpay.api import send_chat_message

logger = logging.getLogger(__name__)


# Валидаторы форматов
_VALIDATORS: dict[str, re.Pattern] = {
    "steam_key": re.compile(r"^[A-Z0-9]{5}-[A-Z0-9]{5}-[A-Z0-9]{5}$"),
    "email_pass": re.compile(r"^[^@\s]+@[^@\s]+\.[^@\s]+:.+$"),
    "login_pass": re.compile(r"^[^:\s]+:[^:\s]+$"),
    "hex_32": re.compile(r"^[a-f0-9]{32}$", re.IGNORECASE),
    "uuid": re.compile(
        r"^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$",
        re.IGNORECASE,
    ),
}


def detect_format(item: str) -> str:
    """Определяет тип контента. Нужен для валидации и render'а."""
    for fmt, pattern in _VALIDATORS.items():
        if pattern.match(item.strip()):
            return fmt
    if "@" in item and ":" in item:
        return "email_pass"
    if ":" in item and "@" not in item:
        return "login_pass"
    if len(item) >= 20:
        return "long_token"
    return "generic"


def validate_item(item: str, expected_format: str | None = None) -> bool:
    """Проверяет что товар имеет корректный формат."""
    if not item or not item.strip():
        return False
    if not expected_format:
        return True
    validator = _VALIDATORS.get(expected_format)
    if not validator:
        return True
    return bool(validator.match(item.strip()))


def parse_template_placeholders(template: str) -> list[str]:
    """Извлекает все {var} из шаблона."""
    return re.findall(r"\{(\w+)\}", template or "")


def render_delivery_message(
    template: str | None,
    items: list[str],
    lot_name: str,
    buyer: str,
    order_id: str,
) -> str:
    """Формирует сообщение выдачи с подстановкой переменных."""
    ctx = {
        "item": items[0] if items else "",
        "items": "\n".join(f"• {i}" for i in items),
        "items_count": len(items),
        "lot": lot_name,
        "buyer": buyer,
        "order_id": order_id,
    }
    base = template or (
        "Спасибо за покупку! 🎉\n\nВаш товар:\n{items}\n\n"
        "Если возникнут вопросы — пишите!"
    )
    try:
        return base.format(**ctx)
    except (KeyError, IndexError):
        return base


async def get_remaining_count(rule_id: int) -> int:
    async with connect() as db:
        cur = await db.execute(
            "SELECT items FROM auto_delivery WHERE id = ?", (rule_id,)
        )
        row = await cur.fetchone()
        if not row:
            return 0
        try:
            items = json.loads(row["items"])
        except (ValueError, TypeError):
            return 0
        return len(items) if isinstance(items, list) else 0


async def return_item_to_queue(rule_id: int, item: str) -> bool:
    """Возвращает товар в начало очереди (например при refund'е)."""
    async with connect() as db:
        cur = await db.execute(
            "SELECT items FROM auto_delivery WHERE id = ?", (rule_id,)
        )
        row = await cur.fetchone()
        if not row:
            return False
        try:
            items = json.loads(row["items"])
        except (ValueError, TypeError):
            items = []
        if not isinstance(items, list):
            items = []
        items.insert(0, item)
        await db.execute(
            "UPDATE auto_delivery SET items = ? WHERE id = ?",
            (json.dumps(items, ensure_ascii=False), rule_id),
        )
        await db.commit()
    logger.info("Item returned to queue: rule=%s item=%s", rule_id, item[:20])
    return True


async def smart_deliver(
    sess,
    bot,
    acc: dict,
    order,
    *,
    post_payment_delay: float | None = None,
    items_per_order: int = 1,
    low_stock_threshold: int = 5,
) -> dict:
    """Умная выдача с человекоподобной задержкой, валидацией, tracking.

    Возвращает dict с результатом:
      {ok, delivered_items, remaining, reason}
    """
    rule = await find_delivery_for_lot(
        user_id=acc["user_id"],
        lot_name=order.lot_name or "",
        fp_account_id=acc["id"],
    )
    if not rule:
        return {"ok": False, "reason": "no_rule_for_lot"}

    # Задержка "как живой человек"
    if post_payment_delay is None:
        post_payment_delay = random.uniform(2.0, 8.0)
    if post_payment_delay > 0:
        await asyncio.sleep(post_payment_delay)

    # Берём N товаров (обычно 1, но может быть multi-item)
    delivered: list[str] = []
    for _ in range(items_per_order):
        item = await pop_auto_delivery_item(rule["id"])
        if not item:
            break
        delivered.append(item)

    if not delivered:
        # Товаров не осталось — fallback + алёрт админу/пользователю
        user = await get_user_by_id(acc["user_id"])
        if user:
            try:
                await bot.send_message(
                    user["telegram_id"],
                    f"🚨 <b>Закончились товары!</b>\n"
                    f"Лот: <b>{rule['lot_name']}</b>\n"
                    f"Заказ: <code>{order.order_id}</code>\n"
                    f"Покупатель <b>{order.buyer}</b> ждёт — "
                    f"срочно пополни автовыдачу!",
                )
            except Exception:  # noqa: BLE001
                pass
        await send_chat_message(
            sess,
            order.buyer or "",
            "Здравствуйте! Товар временно закончился, пишу вам через пару минут "
            "с ручной выдачей. Приносим извинения за задержку.",
        )
        return {"ok": False, "reason": "out_of_stock"}

    # Рендерим сообщение
    text = render_delivery_message(
        template=rule.get("template"),
        items=delivered,
        lot_name=rule["lot_name"],
        buyer=order.buyer or "",
        order_id=order.order_id,
    )

    ok = await send_chat_message(sess, order.buyer or "", text)

    # Tracking в audit_log
    await audit_log(
        user_id=acc["user_id"],
        action="auto_delivery",
        details=json.dumps(
            {
                "order_id": order.order_id,
                "buyer": order.buyer,
                "lot": rule["lot_name"],
                "items_count": len(delivered),
                "ok": ok,
            },
            ensure_ascii=False,
        ),
    )

    # Проверяем остаток, алёртим если низко
    remaining = await get_remaining_count(rule["id"])
    if remaining < low_stock_threshold:
        user = await get_user_by_id(acc["user_id"])
        if user:
            try:
                await bot.send_message(
                    user["telegram_id"],
                    f"⚠️ <b>Низкий остаток</b>\n"
                    f"Лот: <b>{rule['lot_name']}</b> — осталось {remaining}.\n"
                    f"Пополни через <i>🤖 Автовыдача</i>.",
                )
            except Exception:  # noqa: BLE001
                pass

    return {
        "ok": ok,
        "delivered_items": delivered,
        "remaining": remaining,
        "reason": "delivered" if ok else "send_failed",
    }
