"""Outgoing webhooks — пользователь может подписаться на свои события.

Например, корпоративный покупатель хочет получать уведомление о
каждой продаже на свой Slack/Discord/CRM endpoint. Сохраняем URL,
при event'е POST'им JSON.

Регистрация:
  POST /api/webhooks { url, events: ["new_order","new_message"] }
  GET  /api/webhooks
  DELETE /api/webhooks/{id}
"""

from __future__ import annotations

import json
import logging

from aiohttp import web

from database.db import connect
from database.models import get_or_create_user
from utils.helpers import now_ts

routes = web.RouteTableDef()
logger = logging.getLogger(__name__)


async def _ensure_table() -> None:
    async with connect() as db:
        await db.execute(
            """
            CREATE TABLE IF NOT EXISTS webhooks (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL,
                url TEXT NOT NULL,
                events TEXT NOT NULL,
                secret TEXT,
                is_active INTEGER NOT NULL DEFAULT 1,
                created_at INTEGER NOT NULL
            )
            """
        )
        await db.commit()


@routes.get("/api/webhooks")
async def list_hooks(request: web.Request) -> web.Response:
    await _ensure_table()
    user = await get_or_create_user(request["tg_id"], None)
    async with connect() as db:
        cur = await db.execute(
            "SELECT * FROM webhooks WHERE user_id = ? ORDER BY id DESC",
            (user["id"],),
        )
        rows = []
        for r in await cur.fetchall():
            d = dict(r)
            try:
                d["events"] = json.loads(d["events"])
            except (ValueError, TypeError):
                d["events"] = []
            rows.append(d)
    return web.json_response({"webhooks": rows})


@routes.post("/api/webhooks")
async def create_hook(request: web.Request) -> web.Response:
    await _ensure_table()
    body = await request.json()
    url = (body.get("url") or "").strip()
    events = body.get("events") or []
    secret = body.get("secret")
    if not url.startswith(("http://", "https://")):
        return web.json_response({"error": "invalid_url"}, status=400)
    if not isinstance(events, list) or not events:
        return web.json_response({"error": "events_required"}, status=400)
    user = await get_or_create_user(request["tg_id"], None)
    async with connect() as db:
        cur = await db.execute(
            """
            INSERT INTO webhooks (user_id, url, events, secret, created_at)
            VALUES (?, ?, ?, ?, ?)
            """,
            (
                user["id"],
                url,
                json.dumps(events),
                secret,
                now_ts(),
            ),
        )
        await db.commit()
        return web.json_response({"id": cur.lastrowid})


@routes.delete("/api/webhooks/{wid}")
async def delete_hook(request: web.Request) -> web.Response:
    await _ensure_table()
    try:
        wid = int(request.match_info["wid"])
    except ValueError:
        return web.json_response({"error": "invalid_id"}, status=400)
    user = await get_or_create_user(request["tg_id"], None)
    async with connect() as db:
        cur = await db.execute(
            "DELETE FROM webhooks WHERE id = ? AND user_id = ?",
            (wid, user["id"]),
        )
        await db.commit()
    return web.json_response({"ok": (cur.rowcount or 0) > 0})
