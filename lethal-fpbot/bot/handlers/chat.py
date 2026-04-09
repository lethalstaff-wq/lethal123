"""Чат FunPay через Telegram — UI-часть.

Бот пересылает сообщения покупателей через services.chat_watcher,
здесь живут только обработчики кнопок «Ответить / Заготовки / ИИ /
Арбитраж / Чёрный список» и FSM-ввод свободного ответа.
"""

from __future__ import annotations

import logging

from aiogram import F, Router
from aiogram.filters import StateFilter
from aiogram.fsm.context import FSMContext
from aiogram.fsm.state import State, StatesGroup
from aiogram.types import CallbackQuery, Message

from bot.keyboards.kb import cancel_inline, texts_picker
from database.models import (
    add_to_blacklist,
    get_or_create_user,
    get_text,
    list_texts,
)
from funpay.api import get_chat_messages, send_chat_message
from services import arbitrage_assist, session_pool
from services.ai_responder import reply_to_buyer
from utils.helpers import escape_html

router = Router(name="chat")
logger = logging.getLogger(__name__)


class ReplyChat(StatesGroup):
    waiting_text = State()


def _parse_cb(data: str) -> tuple[int, str] | None:
    parts = data.split(":")
    if len(parts) < 4:
        return None
    try:
        return int(parts[2]), parts[3]
    except ValueError:
        return None


@router.callback_query(F.data.startswith("chat:reply:"))
async def cb_reply(call: CallbackQuery, state: FSMContext) -> None:
    parsed = _parse_cb(call.data or "")
    if not parsed or not isinstance(call.message, Message):
        await call.answer()
        return
    account_id, fp_chat_id = parsed
    await state.set_state(ReplyChat.waiting_text)
    await state.update_data(account_id=account_id, fp_chat_id=fp_chat_id)
    await call.message.answer(
        "✍️ Пришли текст ответа — отправлю в FunPay.",
        reply_markup=cancel_inline(),
    )
    await call.answer()


@router.message(StateFilter(ReplyChat.waiting_text))
async def step_text(message: Message, state: FSMContext) -> None:
    if not message.text:
        return
    data = await state.get_data()
    sess = await session_pool.get(int(data["account_id"]))
    if not sess:
        await message.answer("❌ Сессия не активна, проверь аккаунт.")
        await state.clear()
        return
    ok = await send_chat_message(sess, data["fp_chat_id"], message.text)
    await state.clear()
    await message.answer("✅ Отправлено" if ok else "❌ Не удалось отправить")


@router.callback_query(F.data.startswith("chat:texts:"))
async def cb_texts(call: CallbackQuery) -> None:
    parsed = _parse_cb(call.data or "")
    if not parsed or not call.from_user or not isinstance(call.message, Message):
        await call.answer()
        return
    account_id, fp_chat_id = parsed
    user = await get_or_create_user(call.from_user.id, call.from_user.username)
    items = await list_texts(user["id"])
    await call.message.answer(
        "📋 Выбери заготовку:",
        reply_markup=texts_picker(account_id, fp_chat_id, items),
    )
    await call.answer()


@router.callback_query(F.data.startswith("chat:send:"))
async def cb_send_text(call: CallbackQuery) -> None:
    parts = (call.data or "").split(":")
    if len(parts) < 5 or not call.from_user:
        await call.answer()
        return
    try:
        account_id = int(parts[2])
        fp_chat_id = parts[3]
        text_id = int(parts[4])
    except ValueError:
        await call.answer()
        return

    user = await get_or_create_user(call.from_user.id, call.from_user.username)
    text_row = await get_text(text_id, user["id"])
    if not text_row:
        await call.answer("Не нашёл текст", show_alert=True)
        return
    sess = await session_pool.get(account_id)
    if not sess:
        await call.answer("Сессия неактивна", show_alert=True)
        return
    ok = await send_chat_message(sess, fp_chat_id, text_row["text"])
    await call.answer("✅" if ok else "❌")


@router.callback_query(F.data.startswith("chat:ai:"))
async def cb_ai(call: CallbackQuery) -> None:
    parsed = _parse_cb(call.data or "")
    if not parsed or not isinstance(call.message, Message):
        await call.answer()
        return
    account_id, fp_chat_id = parsed
    sess = await session_pool.get(account_id)
    if not sess:
        await call.answer("Сессия неактивна", show_alert=True)
        return
    msgs = await get_chat_messages(sess, fp_chat_id)
    last_buyer = next(
        (m for m in reversed(msgs) if m.get("author") != (sess.username or "")),
        None,
    )
    if not last_buyer:
        await call.answer("Нет сообщений от покупателя", show_alert=True)
        return
    await call.answer("Думаю…")
    suggestion = await reply_to_buyer(last_buyer.get("text", ""))
    if not suggestion:
        await call.message.answer("⚠️ ИИ недоступен (нет ANTHROPIC_API_KEY).")
        return
    await call.message.answer(
        f"🤖 <b>Предложенный ответ:</b>\n\n{escape_html(suggestion)}\n\n"
        "Скопируй и вставь в «Ответить» если нравится."
    )


@router.callback_query(F.data.startswith("chat:arb:"))
async def cb_arb(call: CallbackQuery) -> None:
    parsed = _parse_cb(call.data or "")
    if not parsed or not isinstance(call.message, Message):
        await call.answer()
        return
    account_id, fp_chat_id = parsed
    sess = await session_pool.get(account_id)
    if not sess:
        await call.answer("Сессия неактивна", show_alert=True)
        return
    await call.answer("Анализирую переписку…")
    defense = await arbitrage_assist.build_defense(sess, fp_chat_id)
    if not defense:
        await call.message.answer("⚠️ Не удалось получить защиту от ИИ.")
        return
    await call.message.answer(
        f"🛡 <b>Текст защиты для арбитража</b>\n\n{escape_html(defense)}"
    )


@router.callback_query(F.data.startswith("chat:black:"))
async def cb_black(call: CallbackQuery) -> None:
    parsed = _parse_cb(call.data or "")
    if not parsed or not call.from_user or not isinstance(call.message, Message):
        await call.answer()
        return
    account_id, fp_chat_id = parsed
    user = await get_or_create_user(call.from_user.id, call.from_user.username)
    # Имя покупателя берём из chat_state
    from database.models import get_chat_state

    state = await get_chat_state(account_id, fp_chat_id)
    name = (state or {}).get("interlocutor") or fp_chat_id
    await add_to_blacklist(user["id"], name, reason="через TG")
    await call.answer(f"🚫 {name} в чёрном списке")
