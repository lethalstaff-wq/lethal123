"""Admin routes — только для пользователей в config.ADMIN_IDS.

Доступны только из админ-аккаунтов. Защита — через проверку tg_id
в каждом хендлере (middleware ничего об этом не знает).
"""

from __future__ import annotations

import logging

from aiohttp import web

from config import ADMIN_IDS
from database.db import connect
from database.models import (
    create_promo_code,
    delete_promo,
    get_user_by_id,
    list_audit_log,
    list_pending_payments,
    list_promos,
    set_payment_status,
    update_user_subscription,
)
from utils.helpers import now_ts

routes = web.RouteTableDef()
logger = logging.getLogger(__name__)


def _is_admin(request: web.Request) -> bool:
    return request.get("tg_id") in ADMIN_IDS


def _admin_only(handler):
    async def wrapped(request: web.Request) -> web.StreamResponse:
        if not _is_admin(request):
            return web.json_response({"error": "forbidden"}, status=403)
        return await handler(request)

    return wrapped


# ----------------------------- USERS --------------------------------------


@routes.get("/api/admin/users")
@_admin_only
async def list_users(request: web.Request) -> web.Response:
    limit = int(request.query.get("limit", "100"))
    offset = int(request.query.get("offset", "0"))
    async with connect() as db:
        cur = await db.execute(
            """
            SELECT id, telegram_id, username, subscription_tier,
                   subscription_expires, balance, created_at
              FROM users
             ORDER BY id DESC
             LIMIT ? OFFSET ?
            """,
            (limit, offset),
        )
        users = [dict(r) for r in await cur.fetchall()]
        cur2 = await db.execute("SELECT COUNT(*) AS c FROM users")
        total = (await cur2.fetchone())["c"]
    return web.json_response({"users": users, "total": total})


@routes.get("/api/admin/users/{uid}")
@_admin_only
async def get_user(request: web.Request) -> web.Response:
    try:
        uid = int(request.match_info["uid"])
    except ValueError:
        return web.json_response({"error": "invalid_id"}, status=400)
    user = await get_user_by_id(uid)
    if not user:
        return web.json_response({"error": "not_found"}, status=404)
    return web.json_response({"user": user})


@routes.post("/api/admin/users/{uid}/grant")
@_admin_only
async def grant_tier(request: web.Request) -> web.Response:
    try:
        uid = int(request.match_info["uid"])
    except ValueError:
        return web.json_response({"error": "invalid_id"}, status=400)
    body = await request.json()
    tier = body.get("tier", "pro")
    days = int(body.get("days", 30))
    if tier not in {"starter", "standard", "pro"}:
        return web.json_response({"error": "invalid_tier"}, status=400)
    expires = now_ts() + days * 86400
    await update_user_subscription(uid, tier, expires)
    return web.json_response({"ok": True, "expires": expires})


# ----------------------------- PAYMENTS -----------------------------------


@routes.get("/api/admin/payments/pending")
@_admin_only
async def admin_pending_payments(request: web.Request) -> web.Response:
    payments = await list_pending_payments()
    return web.json_response({"payments": payments})


@routes.post("/api/admin/payments/{pid}/approve")
@_admin_only
async def approve_payment(request: web.Request) -> web.Response:
    try:
        pid = int(request.match_info["pid"])
    except ValueError:
        return web.json_response({"error": "invalid_id"}, status=400)
    payment = await set_payment_status(pid, "approved", note="admin")
    if not payment:
        return web.json_response({"error": "not_found"}, status=404)
    expires = now_ts() + 30 * 86400
    await update_user_subscription(
        payment["user_id"], payment["tier"], expires
    )
    return web.json_response({"ok": True})


@routes.post("/api/admin/payments/{pid}/reject")
@_admin_only
async def reject_payment(request: web.Request) -> web.Response:
    try:
        pid = int(request.match_info["pid"])
    except ValueError:
        return web.json_response({"error": "invalid_id"}, status=400)
    await set_payment_status(pid, "rejected", note="admin")
    return web.json_response({"ok": True})


# ----------------------------- PROMO CODES --------------------------------


@routes.get("/api/admin/promos")
@_admin_only
async def list_promo_codes(request: web.Request) -> web.Response:
    promos = await list_promos()
    return web.json_response({"promos": promos})


@routes.post("/api/admin/promos")
@_admin_only
async def create_promo(request: web.Request) -> web.Response:
    body = await request.json()
    code = body.get("code", "").upper()
    percent = int(body.get("percent", 0))
    max_uses = int(body.get("max_uses", 0))
    valid_days = body.get("valid_days")
    if not code or percent <= 0 or percent > 100:
        return web.json_response({"error": "invalid_input"}, status=400)
    valid_until = (
        now_ts() + int(valid_days) * 86400 if valid_days else None
    )
    pid = await create_promo_code(code, percent, max_uses, valid_until)
    return web.json_response({"id": pid})


@routes.delete("/api/admin/promos/{pid}")
@_admin_only
async def delete_promo_code(request: web.Request) -> web.Response:
    try:
        pid = int(request.match_info["pid"])
    except ValueError:
        return web.json_response({"error": "invalid_id"}, status=400)
    ok = await delete_promo(pid)
    return web.json_response({"ok": ok})


# ----------------------------- AUDIT LOG ----------------------------------


@routes.get("/api/admin/audit")
@_admin_only
async def get_audit(request: web.Request) -> web.Response:
    user_id_param = request.query.get("user_id")
    user_id = int(user_id_param) if user_id_param else None
    limit = int(request.query.get("limit", "100"))
    rows = await list_audit_log(user_id, limit=limit)
    return web.json_response({"entries": rows})


# ----------------------------- BROADCAST ----------------------------------


@routes.post("/api/admin/broadcast")
@_admin_only
async def broadcast(request: web.Request) -> web.Response:
    body = await request.json()
    text = (body.get("text") or "").strip()
    if not text:
        return web.json_response({"error": "text_required"}, status=400)

    bot = request.app.get("bot")
    if not bot:
        return web.json_response({"error": "bot_unavailable"}, status=503)

    async with connect() as db:
        cur = await db.execute("SELECT telegram_id FROM users")
        ids = [r[0] for r in await cur.fetchall()]

    sent = 0
    failed = 0
    for tg_id in ids:
        try:
            await bot.send_message(tg_id, text)
            sent += 1
        except Exception:  # noqa: BLE001
            failed += 1
    return web.json_response({"sent": sent, "failed": failed, "total": len(ids)})


# ----------------------------- METRICS ------------------------------------


@routes.get("/api/admin/dashboard")
@_admin_only
async def admin_dashboard(request: web.Request) -> web.Response:
    """Сводный дашборд для админа: ключевые метрики SaaS-а."""
    async with connect() as db:
        cur = await db.execute("SELECT COUNT(*) AS c FROM users")
        users_total = (await cur.fetchone())["c"]
        cur = await db.execute(
            "SELECT COUNT(*) AS c FROM users WHERE subscription_tier IS NOT NULL "
            "AND subscription_expires > ?",
            (now_ts(),),
        )
        users_paid = (await cur.fetchone())["c"]
        cur = await db.execute("SELECT COUNT(*) AS c FROM fp_accounts")
        fp_total = (await cur.fetchone())["c"]
        cur = await db.execute(
            "SELECT COUNT(*) AS c FROM stats WHERE timestamp >= ?",
            (now_ts() - 86400,),
        )
        sales_24h = (await cur.fetchone())["c"]
        cur = await db.execute(
            "SELECT COALESCE(SUM(amount), 0) AS s FROM stats WHERE timestamp >= ?",
            (now_ts() - 86400 * 30,),
        )
        revenue_30d = (await cur.fetchone())["s"]
        cur = await db.execute(
            "SELECT subscription_tier, COUNT(*) AS c FROM users "
            "WHERE subscription_tier IS NOT NULL AND subscription_expires > ? "
            "GROUP BY subscription_tier",
            (now_ts(),),
        )
        by_tier = [dict(r) for r in await cur.fetchall()]

    return web.json_response(
        {
            "users_total": users_total,
            "users_paid": users_paid,
            "users_free": users_total - users_paid,
            "conversion_rate": round(users_paid / users_total * 100, 1) if users_total else 0,
            "fp_accounts_total": fp_total,
            "sales_24h": sales_24h,
            "revenue_30d": int(revenue_30d),
            "by_tier": by_tier,
        }
    )
