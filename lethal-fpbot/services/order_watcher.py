"""Мониторинг заказов FunPay.

Делает следующее:
  • Парсит /orders/trade у каждого аккаунта раз в 30 секунд
  • Для новых заказов (paid):
      — добавляет статистику
      — триггерит автовыдачу (services.auto_deliver)
      — отправляет cross-sell, если включён
      — заводит «попроси подтвердить» через confirm_minutes
  • Для давно открытых заказов:
      — подаёт жалобу (auto_complaint)
      — просит отзыв (после закрытия)
"""

from __future__ import annotations

import asyncio
import logging

from aiogram import Bot

from database.models import (
    add_stat,
    get_settings,
    get_user_by_id,
    list_open_orders_for_account,
    mark_order_flag,
    upsert_order,
)
from funpay.api import file_complaint, get_orders, send_chat_message
from utils.helpers import escape_html, now_ts

from . import auto_deliver, cross_sell, session_pool

logger = logging.getLogger(__name__)
INTERVAL = 30  # секунд


async def run(bot: Bot) -> None:
    while True:
        try:
            await _tick(bot)
        except Exception:  # noqa: BLE001
            logger.exception("order_watcher tick failed")
        await asyncio.sleep(INTERVAL)


async def _tick(bot: Bot) -> None:
    for account_id, sess, acc in await session_pool.iter_active():
        try:
            await _process_account(bot, account_id, sess, acc)
        except Exception:  # noqa: BLE001
            logger.exception("order_watcher account %s failed", acc["login"])


async def _process_account(bot: Bot, account_id: int, sess, acc: dict) -> None:
    settings = await get_settings(acc["user_id"])
    user = await get_user_by_id(acc["user_id"])
    if not user:
        return

    orders = await get_orders(sess)
    for order in orders:
        is_new, row = await upsert_order(
            account_id=account_id,
            order_id=order.order_id,
            status=order.status,
            buyer=order.buyer,
            amount=order.amount,
            lot_name=order.lot_name,
        )
        if is_new and order.status == "paid":
            await _on_new_paid_order(bot, sess, acc, user, order, row, settings)

    # Просрочка → авто-жалоба
    if settings.get("auto_complaint"):
        threshold = (settings.get("complaint_hours") or 24) * 3600
        for row in await list_open_orders_for_account(account_id):
            age = now_ts() - row["first_seen"]
            if age >= threshold and not row["complaint_filed"]:
                text = settings.get("complaint_text") or (
                    "Покупатель не подтвердил заказ. Прошу вмешательства."
                )
                ok = await file_complaint(sess, row["order_id"], text)
                await mark_order_flag(row["id"], "complaint_filed")
                if ok:
                    await bot.send_message(
                        user["telegram_id"],
                        f"🚨 Подал жалобу по заказу <code>{row['order_id']}</code> "
                        f"(аккаунт {escape_html(acc['login'])})",
                    )


async def _on_new_paid_order(
    bot: Bot, sess, acc: dict, user: dict, order, row: dict, settings: dict
) -> None:
    # Алёрт в Telegram
    await bot.send_message(
        user["telegram_id"],
        (
            f"🛒 <b>Новый заказ!</b>\n"
            f"📦 {escape_html(order.lot_name or '')}\n"
            f"👤 {escape_html(order.buyer or '')}\n"
            f"💰 {order.amount} {escape_html(order.currency or '')}\n"
            f"🏷 Аккаунт: {escape_html(acc['login'])}"
        ),
    )

    # Статистика
    await add_stat(
        user_id=acc["user_id"],
        fp_account_id=acc["id"],
        amount=int(order.amount or 0),
        lot_name=order.lot_name,
        buyer=order.buyer,
    )

    # Автовыдача
    if settings.get("auto_delivery"):
        try:
            await auto_deliver.deliver(sess, acc, order, row)
            await mark_order_flag(row["id"], "delivered")
        except Exception:  # noqa: BLE001
            logger.exception("auto_deliver failed")

    # Просьба подтвердить
    if settings.get("ask_confirm"):
        # Откладываем фоновой задачей — confirm_minutes
        delay = (settings.get("confirm_minutes") or 30) * 60
        asyncio.create_task(
            _delayed_ask_confirm(sess, acc, order, row, delay)
        )

    # Cross-sell
    if settings.get("cross_sell"):
        try:
            await cross_sell.send(sess, acc, order, settings)
        except Exception:  # noqa: BLE001
            logger.exception("cross_sell failed")


async def _delayed_ask_confirm(sess, acc: dict, order, row: dict, delay: int) -> None:
    await asyncio.sleep(delay)
    text = (
        f"👋 Если всё в порядке с заказом — подтверди его, пожалуйста "
        f"в карточке заказа, чтобы средства были перечислены продавцу. "
        f"Спасибо за покупку!"
    )
    # Найдём чат с покупателем — у заказа в FunPay есть buyer username,
    # отдельный fp_chat_id здесь не парсим, поэтому отправим через node = buyer
    # (FunPay использует username как часть node для DM).
    try:
        await send_chat_message(sess, order.buyer, text)
    except Exception:  # noqa: BLE001
        logger.debug("ask_confirm send failed")
    await mark_order_flag(row["id"], "confirm_asked")
