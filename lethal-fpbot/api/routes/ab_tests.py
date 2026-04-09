"""CRUD A/B тестов."""

from __future__ import annotations

from aiohttp import web

from database.models import (
    create_ab_test,
    delete_ab_test,
    get_or_create_user,
    list_ab_tests,
)
from services.ab_testing import calc_winner

routes = web.RouteTableDef()


@routes.get("/api/ab")
async def list_(request: web.Request) -> web.Response:
    user = await get_or_create_user(request["tg_id"], None)
    tests = await list_ab_tests(user["id"])
    enriched = [{**t, **calc_winner(t)} for t in tests]
    return web.json_response({"tests": enriched})


@routes.post("/api/ab")
async def create(request: web.Request) -> web.Response:
    body = await request.json()
    name = (body.get("name") or "").strip()
    a = (body.get("variant_a") or "").strip()
    b = (body.get("variant_b") or "").strip()
    if not all([name, a, b]):
        return web.json_response(
            {"error": "name, variant_a, variant_b required"}, status=400
        )
    user = await get_or_create_user(request["tg_id"], None)
    tid = await create_ab_test(user["id"], name, a, b)
    return web.json_response({"id": tid})


@routes.delete("/api/ab/{tid}")
async def remove(request: web.Request) -> web.Response:
    try:
        tid = int(request.match_info["tid"])
    except ValueError:
        return web.json_response({"error": "invalid_id"}, status=400)
    user = await get_or_create_user(request["tg_id"], None)
    ok = await delete_ab_test(tid, user["id"])
    return web.json_response({"ok": ok})
