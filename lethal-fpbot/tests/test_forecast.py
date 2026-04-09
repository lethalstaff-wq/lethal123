"""Тесты прогнозирования."""

from __future__ import annotations

import pytest

from services.forecast import linear_regression, weekly_seasonality

pytestmark = pytest.mark.asyncio


def test_linear_regression_perfect_line():
    pts = [(0, 0), (1, 10), (2, 20), (3, 30)]
    a, b = linear_regression(pts)
    assert abs(a) < 1e-6
    assert abs(b - 10) < 1e-6


def test_linear_regression_constant():
    pts = [(0, 5), (1, 5), (2, 5), (3, 5)]
    a, b = linear_regression(pts)
    assert b == 0
    assert a == 5


def test_linear_regression_too_few():
    a, b = linear_regression([(0, 1)])
    assert a == 0 and b == 0


def test_weekly_seasonality():
    # 7 точек, ровно по 1 на каждый день недели,
    # все равны 100 → сезонность 1.0 везде
    pts = [(86400 * i, 100) for i in range(7)]
    season = weekly_seasonality(pts)
    assert all(abs(v - 1.0) < 0.01 for v in season.values())


async def test_forecast_insufficient_data(tmp_db):
    from database.models import add_stat, get_or_create_user
    from services.forecast import forecast_next_days

    u = await get_or_create_user(1, "x")
    await add_stat(u["id"], None, 100, "Lot", "buyer")
    result = await forecast_next_days(u["id"])
    assert result["trend"] == "insufficient_data"


async def test_ltv_calc(tmp_db):
    from database.models import add_stat, get_or_create_user
    from services.forecast import calc_lifetime_value

    u = await get_or_create_user(1, "x")
    for i in range(10):
        await add_stat(u["id"], None, 100, "Lot", f"buyer{i % 3}")
    ltv = await calc_lifetime_value(u["id"])
    assert ltv["orders"] == 10
    assert ltv["revenue"] == 1000
    assert ltv["buyers"] == 3
    assert ltv["aov"] == 100
