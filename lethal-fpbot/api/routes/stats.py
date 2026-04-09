"""GET /api/stats — статистика, графики, экспорт."""

from __future__ import annotations

import csv
import io

from aiohttp import web

from database.db import connect
from database.models import get_or_create_user, stats_summary, stats_top_lots
from utils.helpers import now_ts

routes = web.RouteTableDef()


_PERIODS = {
    "day": 24 * 3600,
    "week": 7 * 24 * 3600,
    "month": 30 * 24 * 3600,
    "all": 10 * 365 * 24 * 3600,
}


@routes.get("/api/stats")
async def stats(request: web.Request) -> web.Response:
    user = await get_or_create_user(request["tg_id"], None)
    period = request.query.get("period", "week")
    if period not in _PERIODS:
        period = "week"
    since = now_ts() - _PERIODS[period]
    summary = await stats_summary(user["id"], since)
    tops = await stats_top_lots(user["id"], since, limit=10)

    # Точки графика — выручка по дням
    series = await _daily_series(user["id"], since)

    return web.json_response(
        {
            "period": period,
            "summary": summary,
            "top_lots": tops,
            "chart": series,
        }
    )


async def _daily_series(user_id: int, since_ts: int) -> list[dict]:
    async with connect() as db:
        cur = await db.execute(
            """
            SELECT (timestamp / 86400) * 86400 AS day,
                   COUNT(*) AS cnt,
                   SUM(amount) AS total
              FROM stats
             WHERE user_id = ? AND timestamp >= ?
             GROUP BY day
             ORDER BY day
            """,
            (user_id, since_ts),
        )
        return [
            {"day": int(r["day"]), "count": int(r["cnt"]), "total": int(r["total"] or 0)}
            for r in await cur.fetchall()
        ]


@routes.get("/api/stats/export.csv")
async def export_csv(request: web.Request) -> web.Response:
    user = await get_or_create_user(request["tg_id"], None)
    async with connect() as db:
        cur = await db.execute(
            """
            SELECT timestamp, amount, lot_name, buyer
              FROM stats
             WHERE user_id = ?
             ORDER BY timestamp DESC
            """,
            (user["id"],),
        )
        rows = list(await cur.fetchall())

    buf = io.StringIO()
    w = csv.writer(buf)
    w.writerow(["timestamp", "amount", "lot_name", "buyer"])
    for r in rows:
        w.writerow([r["timestamp"], r["amount"], r["lot_name"] or "", r["buyer"] or ""])

    return web.Response(
        text=buf.getvalue(),
        content_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=stats.csv"},
    )
