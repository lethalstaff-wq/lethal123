"""Мониторинг цен конкурентов (Standard+).

Каждый час пробегается по списку competitors и парсит min цену
с указанной страницы FunPay (категория или конкретный лот). Если
цена изменилась — пишем пользователю.
"""

from __future__ import annotations

import asyncio
import logging
import re

from aiogram import Bot

from database.db import connect
from database.models import (
    get_user_by_id,
    list_competitors,
    update_competitor_price,
)
from utils.helpers import escape_html

from . import session_pool

logger = logging.getLogger(__name__)
INTERVAL = 3600


async def run(bot: Bot) -> None:
    while True:
        try:
            await _tick(bot)
        except Exception:  # noqa: BLE001
            logger.exception("competitor_watcher tick failed")
        await asyncio.sleep(INTERVAL)


async def _tick(bot: Bot) -> None:
    # competitors привязаны к user_id, а сессии — к fp_account_id.
    # Берём первую активную сессию пользователя.
    async with connect() as db:
        cur = await db.execute("SELECT DISTINCT user_id FROM competitors")
        user_ids = [r[0] for r in await cur.fetchall()]

    for uid in user_ids:
        rows = await list_competitors(uid)
        if not rows:
            continue
        # Возьмём любого активного аккаунта этого юзера для прокси/UA
        async with connect() as db:
            cur = await db.execute(
                "SELECT id FROM fp_accounts WHERE user_id = ? AND is_active = 1 LIMIT 1",
                (uid,),
            )
            acc_row = await cur.fetchone()
        if not acc_row:
            continue
        sess = await session_pool.get(acc_row[0])
        if not sess:
            continue

        user = await get_user_by_id(uid)
        for c in rows:
            try:
                status, html = await sess.get(c["competitor_url"])
                if status != 200:
                    continue
                # очень простой парсер: ищем минимальную цену в data-s
                prices = [float(x) for x in re.findall(r'data-s="([\d\.]+)"', html)]
                if not prices:
                    continue
                min_price = min(prices)
                old = c.get("last_price")
                if old and abs(min_price - old) > 0.01:
                    diff = min_price - old
                    arrow = "📉" if diff < 0 else "📈"
                    if user:
                        await bot.send_message(
                            user["telegram_id"],
                            f"{arrow} Конкурент изменил цену\n"
                            f"<code>{escape_html(c['competitor_url'])}</code>\n"
                            f"{old} → <b>{min_price}</b>",
                        )
                await update_competitor_price(c["id"], min_price)
            except Exception:  # noqa: BLE001
                logger.exception("competitor scan failed")
