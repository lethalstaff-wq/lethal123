"""Хендлеры старта/главного меню/«О боте»/«Помощь».

Регистрирует пользователя в БД при первом /start, показывает приветствие
и главное меню. Также ловит нажатия по «ℹ️ О боте» и «🏷 Помощь».
"""

from __future__ import annotations

from aiogram import F, Router
from aiogram.filters import CommandObject, CommandStart
from aiogram.types import Message

from bot.keyboards.kb import (
    BTN_ABOUT,
    BTN_HELP,
    main_menu,
)
from config import BRAND_NAME, BRAND_SHORT
from database.models import get_or_create_user, get_user_by_referral_code

router = Router(name="start")


WELCOME = (
    "👋 <b>Привет, {name}!</b>\n\n"
    "Это <b>{brand}</b> — комбайн для автоматизации продаж на FunPay.\n\n"
    "🔥 <b>Что умеет бот:</b>\n"
    "• 📁 Управлять несколькими ФП-аккаунтами с одного места\n"
    "• 🔑 Работать через личные прокси\n"
    "• 📈 Поднимать предложения 24/7\n"
    "• 🤖 Автовыдавать товары моментально\n"
    "• 📨 Отвечать клиентам по триггерам\n"
    "• 📊 Считать статистику и помогать с арбитражем\n\n"
    "👇 Жми кнопки внизу — начни с <b>«📁 Мои аккаунты»</b>, "
    "чтобы подключить свой FunPay."
)


ABOUT_TEXT = (
    "ℹ️ <b>{brand}</b>\n\n"
    "Бот для автоматизации продаж на FunPay. Один бот — много клиентов, "
    "у каждого своё пространство.\n\n"
    "💎 <b>Тарифы:</b>\n"
    "🥉 <b>Starter</b> — 500₽/мес · 1 аккаунт\n"
    "🥈 <b>Standard</b> — 1000₽/мес · 5 аккаунтов\n"
    "🥇 <b>Pro</b> — 1500₽/мес · 10 аккаунтов + ИИ\n\n"
    "Бренд: <b>Lethal Solutions</b>"
)


HELP_TEXT = (
    "🏷 <b>Помощь</b>\n\n"
    "🔹 <b>Как начать?</b>\n"
    "1. Нажми «📁 Мои аккаунты» → «➕ Добавить аккаунт»\n"
    "2. Введи логин, пароль и (по желанию) прокси FunPay\n"
    "3. Бот залогинится и сохранит сессию\n"
    "4. Готово — включай автоподнятие, автовыдачу и автоответы\n\n"
    "🔹 <b>Безопасность.</b> Пароли шифруются AES-ключом и никогда "
    "не покидают сервер в открытом виде.\n\n"
    "🔹 <b>Поддержка.</b> Напиши в чат бренда Lethal Solutions."
)


@router.message(CommandStart())
async def cmd_start(message: Message, command: CommandObject) -> None:
    if not message.from_user:
        return
    # Парсим реферальный код из /start REFCODE и резолвим его в user_id
    referred_by: int | None = None
    if command.args:
        referrer = await get_user_by_referral_code(command.args.strip().upper())
        if referrer and referrer["telegram_id"] != message.from_user.id:
            referred_by = referrer["id"]

    await get_or_create_user(
        telegram_id=message.from_user.id,
        username=message.from_user.username,
        referred_by=referred_by,
    )

    await message.answer(
        WELCOME.format(
            name=message.from_user.first_name or "друг",
            brand=BRAND_NAME,
        ),
        reply_markup=main_menu(),
    )


@router.message(F.text == BTN_ABOUT)
async def about(message: Message) -> None:
    await message.answer(ABOUT_TEXT.format(brand=BRAND_NAME))


@router.message(F.text == BTN_HELP)
async def help_(message: Message) -> None:
    await message.answer(HELP_TEXT)


@router.message(F.text.in_({"/menu", "Меню", "меню"}))
async def show_menu(message: Message) -> None:
    await message.answer(
        f"{BRAND_SHORT} — главное меню", reply_markup=main_menu()
    )
