"""GET /api/forecast — прогноз выручки и LTV."""

from __future__ import annotations

from aiohttp import web

from database.models import get_or_create_user
from services.forecast import calc_lifetime_value, forecast_next_days

routes = web.RouteTableDef()


@routes.get("/api/forecast")
async def forecast(request: web.Request) -> web.Response:
    user = await get_or_create_user(request["tg_id"], None)
    days = int(request.query.get("days", "7"))
    days = max(1, min(30, days))
    data = await forecast_next_days(user["id"], days=days)
    return web.json_response(data)


@routes.get("/api/forecast/ltv")
async def ltv(request: web.Request) -> web.Response:
    user = await get_or_create_user(request["tg_id"], None)
    data = await calc_lifetime_value(user["id"])
    return web.json_response(data)
