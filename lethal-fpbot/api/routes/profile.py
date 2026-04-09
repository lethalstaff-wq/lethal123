"""Профиль пользователя через Web API."""

from __future__ import annotations

from aiohttp import web

from database.models import (
    count_fp_accounts,
    get_or_create_user,
    list_referrals,
)
from utils.helpers import now_ts

routes = web.RouteTableDef()


@routes.get("/api/profile")
async def me(request: web.Request) -> web.Response:
    user = await get_or_create_user(request["tg_id"], None)
    fp_count = await count_fp_accounts(user["id"])
    refs = await list_referrals(user["id"])

    expires = user.get("subscription_expires") or 0
    tier = user.get("subscription_tier")
    if expires < now_ts():
        tier = None

    return web.json_response(
        {
            "id": user["id"],
            "telegram_id": user["telegram_id"],
            "username": user.get("username"),
            "tier": tier,
            "expires": expires,
            "balance": user.get("balance", 0),
            "referral_code": user.get("referral_code"),
            "referrals_count": len(refs),
            "fp_accounts_count": fp_count,
            "created_at": user.get("created_at"),
        }
    )
