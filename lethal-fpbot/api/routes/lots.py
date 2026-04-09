"""GET /api/lots — лоты пользователя с FunPay (через все его аккаунты)."""

from __future__ import annotations

import logging

from aiohttp import web

from database.models import get_or_create_user, list_fp_accounts
from funpay.api import get_lots, raise_lots
from games.matchers import detect_game_from_lot, detect_lot_type
from services import session_pool

routes = web.RouteTableDef()
logger = logging.getLogger(__name__)


@routes.get("/api/lots")
async def list_all_lots(request: web.Request) -> web.Response:
    user = await get_or_create_user(request["tg_id"], None)
    accounts = await list_fp_accounts(user["id"])
    out = []
    for acc in accounts:
        sess = await session_pool.get(acc["id"])
        if not sess:
            continue
        if not sess.user_id:
            await sess.restore()
        if not sess.user_id:
            continue
        try:
            lots = await get_lots(sess, sess.user_id)
        except Exception as exc:  # noqa: BLE001
            logger.warning("get_lots failed: %s", exc)
            continue
        for lot in lots:
            game = detect_game_from_lot(lot.title)
            out.append(
                {
                    "account_id": acc["id"],
                    "account_login": acc["login"],
                    "id": lot.id,
                    "title": lot.title,
                    "price": lot.price,
                    "currency": lot.currency,
                    "type": detect_lot_type(lot.title),
                    "game": game["id"] if game else None,
                    "game_name": game["name"] if game else None,
                }
            )
    return web.json_response({"lots": out, "count": len(out)})


@routes.post("/api/lots/raise")
async def raise_all(request: web.Request) -> web.Response:
    """Поднять все лоты пользователя по всем его аккаунтам."""
    user = await get_or_create_user(request["tg_id"], None)
    accounts = await list_fp_accounts(user["id"])
    raised = 0
    for acc in accounts:
        sess = await session_pool.get(acc["id"])
        if not sess:
            continue
        if not sess.user_id:
            await sess.restore()
        if not sess.user_id:
            continue
        try:
            lots = await get_lots(sess, sess.user_id)
        except Exception:  # noqa: BLE001
            continue
        for lot in lots:
            if not lot.id:
                continue
            game = detect_game_from_lot(lot.title)
            game_id = game["fp_game_id"] if game else 1
            try:
                ok = await raise_lots(sess, game_id=game_id, node_id=int(lot.id))
                if ok:
                    raised += 1
            except (ValueError, Exception):  # noqa: BLE001
                pass
    return web.json_response({"raised": raised})
