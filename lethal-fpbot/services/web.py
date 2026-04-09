"""Web сервис: aiohttp-сервер для Web API + healthcheck + Mini App.

Заменяет старый services/health.py: теперь это полноценный сервер,
который кроме /healthz и /metrics обслуживает все /api/* маршруты
для Mini App.
"""

from __future__ import annotations

import asyncio
import logging
import os

from aiogram import Bot
from aiohttp import web

from api.server import create_app

logger = logging.getLogger(__name__)


async def run(bot: Bot) -> None:
    host = os.getenv("HEALTH_HOST", "127.0.0.1")
    port = int(os.getenv("HEALTH_PORT", "8080"))

    app = create_app()
    # Кладём bot в app чтобы хендлеры могли при желании его дёргать
    app["bot"] = bot

    runner = web.AppRunner(app)
    await runner.setup()
    site = web.TCPSite(runner, host, port)
    try:
        await site.start()
        logger.info("Web сервер поднят на http://%s:%d", host, port)
    except OSError as exc:
        logger.warning("Не получилось поднять web: %s", exc)
        return

    while True:
        await asyncio.sleep(3600)
