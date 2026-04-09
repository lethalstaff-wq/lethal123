"""aiohttp web сервер: /api/* + /healthz + /metrics + Mini App статика."""

from __future__ import annotations

import logging
import time

from aiohttp import web

from config import BASE_DIR
from database.db import connect

from .auth import auth_middleware
from .routes import (
    accounts_routes,
    ai_routes,
    auth_routes,
    auto_delivery_routes,
    auto_response_routes,
    billing_routes,
    bulk_routes,
    chats_routes,
    forecast_routes,
    games_routes,
    lots_routes,
    notifications_routes,
    payments_routes,
    profile_routes,
    settings_routes,
    stats_routes,
    texts_routes,
)

logger = logging.getLogger(__name__)
_started_at = time.time()


def create_app() -> web.Application:
    app = web.Application(middlewares=[auth_middleware])

    # API routes
    app.router.add_routes(auth_routes)
    app.router.add_routes(accounts_routes)
    app.router.add_routes(ai_routes)
    app.router.add_routes(auto_delivery_routes)
    app.router.add_routes(auto_response_routes)
    app.router.add_routes(billing_routes)
    app.router.add_routes(chats_routes)
    app.router.add_routes(games_routes)
    app.router.add_routes(lots_routes)
    app.router.add_routes(profile_routes)
    app.router.add_routes(settings_routes)
    app.router.add_routes(stats_routes)
    app.router.add_routes(texts_routes)
    app.router.add_routes(payments_routes)
    app.router.add_routes(bulk_routes)
    app.router.add_routes(forecast_routes)
    app.router.add_routes(notifications_routes)

    # Health & metrics
    app.router.add_get("/healthz", _healthz)
    app.router.add_get("/metrics", _metrics)
    app.router.add_get("/api/public/version", _version)

    # Static (Mini App build)
    miniapp_dist = BASE_DIR / "miniapp" / "dist"
    if miniapp_dist.exists():
        app.router.add_static("/app/", path=str(miniapp_dist), name="miniapp")
        app.router.add_get("/", _redirect_to_app)

    return app


async def run_server(host: str = "127.0.0.1", port: int = 8080) -> None:
    app = create_app()
    runner = web.AppRunner(app)
    await runner.setup()
    site = web.TCPSite(runner, host, port)
    try:
        await site.start()
    except OSError as exc:
        logger.warning("API server failed to bind %s:%d — %s", host, port, exc)
        return
    logger.info("API server up at http://%s:%d", host, port)
    # Сервис висит вечно, бэкграунд-таска
    import asyncio

    while True:
        await asyncio.sleep(3600)


# ----------------------------- helpers -------------------------------------


async def _healthz(request: web.Request) -> web.Response:
    try:
        async with connect() as db:
            cur = await db.execute("SELECT 1")
            await cur.fetchone()
    except Exception:  # noqa: BLE001
        return web.json_response({"status": "fail"}, status=503)
    return web.json_response(
        {"status": "ok", "uptime": int(time.time() - _started_at)}
    )


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


async def _version(request: web.Request) -> web.Response:
    return web.json_response(
        {
            "name": "lethal-fpbot",
            "version": "0.2.0",
            "uptime": int(time.time() - _started_at),
        }
    )


async def _redirect_to_app(request: web.Request) -> web.Response:
    raise web.HTTPFound("/app/")
