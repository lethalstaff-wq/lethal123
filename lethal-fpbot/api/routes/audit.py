"""GET /api/audit — журнал действий пользователя (для self-view)."""

from __future__ import annotations

from aiohttp import web

from database.models import get_or_create_user, list_audit_log

routes = web.RouteTableDef()


@routes.get("/api/audit")
async def list_(request: web.Request) -> web.Response:
    user = await get_or_create_user(request["tg_id"], None)
    limit = int(request.query.get("limit", "50"))
    rows = await list_audit_log(user["id"], limit=limit)
    return web.json_response({"entries": rows})
