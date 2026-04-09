"""Профиль пользователя."""

from __future__ import annotations

from datetime import UTC, datetime

from aiogram import F, Router
from aiogram.types import Message

from bot.keyboards.kb import BTN_PROFILE, profile_menu
from config import TIER_NAMES
from database.models import count_fp_accounts, get_or_create_user, list_referrals
from utils.helpers import escape_html, now_ts

router = Router(name="profile")


@router.message(F.text == BTN_PROFILE)
async def open_(message: Message) -> None:
    if not message.from_user:
        return
    user = await get_or_create_user(message.from_user.id, message.from_user.username)
    fp_count = await count_fp_accounts(user["id"])
    tier = user.get("subscription_tier")
    expires_ts = user.get("subscription_expires") or 0
    if expires_ts and expires_ts < now_ts():
        tier = None

    if tier:
        expires_str = datetime.fromtimestamp(expires_ts, tz=UTC).strftime(
            "%Y-%m-%d"
        )
        sub_line = f"{TIER_NAMES.get(tier, tier)} · до {expires_str}"
    else:
        sub_line = "❌ нет активной подписки"

    referrals = await list_referrals(user["id"])

    text = (
        "👤 <b>Профиль</b>\n\n"
        f"🆔 ID: <code>{user['telegram_id']}</code>\n"
        f"👤 @{escape_html(user.get('username') or '—')}\n"
        f"💎 Подписка: {sub_line}\n"
        f"📁 ФП-аккаунтов: {fp_count}\n"
        f"💰 Баланс: {user.get('balance', 0)}₽\n"
        f"🔗 Реф-код: <code>{escape_html(user.get('referral_code') or '')}</code>\n"
        f"👥 Приглашено: {len(referrals)}"
    )
    await message.answer(
        text,
        reply_markup=profile_menu(user.get("referral_code") or ""),
    )
