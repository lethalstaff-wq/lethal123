"""Воронка продаж: догрев покупателей, которые писали но не купили.

Раз в минуту перебирает chat_state, ищет диалоги где покупатель писал
N минут назад и мы не отвечали — отправляет настраиваемый текст.
Помечает chat_state.funnel_sent чтобы не спамить повторно.
"""

from __future__ import annotations

import asyncio
import logging

from aiogram import Bot

from database.db import connect
from database.models import (
    get_settings,
    list_funnel_candidates,
    mark_funnel_sent,
)
from funpay.api import send_chat_message

from . import session_pool

logger = logging.getLogger(__name__)
INTERVAL = 60


async def run(bot: Bot) -> None:
    while True:
        try:
            await _tick()
        except Exception:  # noqa: BLE001
            logger.exception("funnel tick failed")
        await asyncio.sleep(INTERVAL)


async def _tick() -> None:
    # Берём всех с включённой воронкой → разные delay → батчим минимальный
    candidates = await list_funnel_candidates(min_age_sec=60)
    for cs in candidates:
        # Достаём аккаунт и его настройки
        async with connect() as db:
            cur = await db.execute(
                "SELECT * FROM fp_accounts WHERE id = ?", (cs["account_id"],)
            )
            acc_row = await cur.fetchone()
        if not acc_row:
            continue
        acc = dict(acc_row)
        settings = await get_settings(acc["user_id"])
        if not settings.get("funnel_enabled"):
            continue

        delay = (settings.get("funnel_delay_minutes") or 60) * 60
        from utils.helpers import now_ts

        if now_ts() - (cs["last_buyer_msg_ts"] or 0) < delay:
            continue

        text = settings.get("funnel_text") or (
            "👋 Ещё актуально? Готов сделать вам скидку 5% — берите!"
        )
        sess = await session_pool.get(acc["id"])
        if not sess:
            continue
        try:
            await send_chat_message(sess, cs["fp_chat_id"], text)
            await mark_funnel_sent(cs["id"])
        except Exception:  # noqa: BLE001
            logger.exception("funnel send failed")
