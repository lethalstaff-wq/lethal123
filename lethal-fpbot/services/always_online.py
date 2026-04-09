"""«Вечный онлайн»: периодически дёргает / у каждого активного аккаунта,
у которого включён always_online в настройках.

FunPay помечает продавца оффлайн через ~10 минут неактивности, поэтому
2-3 минут хватает с запасом.
"""

from __future__ import annotations

import asyncio
import logging

from aiogram import Bot

from database.models import get_settings

from . import session_pool

logger = logging.getLogger(__name__)
INTERVAL = 120  # 2 минуты


async def run(bot: Bot) -> None:
    while True:
        try:
            await _tick()
        except Exception:  # noqa: BLE001
            logger.exception("always_online tick failed")
        await asyncio.sleep(INTERVAL)


async def _tick() -> None:
    for _account_id, sess, acc in await session_pool.iter_active():
        settings = await get_settings(acc["user_id"])
        if not settings.get("always_online"):
            continue
        try:
            await sess.get("/")
        except Exception as exc:  # noqa: BLE001
            logger.warning("always_online ping failed for %s: %s", acc["login"], exc)
