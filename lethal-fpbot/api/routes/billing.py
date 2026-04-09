"""Биллинг через Web API."""

from __future__ import annotations

from aiohttp import web

from config import TIER_NAMES, TIER_PRICES
from database.models import create_payment, get_or_create_user

from ..schemas import validate_buy_tier

routes = web.RouteTableDef()


@routes.get("/api/billing/tiers")
async def list_tiers(request: web.Request) -> web.Response:
    return web.json_response(
        {
            "tiers": [
                {
                    "id": tid,
                    "name": TIER_NAMES.get(tid, tid),
                    "price": TIER_PRICES.get(tid, 0),
                }
                for tid in ("starter", "standard", "pro")
            ]
        }
    )


@routes.post("/api/billing/buy")
async def buy(request: web.Request) -> web.Response:
    try:
        body = await request.json()
    except Exception:  # noqa: BLE001
        return web.json_response({"error": "invalid_json"}, status=400)
    data, err = validate_buy_tier(body)
    if err:
        return web.json_response({"error": err}, status=400)

    user = await get_or_create_user(request["tg_id"], None)
    amount = TIER_PRICES[data["tier"]]

    # Промокод
    if data.get("promo"):
        from services.promo import apply_promo

        new_amount, perc, ok = await apply_promo(data["promo"], amount, user["id"])
        if ok:
            amount = new_amount

    pid = await create_payment(user["id"], data["tier"], amount)
    return web.json_response({"payment_id": pid, "amount": amount})
