"""Автоматическое поднятие предложений.

Каждые `raise_interval` минут (из настроек пользователя) дёргает
funpay.api.raise_lots для каждой категории, в которой у пользователя
есть лоты. Категории определяем из списка лотов профиля.
"""

from __future__ import annotations

import asyncio
import logging

from aiogram import Bot

from database.models import get_settings
from funpay.api import get_lots, raise_lots

from . import session_pool

logger = logging.getLogger(__name__)
INTERVAL = 60  # каждую минуту проверяем «пора ли поднимать»

# Для каждого аккаунта запоминаем когда последний раз поднимали
_last_raise: dict[int, float] = {}


async def run(bot: Bot) -> None:
    while True:
        try:
            await _tick()
        except Exception:  # noqa: BLE001
            logger.exception("auto_raise tick failed")
        await asyncio.sleep(INTERVAL)


async def _tick() -> None:
    import time

    now = time.time()
    for account_id, sess, acc in await session_pool.iter_active():
        settings = await get_settings(acc["user_id"])
        if not settings.get("auto_raise"):
            continue
        interval_min = int(settings.get("raise_interval") or 240)
        last = _last_raise.get(account_id, 0)
        if now - last < interval_min * 60:
            continue
        _last_raise[account_id] = now

        if not sess.user_id:
            await sess.restore()
        if not sess.user_id:
            continue

        lots = await get_lots(sess, sess.user_id)
        # FunPay: чтобы поднять, нужны game_id и node_id. Пока берём
        # из URL лотов / data-атрибутов. В первом приближении попробуем
        # дёрнуть raise_lots с node=сам лот, а game_id — заглушка 1.
        # Реальная привязка — в карточке лота, дотюним под конкретные категории.
        nodes_done: set[str] = set()
        for lot in lots:
            if not lot.id or lot.id in nodes_done:
                continue
            nodes_done.add(lot.id)
            try:
                ok = await raise_lots(sess, game_id=1, node_id=int(lot.id))
                if ok:
                    logger.info("Поднят лот %s у %s", lot.id, acc["login"])
            except (ValueError, Exception) as exc:  # noqa: BLE001
                logger.debug("raise failed: %s", exc)
