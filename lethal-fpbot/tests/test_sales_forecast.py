"""Тесты sales forecast."""

from __future__ import annotations

import pytest

pytestmark = pytest.mark.asyncio


async def _ensure(tmp_db):
    from migrations import upgrade

    await upgrade()


def test_linear_regression_perfect():
    from services.sales_forecast import _linear_regression

    xs = [0, 1, 2, 3, 4]
    ys = [0, 10, 20, 30, 40]
    slope, intercept, r_sq = _linear_regression(xs, ys)
    assert abs(slope - 10) < 0.01
    assert abs(intercept) < 0.01
    assert r_sq > 0.99


def test_linear_regression_flat():
    from services.sales_forecast import _linear_regression

    xs = [0, 1, 2, 3, 4]
    ys = [100, 100, 100, 100, 100]
    slope, intercept, r_sq = _linear_regression(xs, ys)
    assert abs(slope) < 0.01
    assert intercept == 100


def test_linear_regression_few_points():
    from services.sales_forecast import _linear_regression

    slope, intercept, r_sq = _linear_regression([0], [100])
    assert slope == 0
    assert intercept == 100


async def test_forecast_no_data(tmp_db):
    await _ensure(tmp_db)
    from database.models import get_or_create_user
    from services.sales_forecast import forecast

    u = await get_or_create_user(1, "x")
    f = await forecast(u["id"])
    assert f.trend == "insufficient_data"


async def test_forecast_with_data(tmp_db):
    await _ensure(tmp_db)
    from database.models import add_stat, get_or_create_user
    from services.sales_forecast import forecast

    u = await get_or_create_user(1, "x")
    # Добавим 10 записей — хватит для прогноза
    for _i in range(10):
        await add_stat(u["id"], None, 500, "Lot", "buyer")

    f = await forecast(u["id"], history_days=7, forecast_days=7)
    assert f is not None
    assert f.trend in {"growing", "declining", "flat"}
    assert len(f.day_by_day) == 7


async def test_format_forecast_insufficient():
    from services.sales_forecast import Forecast, format_forecast

    f = Forecast(
        forecast_total=0,
        trend="insufficient_data",
        confidence="low",
        r_squared=0.0,
        slope=0.0,
        intercept=0.0,
        day_by_day=[],
        history_avg=0.0,
        history_days=30,
    )
    text = format_forecast(f)
    assert "Недостаточно данных" in text


async def test_format_forecast_growing():
    from services.sales_forecast import Forecast, format_forecast

    f = Forecast(
        forecast_total=10000,
        trend="growing",
        confidence="high",
        r_squared=0.8,
        slope=50.0,
        intercept=100.0,
        day_by_day=[(i, 100.0) for i in range(7)],
        history_avg=500.0,
        history_days=30,
    )
    text = format_forecast(f)
    assert "10 000" in text or "10000" in text
    assert "📈" in text
    assert "growing" in text
