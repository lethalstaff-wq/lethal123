"""Хендлеры раздела «🔑 Мои прокси».

В нашей модели прокси привязан к ФП-аккаунту, поэтому раздел показывает
табличку «аккаунт → прокси» и даёт сменить прокси любого аккаунта.
"""

from __future__ import annotations

from aiogram import F, Router
from aiogram.filters import StateFilter
from aiogram.fsm.context import FSMContext
from aiogram.fsm.state import State, StatesGroup
from aiogram.types import CallbackQuery, Message

from bot.keyboards.kb import (
    BTN_PROXIES,
    cancel_inline,
    proxies_menu,
)
from database.models import (
    get_fp_account,
    get_or_create_user,
    list_fp_accounts,
    update_fp_proxy,
)
from utils.helpers import escape_html, parse_proxy

router = Router(name="proxy")


class SetProxy(StatesGroup):
    waiting_value = State()


@router.message(F.text == BTN_PROXIES)
async def open_proxies(message: Message, state: FSMContext) -> None:
    await state.clear()
    if not message.from_user:
        return
    user = await get_or_create_user(
        message.from_user.id, message.from_user.username
    )
    accounts = await list_fp_accounts(user["id"])

    if not accounts:
        text = (
            "🔑 <b>Мои прокси</b>\n\n"
            "У тебя пока нет ФП-аккаунтов — добавь хотя бы один в "
            "«📁 Мои аккаунты», и сможешь привязать прокси."
        )
    else:
        lines = ["🔑 <b>Мои прокси</b>", ""]
        for acc in accounts:
            proxy = acc.get("proxy") or "не задан"
            lines.append(
                f"• <b>{escape_html(acc['login'])}</b> → "
                f"<code>{escape_html(proxy)}</code>"
            )
        lines.append("")
        lines.append("Нажми на аккаунт чтобы поменять прокси.")
        text = "\n".join(lines)

    await message.answer(text, reply_markup=proxies_menu(accounts))


@router.callback_query(F.data.startswith("acc:setproxy:"))
async def cb_set_proxy(call: CallbackQuery, state: FSMContext) -> None:
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

    await state.set_state(SetProxy.waiting_value)
    await state.update_data(account_id=account_id)
    current = acc.get("proxy") or "не задан"
    await call.message.answer(
        f"🔑 <b>Смена прокси для {escape_html(acc['login'])}</b>\n\n"
        f"Текущий: <code>{escape_html(current)}</code>\n\n"
        "Пришли новый прокси одной строкой:\n"
        "<code>http://user:pass@host:port</code>\n"
        "<code>socks5://user:pass@host:port</code>\n"
        "<code>host:port:user:pass</code>\n\n"
        "Чтобы сбросить — отправь <code>-</code>.",
        reply_markup=cancel_inline(),
    )
    await call.answer()


@router.message(StateFilter(SetProxy.waiting_value))
async def step_value(message: Message, state: FSMContext) -> None:
    if not message.text or not message.from_user:
        return
    raw = message.text.strip()
    proxy: str | None
    if raw in {"-", "—", "нет", "no"}:
        proxy = None
    else:
        if not parse_proxy(raw):
            await message.answer(
                "❌ Не понял формат прокси. Попробуй ещё раз или <code>-</code> "
                "чтобы убрать прокси."
            )
            return
        proxy = raw

    data = await state.get_data()
    account_id = int(data["account_id"])
    user = await get_or_create_user(
        message.from_user.id, message.from_user.username
    )
    ok = await update_fp_proxy(account_id, user["id"], proxy)
    await state.clear()

    if not ok:
        await message.answer("❌ Не нашёл такой аккаунт.")
        return

    if proxy:
        await message.answer(
            f"✅ Прокси обновлён: <code>{escape_html(proxy)}</code>\n\n"
            "Не забудь нажать «🔌 Подключить» в карточке аккаунта, "
            "чтобы пересоздать сессию через новый прокси."
        )
    else:
        await message.answer("✅ Прокси сброшен — аккаунт работает напрямую.")
