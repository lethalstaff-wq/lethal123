"""Хендлеры раздела «📁 Мои аккаунты».

FSM-флоу добавления:
  1. login   — пользователь шлёт логин (или email) FunPay
  2. password — шлёт пароль (мы стираем сообщение)
  3. proxy   — шлёт прокси одной строкой или жмёт «без прокси»
  4. Бот логинится, сохраняет в БД, удаляет сообщение с паролем
"""

from __future__ import annotations

import logging

from aiogram import F, Router
from aiogram.filters import StateFilter
from aiogram.fsm.context import FSMContext
from aiogram.fsm.state import State, StatesGroup
from aiogram.types import CallbackQuery, Message

from bot.keyboards.kb import (
    BTN_ACCOUNTS,
    account_card,
    accounts_menu,
    cancel_inline,
    confirm_delete_account,
)
from config import TIER_FP_ACCOUNTS_LIMIT, TIER_NAMES, TIER_STARTER
from database.models import (
    add_fp_account,
    count_fp_accounts,
    delete_fp_account,
    get_fp_account,
    get_or_create_user,
    list_fp_accounts,
)
from funpay.api import login as fp_login
from funpay.api import verify_session
from utils.encryption import decrypt, encrypt
from utils.helpers import escape_html, parse_proxy

router = Router(name="accounts")
logger = logging.getLogger(__name__)


class AddAccount(StatesGroup):
    waiting_login = State()
    waiting_password = State()
    waiting_proxy = State()


# --------------------------- Список аккаунтов ------------------------------


async def _render_accounts_list(message: Message, user_db_id: int) -> None:
    accounts = await list_fp_accounts(user_db_id)
    user = await get_or_create_user(
        message.from_user.id,  # type: ignore[union-attr]
        message.from_user.username,  # type: ignore[union-attr]
    )
    tier = user.get("subscription_tier") or TIER_STARTER
    limit = TIER_FP_ACCOUNTS_LIMIT.get(tier, 1)
    tier_name = TIER_NAMES.get(tier, "🥉 Starter")

    if not accounts:
        text = (
            "📁 <b>Мои аккаунты FunPay</b>\n\n"
            f"Тариф: {tier_name} · лимит {limit}\n\n"
            "У тебя пока нет подключённых аккаунтов.\n"
            "Жми «➕ Добавить аккаунт» чтобы начать."
        )
    else:
        lines = [
            "📁 <b>Мои аккаунты FunPay</b>",
            f"Тариф: {tier_name} · {len(accounts)}/{limit}",
            "",
        ]
        for acc in accounts:
            online = "🟢 онлайн" if acc.get("is_online") else "⚪️ оффлайн"
            proxy = "🔑 прокси" if acc.get("proxy") else "🌐 без прокси"
            lines.append(
                f"• <b>{escape_html(acc['login'])}</b> — {online} · {proxy}"
            )
        text = "\n".join(lines)

    await message.answer(text, reply_markup=accounts_menu(accounts))


@router.message(F.text == BTN_ACCOUNTS)
async def open_accounts(message: Message, state: FSMContext) -> None:
    await state.clear()
    if not message.from_user:
        return
    user = await get_or_create_user(
        message.from_user.id, message.from_user.username
    )
    await _render_accounts_list(message, user["id"])


@router.callback_query(F.data == "acc:list")
async def cb_list(call: CallbackQuery, state: FSMContext) -> None:
    await state.clear()
    if not call.from_user or not call.message:
        return
    user = await get_or_create_user(
        call.from_user.id, call.from_user.username
    )
    accounts = await list_fp_accounts(user["id"])
    await call.message.edit_reply_markup(reply_markup=accounts_menu(accounts))
    await call.answer()


@router.callback_query(F.data == "acc:refresh")
async def cb_refresh(call: CallbackQuery) -> None:
    if not call.from_user or not isinstance(call.message, Message):
        return
    user = await get_or_create_user(
        call.from_user.id, call.from_user.username
    )
    await call.answer("Проверяю сессии…")
    accounts = await list_fp_accounts(user["id"])
    # Пробежимся и обновим статус is_online через verify_session.
    # Делаем последовательно, чтобы не словить капчу/рейт-лимит.
    from database.db import connect

    for acc in accounts:
        gk = decrypt(acc.get("golden_key") or "")
        if not gk:
            continue
        info = await verify_session(gk, proxy=acc.get("proxy"))
        async with connect() as db:
            await db.execute(
                "UPDATE fp_accounts SET is_online = ? WHERE id = ?",
                (1 if info else 0, acc["id"]),
            )
            await db.commit()

    await _render_accounts_list(call.message, user["id"])


# --------------------------- Карточка аккаунта -----------------------------


@router.callback_query(F.data.startswith("acc:view:"))
async def cb_view(call: CallbackQuery) -> None:
    if not call.from_user or not isinstance(call.message, Message):
        return
    account_id = int(call.data.split(":")[2])  # type: ignore[union-attr]
    user = await get_or_create_user(
        call.from_user.id, call.from_user.username
    )
    acc = await get_fp_account(account_id, user["id"])
    if not acc:
        await call.answer("Аккаунт не найден", show_alert=True)
        return

    online = "🟢 онлайн" if acc.get("is_online") else "⚪️ оффлайн"
    proxy = acc.get("proxy") or "не задан"
    text = (
        "📁 <b>Аккаунт FunPay</b>\n\n"
        f"🔐 Логин: <code>{escape_html(acc['login'])}</code>\n"
        f"📡 Статус: {online}\n"
        f"🔑 Прокси: <code>{escape_html(proxy)}</code>"
    )
    await call.message.edit_text(
        text, reply_markup=account_card(acc["id"], bool(acc.get("is_online")))
    )
    await call.answer()


@router.callback_query(F.data.startswith("acc:reconnect:"))
async def cb_reconnect(call: CallbackQuery) -> None:
    if not call.from_user or not isinstance(call.message, Message):
        return
    account_id = int(call.data.split(":")[2])  # type: ignore[union-attr]
    user = await get_or_create_user(
        call.from_user.id, call.from_user.username
    )
    acc = await get_fp_account(account_id, user["id"])
    if not acc:
        await call.answer("Аккаунт не найден", show_alert=True)
        return

    await call.answer("Проверяю сессию…")
    gk = decrypt(acc.get("golden_key") or "")
    info = await verify_session(gk, proxy=acc.get("proxy")) if gk else None

    if not info:
        # Перелогин по сохранённым кредам
        password = decrypt(acc.get("password") or "")
        if not password:
            await call.message.answer(
                "❌ Сессия протухла, а пароль не сохранён. "
                "Удали аккаунт и добавь заново."
            )
            return
        result = await fp_login(
            acc["login"], password, proxy=acc.get("proxy")
        )
        if not result.ok or not result.info:
            await call.message.answer(
                f"❌ Не удалось войти: {escape_html(result.error or 'unknown')}"
            )
            return
        info = result.info

    from database.models import update_fp_session

    await update_fp_session(
        account_id=acc["id"],
        golden_key_enc=encrypt(info.golden_key),
        is_online=True,
    )
    await call.message.answer(
        f"✅ Сессия активна. Привет, <b>{escape_html(info.username or '')}</b>!"
    )


@router.callback_query(F.data.startswith("acc:delete:"))
async def cb_delete(call: CallbackQuery) -> None:
    if not isinstance(call.message, Message):
        return
    account_id = int(call.data.split(":")[2])  # type: ignore[union-attr]
    await call.message.edit_reply_markup(
        reply_markup=confirm_delete_account(account_id)
    )
    await call.answer()


@router.callback_query(F.data.startswith("acc:delete_yes:"))
async def cb_delete_yes(call: CallbackQuery) -> None:
    if not call.from_user or not isinstance(call.message, Message):
        return
    account_id = int(call.data.split(":")[2])  # type: ignore[union-attr]
    user = await get_or_create_user(
        call.from_user.id, call.from_user.username
    )
    ok = await delete_fp_account(account_id, user["id"])
    if ok:
        await call.answer("Удалено", show_alert=False)
    else:
        await call.answer("Не нашёл такой", show_alert=True)
    await _render_accounts_list(call.message, user["id"])


# --------------------------- Добавление: FSM -------------------------------


@router.callback_query(F.data == "acc:add")
async def cb_add(call: CallbackQuery, state: FSMContext) -> None:
    if not call.from_user or not isinstance(call.message, Message):
        return
    user = await get_or_create_user(
        call.from_user.id, call.from_user.username
    )
    tier = user.get("subscription_tier") or TIER_STARTER
    limit = TIER_FP_ACCOUNTS_LIMIT.get(tier, 1)
    used = await count_fp_accounts(user["id"])
    if used >= limit:
        await call.answer(
            f"Достигнут лимит {limit} аккаунтов для тарифа {TIER_NAMES.get(tier, '')}",
            show_alert=True,
        )
        return

    await state.set_state(AddAccount.waiting_login)
    await call.message.answer(
        "🔐 <b>Добавление аккаунта FunPay</b>\n\n"
        "Шаг 1/3 · Отправь <b>логин</b> или email от аккаунта FunPay.\n\n"
        "💡 Можно прервать в любой момент кнопкой ниже.",
        reply_markup=cancel_inline(),
    )
    await call.answer()


@router.callback_query(F.data == "cancel")
async def cb_cancel(call: CallbackQuery, state: FSMContext) -> None:
    await state.clear()
    if isinstance(call.message, Message):
        await call.message.answer("❌ Отменено.")
    await call.answer()


@router.message(StateFilter(AddAccount.waiting_login))
async def step_login(message: Message, state: FSMContext) -> None:
    if not message.text:
        await message.answer("Пришли логин текстом.")
        return
    login_ = message.text.strip()
    if len(login_) < 3 or len(login_) > 100:
        await message.answer("❌ Логин выглядит странно. Попробуй ещё раз.")
        return
    await state.update_data(login=login_)
    await state.set_state(AddAccount.waiting_password)
    await message.answer(
        "Шаг 2/3 · Пришли <b>пароль</b>. Я удалю твоё сообщение сразу "
        "после получения и сохраню пароль зашифрованным AES.",
        reply_markup=cancel_inline(),
    )


@router.message(StateFilter(AddAccount.waiting_password))
async def step_password(message: Message, state: FSMContext) -> None:
    if not message.text:
        await message.answer("Пришли пароль текстом.")
        return
    password = message.text
    # Сразу удалим сообщение с паролем — даже если потом упадём.
    try:
        await message.delete()
    except Exception:
        pass

    await state.update_data(password=password)
    await state.set_state(AddAccount.waiting_proxy)
    await message.answer(
        "Шаг 3/3 · Пришли <b>прокси</b> в формате\n"
        "<code>http://user:pass@host:port</code>\n"
        "<code>socks5://user:pass@host:port</code>\n"
        "или <code>host:port:user:pass</code>.\n\n"
        "Если без прокси — отправь <code>-</code>.",
        reply_markup=cancel_inline(),
    )


@router.message(StateFilter(AddAccount.waiting_proxy))
async def step_proxy(message: Message, state: FSMContext) -> None:
    if not message.text or not message.from_user:
        return
    raw = message.text.strip()
    proxy: str | None
    if raw in {"-", "—", "нет", "no"}:
        proxy = None
    else:
        parsed = parse_proxy(raw)
        if not parsed:
            await message.answer(
                "❌ Не понял формат прокси. Пришли ещё раз или <code>-</code> "
                "если без прокси."
            )
            return
        proxy = raw

    data = await state.get_data()
    login_ = data["login"]
    password = data["password"]

    status_msg = await message.answer("⏳ Логинюсь в FunPay…")
    result = await fp_login(login_, password, proxy=proxy)

    if not result.ok or not result.info:
        await status_msg.edit_text(
            f"❌ Не удалось войти: {escape_html(result.error or 'unknown')}\n\n"
            "Попробуй заново через «📁 Мои аккаунты»."
        )
        await state.clear()
        return

    user = await get_or_create_user(
        message.from_user.id, message.from_user.username
    )
    acc_id = await add_fp_account(
        user_id=user["id"],
        login=login_,
        password_enc=encrypt(password),
        proxy=proxy,
        golden_key_enc=encrypt(result.info.golden_key),
        user_agent=None,
    )

    # Помечаем онлайн
    from database.db import connect

    async with connect() as db:
        await db.execute(
            "UPDATE fp_accounts SET is_online = 1 WHERE id = ?",
            (acc_id,),
        )
        await db.commit()

    await status_msg.edit_text(
        "✅ <b>Аккаунт подключён!</b>\n\n"
        f"👤 {escape_html(result.info.username or login_)}\n"
        f"🆔 FP ID: <code>{result.info.user_id}</code>\n"
        f"🔑 Прокси: <code>{escape_html(proxy or 'не задан')}</code>"
    )
    await state.clear()
    await _render_accounts_list(message, user["id"])
