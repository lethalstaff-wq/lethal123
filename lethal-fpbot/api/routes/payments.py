"""Эндпоинты платёжных провайдеров: создание invoice + webhook."""

from __future__ import annotations

import logging

from aiohttp import web

from config import TIER_NAMES, TIER_PRICES, TIER_PRO, TIER_STANDARD, TIER_STARTER
from database.models import (
    create_payment,
    get_or_create_user,
    set_payment_status,
    update_user_subscription,
)
from services.payments import CryptoBotProvider, YooKassaProvider
from services.promo import apply_promo
from utils.helpers import now_ts

routes = web.RouteTableDef()
logger = logging.getLogger(__name__)


@routes.post("/api/payments/create")
async def create_payment_intent(request: web.Request) -> web.Response:
    try:
        body = await request.json()
    except Exception:  # noqa: BLE001
        return web.json_response({"error": "invalid_json"}, status=400)

    tier = body.get("tier")
    provider = body.get("provider", "yookassa")
    promo = body.get("promo")
    if tier not in {TIER_STARTER, TIER_STANDARD, TIER_PRO}:
        return web.json_response({"error": "invalid_tier"}, status=400)

    user = await get_or_create_user(request["tg_id"], None)
    amount = TIER_PRICES[tier]
    if promo:
        amount, _, _ = await apply_promo(promo, amount, user["id"])

    payment_id = await create_payment(user["id"], tier, amount)

    if provider == "yookassa":
        prov = YooKassaProvider()
    elif provider == "crypto_bot":
        prov = CryptoBotProvider()
    else:
        return web.json_response({"error": "unknown_provider"}, status=400)

    if not prov.enabled:
        return web.json_response(
            {
                "error": "provider_disabled",
                "payment_id": payment_id,
                "amount": amount,
                "manual": True,
            }
        )

    invoice = await prov.create_invoice(
        amount=amount,
        description=f"{TIER_NAMES.get(tier, tier)} (lethal-fpbot)",
        metadata={"payment_id": payment_id, "user_id": user["id"], "tier": tier},
    )
    if invoice.get("error"):
        return web.json_response(invoice, status=502)

    return web.json_response(
        {
            "payment_id": payment_id,
            "amount": amount,
            "provider": provider,
            "url": invoice["url"],
            "invoice_id": invoice["id"],
        }
    )


@routes.post("/api/payments/yookassa/webhook")
async def yookassa_webhook(request: web.Request) -> web.Response:
    try:
        body = await request.json()
    except Exception:  # noqa: BLE001
        return web.json_response({"error": "invalid_json"}, status=400)
    prov = YooKassaProvider()
    parsed = await prov.parse_webhook(body)
    if not parsed:
        return web.json_response({"ok": True})
    if parsed["status"] == "paid":
        await _activate_payment(parsed["metadata"])
    return web.json_response({"ok": True})


@routes.post("/api/payments/cryptobot/webhook")
async def cryptobot_webhook(request: web.Request) -> web.Response:
    try:
        body = await request.json()
    except Exception:  # noqa: BLE001
        return web.json_response({"error": "invalid_json"}, status=400)
    prov = CryptoBotProvider()
    parsed = await prov.parse_webhook(body)
    if not parsed:
        return web.json_response({"ok": True})
    if parsed["status"] == "paid":
        # CryptoBot хранит payload как строку — нужен JSON-парсинг
        import json

        try:
            meta = json.loads(parsed["metadata"].get("payload") or "{}")
        except (ValueError, TypeError):
            meta = {}
        await _activate_payment(meta)
    return web.json_response({"ok": True})


async def _activate_payment(metadata: dict) -> None:
    payment_id = metadata.get("payment_id")
    user_id = metadata.get("user_id")
    tier = metadata.get("tier")
    if not all([payment_id, user_id, tier]):
        return
    await set_payment_status(int(payment_id), "approved", note="webhook")
    expires = now_ts() + 30 * 86400
    await update_user_subscription(int(user_id), tier, expires)
    logger.info("Payment %s activated for user %s", payment_id, user_id)
