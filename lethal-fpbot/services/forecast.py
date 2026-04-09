"""Простое прогнозирование выручки на основе истории.

Используем линейную регрессию методом наименьших квадратов на дневной
агрегации, плюс детектим weekly seasonality (среднее по дням недели).

Без numpy/sklearn чтобы не тащить тяжёлые зависимости — реализация
вручную, всё на чистом Python. Для базового прогноза работает.
"""

from __future__ import annotations

import time
from collections import defaultdict

from database.db import connect


async def fetch_daily_revenue(user_id: int, days: int = 30) -> list[tuple[int, int]]:
    """Возвращает [(day_ts, revenue), ...] за последние days дней."""
    since = int(time.time()) - days * 86400
    async with connect() as db:
        cur = await db.execute(
            """
            SELECT (timestamp / 86400) * 86400 AS day,
                   SUM(amount) AS total
              FROM stats
             WHERE user_id = ? AND timestamp >= ?
             GROUP BY day
             ORDER BY day
            """,
            (user_id, since),
        )
        rows = await cur.fetchall()
    return [(int(r["day"]), int(r["total"] or 0)) for r in rows]


def linear_regression(points: list[tuple[int, int]]) -> tuple[float, float]:
    """y = a + b*x; вернёт (a, b)."""
    n = len(points)
    if n < 2:
        return 0.0, 0.0
    xs = [p[0] for p in points]
    ys = [p[1] for p in points]
    mean_x = sum(xs) / n
    mean_y = sum(ys) / n
    num = sum((xs[i] - mean_x) * (ys[i] - mean_y) for i in range(n))
    den = sum((xs[i] - mean_x) ** 2 for i in range(n))
    if den == 0:
        return mean_y, 0.0
    b = num / den
    a = mean_y - b * mean_x
    return a, b


def weekly_seasonality(points: list[tuple[int, int]]) -> dict[int, float]:
    """Средняя выручка по дню недели (0=пн, 6=вс), как множитель к среднему."""
    if not points:
        return {}
    by_dow: dict[int, list[int]] = defaultdict(list)
    for ts, val in points:
        dow = time.gmtime(ts).tm_wday
        by_dow[dow].append(val)
    overall = sum(p[1] for p in points) / len(points)
    if overall == 0:
        return {dow: 1.0 for dow in range(7)}
    return {
        dow: (sum(vals) / len(vals)) / overall
        for dow, vals in by_dow.items()
    }


async def forecast_next_days(user_id: int, days: int = 7) -> dict:
    history = await fetch_daily_revenue(user_id, days=30)
    if len(history) < 3:
        return {
            "history": history,
            "forecast": [],
            "trend": "insufficient_data",
        }

    a, b = linear_regression(history)
    season = weekly_seasonality(history)
    last_day = history[-1][0]
    forecast: list[dict] = []
    for i in range(1, days + 1):
        ts = last_day + i * 86400
        base = a + b * ts
        dow = time.gmtime(ts).tm_wday
        adj = season.get(dow, 1.0)
        predicted = max(0, int(base * adj))
        forecast.append({"day": ts, "predicted": predicted})

    # Оценка тренда
    if b > 1:
        trend = "growing"
    elif b < -1:
        trend = "declining"
    else:
        trend = "flat"

    # MAPE на исторических данных для индикатора качества
    mape_values = []
    for ts, actual in history:
        predicted = a + b * ts
        if actual > 0:
            mape_values.append(abs(actual - predicted) / actual)
    mape = (sum(mape_values) / len(mape_values) * 100) if mape_values else 0

    return {
        "history": history,
        "forecast": forecast,
        "trend": trend,
        "slope": b,
        "intercept": a,
        "mape": round(mape, 2),
        "confidence": "high" if mape < 20 else ("medium" if mape < 50 else "low"),
    }


async def calc_lifetime_value(user_id: int) -> dict:
    """Простой LTV: total revenue / unique buyers."""
    async with connect() as db:
        cur = await db.execute(
            """
            SELECT COUNT(DISTINCT buyer) AS buyers,
                   COUNT(*) AS orders,
                   COALESCE(SUM(amount), 0) AS revenue
              FROM stats
             WHERE user_id = ?
            """,
            (user_id,),
        )
        row = await cur.fetchone()
    if not row or not row["buyers"]:
        return {"buyers": 0, "orders": 0, "revenue": 0, "ltv": 0, "aov": 0}
    buyers = int(row["buyers"])
    orders = int(row["orders"])
    revenue = int(row["revenue"])
    return {
        "buyers": buyers,
        "orders": orders,
        "revenue": revenue,
        "ltv": int(revenue / buyers),
        "aov": int(revenue / orders) if orders else 0,
        "repeat_rate": round((orders - buyers) / orders, 2) if orders else 0,
    }
