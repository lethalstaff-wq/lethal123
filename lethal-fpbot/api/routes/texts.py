"""CRUD заготовленных текстов."""

from __future__ import annotations

from aiohttp import web

from database.models import (
    add_text,
    delete_text,
    get_or_create_user,
    get_text,
    list_texts,
)

from ..schemas import validate_add_text

routes = web.RouteTableDef()


@routes.get("/api/texts")
async def list_(request: web.Request) -> web.Response:
    user = await get_or_create_user(request["tg_id"], None)
    items = await list_texts(user["id"])
    return web.json_response({"texts": items})


@routes.post("/api/texts")
async def create(request: web.Request) -> web.Response:
    try:
        body = await request.json()
    except Exception:  # noqa: BLE001
        return web.json_response({"error": "invalid_json"}, status=400)
    data, err = validate_add_text(body)
    if err:
        return web.json_response({"error": err}, status=400)
    user = await get_or_create_user(request["tg_id"], None)
    tid = await add_text(user["id"], data["name"], data["text"])
    return web.json_response({"id": tid})


@routes.get("/api/texts/{tid}")
async def get_one(request: web.Request) -> web.Response:
    try:
        tid = int(request.match_info["tid"])
    except ValueError:
        return web.json_response({"error": "invalid_id"}, status=400)
    user = await get_or_create_user(request["tg_id"], None)
    t = await get_text(tid, user["id"])
    if not t:
        return web.json_response({"error": "not_found"}, status=404)
    return web.json_response({"text": t})


@routes.delete("/api/texts/{tid}")
async def remove(request: web.Request) -> web.Response:
    try:
        tid = int(request.match_info["tid"])
    except ValueError:
        return web.json_response({"error": "invalid_id"}, status=400)
    user = await get_or_create_user(request["tg_id"], None)
    ok = await delete_text(tid, user["id"])
    return web.json_response({"ok": ok})
