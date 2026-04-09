"""Простой прогноз продаж на основе исторических данных.

Без ML-библиотек — используем простую линейную регрессию через
встроенный statistics. Для SaaS-бота это достаточно: прогноз на
7-30 дней вперёд с уровнем доверия.

Возвращает:
  • forecast: ожидаемая выручка на N дней
  • trend: растёт / падает / плато
  • confidence: high / medium / low по величине R²
  • day_by_day: поточечный прогноз для графика
"""

from __future__ import annotations

import logging
from dataclasses import dataclass
from datetime import UTC

from database.db import connect
from utils.helpers import now_ts

logger = logging.getLogger(__name__)


@dataclass
class Forecast:
    forecast_total: int
    trend: str  # "growing" / "declining" / "flat" / "insufficient_data"
    confidence: str  # "high" / "medium" / "low"
    r_squared: float
    slope: float
    intercept: float
    day_by_day: list[tuple[int, float]]  # [(day_offset, predicted_revenue), ...]
    history_avg: float
    history_days: int


def _linear_regression(xs: list[float], ys: list[float]) -> tuple[float, float, float]:
    """Возвращает (slope, intercept, r_squared) для простой регрессии y = a*x + b."""
    n = len(xs)
    if n < 2:
        return 0.0, sum(ys) / n if n else 0.0, 0.0

    mean_x = sum(xs) / n
    mean_y = sum(ys) / n

    num = sum((x - mean_x) * (y - mean_y) for x, y in zip(xs, ys, strict=False))
    den_x = sum((x - mean_x) ** 2 for x in xs)

    if den_x == 0:
        return 0.0, mean_y, 0.0

    slope = num / den_x
    intercept = mean_y - slope * mean_x

    # R² — коэффициент детерминации
    ss_tot = sum((y - mean_y) ** 2 for y in ys)
    ss_res = sum(
        (y - (slope * x + intercept)) ** 2
        for x, y in zip(xs, ys, strict=False)
    )
    if ss_tot == 0:
        r_sq = 0.0
    else:
        r_sq = max(0.0, 1 - ss_res / ss_tot)

    return slope, intercept, r_sq


async def _collect_daily_revenue(user_id: int, days: int) -> list[tuple[int, float]]:
    """Возвращает [(day_index, revenue), ...] для последних N дней.

    day_index = 0 — самый ранний, days-1 — сегодня.
    """
    async with connect() as db:
        cur = await db.execute(
            """
            SELECT strftime('%Y-%m-%d', timestamp, 'unixepoch') AS day,
                   COALESCE(SUM(amount), 0) AS total
              FROM stats
             WHERE user_id = ? AND timestamp >= ?
             GROUP BY day
             ORDER BY day
            """,
            (user_id, now_ts() - days * 86400),
        )
        rows = await cur.fetchall()

    by_day = {row["day"]: float(row["total"]) for row in rows}

    # Заполняем пустые дни нулями
    from datetime import datetime, timedelta

    end = datetime.now(tz=UTC).date()
    result = []
    for i in range(days):
        d = end - timedelta(days=days - 1 - i)
        key = d.strftime("%Y-%m-%d")
        result.append((i, by_day.get(key, 0.0)))
    return result


async def forecast(
    user_id: int, history_days: int = 30, forecast_days: int = 7
) -> Forecast | None:
    """Строит прогноз выручки на forecast_days дней вперёд."""
    data = await _collect_daily_revenue(user_id, history_days)

    xs = [x for x, _ in data]
    ys = [y for _, y in data]

    if len(xs) < 7 or sum(ys) == 0:
        return Forecast(
            forecast_total=0,
            trend="insufficient_data",
            confidence="low",
            r_squared=0.0,
            slope=0.0,
            intercept=0.0,
            day_by_day=[],
            history_avg=0.0,
            history_days=history_days,
        )

    slope, intercept, r_sq = _linear_regression(xs, ys)

    # Прогноз на N дней вперёд
    future = []
    for offset in range(1, forecast_days + 1):
        x = len(xs) - 1 + offset
        predicted = max(0.0, slope * x + intercept)
        future.append((offset, predicted))

    forecast_total = int(sum(y for _, y in future))
    history_avg = sum(ys) / len(ys)

    # Тренд
    if abs(slope) < history_avg * 0.01:
        trend = "flat"
    elif slope > 0:
        trend = "growing"
    else:
        trend = "declining"

    # Доверие
    if r_sq >= 0.5:
        confidence = "high"
    elif r_sq >= 0.2:
        confidence = "medium"
    else:
        confidence = "low"

    return Forecast(
        forecast_total=forecast_total,
        trend=trend,
        confidence=confidence,
        r_squared=round(r_sq, 3),
        slope=round(slope, 2),
        intercept=round(intercept, 2),
        day_by_day=future,
        history_avg=round(history_avg, 2),
        history_days=history_days,
    )


def format_forecast(f: Forecast, forecast_days: int = 7) -> str:
    if f.trend == "insufficient_data":
        return (
            "📊 <b>Прогноз</b>\n\n"
            "Недостаточно данных для прогноза. "
            "Нужно хотя бы 7 дней продаж."
        )

    trend_emoji = {
        "growing": "📈",
        "declining": "📉",
        "flat": "➡️",
    }.get(f.trend, "")

    confidence_label = {
        "high": "высокая",
        "medium": "средняя",
        "low": "низкая",
    }.get(f.confidence, "")

    lines = [
        "📊 <b>Прогноз продаж</b>",
        "",
        f"На <b>{forecast_days} дней</b> вперёд: <b>{f.forecast_total:,}₽</b>".replace(",", " "),
        f"{trend_emoji} Тренд: <b>{f.trend}</b>",
        f"🎯 Точность: <b>{confidence_label}</b> (R² = {f.r_squared})",
        "",
        f"📈 Среднее за {f.history_days} дней: <b>{f.history_avg:,.0f}₽/день</b>".replace(",", " "),
    ]
    if f.slope > 0:
        lines.append(f"📈 Рост: +{f.slope:,.0f}₽ в день".replace(",", " "))
    elif f.slope < 0:
        lines.append(f"📉 Падение: {f.slope:,.0f}₽ в день".replace(",", " "))

    return "\n".join(lines)
