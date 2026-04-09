"""POST /api/auth/login — обмен Telegram initData на JWT."""

from __future__ import annotations

import logging

from aiohttp import web

from database.models import get_or_create_user

from ..auth import issue_token_for_user, verify_telegram_init_data
from ..schemas import validate_login_init_data

routes = web.RouteTableDef()
logger = logging.getLogger(__name__)


@routes.post("/api/auth/login")
async def login(request: web.Request) -> web.Response:
    try:
        body = await request.json()
    except Exception:  # noqa: BLE001
        return web.json_response({"error": "invalid_json"}, status=400)

    data, err = validate_login_init_data(body)
    if err:
        return web.json_response({"error": err}, status=400)

    user = verify_telegram_init_data(data["init_data"])
    if not user:
        return web.json_response({"error": "invalid_signature"}, status=401)

    db_user = await get_or_create_user(
        telegram_id=user["id"],
        username=user.get("username"),
    )
    token = issue_token_for_user(user["id"])
    return web.json_response(
        {
            "token": token,
            "user": {
                "id": db_user["id"],
                "telegram_id": db_user["telegram_id"],
                "username": db_user["username"],
                "tier": db_user.get("subscription_tier"),
                "expires": db_user.get("subscription_expires"),
                "balance": db_user.get("balance", 0),
            },
        }
    )


@routes.post("/api/auth/logout")
async def logout(request: web.Request) -> web.Response:
    # JWT stateless — клиент просто выкидывает токен
    return web.json_response({"ok": True})
