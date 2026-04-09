"""Onboarding Wizard — ведёт нового юзера за руку до первого заказа.

Цель: пользователь должен за 3 минуты настроить всё самое важное без
чтения документации. Показываем чек-лист:

  ⬜ Подключить FunPay аккаунт
  ⬜ Включить вечный онлайн
  ⬜ Настроить автоответчик (1+ триггер)
  ⬜ Настроить автовыдачу (1+ правило)
  ⬜ Включить автоподнятие

По каждой незакрытой задаче — кнопка «Сделать сейчас» которая ведёт
прямо в нужный раздел.

Если юзер всё прошёл — показываем 🎉 «Всё готово, бот работает!».

/onboarding и /setup открывают этот экран. После первого /start тоже
автоматически показываем, если ни одного аккаунта ещё нет.
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

from database.models import (
    count_fp_accounts,
    get_or_create_user,
    get_settings,
    list_auto_delivery,
    list_auto_responses,
)

router = Router(name="onboarding")


async def _compute_checklist(user_id: int) -> dict[str, bool]:
    """Возвращает состояние чек-листа онбординга."""
    fp_count = await count_fp_accounts(user_id)
    settings = await get_settings(user_id)
    responses = await list_auto_responses(user_id)
    delivery = await list_auto_delivery(user_id)

    return {
        "account": fp_count > 0,
        "always_online": bool(settings.get("always_online")),
        "auto_response": len(responses) > 0 and bool(settings.get("auto_response")),
        "auto_delivery": len(delivery) > 0 and bool(settings.get("auto_delivery")),
        "auto_raise": bool(settings.get("auto_raise")),
    }


def _format_checklist(state: dict[str, bool]) -> str:
    done = sum(1 for v in state.values() if v)
    total = len(state)
    percent = int(done / total * 100) if total else 0

    bar_width = 10
    filled = int(done / total * bar_width) if total else 0
    bar = "█" * filled + "░" * (bar_width - filled)

    items = [
        ("account", "📁 Подключить FunPay аккаунт"),
        ("always_online", "🟢 Включить вечный онлайн"),
        ("auto_response", "📨 Настроить автоответчик"),
        ("auto_delivery", "🤖 Настроить автовыдачу"),
        ("auto_raise", "🚀 Включить автоподнятие"),
    ]

    lines = [
        "🧭 <b>Быстрая настройка бота</b>",
        "",
        f"Прогресс: <b>{bar}</b> {percent}% ({done}/{total})",
        "",
    ]
    for key, label in items:
        mark = "✅" if state[key] else "⬜"
        lines.append(f"{mark} {label}")

    if done == total:
        lines.append("")
        lines.append("🎉 <b>Всё готово! Бот работает на полную.</b>")
        lines.append("")
        lines.append("Можешь закрыть этот экран и спокойно продавать.")
    else:
        lines.append("")
        lines.append("💡 <i>Жми кнопку незакрытой задачи — перейдёшь в раздел.</i>")

    return "\n".join(lines)


def _checklist_keyboard(state: dict[str, bool]) -> InlineKeyboardMarkup:
    rows: list[list[InlineKeyboardButton]] = []

    if not state["account"]:
        rows.append(
            [
                InlineKeyboardButton(
                    text="📁 Подключить аккаунт", callback_data="onb:goto:accounts"
                )
            ]
        )
    if not state["always_online"]:
        rows.append(
            [
                InlineKeyboardButton(
                    text="🟢 Включить онлайн", callback_data="onb:toggle:always_online"
                )
            ]
        )
    if not state["auto_response"]:
        rows.append(
            [
                InlineKeyboardButton(
                    text="📨 Настроить автоответы",
                    callback_data="onb:goto:auto_response",
                )
            ]
        )
    if not state["auto_delivery"]:
        rows.append(
            [
                InlineKeyboardButton(
                    text="🤖 Настроить автовыдачу",
                    callback_data="onb:goto:auto_delivery",
                )
            ]
        )
    if not state["auto_raise"]:
        rows.append(
            [
                InlineKeyboardButton(
                    text="🚀 Включить автоподнятие",
                    callback_data="onb:toggle:auto_raise",
                )
            ]
        )

    rows.append(
        [
            InlineKeyboardButton(text="🔄 Обновить", callback_data="onb:refresh"),
            InlineKeyboardButton(text="❌ Скрыть", callback_data="onb:close"),
        ]
    )
    return InlineKeyboardMarkup(inline_keyboard=rows)


async def show_onboarding(message: Message, user_id: int) -> None:
    state = await _compute_checklist(user_id)
    await message.answer(
        _format_checklist(state), reply_markup=_checklist_keyboard(state)
    )


@router.message(Command("onboarding"))
@router.message(Command("setup"))
async def cmd_onboarding(message: Message) -> None:
    if not message.from_user:
        return
    user = await get_or_create_user(message.from_user.id, message.from_user.username)
    await show_onboarding(message, user["id"])


@router.callback_query(F.data == "onb:refresh")
async def cb_refresh(call: CallbackQuery) -> None:
    if not call.from_user or not isinstance(call.message, Message):
        return
    user = await get_or_create_user(call.from_user.id, call.from_user.username)
    state = await _compute_checklist(user["id"])
    try:
        await call.message.edit_text(
            _format_checklist(state), reply_markup=_checklist_keyboard(state)
        )
    except Exception:  # noqa: BLE001
        pass
    await call.answer("Обновлено")


@router.callback_query(F.data == "onb:close")
async def cb_close(call: CallbackQuery) -> None:
    if isinstance(call.message, Message):
        try:
            await call.message.delete()
        except Exception:  # noqa: BLE001
            pass
    await call.answer()


@router.callback_query(F.data == "onb:goto:accounts")
async def cb_goto_accounts(call: CallbackQuery) -> None:
    if not isinstance(call.message, Message):
        return
    await call.message.answer(
        "👇 Жми <b>«📁 Аккаунты»</b> в нижней клавиатуре, "
        "потом <b>«➕ Добавить аккаунт»</b>."
    )
    await call.answer()


@router.callback_query(F.data == "onb:goto:auto_response")
async def cb_goto_ar(call: CallbackQuery) -> None:
    if not isinstance(call.message, Message):
        return
    await call.message.answer(
        "👇 Жми <b>«📨 Автоответы»</b> в клавиатуре, "
        "потом <b>«➕ Добавить триггер»</b>.\n\n"
        "💡 Начни с простого: триггер <code>привет, здравствуйте</code> → "
        "ответ <code>Здравствуйте! Что вас интересует?</code>"
    )
    await call.answer()


@router.callback_query(F.data == "onb:goto:auto_delivery")
async def cb_goto_ad(call: CallbackQuery) -> None:
    if not isinstance(call.message, Message):
        return
    await call.message.answer(
        "👇 Жми <b>«🤖 Автовыдача»</b> в клавиатуре, "
        "потом <b>«➕ Добавить лот»</b>.\n\n"
        "💡 Введи название лота (как в FunPay), загрузи товары "
        "построчно — бот будет выдавать их моментально при покупке."
    )
    await call.answer()


@router.callback_query(F.data.startswith("onb:toggle:"))
async def cb_toggle(call: CallbackQuery) -> None:
    if not call.from_user or not isinstance(call.message, Message):
        return
    key = (call.data or "").split(":")[2]
    if key not in {"always_online", "auto_raise", "auto_response", "auto_delivery"}:
        await call.answer()
        return
    user = await get_or_create_user(call.from_user.id, call.from_user.username)

    from database.models import update_setting

    await update_setting(user["id"], key, 1)
    await call.answer("✅ Включено")

    # Обновляем чек-лист
    state = await _compute_checklist(user["id"])
    try:
        await call.message.edit_text(
            _format_checklist(state), reply_markup=_checklist_keyboard(state)
        )
    except Exception:  # noqa: BLE001
        pass
