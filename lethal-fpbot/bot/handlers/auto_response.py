"""Хендлеры автоответчика — триггер-слова → текст ответа."""

from __future__ import annotations

from aiogram import F, Router
from aiogram.filters import StateFilter
from aiogram.fsm.context import FSMContext
from aiogram.fsm.state import State, StatesGroup
from aiogram.types import CallbackQuery, Message

from bot.keyboards.kb import (
    BTN_AUTO_RESPONSE,
    auto_response_card,
    auto_response_menu,
    cancel_inline,
)
from database.models import (
    add_auto_response,
    delete_auto_response,
    get_or_create_user,
    list_auto_responses,
)
from utils.helpers import escape_html

router = Router(name="auto_response")


class AddRule(StatesGroup):
    waiting_triggers = State()
    waiting_response = State()


async def _render(message: Message, user_id: int) -> None:
    rules = await list_auto_responses(user_id)
    if not rules:
        text = (
            "📨 <b>Автоответчик</b>\n\n"
            "Тут хранятся правила: триггер-слова → готовый ответ. "
            "Когда покупатель напишет слово из триггеров — бот ответит "
            "автоматически.\n\n"
            "Жми «➕ Добавить триггер»."
        )
    else:
        lines = ["📨 <b>Автоответчик</b>", ""]
        for r in rules:
            triggers = ", ".join(r["trigger_words"])
            lines.append(
                f"• <b>{escape_html(triggers)}</b> → "
                f"{escape_html(r['response_text'][:60])}"
            )
        text = "\n".join(lines)
    await message.answer(text, reply_markup=auto_response_menu(rules))


@router.message(F.text == BTN_AUTO_RESPONSE)
async def open_(message: Message, state: FSMContext) -> None:
    await state.clear()
    if not message.from_user:
        return
    user = await get_or_create_user(message.from_user.id, message.from_user.username)
    await _render(message, user["id"])


@router.callback_query(F.data == "ar:list")
async def cb_list(call: CallbackQuery, state: FSMContext) -> None:
    await state.clear()
    if not call.from_user or not isinstance(call.message, Message):
        return
    user = await get_or_create_user(call.from_user.id, call.from_user.username)
    rules = await list_auto_responses(user["id"])
    await call.message.edit_reply_markup(reply_markup=auto_response_menu(rules))
    await call.answer()


@router.callback_query(F.data == "ar:add")
async def cb_add(call: CallbackQuery, state: FSMContext) -> None:
    if not isinstance(call.message, Message):
        return
    await state.set_state(AddRule.waiting_triggers)
    await call.message.answer(
        "📨 Шаг 1/2 · Пришли триггер-слова через запятую:\n"
        "<code>привет, здравствуйте, hi</code>",
        reply_markup=cancel_inline(),
    )
    await call.answer()


@router.message(StateFilter(AddRule.waiting_triggers))
async def step_triggers(message: Message, state: FSMContext) -> None:
    if not message.text:
        return
    triggers = [t.strip() for t in message.text.split(",") if t.strip()]
    if not triggers:
        await message.answer("❌ Пусто. Попробуй ещё раз.")
        return
    await state.update_data(triggers=triggers)
    await state.set_state(AddRule.waiting_response)
    await message.answer(
        "📨 Шаг 2/2 · Пришли текст ответа.",
        reply_markup=cancel_inline(),
    )


@router.message(StateFilter(AddRule.waiting_response))
async def step_response(message: Message, state: FSMContext) -> None:
    if not message.text or not message.from_user:
        return
    data = await state.get_data()
    user = await get_or_create_user(message.from_user.id, message.from_user.username)
    await add_auto_response(user["id"], data["triggers"], message.text)
    await state.clear()
    await message.answer("✅ Триггер добавлен!")
    await _render(message, user["id"])


@router.callback_query(F.data.startswith("ar:view:"))
async def cb_view(call: CallbackQuery) -> None:
    if not isinstance(call.message, Message):
        return
    rid = int(call.data.split(":")[2])  # type: ignore[union-attr]
    await call.message.edit_reply_markup(reply_markup=auto_response_card(rid))
    await call.answer()


@router.callback_query(F.data.startswith("ar:del:"))
async def cb_del(call: CallbackQuery) -> None:
    if not call.from_user or not isinstance(call.message, Message):
        return
    rid = int(call.data.split(":")[2])  # type: ignore[union-attr]
    user = await get_or_create_user(call.from_user.id, call.from_user.username)
    await delete_auto_response(rid, user["id"])
    await call.answer("Удалено")
    await _render(call.message, user["id"])
