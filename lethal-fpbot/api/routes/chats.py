"""GET /api/chats — список чатов FunPay со всех аккаунтов."""

from __future__ import annotations

import logging

from aiohttp import web

from database.models import get_or_create_user, list_fp_accounts
from funpay.api import get_chat_messages, get_chats, send_chat_message
from services import session_pool

from ..schemas import validate_send_message

routes = web.RouteTableDef()
logger = logging.getLogger(__name__)


@routes.get("/api/chats")
async def list_all_chats(request: web.Request) -> web.Response:
    user = await get_or_create_user(request["tg_id"], None)
    accounts = await list_fp_accounts(user["id"])
    out = []
    for acc in accounts:
        sess = await session_pool.get(acc["id"])
        if not sess:
            continue
        try:
            chats = await get_chats(sess)
        except Exception:  # noqa: BLE001
            continue
        for c in chats:
            out.append(
                {
                    "account_id": acc["id"],
                    "account_login": acc["login"],
                    "chat_id": c.chat_id,
                    "interlocutor": c.interlocutor,
                    "last_message": c.last_message,
                    "unread": c.unread,
                }
            )
    return web.json_response({"chats": out})


@routes.get("/api/chats/{account_id}/{chat_id}/messages")
async def chat_messages(request: web.Request) -> web.Response:
    try:
        account_id = int(request.match_info["account_id"])
    except ValueError:
        return web.json_response({"error": "invalid_id"}, status=400)
    chat_id = request.match_info["chat_id"]

    sess = await session_pool.get(account_id)
    if not sess:
        return web.json_response({"error": "no_session"}, status=400)
    msgs = await get_chat_messages(sess, chat_id)
    return web.json_response({"messages": msgs})


@routes.post("/api/chats/{account_id}/send")
async def send(request: web.Request) -> web.Response:
    try:
        account_id = int(request.match_info["account_id"])
    except ValueError:
        return web.json_response({"error": "invalid_id"}, status=400)
    try:
        body = await request.json()
    except Exception:  # noqa: BLE001
        return web.json_response({"error": "invalid_json"}, status=400)
    data, err = validate_send_message(body)
    if err:
        return web.json_response({"error": err}, status=400)

    sess = await session_pool.get(account_id)
    if not sess:
        return web.json_response({"error": "no_session"}, status=400)
    ok = await send_chat_message(sess, data["chat_id"], data["text"])
    return web.json_response({"ok": ok})
