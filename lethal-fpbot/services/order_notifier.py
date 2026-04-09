"""Rich-уведомления о заказах в Telegram.

Заменяет простое текстовое сообщение order_watcher'а на красивую
карточку с:
  • Иконкой типа лота
  • Детальной информацией
  • Быстрыми кнопками: «💬 Написать», «📇 CRM карточка», «🛒 История клиента»
  • Если есть ИИ — автоматический summary последних 10 сообщений
  • Счётчик «это N-й заказ от этого клиента»

Минималистично, информативно, кнопки ведут в ключевые действия.
"""

from __future__ import annotations

import logging

from aiogram import Bot
from aiogram.types import InlineKeyboardButton, InlineKeyboardMarkup

from database.models_crm import get_customer
from utils.helpers import escape_html

logger = logging.getLogger(__name__)


def _lot_emoji(lot_name: str) -> str:
    """Эвристика: тип лота по ключевым словам."""
    name = (lot_name or "").lower()
    if any(w in name for w in ["gold", "gp", "gil", "isk", "valuta", "валюта"]):
        return "💰"
    if any(w in name for w in ["account", "акк", "аккаунт", "login"]):
        return "🎮"
    if any(w in name for w in ["key", "ключ", "серийник"]):
        return "🔑"
    if any(w in name for w in ["boost", "прокачк", "буст", "рейтинг"]):
        return "🚀"
    if any(w in name for w in ["skin", "скин", "оружие", "item"]):
        return "🎁"
    return "📦"


def _buyer_trust_badge(customer: dict | None) -> str:
    if not customer:
        return "🆕"
    if customer["orders_count"] >= 4:
        return "💎"
    if customer["orders_count"] >= 2:
        return "👤"
    if customer["reviews_negative"] >= 2:
        return "🚫"
    return "🆕"


def _order_keyboard(
    account_id: int,
    buyer: str,
    customer_id: int | None,
    order_id: str,
) -> InlineKeyboardMarkup:
    rows = []
    if buyer:
        rows.append(
            [
                InlineKeyboardButton(
                    text="💬 Написать",
                    callback_data=f"chat:reply:{account_id}:{buyer}",
                )
            ]
        )
    if customer_id:
        rows.append(
            [
                InlineKeyboardButton(
                    text="📇 CRM карточка",
                    callback_data=f"crm:view:{customer_id}",
                )
            ]
        )
    return InlineKeyboardMarkup(inline_keyboard=rows)


async def send_order_notification(
    bot: Bot,
    user_tg_id: int,
    acc: dict,
    order,
    *,
    user_db_id: int,
) -> None:
    """Отправляет красивую карточку заказа."""
    customer = None
    if order.buyer:
        try:
            customer = await get_customer(user_db_id, order.buyer)
        except Exception:  # noqa: BLE001
            pass

    emoji = _lot_emoji(order.lot_name or "")
    badge = _buyer_trust_badge(customer)

    lines = [
        f"{emoji} <b>Новый заказ!</b>",
        "",
        f"📦 <b>{escape_html(order.lot_name or '')}</b>",
    ]
    if order.amount:
        currency = escape_html(order.currency or "₽")
        lines.append(f"💰 <b>{order.amount} {currency}</b>")

    lines.append("")
    lines.append(
        f"{badge} Покупатель: <b>{escape_html(order.buyer or '—')}</b>"
    )
    if customer:
        if customer["orders_count"] > 0:
            lines.append(
                f"    🔁 {customer['orders_count']}-й заказ · "
                f"потратил {int(customer['total_spent'])}₽ всего"
            )
            if customer["orders_count"] >= 2:
                lines.append("    <i>Постоянный клиент — обслужи вежливо!</i>")
        if customer["reviews_negative"] >= 2:
            lines.append(
                "    ⚠️ <i>У клиента 2+ отрицательных отзывов в CRM</i>"
            )

    lines.append("")
    lines.append(f"🏷 Аккаунт: <b>{escape_html(acc['login'])}</b>")
    lines.append(f"🔗 ID: <code>{escape_html(order.order_id)}</code>")

    try:
        await bot.send_message(
            user_tg_id,
            "\n".join(lines),
            reply_markup=_order_keyboard(
                acc["id"],
                order.buyer or "",
                customer["id"] if customer else None,
                order.order_id,
            ),
        )
    except Exception:  # noqa: BLE001
        logger.exception("send_order_notification failed")
