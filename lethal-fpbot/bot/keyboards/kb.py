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

# ----------------------------- AUTO-RESPONSE -------------------------------

def auto_response_menu(rules: list[dict]) -> InlineKeyboardMarkup:
    rows: list[list[InlineKeyboardButton]] = []
    for r in rules:
        triggers = ", ".join(r.get("trigger_words") or [])[:30]
        rows.append(
            [
                InlineKeyboardButton(
                    text=f"📨 {triggers}",
                    callback_data=f"ar:view:{r['id']}",
                )
            ]
        )
    rows.append(
        [InlineKeyboardButton(text="➕ Добавить триггер", callback_data="ar:add")]
    )
    return InlineKeyboardMarkup(inline_keyboard=rows)


def auto_response_card(rid: int) -> InlineKeyboardMarkup:
    return InlineKeyboardMarkup(
        inline_keyboard=[
            [
                InlineKeyboardButton(text="🗑 Удалить", callback_data=f"ar:del:{rid}"),
                InlineKeyboardButton(text="« Назад", callback_data="ar:list"),
            ]
        ]
    )


# ----------------------------- AUTO-DELIVERY -------------------------------

def auto_delivery_menu(rules: list[dict]) -> InlineKeyboardMarkup:
    rows: list[list[InlineKeyboardButton]] = []
    for r in rules:
        items_left = len(r.get("items") or [])
        rows.append(
            [
                InlineKeyboardButton(
                    text=f"🤖 {r['lot_name']} · {items_left}",
                    callback_data=f"ad:view:{r['id']}",
                )
            ]
        )
    rows.append(
        [InlineKeyboardButton(text="➕ Добавить лот", callback_data="ad:add")]
    )
    return InlineKeyboardMarkup(inline_keyboard=rows)


def auto_delivery_card(rid: int) -> InlineKeyboardMarkup:
    return InlineKeyboardMarkup(
        inline_keyboard=[
            [
                InlineKeyboardButton(text="🗑 Удалить", callback_data=f"ad:del:{rid}"),
                InlineKeyboardButton(text="« Назад", callback_data="ad:list"),
            ]
        ]
    )


# ----------------------------- TEXTS ---------------------------------------

def texts_menu(items: list[dict]) -> InlineKeyboardMarkup:
    rows: list[list[InlineKeyboardButton]] = []
    for t in items:
        rows.append(
            [
                InlineKeyboardButton(
                    text=f"✍️ {t['name']}",
                    callback_data=f"txt:view:{t['id']}",
                )
            ]
        )
    rows.append(
        [InlineKeyboardButton(text="➕ Добавить текст", callback_data="txt:add")]
    )
    return InlineKeyboardMarkup(inline_keyboard=rows)


def text_card(tid: int) -> InlineKeyboardMarkup:
    return InlineKeyboardMarkup(
        inline_keyboard=[
            [
                InlineKeyboardButton(text="🗑 Удалить", callback_data=f"txt:del:{tid}"),
                InlineKeyboardButton(text="« Назад", callback_data="txt:list"),
            ]
        ]
    )


# ----------------------------- STATS ---------------------------------------

def stats_menu() -> InlineKeyboardMarkup:
    return InlineKeyboardMarkup(
        inline_keyboard=[
            [
                InlineKeyboardButton(text="🕐 День", callback_data="stats:day"),
                InlineKeyboardButton(text="📅 Неделя", callback_data="stats:week"),
            ],
            [
                InlineKeyboardButton(text="📆 Месяц", callback_data="stats:month"),
                InlineKeyboardButton(text="🌐 Всё", callback_data="stats:all"),
            ],
        ]
    )


# ----------------------------- BILLING -------------------------------------

def billing_menu() -> InlineKeyboardMarkup:
    return InlineKeyboardMarkup(
        inline_keyboard=[
            [InlineKeyboardButton(text="🥉 Starter — 500₽", callback_data="bill:buy:starter")],
            [InlineKeyboardButton(text="🥈 Standard — 1000₽", callback_data="bill:buy:standard")],
            [InlineKeyboardButton(text="🥇 Pro — 1500₽", callback_data="bill:buy:pro")],
        ]
    )


# ----------------------------- PROFILE -------------------------------------

def profile_menu(referral_code: str) -> InlineKeyboardMarkup:
    return InlineKeyboardMarkup(
        inline_keyboard=[
            [
                InlineKeyboardButton(
                    text=f"🔗 Реф-код: {referral_code}",
                    callback_data="profile:ref",
                )
            ],
            [
                InlineKeyboardButton(
                    text="💳 Купить тариф", callback_data="bill:open"
                )
            ],
        ]
    )


# ----------------------------- SETTINGS ------------------------------------

SETTING_LABELS: dict[str, str] = {
    "auto_raise": "📈 Автоподнятие",
    "auto_delivery": "🤖 Автовыдача",
    "auto_response": "📨 Автоответчик",
    "always_online": "🟢 Вечный онлайн",
    "ask_review": "⭐️ Просить отзыв",
    "ask_confirm": "✅ Просить подтвердить",
    "auto_complaint": "🚨 Авто-жалоба 24ч",
    "review_reply": "💬 Ответ на отзывы",
    "cross_sell": "🛒 Кросселл",
    "funnel_enabled": "🎯 Воронка продаж",
    "anti_scam": "🛡 Антискам",
    "smart_pricing": "💸 Смарт-прайсинг",
    "auto_price_adjust": "📉 Авто-снижение цены",
}


def settings_menu(settings: dict) -> InlineKeyboardMarkup:
    rows: list[list[InlineKeyboardButton]] = []
    for key, label in SETTING_LABELS.items():
        on = bool(settings.get(key))
        emoji = "🟢" if on else "⚪️"
        rows.append(
            [
                InlineKeyboardButton(
                    text=f"{emoji} {label}",
                    callback_data=f"set:toggle:{key}",
                )
            ]
        )
    rows.append(
        [InlineKeyboardButton(text="⏱ Интервал поднятия", callback_data="set:raise_interval")]
    )
    rows.append(
        [InlineKeyboardButton(text="✍️ Тексты воронки/жалобы/кросселла", callback_data="set:texts")]
    )
    return InlineKeyboardMarkup(inline_keyboard=rows)


# ----------------------------- ADMIN ---------------------------------------

def admin_menu() -> InlineKeyboardMarkup:
    return InlineKeyboardMarkup(
        inline_keyboard=[
            [InlineKeyboardButton(text="👥 Пользователи", callback_data="admin:users")],
            [InlineKeyboardButton(text="💳 Платежи", callback_data="admin:payments")],
            [InlineKeyboardButton(text="📢 Рассылка", callback_data="admin:broadcast")],
        ]
    )


def payment_review(payment_id: int) -> InlineKeyboardMarkup:
    return InlineKeyboardMarkup(
        inline_keyboard=[
            [
                InlineKeyboardButton(text="✅ Подтвердить", callback_data=f"admin:pay_ok:{payment_id}"),
                InlineKeyboardButton(text="❌ Отклонить", callback_data=f"admin:pay_no:{payment_id}"),
            ]
        ]
    )


# ----------------------------- CHAT MESSAGE --------------------------------

def chat_message_keyboard(account_id: int, fp_chat_id: str) -> InlineKeyboardMarkup:
    return InlineKeyboardMarkup(
        inline_keyboard=[
            [
                InlineKeyboardButton(
                    text="✍️ Ответить",
                    callback_data=f"chat:reply:{account_id}:{fp_chat_id}",
                ),
                InlineKeyboardButton(
                    text="📋 Заготовки",
                    callback_data=f"chat:texts:{account_id}:{fp_chat_id}",
                ),
            ],
            [
                InlineKeyboardButton(
                    text="🤖 ИИ-ответ",
                    callback_data=f"chat:ai:{account_id}:{fp_chat_id}",
                ),
                InlineKeyboardButton(
                    text="🛡 Арбитраж",
                    callback_data=f"chat:arb:{account_id}:{fp_chat_id}",
                ),
            ],
            [
                InlineKeyboardButton(
                    text="🚫 В чёрный список",
                    callback_data=f"chat:black:{account_id}:{fp_chat_id}",
                ),
            ],
        ]
    )


def texts_picker(account_id: int, fp_chat_id: str, items: list[dict]) -> InlineKeyboardMarkup:
    rows: list[list[InlineKeyboardButton]] = []
    for t in items:
        rows.append(
            [
                InlineKeyboardButton(
                    text=f"✍️ {t['name']}",
                    callback_data=f"chat:send:{account_id}:{fp_chat_id}:{t['id']}",
                )
            ]
        )
    if not rows:
        rows.append(
            [InlineKeyboardButton(text="Нет заготовок", callback_data="cancel")]
        )
    return InlineKeyboardMarkup(inline_keyboard=rows)


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
