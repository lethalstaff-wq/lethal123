"""Все клавиатуры бота — reply и inline.

Названия пунктов меню задаём константами, чтобы хендлеры могли
сравнивать message.text без расхождений эмодзи/пробелов.
"""

from __future__ import annotations

from aiogram.types import (
    InlineKeyboardButton,
    InlineKeyboardMarkup,
    KeyboardButton,
    ReplyKeyboardMarkup,
)


# ----- Подписи кнопок главного меню (используются в фильтрах) --------------

BTN_ACCOUNTS = "📁 Мои аккаунты"
BTN_PROXIES = "🔑 Мои прокси"
BTN_AUTO_RESPONSE = "📨 Автоответчик"
BTN_AUTO_DELIVERY = "🤖 Автовыдача"
BTN_STATS = "📊 Статистика"
BTN_RAISE_ON = "📈 Поднять предложения"
BTN_RAISE_OFF = "⬇️ Отключить автоподнятие"
BTN_TEXTS = "✍️ Заготовленные тексты"
BTN_BILLING = "💳 Биллинг"
BTN_PROFILE = "👤 Профиль"
BTN_SETTINGS = "⚙️ Настройки"
BTN_ABOUT = "ℹ️ О боте"
BTN_HELP = "🏷 Помощь"


def main_menu() -> ReplyKeyboardMarkup:
    """Главная reply-клавиатура (видна всегда после /start)."""
    return ReplyKeyboardMarkup(
        keyboard=[
            [KeyboardButton(text=BTN_ACCOUNTS), KeyboardButton(text=BTN_PROXIES)],
            [
                KeyboardButton(text=BTN_AUTO_RESPONSE),
                KeyboardButton(text=BTN_AUTO_DELIVERY),
            ],
            [KeyboardButton(text=BTN_STATS)],
            [
                KeyboardButton(text=BTN_RAISE_ON),
                KeyboardButton(text=BTN_RAISE_OFF),
            ],
            [KeyboardButton(text=BTN_TEXTS), KeyboardButton(text=BTN_BILLING)],
            [KeyboardButton(text=BTN_PROFILE), KeyboardButton(text=BTN_SETTINGS)],
            [KeyboardButton(text=BTN_ABOUT), KeyboardButton(text=BTN_HELP)],
        ],
        resize_keyboard=True,
        is_persistent=True,
    )


# ------------------------------- ACCOUNTS ----------------------------------

def accounts_menu(accounts: list[dict]) -> InlineKeyboardMarkup:
    """Inline-клавиатура для раздела «Мои аккаунты»."""
    rows: list[list[InlineKeyboardButton]] = []
    for acc in accounts:
        emoji = "🟢" if acc.get("is_online") else "⚪️"
        rows.append(
            [
                InlineKeyboardButton(
                    text=f"{emoji} {acc['login']}",
                    callback_data=f"acc:view:{acc['id']}",
                )
            ]
        )
    rows.append(
        [
            InlineKeyboardButton(
                text="➕ Добавить аккаунт", callback_data="acc:add"
            )
        ]
    )
    rows.append(
        [
            InlineKeyboardButton(
                text="🔄 Обновить", callback_data="acc:refresh"
            )
        ]
    )
    return InlineKeyboardMarkup(inline_keyboard=rows)


def account_card(account_id: int, is_online: bool) -> InlineKeyboardMarkup:
    """Карточка одного аккаунта с действиями."""
    status_btn = (
        InlineKeyboardButton(
            text="🟢 Онлайн" if is_online else "🔌 Подключить",
            callback_data=f"acc:reconnect:{account_id}",
        )
    )
    return InlineKeyboardMarkup(
        inline_keyboard=[
            [status_btn],
            [
                InlineKeyboardButton(
                    text="🔑 Сменить прокси",
                    callback_data=f"acc:setproxy:{account_id}",
                ),
                InlineKeyboardButton(
                    text="🗑 Удалить",
                    callback_data=f"acc:delete:{account_id}",
                ),
            ],
            [
                InlineKeyboardButton(
                    text="« Назад", callback_data="acc:list"
                )
            ],
        ]
    )


def confirm_delete_account(account_id: int) -> InlineKeyboardMarkup:
    return InlineKeyboardMarkup(
        inline_keyboard=[
            [
                InlineKeyboardButton(
                    text="✅ Да, удалить",
                    callback_data=f"acc:delete_yes:{account_id}",
                ),
                InlineKeyboardButton(
                    text="❌ Отмена",
                    callback_data=f"acc:view:{account_id}",
                ),
            ]
        ]
    )


def cancel_inline() -> InlineKeyboardMarkup:
    return InlineKeyboardMarkup(
        inline_keyboard=[
            [InlineKeyboardButton(text="❌ Отмена", callback_data="cancel")]
        ]
    )


# -------------------------------- PROXIES ----------------------------------

def proxies_menu(accounts: list[dict]) -> InlineKeyboardMarkup:
    """Inline-клавиатура для раздела «Мои прокси».

    Прокси в нашей модели привязаны к ФП-аккаунту, так что показываем
    таблицу: аккаунт → прокси.
    """
    rows: list[list[InlineKeyboardButton]] = []
    for acc in accounts:
        proxy = acc.get("proxy") or "—"
        # Усечём чтобы влезло в кнопку
        proxy_label = proxy if len(proxy) <= 24 else proxy[:21] + "…"
        rows.append(
            [
                InlineKeyboardButton(
                    text=f"🔑 {acc['login']} · {proxy_label}",
                    callback_data=f"acc:setproxy:{acc['id']}",
                )
            ]
        )
    if not rows:
        rows.append(
            [
                InlineKeyboardButton(
                    text="➕ Сначала добавь аккаунт",
                    callback_data="acc:add",
                )
            ]
        )
    return InlineKeyboardMarkup(inline_keyboard=rows)
