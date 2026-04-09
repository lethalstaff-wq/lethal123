"""GET/POST/DELETE /api/accounts/* — управление ФП-аккаунтами."""

from __future__ import annotations

import logging

from aiohttp import web

from config import TIER_FP_ACCOUNTS_LIMIT, TIER_STARTER
from database.models import (
    add_fp_account,
    count_fp_accounts,
    delete_fp_account,
    get_fp_account,
    get_or_create_user,
    list_fp_accounts,
    update_fp_proxy,
)
from funpay.api import login as fp_login
from utils.encryption import encrypt

from ..schemas import validate_add_account, validate_set_proxy

routes = web.RouteTableDef()
logger = logging.getLogger(__name__)


def _serialize_account(acc: dict) -> dict:
    return {
        "id": acc["id"],
        "login": acc["login"],
        "proxy": acc.get("proxy"),
        "is_online": bool(acc.get("is_online")),
        "is_active": bool(acc.get("is_active")),
        "last_session_update": acc.get("last_session_update"),
        "created_at": acc.get("created_at"),
    }


async def _get_user(request: web.Request) -> dict:
    tg_id = request["tg_id"]
    return await get_or_create_user(tg_id, None)


@routes.get("/api/accounts")
async def list_accounts(request: web.Request) -> web.Response:
    user = await _get_user(request)
    accs = await list_fp_accounts(user["id"])
    return web.json_response({"accounts": [_serialize_account(a) for a in accs]})


@routes.get("/api/accounts/{account_id}")
async def get_account(request: web.Request) -> web.Response:
    try:
        account_id = int(request.match_info["account_id"])
    except ValueError:
        return web.json_response({"error": "invalid_id"}, status=400)
    user = await _get_user(request)
    acc = await get_fp_account(account_id, user["id"])
    if not acc:
        return web.json_response({"error": "not_found"}, status=404)
    return web.json_response({"account": _serialize_account(acc)})


@routes.post("/api/accounts")
async def create_account(request: web.Request) -> web.Response:
    try:
        body = await request.json()
    except Exception:  # noqa: BLE001
        return web.json_response({"error": "invalid_json"}, status=400)

    data, err = validate_add_account(body)
    if err:
        return web.json_response({"error": err}, status=400)

    user = await _get_user(request)
    tier = user.get("subscription_tier") or TIER_STARTER
    limit = TIER_FP_ACCOUNTS_LIMIT.get(tier, 1)
    used = await count_fp_accounts(user["id"])
    if used >= limit:
        return web.json_response(
            {"error": "tier_limit", "limit": limit, "tier": tier}, status=403
        )

    result = await fp_login(data["login"], data["password"], proxy=data.get("proxy"))
    if not result.ok or not result.info:
        return web.json_response(
            {"error": "fp_login_failed", "details": result.error}, status=400
        )

    acc_id = await add_fp_account(
        user_id=user["id"],
        login=data["login"],
        password_enc=encrypt(data["password"]),
        proxy=data.get("proxy"),
        golden_key_enc=encrypt(result.info.golden_key),
        user_agent=None,
    )

    from database.db import connect

    async with connect() as db:
        await db.execute(
            "UPDATE fp_accounts SET is_online = 1 WHERE id = ?", (acc_id,)
        )
        await db.commit()

    return web.json_response(
        {"id": acc_id, "fp_user_id": result.info.user_id, "fp_username": result.info.username}
    )


@routes.delete("/api/accounts/{account_id}")
async def remove_account(request: web.Request) -> web.Response:
    try:
        account_id = int(request.match_info["account_id"])
    except ValueError:
        return web.json_response({"error": "invalid_id"}, status=400)
    user = await _get_user(request)
    ok = await delete_fp_account(account_id, user["id"])
    if not ok:
        return web.json_response({"error": "not_found"}, status=404)
    return web.json_response({"ok": True})


@routes.patch("/api/accounts/{account_id}/proxy")
async def patch_proxy(request: web.Request) -> web.Response:
    try:
        account_id = int(request.match_info["account_id"])
    except ValueError:
        return web.json_response({"error": "invalid_id"}, status=400)
    try:
        body = await request.json()
    except Exception:  # noqa: BLE001
        return web.json_response({"error": "invalid_json"}, status=400)
    data, err = validate_set_proxy(body)
    if err:
        return web.json_response({"error": err}, status=400)
    user = await _get_user(request)
    ok = await update_fp_proxy(account_id, user["id"], data["proxy"])
    if not ok:
        return web.json_response({"error": "not_found"}, status=404)
    return web.json_response({"ok": True})


@routes.post("/api/accounts/{account_id}/reconnect")
async def reconnect(request: web.Request) -> web.Response:
    try:
        account_id = int(request.match_info["account_id"])
    except ValueError:
        return web.json_response({"error": "invalid_id"}, status=400)
    from services import session_pool

    sess = await session_pool.reload(account_id)
    if not sess:
        return web.json_response({"error": "reconnect_failed"}, status=400)
    return web.json_response({"ok": True, "online": True})
