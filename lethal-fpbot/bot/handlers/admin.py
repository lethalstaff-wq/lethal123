"""Админ-панель.

Доступ только для тех, чей telegram_id есть в config.ADMIN_IDS.
Возможности:
  • Просмотр и подтверждение/отклонение pending_payments
  • Список пользователей
  • Рассылка по всем (упрощённо — без бат-чинга)
"""

from __future__ import annotations

import logging

from aiogram import Bot, F, Router
from aiogram.filters import Command, StateFilter
from aiogram.fsm.context import FSMContext
from aiogram.fsm.state import State, StatesGroup
from aiogram.types import CallbackQuery, Message

from bot.keyboards.kb import admin_menu, cancel_inline
from config import ADMIN_IDS, TIER_NAMES
from database.db import connect
from database.models import (
    add_balance,
    get_user_by_id,
    list_pending_payments,
    set_payment_status,
    update_user_subscription,
)
from utils.helpers import now_ts

REFERRAL_PERCENT = 10  # 10% от суммы покупки реферала идёт пригласившему

router = Router(name="admin")
logger = logging.getLogger(__name__)


def _is_admin(user_id: int) -> bool:
    return user_id in ADMIN_IDS


class Broadcast(StatesGroup):
    waiting_text = State()


@router.message(Command("admin"))
async def admin(message: Message) -> None:
    if not message.from_user or not _is_admin(message.from_user.id):
        return
    await message.answer("👑 <b>Админ-панель</b>", reply_markup=admin_menu())


@router.callback_query(F.data == "admin:users")
async def cb_users(call: CallbackQuery) -> None:
    if not call.from_user or not _is_admin(call.from_user.id):
        await call.answer()
        return
    async with connect() as db:
        cur = await db.execute(
            "SELECT COUNT(*) AS c FROM users"
        )
        total = (await cur.fetchone())["c"]
        cur = await db.execute(
            "SELECT * FROM users ORDER BY id DESC LIMIT 10"
        )
        rows = [dict(r) for r in await cur.fetchall()]
    lines = [f"👥 Всего пользователей: <b>{total}</b>", "", "Последние 10:"]
    for r in rows:
        tier = r.get("subscription_tier") or "—"
        lines.append(f"• #{r['id']} @{r.get('username') or '—'} · {tier}")
    if isinstance(call.message, Message):
        await call.message.answer("\n".join(lines))
    await call.answer()


@router.callback_query(F.data == "admin:payments")
async def cb_payments(call: CallbackQuery) -> None:
    if not call.from_user or not _is_admin(call.from_user.id):
        await call.answer()
        return
    pending = await list_pending_payments()
    if not pending:
        if isinstance(call.message, Message):
            await call.message.answer("📭 Нет ожидающих платежей.")
        await call.answer()
        return

    from bot.keyboards.kb import payment_review

    for p in pending:
        if isinstance(call.message, Message):
            await call.message.answer(
                f"💳 #{p['id']} · user_id={p['user_id']} · "
                f"{TIER_NAMES.get(p['tier'], p['tier'])} · {p['amount']}₽",
                reply_markup=payment_review(p["id"]),
            )
    await call.answer()


@router.callback_query(F.data.startswith("admin:pay_ok:"))
async def cb_pay_ok(call: CallbackQuery, bot: Bot) -> None:
    if not call.from_user or not _is_admin(call.from_user.id):
        await call.answer()
        return
    pid = int((call.data or "").split(":")[2])
    payment = await set_payment_status(pid, "approved", note="ok")
    if not payment:
        await call.answer("Не нашёл", show_alert=True)
        return

    expires = now_ts() + 30 * 24 * 3600  # 30 дней
    await update_user_subscription(payment["user_id"], payment["tier"], expires)

    user = await get_user_by_id(payment["user_id"])
    if user:
        try:
            await bot.send_message(
                user["telegram_id"],
                f"✅ Оплата подтверждена! Активирован тариф "
                f"<b>{TIER_NAMES.get(payment['tier'], payment['tier'])}</b> "
                f"на 30 дней.",
            )
        except Exception:  # noqa: BLE001
            pass

        # Реферальный бонус — пригласившему капает % от суммы на баланс
        if user.get("referred_by"):
            bonus = int(payment["amount"] * REFERRAL_PERCENT / 100)
            await add_balance(user["referred_by"], bonus)
            referrer = await get_user_by_id(user["referred_by"])
            if referrer:
                try:
                    await bot.send_message(
                        referrer["telegram_id"],
                        f"🎁 <b>Реферальный бонус!</b>\n"
                        f"Твой приглашённый купил {TIER_NAMES.get(payment['tier'], '')}.\n"
                        f"+{bonus}₽ на баланс.",
                    )
                except Exception:  # noqa: BLE001
                    pass
    await call.answer("Подтверждено")


@router.callback_query(F.data.startswith("admin:pay_no:"))
async def cb_pay_no(call: CallbackQuery, bot: Bot) -> None:
    if not call.from_user or not _is_admin(call.from_user.id):
        await call.answer()
        return
    pid = int((call.data or "").split(":")[2])
    payment = await set_payment_status(pid, "rejected", note="no")
    if not payment:
        await call.answer("Не нашёл", show_alert=True)
        return
    user = await get_user_by_id(payment["user_id"])
    if user:
        try:
            await bot.send_message(
                user["telegram_id"],
                f"❌ Заявка #{pid} отклонена.",
            )
        except Exception:  # noqa: BLE001
            pass
    await call.answer("Отклонено")


@router.callback_query(F.data == "admin:broadcast")
async def cb_broadcast(call: CallbackQuery, state: FSMContext) -> None:
    if not call.from_user or not _is_admin(call.from_user.id):
        await call.answer()
        return
    await state.set_state(Broadcast.waiting_text)
    if isinstance(call.message, Message):
        await call.message.answer(
            "📢 Пришли текст рассылки. Будет отправлено всем пользователям.",
            reply_markup=cancel_inline(),
        )
    await call.answer()


@router.message(StateFilter(Broadcast.waiting_text))
async def step_broadcast(message: Message, state: FSMContext, bot: Bot) -> None:
    if not message.text or not message.from_user or not _is_admin(message.from_user.id):
        return
    text = message.text
    async with connect() as db:
        cur = await db.execute("SELECT telegram_id FROM users")
        ids = [r[0] for r in await cur.fetchall()]
    sent = 0
    failed = 0
    for tg_id in ids:
        try:
            await bot.send_message(tg_id, text)
            sent += 1
        except Exception:  # noqa: BLE001
            failed += 1
    await state.clear()
    await message.answer(f"📢 Готово. Отправлено: {sent}, ошибок: {failed}")
