"""CRM-хендлеры: список клиентов, карточка, теги, заметки, история.

Подход: всё красиво и минималистично. Каждый экран помещается в ~8-12
строк текста, действия в inline-клавиатуре. Пагинация по 8 клиентов
на страницу — чтобы меню всегда было компактным.
"""

from __future__ import annotations

import logging
from datetime import UTC, datetime

from aiogram import F, Router
from aiogram.filters import Command, StateFilter
from aiogram.fsm.context import FSMContext
from aiogram.fsm.state import State, StatesGroup
from aiogram.types import CallbackQuery, Message

from bot.keyboards.crm_kb import (
    crm_main_menu,
    customer_card,
    notes_view,
    segment_list,
    tags_view,
)
from bot.keyboards.kb import cancel_inline
from database.models import get_or_create_user
from database.models_crm import (
    SEGMENT_EMOJI,
    SEGMENT_NAMES,
    add_note,
    add_tag,
    count_by_segment,
    delete_note,
    find_by_tag,
    get_customer_by_id,
    list_customers,
    list_interactions,
    list_notes,
    list_tags,
    remove_tag,
    search_customers,
    user_crm_summary,
)
from utils.helpers import escape_html, now_ts

router = Router(name="crm")
logger = logging.getLogger(__name__)

PAGE_SIZE = 8


class CrmFSM(StatesGroup):
    waiting_search = State()
    waiting_tag = State()
    waiting_add_tag = State()
    waiting_add_note = State()
    waiting_dm = State()


def _format_money(amount: int | float) -> str:
    return f"{int(amount):,}".replace(",", " ") + "₽"


def _format_date(ts: int | None) -> str:
    if not ts:
        return "—"
    return datetime.fromtimestamp(ts, tz=UTC).strftime("%d.%m.%y")


def _format_ago(ts: int | None) -> str:
    if not ts:
        return "давно"
    diff = now_ts() - ts
    if diff < 3600:
        return f"{diff // 60} мин назад"
    if diff < 86400:
        return f"{diff // 3600} ч назад"
    return f"{diff // 86400} дн назад"


async def _render_home(message: Message, user_id: int) -> None:
    summary = await user_crm_summary(user_id)
    segments = await count_by_segment(user_id)

    if summary["total"] == 0:
        text = (
            "📇 <b>CRM — ваши клиенты</b>\n\n"
            "Пока здесь пусто. Как только на FunPay начнутся продажи — "
            "клиенты автоматически появятся в CRM с историей, метриками "
            "и сегментацией.\n\n"
            "💡 <i>CRM собирает данные сам — ничего настраивать не нужно.</i>"
        )
    else:
        text = (
            "📇 <b>CRM — ваши клиенты</b>\n\n"
            f"👥 Всего: <b>{summary['total']}</b>\n"
            f"💰 Выручка: <b>{_format_money(summary['total_revenue'])}</b>\n"
            f"📊 Средний чек: <b>{_format_money(summary['avg_aov'])}</b>\n"
            f"⭐️ LTV: <b>{_format_money(summary['avg_ltv'])}</b>\n"
            f"🔄 Возврат: <b>{summary['repeat_rate']}%</b>"
        )

    await message.answer(text, reply_markup=crm_main_menu(summary, segments))


@router.message(Command("crm"))
async def cmd_crm(message: Message, state: FSMContext) -> None:
    await state.clear()
    if not message.from_user:
        return
    user = await get_or_create_user(message.from_user.id, message.from_user.username)
    await _render_home(message, user["id"])


@router.message(F.text == "📇 CRM")
async def btn_crm(message: Message, state: FSMContext) -> None:
    await cmd_crm(message, state)


@router.callback_query(F.data == "crm:home")
async def cb_home(call: CallbackQuery, state: FSMContext) -> None:
    await state.clear()
    if not call.from_user or not isinstance(call.message, Message):
        return
    user = await get_or_create_user(call.from_user.id, call.from_user.username)
    summary = await user_crm_summary(user["id"])
    segments = await count_by_segment(user["id"])
    try:
        await call.message.edit_reply_markup(
            reply_markup=crm_main_menu(summary, segments)
        )
    except Exception:  # noqa: BLE001
        await _render_home(call.message, user["id"])
    await call.answer()


@router.callback_query(F.data == "crm:summary")
async def cb_summary(call: CallbackQuery) -> None:
    if not call.from_user or not isinstance(call.message, Message):
        return
    user = await get_or_create_user(call.from_user.id, call.from_user.username)
    s = await user_crm_summary(user["id"])
    segs = await count_by_segment(user["id"])

    lines = [
        "📊 <b>Сводка CRM</b>",
        "",
        f"👥 Всего клиентов: <b>{s['total']}</b>",
        f"💰 Выручка: <b>{_format_money(s['total_revenue'])}</b>",
        f"📦 Заказов: <b>{s['total_orders']}</b>",
        f"📊 Средний чек: <b>{_format_money(s['avg_aov'])}</b>",
        f"⭐️ Средний LTV: <b>{_format_money(s['avg_ltv'])}</b>",
        f"🔄 Repeat rate: <b>{s['repeat_rate']}%</b>",
        f"💎 VIP: <b>{segs.get('vip', 0)}</b>",
        f"⚠️ Риск ухода: <b>{segs.get('churn_risk', 0)}</b>",
        f"🚫 Проблемные: <b>{segs.get('problematic', 0)}</b>",
    ]
    await call.message.answer("\n".join(lines))
    await call.answer()


@router.callback_query(F.data.startswith("crm:seg:"))
async def cb_segment(call: CallbackQuery) -> None:
    if not call.from_user or not isinstance(call.message, Message):
        return
    parts = (call.data or "").split(":")
    if len(parts) < 4:
        await call.answer()
        return
    segment = parts[2]
    try:
        page = int(parts[3])
    except ValueError:
        page = 0

    user = await get_or_create_user(call.from_user.id, call.from_user.username)
    customers = await list_customers(
        user["id"],
        segment=segment,
        limit=PAGE_SIZE + 1,
        offset=page * PAGE_SIZE,
    )
    has_more = len(customers) > PAGE_SIZE
    customers = customers[:PAGE_SIZE]

    emoji = SEGMENT_EMOJI.get(segment, "")
    name = SEGMENT_NAMES.get(segment, segment)

    if not customers:
        text = f"{emoji} <b>{name}</b>\n\nВ этом сегменте пока нет клиентов."
    else:
        text = f"{emoji} <b>{name}</b>\n\nСтраница {page + 1}"

    try:
        await call.message.edit_text(
            text, reply_markup=segment_list(segment, customers, page, has_more)
        )
    except Exception:  # noqa: BLE001
        await call.message.answer(
            text, reply_markup=segment_list(segment, customers, page, has_more)
        )
    await call.answer()


@router.callback_query(F.data.startswith("crm:view:"))
async def cb_view_customer(call: CallbackQuery) -> None:
    if not call.from_user or not isinstance(call.message, Message):
        return
    try:
        customer_id = int((call.data or "").split(":")[2])
    except ValueError:
        await call.answer()
        return

    customer = await get_customer_by_id(customer_id)
    if not customer:
        await call.answer("Клиент не найден", show_alert=True)
        return

    user = await get_or_create_user(call.from_user.id, call.from_user.username)
    if customer["user_id"] != user["id"]:
        await call.answer("Нет доступа", show_alert=True)
        return

    tags = await list_tags(customer_id)
    notes = await list_notes(customer_id)

    emoji = SEGMENT_EMOJI.get(customer["segment"], "")
    seg_name = SEGMENT_NAMES.get(customer["segment"], customer["segment"])

    lines = [
        f"👤 <b>{escape_html(customer['fp_username'])}</b>",
        f"{emoji} {seg_name}",
        "",
        f"📅 Первый контакт: {_format_date(customer['first_seen'])}",
        f"🕐 Последний: {_format_ago(customer['last_seen'])}",
    ]
    if customer["orders_count"]:
        lines.extend(
            [
                "",
                f"📦 Заказов: <b>{customer['orders_count']}</b>",
                f"💰 Всего потратил: <b>{_format_money(customer['total_spent'])}</b>",
                f"📊 Средний чек: <b>{_format_money(customer['avg_order_value'])}</b>",
                f"⭐️ LTV: <b>{_format_money(customer['ltv'])}</b>",
            ]
        )
    if customer["messages_count"]:
        lines.append(f"💬 Сообщений: {customer['messages_count']}")
    if customer["reviews_given"]:
        lines.append(
            f"👍 Отзывы: +{customer['reviews_positive']} / "
            f"−{customer['reviews_negative']}"
        )
    if customer["refund_count"]:
        lines.append(f"↩️ Возвратов: <b>{customer['refund_count']}</b>")
    if tags:
        lines.append("")
        lines.append("🏷 " + " ".join(f"#{t}" for t in tags))
    if notes:
        lines.append("")
        lines.append(f"📝 Заметок: {len(notes)}")

    try:
        await call.message.edit_text(
            "\n".join(lines), reply_markup=customer_card(customer_id)
        )
    except Exception:  # noqa: BLE001
        await call.message.answer(
            "\n".join(lines), reply_markup=customer_card(customer_id)
        )
    await call.answer()


@router.callback_query(F.data.startswith("crm:hist:"))
async def cb_history(call: CallbackQuery) -> None:
    if not isinstance(call.message, Message):
        return
    try:
        customer_id = int((call.data or "").split(":")[2])
    except ValueError:
        await call.answer()
        return

    interactions = await list_interactions(customer_id, limit=15)
    if not interactions:
        await call.answer("История пуста", show_alert=True)
        return

    lines = ["📜 <b>История взаимодействий</b>", ""]
    kind_emoji = {
        "message_in": "💬",
        "message_out": "✉️",
        "order": "🛒",
        "review_positive": "⭐️",
        "review_negative": "⚠️",
        "refund": "↩️",
    }
    for it in interactions:
        emoji = kind_emoji.get(it["kind"], "•")
        when = _format_ago(it["timestamp"])
        detail = it.get("details") or it.get("kind")
        amount = f" · {_format_money(it['amount'])}" if it.get("amount") else ""
        lines.append(f"{emoji} {when}{amount}\n    <i>{escape_html(detail)}</i>")

    await call.message.answer("\n".join(lines))
    await call.answer()


@router.callback_query(F.data.startswith("crm:tags:"))
async def cb_tags(call: CallbackQuery) -> None:
    if not isinstance(call.message, Message):
        return
    try:
        customer_id = int((call.data or "").split(":")[2])
    except ValueError:
        await call.answer()
        return
    tags = await list_tags(customer_id)
    text = "🏷 <b>Теги клиента</b>\n\n"
    text += ("\n".join(f"• #{t}" for t in tags)) if tags else "Тегов нет."
    await call.message.answer(text, reply_markup=tags_view(customer_id, tags))
    await call.answer()


@router.callback_query(F.data.startswith("crm:addtag:"))
async def cb_add_tag(call: CallbackQuery, state: FSMContext) -> None:
    if not isinstance(call.message, Message):
        return
    try:
        customer_id = int((call.data or "").split(":")[2])
    except ValueError:
        await call.answer()
        return
    await state.set_state(CrmFSM.waiting_add_tag)
    await state.update_data(customer_id=customer_id)
    await call.message.answer(
        "🏷 Пришли тег одним словом (например: <code>vip</code>, <code>должник</code>)",
        reply_markup=cancel_inline(),
    )
    await call.answer()


@router.message(StateFilter(CrmFSM.waiting_add_tag))
async def step_add_tag(message: Message, state: FSMContext) -> None:
    if not message.text:
        return
    data = await state.get_data()
    customer_id = int(data["customer_id"])
    ok = await add_tag(customer_id, message.text.strip())
    await state.clear()
    if ok:
        await message.answer("✅ Тег добавлен")
    else:
        await message.answer("❌ Не получилось (возможно уже есть)")


@router.callback_query(F.data.startswith("crm:rmtag:"))
async def cb_rm_tag(call: CallbackQuery) -> None:
    parts = (call.data or "").split(":")
    if len(parts) < 4:
        await call.answer()
        return
    try:
        customer_id = int(parts[2])
    except ValueError:
        await call.answer()
        return
    tag = parts[3]
    await remove_tag(customer_id, tag)
    await call.answer(f"Убран: #{tag}")


@router.callback_query(F.data.startswith("crm:notes:"))
async def cb_notes(call: CallbackQuery) -> None:
    if not isinstance(call.message, Message):
        return
    try:
        customer_id = int((call.data or "").split(":")[2])
    except ValueError:
        await call.answer()
        return
    notes = await list_notes(customer_id)
    if not notes:
        text = "📝 Заметок пока нет"
    else:
        lines = ["📝 <b>Заметки</b>", ""]
        for n in notes[:10]:
            lines.append(f"• {_format_date(n['created_at'])}: {escape_html(n['text'])}")
        text = "\n".join(lines)
    await call.message.answer(text, reply_markup=notes_view(customer_id, notes))
    await call.answer()


@router.callback_query(F.data.startswith("crm:addnote:"))
async def cb_add_note(call: CallbackQuery, state: FSMContext) -> None:
    if not isinstance(call.message, Message):
        return
    try:
        customer_id = int((call.data or "").split(":")[2])
    except ValueError:
        await call.answer()
        return
    await state.set_state(CrmFSM.waiting_add_note)
    await state.update_data(customer_id=customer_id)
    await call.message.answer(
        "📝 Напиши заметку о клиенте",
        reply_markup=cancel_inline(),
    )
    await call.answer()


@router.message(StateFilter(CrmFSM.waiting_add_note))
async def step_add_note(message: Message, state: FSMContext) -> None:
    if not message.text:
        return
    data = await state.get_data()
    customer_id = int(data["customer_id"])
    await add_note(customer_id, message.text[:1000])
    await state.clear()
    await message.answer("✅ Заметка добавлена")


@router.callback_query(F.data.startswith("crm:rmnote:"))
async def cb_rm_note(call: CallbackQuery) -> None:
    parts = (call.data or "").split(":")
    if len(parts) < 4:
        await call.answer()
        return
    try:
        customer_id = int(parts[2])
        note_id = int(parts[3])
    except ValueError:
        await call.answer()
        return
    await delete_note(note_id, customer_id)
    await call.answer("Удалено")


@router.callback_query(F.data == "crm:search")
async def cb_search(call: CallbackQuery, state: FSMContext) -> None:
    if not isinstance(call.message, Message):
        return
    await state.set_state(CrmFSM.waiting_search)
    await call.message.answer(
        "🔍 Введите часть имени клиента для поиска",
        reply_markup=cancel_inline(),
    )
    await call.answer()


@router.message(StateFilter(CrmFSM.waiting_search))
async def step_search(message: Message, state: FSMContext) -> None:
    if not message.text or not message.from_user:
        return
    user = await get_or_create_user(message.from_user.id, message.from_user.username)
    results = await search_customers(user["id"], message.text.strip(), limit=10)
    await state.clear()

    if not results:
        await message.answer("🤷 Никого не нашли")
        return

    lines = ["🔍 <b>Результаты поиска</b>", ""]
    from bot.keyboards.crm_kb import segment_list

    # Используем тот же лейаут что для сегмента
    await message.answer(
        "\n".join(lines),
        reply_markup=segment_list("search", results, 0, False),
    )


@router.callback_query(F.data == "crm:tag")
async def cb_tag_search(call: CallbackQuery, state: FSMContext) -> None:
    if not isinstance(call.message, Message):
        return
    await state.set_state(CrmFSM.waiting_tag)
    await call.message.answer(
        "🏷 Введите тег для поиска клиентов",
        reply_markup=cancel_inline(),
    )
    await call.answer()


@router.message(StateFilter(CrmFSM.waiting_tag))
async def step_tag_search(message: Message, state: FSMContext) -> None:
    if not message.text or not message.from_user:
        return
    user = await get_or_create_user(message.from_user.id, message.from_user.username)
    results = await find_by_tag(user["id"], message.text.strip(), limit=20)
    await state.clear()

    if not results:
        await message.answer("🤷 По этому тегу никого нет")
        return

    from bot.keyboards.crm_kb import segment_list

    await message.answer(
        f"🏷 <b>По тегу #{escape_html(message.text.strip().lower())}</b>",
        reply_markup=segment_list("tag", results, 0, False),
    )
