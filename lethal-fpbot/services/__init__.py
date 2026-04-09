"""Реестр фоновых сервисов.

Каждый сервис экспортирует async-функцию `run(bot)` либо `start(bot)`,
которая запускает свой polling-цикл. Здесь собираем их в одну точку,
чтобы main.py мог поднять всё одной строкой.
"""

from __future__ import annotations

import asyncio
import logging

from aiogram import Bot

logger = logging.getLogger(__name__)


async def start_all(bot: Bot) -> list[asyncio.Task]:
    """Запускает все фоновые задачи и возвращает их список."""
    from . import (
        always_online,
        auto_bichevka,
        auto_deliver,
        auto_raise,
        chat_watcher,
        competitor_watcher,
        funnel,
        order_watcher,
        review_watcher,
        session_restore,
        smart_pricing,
    )

    tasks: list[asyncio.Task] = []

    def _spawn(coro, name: str) -> None:
        task = asyncio.create_task(_safe_loop(coro, name), name=name)
        tasks.append(task)

    _spawn(session_restore.run(bot), "session_restore")
    _spawn(always_online.run(bot), "always_online")
    _spawn(auto_raise.run(bot), "auto_raise")
    _spawn(chat_watcher.run(bot), "chat_watcher")
    _spawn(order_watcher.run(bot), "order_watcher")
    _spawn(auto_deliver.run(bot), "auto_deliver")
    _spawn(review_watcher.run(bot), "review_watcher")
    _spawn(competitor_watcher.run(bot), "competitor_watcher")
    _spawn(funnel.run(bot), "funnel")
    _spawn(smart_pricing.run(bot), "smart_pricing")
    _spawn(auto_bichevka.run(bot), "auto_bichevka")

    logger.info("Запущено фоновых сервисов: %d", len(tasks))
    return tasks


async def _safe_loop(coro, name: str) -> None:
    """Оборачивает корутину так, чтобы исключение не убивало весь сервис."""
    try:
        await coro
    except asyncio.CancelledError:
        raise
    except Exception:  # noqa: BLE001
        logger.exception("Сервис %s упал", name)
