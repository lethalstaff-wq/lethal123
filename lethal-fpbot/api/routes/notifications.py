"""GET/PATCH /api/notifications — настройки уведомлений."""

from __future__ import annotations

from aiohttp import web

from database.models import (
    get_notification_prefs,
    get_or_create_user,
    update_notification_pref,
)

routes = web.RouteTableDef()


_BOOL_FIELDS = {
    "notify_new_order",
    "notify_new_message",
    "notify_new_review",
    "notify_session_lost",
    "notify_payment",
}
_HOUR_FIELDS = {"quiet_hours_start", "quiet_hours_end"}


@routes.get("/api/notifications")
async def get(request: web.Request) -> web.Response:
    user = await get_or_create_user(request["tg_id"], None)
    prefs = await get_notification_prefs(user["id"])
    return web.json_response({"prefs": dict(prefs)})


@routes.patch("/api/notifications")
async def patch(request: web.Request) -> web.Response:
    try:
        body = await request.json()
    except Exception:  # noqa: BLE001
        return web.json_response({"error": "invalid_json"}, status=400)
    user = await get_or_create_user(request["tg_id"], None)
    updated: list[str] = []
    for key, value in body.items():
        if key in _BOOL_FIELDS:
            await update_notification_pref(user["id"], key, 1 if value else 0)
            updated.append(key)
        elif key in _HOUR_FIELDS:
            try:
                v = int(value)
            except (TypeError, ValueError):
                continue
            if 0 <= v <= 23:
                await update_notification_pref(user["id"], key, v)
                updated.append(key)
    prefs = await get_notification_prefs(user["id"])
    return web.json_response({"prefs": dict(prefs), "updated": updated})
