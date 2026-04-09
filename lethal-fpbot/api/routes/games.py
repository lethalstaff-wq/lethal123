"""Каталог игр FunPay для Mini App (выпадашки в формах лотов и т.д.)."""

from __future__ import annotations

from aiohttp import web

from games import GAMES
from games.matchers import list_categories, list_games_by_category

routes = web.RouteTableDef()


@routes.get("/api/games")
async def list_all(request: web.Request) -> web.Response:
    category = request.query.get("category")
    if category:
        games = list_games_by_category(category)
    else:
        games = GAMES
    return web.json_response(
        {
            "games": [
                {
                    "id": g["id"],
                    "name": g["name"],
                    "category": g["category"],
                    "currency": g.get("currency"),
                }
                for g in games
            ]
        }
    )


@routes.get("/api/games/categories")
async def list_cats(request: web.Request) -> web.Response:
    return web.json_response({"categories": list_categories()})
