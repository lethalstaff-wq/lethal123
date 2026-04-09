"""Хендлер шаблонов лотов.

Пользователь сохраняет часто используемые заголовок+описание как
шаблон и при создании нового лота на FunPay быстро подставляет.
"""

from __future__ import annotations

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
from database.models import get_or_create_user
from database.models_price import (
    delete_template,
    get_template,
    increment_template_use,
    list_templates,
    save_template,
)
from utils.helpers import escape_html

router = Router(name="templates")


class TplFSM(StatesGroup):
    waiting_name = State()
    waiting_title = State()
    waiting_description = State()


def _list_kb(templates: list[dict]) -> InlineKeyboardMarkup:
    rows = []
    for t in templates[:20]:
        label = f"📋 {t['name']}"
        if t["use_count"]:
            label += f" · ×{t['use_count']}"
        rows.append(
            [InlineKeyboardButton(text=label, callback_data=f"tpl:view:{t['id']}")]
        )
    rows.append(
        [InlineKeyboardButton(text="➕ Создать шаблон", callback_data="tpl:new")]
    )
    return InlineKeyboardMarkup(inline_keyboard=rows)


def _view_kb(template_id: int) -> InlineKeyboardMarkup:
    return InlineKeyboardMarkup(
        inline_keyboard=[
            [
                InlineKeyboardButton(
                    text="📤 Использовать", callback_data=f"tpl:use:{template_id}"
                )
            ],
            [
                InlineKeyboardButton(
                    text="🗑 Удалить", callback_data=f"tpl:del:{template_id}"
                ),
                InlineKeyboardButton(
                    text="« К списку", callback_data="tpl:list"
                ),
            ],
        ]
    )


@router.message(Command("templates"))
async def cmd_templates(message: Message, state: FSMContext) -> None:
    await state.clear()
    if not message.from_user:
        return
    user = await get_or_create_user(message.from_user.id, message.from_user.username)
    templates = await list_templates(user["id"])
    if not templates:
        await message.answer(
            "📋 <b>Шаблоны лотов</b>\n\n"
            "Сохрани часто используемые заголовки и описания как шаблоны. "
            "При создании нового лота на FunPay быстро скопируешь готовый "
            "текст с одной кнопки.",
            reply_markup=_list_kb([]),
        )
    else:
        await message.answer(
            f"📋 <b>Шаблоны лотов ({len(templates)})</b>",
            reply_markup=_list_kb(templates),
        )


@router.callback_query(F.data == "tpl:list")
async def cb_list(call: CallbackQuery) -> None:
    if not call.from_user or not isinstance(call.message, Message):
        return
    user = await get_or_create_user(call.from_user.id, call.from_user.username)
    templates = await list_templates(user["id"])
    try:
        await call.message.edit_reply_markup(reply_markup=_list_kb(templates))
    except Exception:  # noqa: BLE001
        pass
    await call.answer()


@router.callback_query(F.data == "tpl:new")
async def cb_new(call: CallbackQuery, state: FSMContext) -> None:
    if not isinstance(call.message, Message):
        return
    await state.set_state(TplFSM.waiting_name)
    await call.message.answer(
        "📋 Как назвать шаблон? (короткое имя для выбора)",
        reply_markup=cancel_inline(),
    )
    await call.answer()


@router.message(StateFilter(TplFSM.waiting_name))
async def step_name(message: Message, state: FSMContext) -> None:
    if not message.text:
        return
    await state.update_data(name=message.text.strip()[:100])
    await state.set_state(TplFSM.waiting_title)
    await message.answer(
        "📝 Пришли заголовок лота (можно с плейсхолдерами {quantity}, {price}):",
        reply_markup=cancel_inline(),
    )


@router.message(StateFilter(TplFSM.waiting_title))
async def step_title(message: Message, state: FSMContext) -> None:
    if not message.text:
        return
    await state.update_data(title=message.text.strip()[:500])
    await state.set_state(TplFSM.waiting_description)
    await message.answer(
        "📄 Теперь описание лота:",
        reply_markup=cancel_inline(),
    )


@router.message(StateFilter(TplFSM.waiting_description))
async def step_description(message: Message, state: FSMContext) -> None:
    if not message.text or not message.from_user:
        return
    data = await state.get_data()
    user = await get_or_create_user(message.from_user.id, message.from_user.username)
    await save_template(
        user_id=user["id"],
        name=data["name"],
        title_template=data["title"],
        description_template=message.text.strip()[:3000],
    )
    await state.clear()
    await message.answer("✅ Шаблон сохранён")
    templates = await list_templates(user["id"])
    await message.answer(
        f"📋 Всего шаблонов: {len(templates)}",
        reply_markup=_list_kb(templates),
    )


@router.callback_query(F.data.startswith("tpl:view:"))
async def cb_view(call: CallbackQuery) -> None:
    if not call.from_user or not isinstance(call.message, Message):
        return
    try:
        tid = int((call.data or "").split(":")[2])
    except ValueError:
        await call.answer()
        return
    user = await get_or_create_user(call.from_user.id, call.from_user.username)
    tpl = await get_template(tid, user["id"])
    if not tpl:
        await call.answer("Не найден", show_alert=True)
        return
    text = (
        f"📋 <b>{escape_html(tpl['name'])}</b>\n"
        f"Использован: {tpl['use_count']} раз\n\n"
        f"<b>Заголовок:</b>\n<code>{escape_html(tpl['title_template'])}</code>\n\n"
        f"<b>Описание:</b>\n<code>{escape_html(tpl['description_template'])}</code>"
    )
    await call.message.answer(text, reply_markup=_view_kb(tid))
    await call.answer()


@router.callback_query(F.data.startswith("tpl:use:"))
async def cb_use(call: CallbackQuery) -> None:
    if not call.from_user or not isinstance(call.message, Message):
        return
    try:
        tid = int((call.data or "").split(":")[2])
    except ValueError:
        await call.answer()
        return
    user = await get_or_create_user(call.from_user.id, call.from_user.username)
    tpl = await get_template(tid, user["id"])
    if not tpl:
        await call.answer("Не найден", show_alert=True)
        return
    await increment_template_use(tid)
    # Шлём отдельными сообщениями для удобного копирования
    await call.message.answer(
        f"📋 <b>Шаблон {escape_html(tpl['name'])}</b>"
    )
    await call.message.answer(
        f"<code>{escape_html(tpl['title_template'])}</code>",
    )
    await call.message.answer(
        f"<code>{escape_html(tpl['description_template'])}</code>",
    )
    await call.answer("Скопируй и вставь в FunPay")


@router.callback_query(F.data.startswith("tpl:del:"))
async def cb_del(call: CallbackQuery) -> None:
    if not call.from_user or not isinstance(call.message, Message):
        return
    try:
        tid = int((call.data or "").split(":")[2])
    except ValueError:
        await call.answer()
        return
    user = await get_or_create_user(call.from_user.id, call.from_user.username)
    await delete_template(tid, user["id"])
    await call.answer("Удалено")
