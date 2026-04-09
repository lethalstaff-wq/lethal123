"""Рассылка клиентам по сегментам.

Продавец может выбрать сегмент (например «Спящие» или «VIP») и
разослать всем клиентам этого сегмента сообщение в FunPay-чат.
Поддерживаются переменные: {buyer}, {lot}.

Защита:
  • Rate limit: между сообщениями 3-5 секунд случайно
  • Content moderation: проверяется каждый исходящий текст
  • Stop list: клиенты в blacklist пропускаются
  • Max 100 сообщений за раз (чтобы не задело FunPay)
"""

from __future__ import annotations

import asyncio
import logging
import random

from aiogram import F, Router
from aiogram.filters import Command, StateFilter
from aiogram.fsm.context import FSMContext
from aiogram.fsm.state import State, StatesGroup
from aiogram.types import (
    CallbackQuery,
    InlineKeyboardButton,
    InlineKeyboardMarkup,
    Message,
)

from bot.keyboards.kb import cancel_inline
from database.models import get_or_create_user, is_blacklisted
from database.models_crm import (
    ALL_SEGMENTS,
    SEGMENT_EMOJI,
    SEGMENT_NAMES,
    count_by_segment,
    list_customers,
)
from services import session_pool
from services.content_moderation import check_outgoing
from utils.helpers import escape_html

router = Router(name="crm_broadcast")
logger = logging.getLogger(__name__)


MAX_PER_BROADCAST = 100


class BroadcastFSM(StatesGroup):
    waiting_segment = State()
    waiting_text = State()
    waiting_confirm = State()


def _segment_picker(segments: dict[str, int]) -> InlineKeyboardMarkup:
    rows = []
    for seg in ALL_SEGMENTS:
        cnt = segments.get(seg, 0)
        if cnt == 0:
            continue
        rows.append(
            [
                InlineKeyboardButton(
                    text=f"{SEGMENT_EMOJI[seg]} {SEGMENT_NAMES[seg]} ({cnt})",
                    callback_data=f"bcrm:seg:{seg}",
                )
            ]
        )
    rows.append([InlineKeyboardButton(text="❌ Отмена", callback_data="cancel")])
    return InlineKeyboardMarkup(inline_keyboard=rows)


def _confirm_kb() -> InlineKeyboardMarkup:
    return InlineKeyboardMarkup(
        inline_keyboard=[
            [
                InlineKeyboardButton(text="✅ Отправить", callback_data="bcrm:send"),
                InlineKeyboardButton(text="❌ Отмена", callback_data="cancel"),
            ]
        ]
    )


@router.message(Command("broadcast_customers"))
async def cmd_broadcast(message: Message, state: FSMContext) -> None:
    if not message.from_user:
        return
    user = await get_or_create_user(message.from_user.id, message.from_user.username)
    segments = await count_by_segment(user["id"])
    if not segments:
        await message.answer("📭 У тебя ещё нет клиентов в CRM.")
        return

    await state.set_state(BroadcastFSM.waiting_segment)
    await message.answer(
        "📣 <b>Рассылка клиентам по сегментам</b>\n\n"
        "Выбери кому отправить:",
        reply_markup=_segment_picker(segments),
    )


@router.callback_query(F.data.startswith("bcrm:seg:"), StateFilter(BroadcastFSM.waiting_segment))
async def cb_pick_segment(call: CallbackQuery, state: FSMContext) -> None:
    if not call.from_user or not isinstance(call.message, Message):
        return
    segment = (call.data or "").split(":")[2]
    if segment not in ALL_SEGMENTS:
        await call.answer()
        return

    user = await get_or_create_user(call.from_user.id, call.from_user.username)
    customers = await list_customers(
        user["id"], segment=segment, limit=MAX_PER_BROADCAST + 1
    )
    if not customers:
        await call.answer("В этом сегменте 0 клиентов", show_alert=True)
        return

    await state.update_data(
        segment=segment, count=min(len(customers), MAX_PER_BROADCAST)
    )
    await state.set_state(BroadcastFSM.waiting_text)

    await call.message.answer(
        f"{SEGMENT_EMOJI[segment]} <b>{SEGMENT_NAMES[segment]}</b> — "
        f"{min(len(customers), MAX_PER_BROADCAST)} клиентов\n\n"
        "Пришли текст рассылки. Поддерживаются переменные:\n"
        "• <code>{buyer}</code> — имя покупателя\n"
        "• <code>{orders}</code> — кол-во заказов\n"
        "• <code>{total}</code> — сколько потратил\n\n"
        "⚠️ <i>Рассылка проходит content moderation — "
        "запрещённые фразы будут заблокированы.</i>",
        reply_markup=cancel_inline(),
    )
    await call.answer()


@router.message(StateFilter(BroadcastFSM.waiting_text))
async def step_text(message: Message, state: FSMContext) -> None:
    if not message.text:
        return
    text = message.text.strip()

    # Проверяем шаблон на запрещёнку
    mod = check_outgoing(text)
    if mod.blocked:
        await message.answer(
            "🚫 <b>Сообщение заблокировано модерацией</b>\n\n"
            f"Причина: {mod.reason}\n\n"
            f"<b>Безопасная версия:</b>\n<code>{escape_html(mod.safe_text)}</code>\n\n"
            "Перепиши и пришли снова."
        )
        return

    data = await state.get_data()
    await state.update_data(text=text)
    await state.set_state(BroadcastFSM.waiting_confirm)

    segment = data["segment"]
    count = data["count"]

    await message.answer(
        f"📣 <b>Подтверди рассылку</b>\n\n"
        f"Сегмент: {SEGMENT_EMOJI[segment]} {SEGMENT_NAMES[segment]}\n"
        f"Получателей: <b>{count}</b>\n\n"
        f"<b>Текст:</b>\n<code>{escape_html(text[:500])}</code>\n\n"
        "Между сообщениями будет 3-5 секунд задержка — рассылка займёт "
        f"примерно <b>{count * 4 // 60} мин</b>.",
        reply_markup=_confirm_kb(),
    )


@router.callback_query(F.data == "bcrm:send", StateFilter(BroadcastFSM.waiting_confirm))
async def cb_send(call: CallbackQuery, state: FSMContext) -> None:
    if not call.from_user or not isinstance(call.message, Message):
        return
    data = await state.get_data()
    await state.clear()

    segment = data["segment"]
    text = data["text"]
    user = await get_or_create_user(call.from_user.id, call.from_user.username)

    customers = await list_customers(
        user["id"], segment=segment, limit=MAX_PER_BROADCAST
    )
    if not customers:
        await call.message.answer("Некому отправлять")
        return

    await call.message.answer(
        f"⏳ Начинаю рассылку по {len(customers)} клиентам…"
    )
    await call.answer()

    # Запускаем в фоне чтобы не блокировать handler
    asyncio.create_task(
        _broadcast_runner(call.bot, user["id"], customers, text)
    )


async def _broadcast_runner(bot, user_id: int, customers: list[dict], text: str) -> None:
    """Последовательная рассылка с задержкой."""
    from funpay.api import send_chat_message

    sent = 0
    skipped = 0
    failed = 0

    for customer in customers:
        buyer = customer["fp_username"]
        if await is_blacklisted(user_id, buyer):
            skipped += 1
            continue

        # Рендер шаблона
        try:
            rendered = text.format(
                buyer=buyer,
                orders=customer["orders_count"],
                total=int(customer["total_spent"]),
            )
        except (KeyError, IndexError):
            rendered = text

        # Проверка content moderation для персонализированного текста
        mod = check_outgoing(rendered)
        if mod.blocked:
            failed += 1
            continue

        # Берём первую доступную сессию пользователя
        from database.db import connect

        async with connect() as db:
            cur = await db.execute(
                "SELECT id FROM fp_accounts WHERE user_id = ? AND is_active = 1 LIMIT 1",
                (user_id,),
            )
            acc_row = await cur.fetchone()

        if not acc_row:
            failed += 1
            continue

        sess = await session_pool.get(acc_row["id"])
        if not sess:
            failed += 1
            continue

        try:
            ok = await send_chat_message(sess, buyer, rendered)
            if ok:
                sent += 1
            else:
                failed += 1
        except Exception:  # noqa: BLE001
            logger.exception("broadcast send failed for %s", buyer)
            failed += 1

        # Задержка 3-5 секунд
        await asyncio.sleep(random.uniform(3.0, 5.0))

    # Репорт пользователю
    from database.models import get_user_by_id

    u = await get_user_by_id(user_id)
    if u:
        try:
            await bot.send_message(
                u["telegram_id"],
                f"📣 <b>Рассылка завершена</b>\n\n"
                f"✅ Отправлено: <b>{sent}</b>\n"
                f"⏭ Пропущено (ЧС): {skipped}\n"
                f"❌ Ошибок: {failed}",
            )
        except Exception:  # noqa: BLE001
            pass
