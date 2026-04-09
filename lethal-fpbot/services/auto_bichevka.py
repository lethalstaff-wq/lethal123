"""Авто-бичевка (Standard+).

Цикл «дешёвый лот → автовыдача → просьба отзыва → заново».
Скелет: раз в N минут проверяет, что у пользователя есть «бичевка-лот»
(помеченный template содержит слово BICHEVKA), и пополняет список
items если они закончились — а заодно дёргает auto_raise по этому лоту
чтобы он маячил на верху.
"""

from __future__ import annotations

import asyncio
import logging

from aiogram import Bot

from database.db import connect
from database.models import get_settings

logger = logging.getLogger(__name__)
INTERVAL = 600


async def run(bot: Bot) -> None:
    while True:
        try:
            await _tick()
        except Exception:  # noqa: BLE001
            logger.exception("auto_bichevka tick failed")
        await asyncio.sleep(INTERVAL)


async def _tick() -> None:
    async with connect() as db:
        cur = await db.execute(
            """
            SELECT ad.*, fa.user_id
              FROM auto_delivery ad
              JOIN fp_accounts fa ON fa.id = ad.fp_account_id
             WHERE ad.template LIKE '%BICHEVKA%' AND ad.is_active = 1
            """
        )
        rows = [dict(r) for r in await cur.fetchall()]

    for row in rows:
        settings = await get_settings(row["user_id"])
        # сюда можно прицепить логику пополнения items, повышения цены и т.д.
        # пока — просто логируем что нашли активную бичевку
        logger.debug("auto_bichevka active: %s", row.get("lot_name"))
