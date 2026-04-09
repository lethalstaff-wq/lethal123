"""HTTP /healthz и /metrics для мониторинга.

Минимальный aiohttp-сервер сбоку от бота. Открывает 0.0.0.0:8080
(переопределяется через HEALTH_HOST/HEALTH_PORT в окружении).

  GET /healthz   -> {"status":"ok"} либо 503
  GET /metrics   -> Prometheus-совместимый текст с базовыми счётчиками
"""

from __future__ import annotations

import logging
import os
import time

from aiogram import Bot
from aiohttp import web

from database.db import connect

logger = logging.getLogger(__name__)

_started_at = time.time()


async def run(bot: Bot) -> None:
    host = os.getenv("HEALTH_HOST", "127.0.0.1")
    port = int(os.getenv("HEALTH_PORT", "8080"))

    app = web.Application()
    app["bot"] = bot
    app.router.add_get("/healthz", _healthz)
    app.router.add_get("/metrics", _metrics)

    runner = web.AppRunner(app)
    await runner.setup()
    site = web.TCPSite(runner, host, port)
    try:
        await site.start()
        logger.info("Health endpoint поднят на http://%s:%d", host, port)
    except OSError as exc:
        # порт занят / нет прав — не валим бот
        logger.warning("Не получилось поднять health endpoint: %s", exc)
        return

    # Сервис висит «вечно», пока его не отменят
    import asyncio

    while True:
        await asyncio.sleep(3600)


async def _healthz(request: web.Request) -> web.Response:
    try:
        async with connect() as db:
            cur = await db.execute("SELECT 1")
            await cur.fetchone()
    except Exception:  # noqa: BLE001
        return web.json_response({"status": "fail"}, status=503)
    return web.json_response({"status": "ok", "uptime": int(time.time() - _started_at)})


async def _metrics(request: web.Request) -> web.Response:
    counts = {}
    try:
        async with connect() as db:
            for tbl in ("users", "fp_accounts", "stats", "orders_seen"):
                cur = await db.execute(f"SELECT COUNT(*) AS c FROM {tbl}")
                row = await cur.fetchone()
                counts[tbl] = int(row["c"]) if row else 0
    except Exception:  # noqa: BLE001
        return web.Response(text="# error\n", status=500)

    lines = [
        "# HELP lethal_uptime_seconds Service uptime in seconds",
        "# TYPE lethal_uptime_seconds gauge",
        f"lethal_uptime_seconds {int(time.time() - _started_at)}",
    ]
    for tbl, c in counts.items():
        lines.append(f"# HELP lethal_{tbl}_total Rows in {tbl}")
        lines.append(f"# TYPE lethal_{tbl}_total gauge")
        lines.append(f"lethal_{tbl}_total {c}")
    return web.Response(text="\n".join(lines) + "\n")
