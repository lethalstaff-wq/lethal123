"""CRUD автоответчика."""

from __future__ import annotations

from aiohttp import web

from database.models import (
    add_auto_response,
    delete_auto_response,
    get_or_create_user,
    list_auto_responses,
)

from ..schemas import validate_add_auto_response

routes = web.RouteTableDef()


@routes.get("/api/auto_response")
async def list_(request: web.Request) -> web.Response:
    user = await get_or_create_user(request["tg_id"], None)
    rules = await list_auto_responses(user["id"])
    return web.json_response({"rules": rules})


@routes.post("/api/auto_response")
async def create(request: web.Request) -> web.Response:
    try:
        body = await request.json()
    except Exception:  # noqa: BLE001
        return web.json_response({"error": "invalid_json"}, status=400)
    data, err = validate_add_auto_response(body)
    if err:
        return web.json_response({"error": err}, status=400)
    user = await get_or_create_user(request["tg_id"], None)
    rid = await add_auto_response(user["id"], data["triggers"], data["response"])
    return web.json_response({"id": rid})


@routes.delete("/api/auto_response/{rid}")
async def remove(request: web.Request) -> web.Response:
    try:
        rid = int(request.match_info["rid"])
    except ValueError:
        return web.json_response({"error": "invalid_id"}, status=400)
    user = await get_or_create_user(request["tg_id"], None)
    ok = await delete_auto_response(rid, user["id"])
    return web.json_response({"ok": ok})
