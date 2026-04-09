"""Help Center — структурированная справка с FAQ.

Минималистичный центр помощи: категории, переход в категорию, ответы
на частые вопросы, ссылки на раздел бота где это настраивается.

Команды: /help, /faq
"""

from __future__ import annotations

from aiogram import F, Router
from aiogram.filters import Command
from aiogram.types import (
    CallbackQuery,
    InlineKeyboardButton,
    InlineKeyboardMarkup,
    Message,
)

router = Router(name="help_center")


# Структура FAQ: категория → [(вопрос, ответ), ...]
FAQ: dict[str, tuple[str, list[tuple[str, str]]]] = {
    "getting_started": (
        "🚀 Начало работы",
        [
            (
                "Как подключить свой аккаунт FunPay?",
                "Нажми «📁 Аккаунты» → «➕ Добавить аккаунт». Введи логин, "
                "пароль и (опционально) прокси. Пароль удаляется из чата "
                "сразу после получения, хранится зашифрованным.",
            ),
            (
                "Нужен ли мне прокси?",
                "Необязательно, но желательно если запускаешь несколько "
                "аккаунтов с одного сервера — FunPay может заметить и "
                "заблокировать. Форматы: <code>http://user:pass@ip:port</code>, "
                "<code>socks5://ip:port</code>, <code>ip:port:user:pass</code>.",
            ),
            (
                "Мой аккаунт уже активен?",
                "После добавления статус автоматически становится 🟢. "
                "Если видишь ⚪️ — жми «🔌 Подключить» в карточке аккаунта.",
            ),
            (
                "С чего начать настройку?",
                "Команда /onboarding — бот покажет чек-лист из 5 пунктов и "
                "проведёт за руку.",
            ),
        ],
    ),
    "automation": (
        "⚙️ Автоматизации",
        [
            (
                "Как работает автоподнятие?",
                "Бот сам поднимает все твои лоты каждые N минут (по "
                "умолчанию 240). Настраивается в ⚙️ Настройках. Pro-тариф "
                "использует приоритеты по выручке + smart jitter.",
            ),
            (
                "Что такое автовыдача?",
                "Загружаешь список товаров (ключей/аккаунтов), привязываешь "
                "к названию лота. Бот автоматически выдаёт товар покупателю "
                "после оплаты. Формат валидируется (Steam key, email:pass).",
            ),
            (
                "Что такое автоответчик?",
                "Правила «триггер-слово → ответ». Работают переменные "
                "<code>{buyer}</code>, <code>{lot}</code>, время суток, "
                "рабочие часы, варианты через |||, regex в триггерах.",
            ),
            (
                "Почему мой бот не отвечает?",
                "1) Проверь что тумблер 📨 Автоответчик включён в ⚙️ Настройках. "
                "2) Проверь что сам аккаунт 🟢 онлайн. 3) Проверь что сессия "
                "жива (она обновляется раз в 10 минут автоматически).",
            ),
        ],
    ),
    "chat": (
        "💬 Чат через Telegram",
        [
            (
                "Как это работает?",
                "Standard+ тариф. Бот каждые 7 секунд парсит чаты FunPay, "
                "новые сообщения пересылает тебе в Telegram с кнопками "
                "✍️ Ответить / 📋 Заготовки / 🤖 ИИ / 🛡 Арбитраж.",
            ),
            (
                "Что такое «🔥 ГОРЯЧИЙ ЛИД»?",
                "Бот анализирует текст покупателя по 20+ паттернам "
                "готовности купить (куплю, беру, сколько стоит...). "
                "Если score ≥ 70 — ты получаешь приоритетный алёрт "
                "«ответь за 2-3 минуты».",
            ),
            (
                "Почему мои ответы проверяются?",
                "Content moderation защищает твой аккаунт от бана FunPay: "
                "блокирует упоминания Telegram/Discord/номеров в "
                "исходящих сообщениях. Если такой текст перехвачен — "
                "бот покажет безопасную версию.",
            ),
        ],
    ),
    "crm": (
        "📇 CRM",
        [
            (
                "Откуда берутся клиенты?",
                "Автоматически! Как только покупатель напишет тебе или "
                "сделает заказ — появится в CRM с метриками: orders_count, "
                "total_spent, avg_order_value, LTV.",
            ),
            (
                "Что такое сегменты?",
                "Автоматическая классификация клиентов: 🆕 Новые, "
                "👤 Постоянные, 💎 VIP, 💤 Спящие, ⚠️ Риск ухода, "
                "🚫 Проблемные, ❌ Потерянные. Пересчитывается при каждом "
                "контакте.",
            ),
            (
                "Можно ли добавить свои заметки?",
                "Да, открой карточку клиента → 📝 Заметки → ➕ Добавить. "
                "Теги работают так же: свободные метки для фильтрации.",
            ),
        ],
    ),
    "billing": (
        "💳 Оплата и тарифы",
        [
            (
                "Какие тарифы есть?",
                "🥉 Starter 500₽ — 1 аккаунт, базовые фичи.\n"
                "🥈 Standard 1000₽ — до 5 аккаунтов, чат через ТГ, антискам, "
                "кросселл.\n"
                "🥇 Pro 1500₽ — до 10 аккаунтов, ИИ-ответы, арбитраж, "
                "воронка, дэшборд, AI-генератор лотов.",
            ),
            (
                "Как купить тариф?",
                "Жми «💳 Тарифы» → выбери нужный → оплата картой "
                "(моментально) или вручную через админа.",
            ),
            (
                "Что даёт Telegram Stars?",
                "Альтернативный способ оплаты прямо в Telegram без карты. "
                "Работает если включено админом (TG_STARS_ENABLED=1).",
            ),
            (
                "Есть ли рефералы?",
                "Да, 10% с оплаты приглашённого идёт тебе на баланс. "
                "Твой реф-код в 👤 Профиле.",
            ),
        ],
    ),
    "safety": (
        "🛡 Безопасность",
        [
            (
                "Как защищены мои пароли?",
                "Fernet (AES-128 CBC + HMAC-SHA256). Ключ либо в "
                "ENCRYPTION_KEY env, либо в <code>.secret_key</code> (0600). "
                "В логах и UI пароли не появляются.",
            ),
            (
                "Что если забанят мой аккаунт?",
                "Content moderation блокирует контент который часто "
                "приводит к бану: упоминания внешних мессенджеров, "
                "номеров, ссылок. Если тебя всё равно забанили — "
                "автоматического восстановления нет, это делается руками.",
            ),
            (
                "Что делать если сессия протухла?",
                "Сервис session_restore каждые 10 минут проверяет все "
                "аккаунты и перелогинивается автоматически, используя "
                "сохранённый зашифрованный пароль.",
            ),
        ],
    ),
    "troubleshoot": (
        "🔧 Проблемы",
        [
            (
                "Бот не видит новые заказы",
                "Убедись что тариф активен (💳 Тарифы) и аккаунт 🟢 онлайн. "
                "Order watcher пулит FunPay раз в 30 секунд. Если заказ "
                "был давно — он не подхватится (берёт только новые после "
                "запуска).",
            ),
            (
                "FunPay вернул 403",
                "Обычно это Cloudflare. Попробуй другой прокси или "
                "перезапусти бота. В крайнем случае — смени User-Agent.",
            ),
            (
                "Автовыдача не работает",
                "1) Правило создано для правильного названия лота? "
                "(бот матчит по substring) 2) Товары не закончились? "
                "(иначе покажет алёрт) 3) Включён тумблер в ⚙️ Настройках?",
            ),
            (
                "Где логи?",
                "Docker: <code>docker compose logs -f bot</code>. "
                "systemd: <code>journalctl -u lethal-fpbot -f</code>. "
                "Локально: stdout.",
            ),
        ],
    ),
}


def _categories_kb() -> InlineKeyboardMarkup:
    rows = []
    for cat_id, (title, _) in FAQ.items():
        rows.append(
            [InlineKeyboardButton(text=title, callback_data=f"help:cat:{cat_id}")]
        )
    rows.append(
        [
            InlineKeyboardButton(
                text="📖 Полная документация",
                url="https://github.com/lethalstaff-wq/lethal123",
            )
        ]
    )
    rows.append(
        [
            InlineKeyboardButton(
                text="💬 Поддержка",
                callback_data="help:support",
            )
        ]
    )
    return InlineKeyboardMarkup(inline_keyboard=rows)


def _questions_kb(cat_id: str) -> InlineKeyboardMarkup:
    _, questions = FAQ[cat_id]
    rows = []
    for i, (q, _) in enumerate(questions):
        rows.append(
            [
                InlineKeyboardButton(
                    text=q, callback_data=f"help:q:{cat_id}:{i}"
                )
            ]
        )
    rows.append(
        [InlineKeyboardButton(text="« К категориям", callback_data="help:home")]
    )
    return InlineKeyboardMarkup(inline_keyboard=rows)


def _answer_kb(cat_id: str) -> InlineKeyboardMarkup:
    return InlineKeyboardMarkup(
        inline_keyboard=[
            [
                InlineKeyboardButton(
                    text="« К вопросам", callback_data=f"help:cat:{cat_id}"
                )
            ]
        ]
    )


@router.message(Command("help"))
@router.message(Command("faq"))
async def cmd_help(message: Message) -> None:
    await message.answer(
        "🆘 <b>Центр помощи</b>\n\n"
        "Выбери категорию, я покажу ответы на частые вопросы:",
        reply_markup=_categories_kb(),
    )


@router.callback_query(F.data == "help:home")
async def cb_home(call: CallbackQuery) -> None:
    if not isinstance(call.message, Message):
        return
    try:
        await call.message.edit_text(
            "🆘 <b>Центр помощи</b>\n\n"
            "Выбери категорию, я покажу ответы на частые вопросы:",
            reply_markup=_categories_kb(),
        )
    except Exception:  # noqa: BLE001
        pass
    await call.answer()


@router.callback_query(F.data.startswith("help:cat:"))
async def cb_category(call: CallbackQuery) -> None:
    if not isinstance(call.message, Message):
        return
    cat_id = (call.data or "").split(":")[2]
    if cat_id not in FAQ:
        await call.answer()
        return
    title, questions = FAQ[cat_id]
    lines = [f"{title}", "", f"Вопросов в категории: {len(questions)}", ""]
    lines.append("Выбери вопрос:")
    try:
        await call.message.edit_text(
            "\n".join(lines), reply_markup=_questions_kb(cat_id)
        )
    except Exception:  # noqa: BLE001
        pass
    await call.answer()


@router.callback_query(F.data.startswith("help:q:"))
async def cb_question(call: CallbackQuery) -> None:
    if not isinstance(call.message, Message):
        return
    parts = (call.data or "").split(":")
    if len(parts) < 4:
        await call.answer()
        return
    cat_id = parts[2]
    try:
        q_idx = int(parts[3])
    except ValueError:
        await call.answer()
        return
    if cat_id not in FAQ:
        await call.answer()
        return
    title, questions = FAQ[cat_id]
    if q_idx < 0 or q_idx >= len(questions):
        await call.answer()
        return
    q, a = questions[q_idx]
    text = f"{title}\n\n<b>{q}</b>\n\n{a}"
    try:
        await call.message.edit_text(text, reply_markup=_answer_kb(cat_id))
    except Exception:  # noqa: BLE001
        pass
    await call.answer()


@router.callback_query(F.data == "help:support")
async def cb_support(call: CallbackQuery) -> None:
    if not isinstance(call.message, Message):
        return
    await call.message.answer(
        "💬 <b>Поддержка Lethal Solutions</b>\n\n"
        "Если не нашёл ответ — напиши админу, опиши проблему и приложи "
        "скрин если нужно. Команда /profile покажет твой ID чтобы ты "
        "мог его указать.\n\n"
        "Приоритетная поддержка — в Pro-тарифе."
    )
    await call.answer()
