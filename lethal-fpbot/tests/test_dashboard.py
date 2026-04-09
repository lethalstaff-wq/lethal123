"""Тесты сервиса dashboard (графики)."""

from __future__ import annotations

import pytest

pytestmark = pytest.mark.asyncio


def test_try_matplotlib_import():
    from services.dashboard import _try_matplotlib

    plt = _try_matplotlib()
    # Если matplotlib установлен — не None, иначе None.
    # Тест просто проверяет что функция не падает.
    assert plt is None or plt is not None


def test_revenue_by_day_empty():
    from services.dashboard import revenue_by_day

    assert revenue_by_day([], days=7) is None


def test_revenue_by_day_returns_png():
    from services.dashboard import _try_matplotlib, revenue_by_day

    if not _try_matplotlib():
        pytest.skip("matplotlib not installed")

    data = [("2025-01-01", 500), ("2025-01-02", 1200), ("2025-01-03", 800)]
    png = revenue_by_day(data, days=3)
    assert png is not None
    assert png.startswith(b"\x89PNG")  # PNG magic


def test_top_lots_chart_empty():
    from services.dashboard import top_lots_chart

    assert top_lots_chart([]) is None


def test_top_lots_chart_returns_png():
    from services.dashboard import _try_matplotlib, top_lots_chart

    if not _try_matplotlib():
        pytest.skip("matplotlib not installed")

    data = [("Lot A", 5000), ("Lot B", 3000), ("Lot C", 1500)]
    png = top_lots_chart(data)
    assert png is not None
    assert png.startswith(b"\x89PNG")


def test_hours_activity_empty():
    from services.dashboard import hours_activity_chart

    assert hours_activity_chart({}) is None


def test_hours_activity_returns_png():
    from services.dashboard import _try_matplotlib, hours_activity_chart

    if not _try_matplotlib():
        pytest.skip("matplotlib not installed")

    hours = {10: 5, 11: 8, 12: 12, 13: 15, 14: 20, 15: 18, 16: 10}
    png = hours_activity_chart(hours)
    assert png is not None
    assert png.startswith(b"\x89PNG")


def test_funnel_chart_empty():
    from services.dashboard import funnel_chart

    assert funnel_chart([]) is None


def test_funnel_chart_returns_png():
    from services.dashboard import _try_matplotlib, funnel_chart

    if not _try_matplotlib():
        pytest.skip("matplotlib not installed")

    stages = [("Сообщения", 100), ("Заказы", 20), ("Отзывы", 15)]
    png = funnel_chart(stages)
    assert png is not None
    assert png.startswith(b"\x89PNG")


def test_segments_donut_empty():
    from services.dashboard import segments_donut

    assert segments_donut({}) is None
    assert segments_donut({"new": 0}) is None


async def test_collect_revenue_by_day(tmp_db):
    from database.models import add_stat, get_or_create_user
    from services.dashboard import collect_revenue_by_day

    u = await get_or_create_user(1, "seller")
    await add_stat(u["id"], None, 500, "Lot", "buyer")
    await add_stat(u["id"], None, 800, "Lot", "buyer")

    data = await collect_revenue_by_day(u["id"], days=7)
    assert len(data) == 7  # всегда заполнено 7 слотов
    total = sum(v for _, v in data)
    assert total == 1300


async def test_collect_top_lots(tmp_db):
    from database.models import add_stat, get_or_create_user
    from services.dashboard import collect_top_lots

    u = await get_or_create_user(1, "seller")
    await add_stat(u["id"], None, 1000, "Top Lot", "b1")
    await add_stat(u["id"], None, 500, "Mid Lot", "b2")
    await add_stat(u["id"], None, 2000, "Top Lot", "b3")

    data = await collect_top_lots(u["id"], days=30, limit=5)
    assert len(data) == 2
    # Top Lot = 3000 > Mid Lot = 500
    assert data[0][0] == "Top Lot"
    assert data[0][1] == 3000
