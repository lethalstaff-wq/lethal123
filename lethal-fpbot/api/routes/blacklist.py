"""CRUD чёрного списка покупателей."""

from __future__ import annotations

from aiohttp import web

from database.models import (
    add_to_blacklist,
    get_or_create_user,
    list_blacklist,
    remove_from_blacklist,
)

routes = web.RouteTableDef()


@routes.get("/api/blacklist")
async def list_(request: web.Request) -> web.Response:
    user = await get_or_create_user(request["tg_id"], None)
    items = await list_blacklist(user["id"])
    return web.json_response({"blacklist": items})


@routes.post("/api/blacklist")
async def add(request: web.Request) -> web.Response:
    body = await request.json()
    name = (body.get("buyer_name") or "").strip()
    reason = body.get("reason")
    if not name:
        return web.json_response({"error": "buyer_name required"}, status=400)
    user = await get_or_create_user(request["tg_id"], None)
    bid = await add_to_blacklist(user["id"], name, reason)
    return web.json_response({"id": bid})


@routes.delete("/api/blacklist/{bid}")
async def remove(request: web.Request) -> web.Response:
    try:
        bid = int(request.match_info["bid"])
    except ValueError:
        return web.json_response({"error": "invalid_id"}, status=400)
    user = await get_or_create_user(request["tg_id"], None)
    ok = await remove_from_blacklist(bid, user["id"])
    return web.json_response({"ok": ok})
