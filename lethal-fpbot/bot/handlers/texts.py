"""Заготовленные тексты."""

from __future__ import annotations

from aiogram import F, Router
from aiogram.filters import StateFilter
from aiogram.fsm.context import FSMContext
from aiogram.fsm.state import State, StatesGroup
from aiogram.types import CallbackQuery, Message

from bot.keyboards.kb import (
    BTN_TEXTS,
    cancel_inline,
    text_card,
    texts_menu,
)
from database.models import (
    add_text,
    delete_text,
    get_or_create_user,
    get_text,
    list_texts,
)
from utils.helpers import escape_html

router = Router(name="texts")


class AddText(StatesGroup):
    waiting_name = State()
    waiting_text = State()


async def _render(message: Message, user_id: int) -> None:
    items = await list_texts(user_id)
    if not items:
        text = (
            "✍️ <b>Заготовленные тексты</b>\n\n"
            "Сохрани шаблоны ответов — приветствие, инструкция по выдаче, "
            "ответ на «дай скидку» и т.д. Сможешь вставлять одной кнопкой "
            "из любого диалога."
        )
    else:
        lines = ["✍️ <b>Заготовленные тексты</b>", ""]
        for t in items:
            lines.append(f"• <b>{escape_html(t['name'])}</b>")
        text = "\n".join(lines)
    await message.answer(text, reply_markup=texts_menu(items))


@router.message(F.text == BTN_TEXTS)
async def open_(message: Message, state: FSMContext) -> None:
    await state.clear()
    if not message.from_user:
        return
    user = await get_or_create_user(message.from_user.id, message.from_user.username)
    await _render(message, user["id"])


@router.callback_query(F.data == "txt:list")
async def cb_list(call: CallbackQuery, state: FSMContext) -> None:
    await state.clear()
    if not call.from_user or not isinstance(call.message, Message):
        return
    user = await get_or_create_user(call.from_user.id, call.from_user.username)
    items = await list_texts(user["id"])
    await call.message.edit_reply_markup(reply_markup=texts_menu(items))
    await call.answer()


@router.callback_query(F.data == "txt:add")
async def cb_add(call: CallbackQuery, state: FSMContext) -> None:
    if not isinstance(call.message, Message):
        return
    await state.set_state(AddText.waiting_name)
    await call.message.answer(
        "✍️ Шаг 1/2 · Пришли название текста (для себя).",
        reply_markup=cancel_inline(),
    )
    await call.answer()


@router.message(StateFilter(AddText.waiting_name))
async def step_name(message: Message, state: FSMContext) -> None:
    if not message.text:
        return
    await state.update_data(name=message.text.strip()[:64])
    await state.set_state(AddText.waiting_text)
    await message.answer(
        "✍️ Шаг 2/2 · Пришли сам текст.",
        reply_markup=cancel_inline(),
    )


@router.message(StateFilter(AddText.waiting_text))
async def step_text(message: Message, state: FSMContext) -> None:
    if not message.text or not message.from_user:
        return
    data = await state.get_data()
    user = await get_or_create_user(message.from_user.id, message.from_user.username)
    await add_text(user["id"], data["name"], message.text)
    await state.clear()
    await message.answer("✅ Текст сохранён!")
    await _render(message, user["id"])


@router.callback_query(F.data.startswith("txt:view:"))
async def cb_view(call: CallbackQuery) -> None:
    if not call.from_user or not isinstance(call.message, Message):
        return
    tid = int(call.data.split(":")[2])  # type: ignore[union-attr]
    user = await get_or_create_user(call.from_user.id, call.from_user.username)
    t = await get_text(tid, user["id"])
    if not t:
        await call.answer("Не найден", show_alert=True)
        return
    await call.message.answer(
        f"✍️ <b>{escape_html(t['name'])}</b>\n\n{escape_html(t['text'])}",
        reply_markup=text_card(tid),
    )
    await call.answer()


@router.callback_query(F.data.startswith("txt:del:"))
async def cb_del(call: CallbackQuery) -> None:
    if not call.from_user or not isinstance(call.message, Message):
        return
    tid = int(call.data.split(":")[2])  # type: ignore[union-attr]
    user = await get_or_create_user(call.from_user.id, call.from_user.username)
    await delete_text(tid, user["id"])
    await call.answer("Удалено")
    await _render(call.message, user["id"])
