"""GET/PATCH /api/settings — настройки автоматизаций."""

from __future__ import annotations

from aiohttp import web

from database.models import get_or_create_user, get_settings, update_setting

from ..schemas import validate_settings_patch

routes = web.RouteTableDef()


@routes.get("/api/settings")
async def get(request: web.Request) -> web.Response:
    user = await get_or_create_user(request["tg_id"], None)
    settings = await get_settings(user["id"])
    return web.json_response({"settings": dict(settings)})


@routes.patch("/api/settings")
async def patch(request: web.Request) -> web.Response:
    try:
        body = await request.json()
    except Exception:  # noqa: BLE001
        return web.json_response({"error": "invalid_json"}, status=400)
    data, err = validate_settings_patch(body)
    if err:
        return web.json_response({"error": err}, status=400)
    user = await get_or_create_user(request["tg_id"], None)
    for key, value in data.items():
        await update_setting(user["id"], key, value)
    settings = await get_settings(user["id"])
    return web.json_response({"settings": dict(settings)})
