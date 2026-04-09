"""ИИ-эндпоинты Web API: подсказка ответа покупателю и арбитраж."""

from __future__ import annotations

from aiohttp import web

from services import session_pool
from services.ai_responder import reply_to_buyer
from services.arbitrage_assist import build_defense

routes = web.RouteTableDef()


@routes.post("/api/ai/reply")
async def suggest_reply(request: web.Request) -> web.Response:
    try:
        body = await request.json()
    except Exception:  # noqa: BLE001
        return web.json_response({"error": "invalid_json"}, status=400)

    text = body.get("text") or ""
    context = body.get("context") or ""
    if not text:
        return web.json_response({"error": "text required"}, status=400)
    suggestion = await reply_to_buyer(text, context)
    if not suggestion:
        return web.json_response({"error": "ai_disabled"}, status=503)
    return web.json_response({"suggestion": suggestion})


@routes.post("/api/ai/arbitrage")
async def arbitrage(request: web.Request) -> web.Response:
    try:
        body = await request.json()
    except Exception:  # noqa: BLE001
        return web.json_response({"error": "invalid_json"}, status=400)

    account_id = body.get("account_id")
    chat_id = body.get("chat_id")
    if not account_id or not chat_id:
        return web.json_response(
            {"error": "account_id and chat_id required"}, status=400
        )

    sess = await session_pool.get(int(account_id))
    if not sess:
        return web.json_response({"error": "no_session"}, status=400)

    defense = await build_defense(sess, chat_id)
    if not defense:
        return web.json_response({"error": "ai_disabled"}, status=503)
    return web.json_response({"defense": defense})
