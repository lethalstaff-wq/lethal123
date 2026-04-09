"""Хендлеры автовыдачи — лот → список товаров."""

from __future__ import annotations

from aiogram import F, Router
from aiogram.filters import StateFilter
from aiogram.fsm.context import FSMContext
from aiogram.fsm.state import State, StatesGroup
from aiogram.types import CallbackQuery, Message

from bot.keyboards.kb import (
    BTN_AUTO_DELIVERY,
    auto_delivery_card,
    auto_delivery_menu,
    cancel_inline,
)
from database.models import (
    add_auto_delivery,
    delete_auto_delivery,
    get_or_create_user,
    list_auto_delivery,
)
from utils.helpers import escape_html

router = Router(name="auto_delivery")


class AddLot(StatesGroup):
    waiting_lot_name = State()
    waiting_items = State()
    waiting_template = State()


async def _render(message: Message, user_id: int) -> None:
    rules = await list_auto_delivery(user_id)
    if not rules:
        text = (
            "🤖 <b>Автовыдача</b>\n\n"
            "Загрузи свои товары — бот будет автоматически отдавать их "
            "покупателю при покупке. Идеально для аккаунтов / ключей / гайдов."
        )
    else:
        lines = ["🤖 <b>Автовыдача</b>", ""]
        for r in rules:
            left = len(r["items"])
            lines.append(
                f"• <b>{escape_html(r['lot_name'])}</b> — осталось {left}"
            )
        text = "\n".join(lines)
    await message.answer(text, reply_markup=auto_delivery_menu(rules))


@router.message(F.text == BTN_AUTO_DELIVERY)
async def open_(message: Message, state: FSMContext) -> None:
    await state.clear()
    if not message.from_user:
        return
    user = await get_or_create_user(message.from_user.id, message.from_user.username)
    await _render(message, user["id"])


@router.callback_query(F.data == "ad:list")
async def cb_list(call: CallbackQuery, state: FSMContext) -> None:
    await state.clear()
    if not call.from_user or not isinstance(call.message, Message):
        return
    user = await get_or_create_user(call.from_user.id, call.from_user.username)
    rules = await list_auto_delivery(user["id"])
    await call.message.edit_reply_markup(reply_markup=auto_delivery_menu(rules))
    await call.answer()


@router.callback_query(F.data == "ad:add")
async def cb_add(call: CallbackQuery, state: FSMContext) -> None:
    if not isinstance(call.message, Message):
        return
    await state.set_state(AddLot.waiting_lot_name)
    await call.message.answer(
        "🤖 Шаг 1/3 · Пришли название лота FunPay (или часть названия — "
        "будем матчить по подстроке).",
        reply_markup=cancel_inline(),
    )
    await call.answer()


@router.message(StateFilter(AddLot.waiting_lot_name))
async def step_lot(message: Message, state: FSMContext) -> None:
    if not message.text:
        return
    await state.update_data(lot_name=message.text.strip())
    await state.set_state(AddLot.waiting_items)
    await message.answer(
        "🤖 Шаг 2/3 · Пришли товары — каждый с новой строки. "
        "Бот будет выдавать их по одному на каждую покупку.",
        reply_markup=cancel_inline(),
    )


@router.message(StateFilter(AddLot.waiting_items))
async def step_items(message: Message, state: FSMContext) -> None:
    if not message.text:
        return
    items = [x.strip() for x in message.text.splitlines() if x.strip()]
    if not items:
        await message.answer("❌ Пусто.")
        return
    await state.update_data(items=items)
    await state.set_state(AddLot.waiting_template)
    await message.answer(
        "🤖 Шаг 3/3 · Пришли шаблон сообщения. Поддерживаются плейсхолдеры:\n"
        "<code>{item}</code> — товар\n"
        "<code>{lot}</code> — название лота\n\n"
        "Или отправь <code>-</code> чтобы использовать стандартный.",
        reply_markup=cancel_inline(),
    )


@router.message(StateFilter(AddLot.waiting_template))
async def step_template(message: Message, state: FSMContext) -> None:
    if not message.text or not message.from_user:
        return
    template = None if message.text.strip() in {"-", "—"} else message.text
    data = await state.get_data()
    user = await get_or_create_user(message.from_user.id, message.from_user.username)
    await add_auto_delivery(
        user_id=user["id"],
        fp_account_id=None,
        lot_name=data["lot_name"],
        items=data["items"],
        template=template,
    )
    await state.clear()
    await message.answer(f"✅ Лот добавлен! Товаров в очереди: {len(data['items'])}")
    await _render(message, user["id"])


@router.callback_query(F.data.startswith("ad:view:"))
async def cb_view(call: CallbackQuery) -> None:
    if not isinstance(call.message, Message):
        return
    rid = int(call.data.split(":")[2])  # type: ignore[union-attr]
    await call.message.edit_reply_markup(reply_markup=auto_delivery_card(rid))
    await call.answer()


@router.callback_query(F.data.startswith("ad:del:"))
async def cb_del(call: CallbackQuery) -> None:
    if not call.from_user or not isinstance(call.message, Message):
        return
    rid = int(call.data.split(":")[2])  # type: ignore[union-attr]
    user = await get_or_create_user(call.from_user.id, call.from_user.username)
    await delete_auto_delivery(rid, user["id"])
    await call.answer("Удалено")
    await _render(call.message, user["id"])
