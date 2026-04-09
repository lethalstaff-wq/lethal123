"""Клавиатуры CRM-модуля — красиво, минималистично."""

from __future__ import annotations

from aiogram.types import InlineKeyboardButton, InlineKeyboardMarkup

from database.models_crm import (
    ALL_SEGMENTS,
    SEGMENT_EMOJI,
    SEGMENT_NAMES,
)


def crm_main_menu(summary: dict, segments: dict[str, int]) -> InlineKeyboardMarkup:
    """Главный экран CRM — сегменты с количеством + поиск."""
    rows: list[list[InlineKeyboardButton]] = []

    # Сегменты по 2 в ряд
    buttons = []
    for seg in ALL_SEGMENTS:
        cnt = segments.get(seg, 0)
        if cnt == 0:
            continue
        emoji = SEGMENT_EMOJI[seg]
        name = SEGMENT_NAMES[seg]
        buttons.append(
            InlineKeyboardButton(
                text=f"{emoji} {name} · {cnt}",
                callback_data=f"crm:seg:{seg}:0",
            )
        )
    for i in range(0, len(buttons), 2):
        rows.append(buttons[i : i + 2])

    # Служебные кнопки
    rows.append(
        [
            InlineKeyboardButton(text="🔍 Поиск", callback_data="crm:search"),
            InlineKeyboardButton(text="🏷 По тегу", callback_data="crm:tag"),
        ]
    )
    rows.append(
        [
            InlineKeyboardButton(text="📊 Сводка", callback_data="crm:summary"),
            InlineKeyboardButton(text="« Меню", callback_data="menu:main"),
        ]
    )
    return InlineKeyboardMarkup(inline_keyboard=rows)


def segment_list(
    segment: str, customers: list[dict], page: int, has_more: bool
) -> InlineKeyboardMarkup:
    """Список клиентов одного сегмента с пагинацией."""
    rows: list[list[InlineKeyboardButton]] = []

    for c in customers:
        label = f"👤 {c['fp_username']}"
        if c["orders_count"]:
            label += f" · {c['orders_count']} зак · {int(c['total_spent'])}₽"
        rows.append(
            [
                InlineKeyboardButton(
                    text=label,
                    callback_data=f"crm:view:{c['id']}",
                )
            ]
        )

    # Пагинация
    nav_row: list[InlineKeyboardButton] = []
    if page > 0:
        nav_row.append(
            InlineKeyboardButton(
                text="‹ Назад", callback_data=f"crm:seg:{segment}:{page - 1}"
            )
        )
    if has_more:
        nav_row.append(
            InlineKeyboardButton(
                text="Вперёд ›", callback_data=f"crm:seg:{segment}:{page + 1}"
            )
        )
    if nav_row:
        rows.append(nav_row)

    rows.append(
        [InlineKeyboardButton(text="« К сегментам", callback_data="crm:home")]
    )
    return InlineKeyboardMarkup(inline_keyboard=rows)


def customer_card(customer_id: int) -> InlineKeyboardMarkup:
    """Карточка клиента — действия над ним."""
    return InlineKeyboardMarkup(
        inline_keyboard=[
            [
                InlineKeyboardButton(
                    text="📜 История", callback_data=f"crm:hist:{customer_id}:0"
                ),
                InlineKeyboardButton(
                    text="🏷 Теги", callback_data=f"crm:tags:{customer_id}"
                ),
            ],
            [
                InlineKeyboardButton(
                    text="📝 Заметки", callback_data=f"crm:notes:{customer_id}"
                ),
                InlineKeyboardButton(
                    text="✉️ Написать", callback_data=f"crm:dm:{customer_id}"
                ),
            ],
            [
                InlineKeyboardButton(
                    text="🚫 В ЧС", callback_data=f"crm:ban:{customer_id}"
                ),
                InlineKeyboardButton(
                    text="« Назад", callback_data="crm:home"
                ),
            ],
        ]
    )


def tags_view(customer_id: int, tags: list[str]) -> InlineKeyboardMarkup:
    """Управление тегами клиента."""
    rows: list[list[InlineKeyboardButton]] = []
    for tag in tags:
        rows.append(
            [
                InlineKeyboardButton(
                    text=f"🏷 {tag} · удалить",
                    callback_data=f"crm:rmtag:{customer_id}:{tag}",
                )
            ]
        )
    rows.append(
        [
            InlineKeyboardButton(
                text="➕ Добавить тег",
                callback_data=f"crm:addtag:{customer_id}",
            )
        ]
    )
    rows.append(
        [InlineKeyboardButton(text="« Карточка", callback_data=f"crm:view:{customer_id}")]
    )
    return InlineKeyboardMarkup(inline_keyboard=rows)


def notes_view(customer_id: int, notes: list[dict]) -> InlineKeyboardMarkup:
    rows: list[list[InlineKeyboardButton]] = []
    for n in notes[:10]:
        preview = (n["text"] or "")[:30]
        rows.append(
            [
                InlineKeyboardButton(
                    text=f"🗑 {preview}",
                    callback_data=f"crm:rmnote:{customer_id}:{n['id']}",
                )
            ]
        )
    rows.append(
        [
            InlineKeyboardButton(
                text="➕ Добавить заметку",
                callback_data=f"crm:addnote:{customer_id}",
            )
        ]
    )
    rows.append(
        [InlineKeyboardButton(text="« Карточка", callback_data=f"crm:view:{customer_id}")]
    )
    return InlineKeyboardMarkup(inline_keyboard=rows)
