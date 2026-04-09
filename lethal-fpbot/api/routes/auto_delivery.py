"""CRUD автовыдачи."""

from __future__ import annotations

from aiohttp import web

from database.models import (
    add_auto_delivery,
    delete_auto_delivery,
    get_or_create_user,
    list_auto_delivery,
)

from ..schemas import validate_add_auto_delivery

routes = web.RouteTableDef()


@routes.get("/api/auto_delivery")
async def list_(request: web.Request) -> web.Response:
    user = await get_or_create_user(request["tg_id"], None)
    rules = await list_auto_delivery(user["id"])
    return web.json_response({"rules": rules})


@routes.post("/api/auto_delivery")
async def create(request: web.Request) -> web.Response:
    try:
        body = await request.json()
    except Exception:  # noqa: BLE001
        return web.json_response({"error": "invalid_json"}, status=400)
    data, err = validate_add_auto_delivery(body)
    if err:
        return web.json_response({"error": err}, status=400)
    user = await get_or_create_user(request["tg_id"], None)
    rid = await add_auto_delivery(
        user_id=user["id"],
        fp_account_id=None,
        lot_name=data["lot_name"],
        items=data["items"],
        template=data.get("template"),
    )
    return web.json_response({"id": rid})


@routes.delete("/api/auto_delivery/{rid}")
async def remove(request: web.Request) -> web.Response:
    try:
        rid = int(request.match_info["rid"])
    except ValueError:
        return web.json_response({"error": "invalid_id"}, status=400)
    user = await get_or_create_user(request["tg_id"], None)
    ok = await delete_auto_delivery(rid, user["id"])
    return web.json_response({"ok": ok})
