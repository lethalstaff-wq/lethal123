"""Быстрые команды для продвинутых пользователей.

Набор /команд которые делают одно конкретное действие без меню:

  /raise — немедленно поднять все лоты
  /online — включить/выключить вечный онлайн
  /ping — проверить живую ли FP сессия
  /stop — остановить все автоматизации разом
  /go — включить все автоматизации разом
  /health — проверить здоровье лотов
  /summary — быстрое саммари за сегодня
  /me — краткий профиль
"""

from __future__ import annotations

import logging

from aiogram import Router
from aiogram.filters import Command
from aiogram.types import Message

from database.models import (
    get_or_create_user,
    get_settings,
    list_fp_accounts,
    stats_summary,
    update_setting,
)
from database.models_crm import user_crm_summary
from services import session_pool
from utils.helpers import escape_html, now_ts

router = Router(name="quick_actions")
logger = logging.getLogger(__name__)


@router.message(Command("raise"))
async def cmd_raise(message: Message) -> None:
    if not message.from_user:
        return
    user = await get_or_create_user(message.from_user.id, message.from_user.username)
    accounts = await list_fp_accounts(user["id"])
    if not accounts:
        await message.answer("У тебя нет ФП-аккаунтов.")
        return

    total_lots = 0
    for acc in accounts:
        if not acc.get("is_active"):
            continue
        sess = await session_pool.get(acc["id"])
        if not sess or not sess.user_id:
            continue
        try:
            from funpay.api import get_lots, raise_lots

            lots = await get_lots(sess, sess.user_id)
            for lot in lots:
                if lot.id:
                    try:
                        await raise_lots(sess, game_id=1, node_id=int(lot.id))
                        total_lots += 1
                    except (ValueError, Exception):  # noqa: BLE001
                        pass
        except Exception:  # noqa: BLE001
            logger.exception("quick raise failed")

    await message.answer(f"🚀 Попытались поднять {total_lots} лотов.")


@router.message(Command("online"))
async def cmd_online(message: Message) -> None:
    if not message.from_user:
        return
    user = await get_or_create_user(message.from_user.id, message.from_user.username)
    settings = await get_settings(user["id"])
    new_val = 0 if settings.get("always_online") else 1
    await update_setting(user["id"], "always_online", new_val)
    await message.answer(
        "🟢 Вечный онлайн включён" if new_val else "⚪️ Вечный онлайн выключен"
    )


@router.message(Command("ping"))
async def cmd_ping(message: Message) -> None:
    if not message.from_user:
        return
    user = await get_or_create_user(message.from_user.id, message.from_user.username)
    accounts = await list_fp_accounts(user["id"])
    if not accounts:
        await message.answer("Нет аккаунтов.")
        return

    lines = ["📡 <b>Статус аккаунтов:</b>", ""]
    for acc in accounts:
        sess = await session_pool.get(acc["id"])
        if not sess:
            lines.append(f"⚪️ <b>{escape_html(acc['login'])}</b> — сессия не поднята")
            continue
        try:
            info = await sess.restore()
            if info and info.username:
                lines.append(
                    f"🟢 <b>{escape_html(acc['login'])}</b> — "
                    f"{escape_html(info.username)}"
                )
            else:
                lines.append(f"🔴 <b>{escape_html(acc['login'])}</b> — сессия протухла")
        except Exception as exc:  # noqa: BLE001
            lines.append(f"🔴 <b>{escape_html(acc['login'])}</b> — {exc}")

    await message.answer("\n".join(lines))


@router.message(Command("stop"))
async def cmd_stop(message: Message) -> None:
    if not message.from_user:
        return
    user = await get_or_create_user(message.from_user.id, message.from_user.username)

    # Выключаем все тумблеры автоматизаций
    toggles = [
        "auto_raise",
        "auto_delivery",
        "auto_response",
        "always_online",
        "review_reply",
        "cross_sell",
        "funnel_enabled",
        "auto_complaint",
    ]
    for key in toggles:
        await update_setting(user["id"], key, 0)

    await message.answer(
        "🛑 <b>Все автоматизации остановлены</b>\n\n"
        "Бот продолжает отслеживать заказы и сообщения — "
        "только реактивные действия отключены.\n\n"
        "Включить обратно: /go или ⚙️ Настройки"
    )


@router.message(Command("go"))
async def cmd_go(message: Message) -> None:
    if not message.from_user:
        return
    user = await get_or_create_user(message.from_user.id, message.from_user.username)

    # Включаем базовый набор
    toggles = [
        "auto_raise",
        "auto_delivery",
        "auto_response",
        "always_online",
    ]
    for key in toggles:
        await update_setting(user["id"], key, 1)

    await message.answer(
        "🚀 <b>Автоматизации запущены</b>\n\n"
        "Включено: автоподнятие, автовыдача, автоответы, вечный онлайн."
    )


@router.message(Command("summary"))
async def cmd_summary(message: Message) -> None:
    if not message.from_user:
        return
    user = await get_or_create_user(message.from_user.id, message.from_user.username)
    day = await stats_summary(user["id"], now_ts() - 86400)
    crm = await user_crm_summary(user["id"])

    await message.answer(
        f"⚡ <b>Сводка за сегодня</b>\n\n"
        f"💰 Выручка: <b>{day['total']:,}₽</b>\n".replace(",", " ")
        + f"📦 Заказов: <b>{day['count']}</b>\n"
        f"👥 В CRM: <b>{crm['total']}</b>\n"
        f"⭐️ LTV (avg): <b>{crm['avg_ltv']:,.0f}₽</b>".replace(",", " ")
    )


@router.message(Command("me"))
async def cmd_me(message: Message) -> None:
    if not message.from_user:
        return
    user = await get_or_create_user(message.from_user.id, message.from_user.username)
    accounts = await list_fp_accounts(user["id"])
    active_count = sum(1 for a in accounts if a.get("is_active"))

    tier = user.get("subscription_tier") or "—"
    expires = user.get("subscription_expires") or 0
    if expires and expires < now_ts():
        tier = "истёк"

    await message.answer(
        f"👤 <b>Твой профиль</b>\n\n"
        f"🆔 <code>{user['telegram_id']}</code>\n"
        f"💎 Тариф: <b>{tier}</b>\n"
        f"📁 Аккаунтов: <b>{active_count}/{len(accounts)}</b>\n"
        f"🔗 Реф-код: <code>{user.get('referral_code') or '—'}</code>"
    )


@router.message(Command("health"))
async def cmd_health(message: Message) -> None:
    if not message.from_user:
        return
    user = await get_or_create_user(message.from_user.id, message.from_user.username)
    accounts = await list_fp_accounts(user["id"])
    if not accounts:
        await message.answer("Нет аккаунтов.")
        return

    # Упрощённый health check — считаем только сессии
    online = 0
    for acc in accounts:
        if not acc.get("is_active"):
            continue
        sess = await session_pool.get(acc["id"])
        if sess and sess.user_id:
            online += 1

    from services.lot_health import LotHealthReport, format_report

    report = LotHealthReport(total_lots=len(accounts), healthy=online)
    await message.answer(format_report(report))
