"""Хендлер AI-генератора описаний лотов (Pro-фича).

Командой /lot_gen или кнопкой пользователь запускает FSM:
  1. Игра
  2. Тип (валюта/аккаунт/ключ/буст/предметы)
  3. Количество/особенности
  4. Тон
→ бот шлёт сгенерированный заголовок и описание с кнопками
  "✅ Скопировать" / "♻️ Ещё вариант" / "📊 Качество".
"""

from __future__ import annotations

import logging

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
from services.lot_ai_generator import (
    LotGenRequest,
    generate_lot,
    improve_existing,
)
from services.lot_quality import analyze_lot, format_report
from utils.helpers import escape_html

router = Router(name="lot_gen")
logger = logging.getLogger(__name__)


ITEM_TYPES = {
    "currency": "💰 Валюта",
    "account": "🎮 Аккаунт",
    "key": "🔑 Ключ",
    "boost": "🚀 Буст",
    "items": "🎁 Предметы",
}

TONES = {
    "дружелюбный": "😊 Дружелюбный",
    "профессиональный": "💼 Профессиональный",
    "короткий": "⚡ Короткий",
}


class GenFSM(StatesGroup):
    waiting_game = State()
    waiting_type = State()
    waiting_quantity = State()
    waiting_tone = State()
    waiting_improve_title = State()
    waiting_improve_desc = State()


def _type_kb() -> InlineKeyboardMarkup:
    rows = [
        [InlineKeyboardButton(text=label, callback_data=f"gen:type:{k}")]
        for k, label in ITEM_TYPES.items()
    ]
    rows.append([InlineKeyboardButton(text="❌ Отмена", callback_data="cancel")])
    return InlineKeyboardMarkup(inline_keyboard=rows)


def _tone_kb() -> InlineKeyboardMarkup:
    rows = [
        [InlineKeyboardButton(text=label, callback_data=f"gen:tone:{k}")]
        for k, label in TONES.items()
    ]
    return InlineKeyboardMarkup(inline_keyboard=rows)


def _result_kb() -> InlineKeyboardMarkup:
    return InlineKeyboardMarkup(
        inline_keyboard=[
            [
                InlineKeyboardButton(text="♻️ Ещё вариант", callback_data="gen:redo"),
                InlineKeyboardButton(text="📊 Качество", callback_data="gen:quality"),
            ],
            [
                InlineKeyboardButton(text="✨ Улучшить имеющийся лот", callback_data="gen:improve"),
            ],
        ]
    )


@router.message(Command("lot_gen"))
async def cmd_gen(message: Message, state: FSMContext) -> None:
    await state.clear()
    await state.set_state(GenFSM.waiting_game)
    await message.answer(
        "✨ <b>AI-генератор лота</b>\n\n"
        "Я помогу составить продающее описание. Начнём — "
        "напиши название игры:",
        reply_markup=cancel_inline(),
    )


@router.message(F.text == "✨ AI лот")
async def btn_gen(message: Message, state: FSMContext) -> None:
    await cmd_gen(message, state)


@router.message(StateFilter(GenFSM.waiting_game))
async def step_game(message: Message, state: FSMContext) -> None:
    if not message.text:
        return
    game = message.text.strip()[:100]
    if not game:
        await message.answer("❌ Пусто. Попробуй ещё.")
        return
    await state.update_data(game=game)
    await state.set_state(GenFSM.waiting_type)
    await message.answer("Тип товара:", reply_markup=_type_kb())


@router.callback_query(F.data.startswith("gen:type:"), StateFilter(GenFSM.waiting_type))
async def step_type(call: CallbackQuery, state: FSMContext) -> None:
    if not isinstance(call.message, Message):
        return
    item_type = (call.data or "").split(":")[2]
    if item_type not in ITEM_TYPES:
        await call.answer()
        return
    await state.update_data(item_type=item_type)
    await state.set_state(GenFSM.waiting_quantity)
    await call.message.answer(
        "Количество/особенности? (например: <code>1000 голда</code>, "
        "<code>уровень 70</code>, <code>random key premium</code>) или "
        "<code>-</code> чтобы пропустить.",
        reply_markup=cancel_inline(),
    )
    await call.answer()


@router.message(StateFilter(GenFSM.waiting_quantity))
async def step_quantity(message: Message, state: FSMContext) -> None:
    if not message.text:
        return
    text = message.text.strip()
    quantity = "" if text in {"-", "—"} else text[:200]
    await state.update_data(quantity=quantity)
    await state.set_state(GenFSM.waiting_tone)
    await message.answer("Тон общения:", reply_markup=_tone_kb())


@router.callback_query(F.data.startswith("gen:tone:"), StateFilter(GenFSM.waiting_tone))
async def step_tone(call: CallbackQuery, state: FSMContext) -> None:
    if not isinstance(call.message, Message):
        return
    tone = (call.data or "").split(":")[2]
    if tone not in TONES:
        await call.answer()
        return
    data = await state.get_data()
    await state.update_data(tone=tone)

    req = LotGenRequest(
        game=data.get("game", ""),
        item_type=data.get("item_type", "currency"),
        quantity=data.get("quantity", ""),
        tone=tone,
    )
    await call.answer("Генерирую…")
    await call.message.answer("⏳ ИИ работает над лотом…")

    result = await generate_lot(req)
    if not result:
        await call.message.answer(
            "❌ ИИ-генератор недоступен. Задан ли <code>ANTHROPIC_API_KEY</code>?"
        )
        await state.clear()
        return

    await state.update_data(last_result={"title": result.title, "description": result.description})

    text = (
        f"✨ <b>Готово!</b>\n\n"
        f"📋 <b>Заголовок:</b>\n<code>{escape_html(result.title)}</code>\n\n"
        f"📝 <b>Описание:</b>\n<code>{escape_html(result.description)}</code>\n\n"
        f"🎯 Quality: <b>{result.quality_score}/100</b>"
    )
    if result.seo_keywords:
        text += "\n🔑 SEO: " + ", ".join(result.seo_keywords)
    if result.tokens_used:
        text += f"\n<i>Потрачено токенов: {result.tokens_used}</i>"

    await call.message.answer(text, reply_markup=_result_kb())


@router.callback_query(F.data == "gen:quality")
async def cb_quality(call: CallbackQuery, state: FSMContext) -> None:
    if not isinstance(call.message, Message):
        return
    data = await state.get_data()
    last = data.get("last_result")
    if not last:
        await call.answer("Нет результата для анализа", show_alert=True)
        return
    analysis = analyze_lot(last["title"], last["description"])
    await call.message.answer(format_report(analysis))
    await call.answer()


@router.callback_query(F.data == "gen:redo")
async def cb_redo(call: CallbackQuery, state: FSMContext) -> None:
    if not isinstance(call.message, Message):
        return
    data = await state.get_data()
    if not data.get("game"):
        await call.answer("Нет сохранённых параметров", show_alert=True)
        return

    req = LotGenRequest(
        game=data["game"],
        item_type=data.get("item_type", "currency"),
        quantity=data.get("quantity", ""),
        tone=data.get("tone", "дружелюбный"),
    )
    await call.answer("Генерирую вариант…")
    result = await generate_lot(req)
    if not result:
        await call.message.answer("❌ Ошибка генерации")
        return

    await state.update_data(last_result={"title": result.title, "description": result.description})
    text = (
        f"♻️ <b>Новый вариант</b>\n\n"
        f"📋 <code>{escape_html(result.title)}</code>\n\n"
        f"📝 <code>{escape_html(result.description)}</code>\n\n"
        f"🎯 Quality: <b>{result.quality_score}/100</b>"
    )
    await call.message.answer(text, reply_markup=_result_kb())


@router.callback_query(F.data == "gen:improve")
async def cb_improve(call: CallbackQuery, state: FSMContext) -> None:
    if not isinstance(call.message, Message):
        return
    await state.set_state(GenFSM.waiting_improve_title)
    await call.message.answer(
        "✨ <b>Улучшить существующий лот</b>\n\n"
        "Пришли заголовок своего текущего лота:",
        reply_markup=cancel_inline(),
    )
    await call.answer()


@router.message(StateFilter(GenFSM.waiting_improve_title))
async def step_improve_title(message: Message, state: FSMContext) -> None:
    if not message.text:
        return
    await state.update_data(old_title=message.text.strip())
    await state.set_state(GenFSM.waiting_improve_desc)
    await message.answer(
        "Теперь пришли текущее описание одним сообщением:",
        reply_markup=cancel_inline(),
    )


@router.message(StateFilter(GenFSM.waiting_improve_desc))
async def step_improve_desc(message: Message, state: FSMContext) -> None:
    if not message.text:
        return
    data = await state.get_data()
    old_title = data.get("old_title", "")
    old_desc = message.text.strip()

    await message.answer("⏳ Улучшаю через ИИ…")
    result = await improve_existing(old_title, old_desc)
    await state.clear()

    if not result:
        await message.answer("❌ ИИ недоступен.")
        return

    old_analysis = analyze_lot(old_title, old_desc)
    text = (
        f"✨ <b>Улучшенный лот</b>\n\n"
        f"📋 <code>{escape_html(result.title)}</code>\n\n"
        f"📝 <code>{escape_html(result.description)}</code>\n\n"
        f"📊 Было: <b>{old_analysis['total']}/100</b> → "
        f"стало: <b>{result.quality_score}/100</b>"
    )
    await message.answer(text, reply_markup=_result_kb())
