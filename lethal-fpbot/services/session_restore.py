"""Периодически проверяет, что все ФП-сессии живы.

Если verify_session возвращает None — пытается перелогиниться через
session_pool.reload, который сам сходит за паролем в БД.
"""

from __future__ import annotations

import asyncio
import logging

from aiogram import Bot

from database.db import connect
from database.models import list_active_fp_accounts
from funpay.api import verify_session
from utils.encryption import decrypt

from . import session_pool

logger = logging.getLogger(__name__)
INTERVAL = 600  # 10 минут


async def run(bot: Bot) -> None:
    while True:
        try:
            await _tick()
        except Exception:  # noqa: BLE001
            logger.exception("session_restore tick failed")
        await asyncio.sleep(INTERVAL)


async def _tick() -> None:
    accounts = await list_active_fp_accounts()
    for acc in accounts:
        gk = decrypt(acc.get("golden_key") or "")
        info = await verify_session(gk, proxy=acc.get("proxy")) if gk else None
        is_online = info is not None
        async with connect() as db:
            await db.execute(
                "UPDATE fp_accounts SET is_online = ? WHERE id = ?",
                (1 if is_online else 0, acc["id"]),
            )
            await db.commit()
        if not is_online:
            logger.info("Сессия %s протухла, пересоздаю", acc["login"])
            await session_pool.reload(acc["id"])
