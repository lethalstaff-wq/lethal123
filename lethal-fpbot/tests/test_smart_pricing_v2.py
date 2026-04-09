"""Тесты продвинутого смарт-прайсинга."""

from __future__ import annotations

from services.smart_pricing_v2 import (
    _percentile,
    build_snapshot,
    compute_target_price,
    recommend,
)


def test_percentile_basic():
    sample = [1, 2, 3, 4, 5]
    assert _percentile(sample, 0) == 1
    assert _percentile(sample, 100) == 5
    assert _percentile(sample, 50) == 3


def test_snapshot_builds():
    prices = [100, 150, 200, 250, 300, 500, 1000]
    snap = build_snapshot(prices)
    assert snap is not None
    assert snap.total_lots == 7
    assert snap.min_price == 100
    assert snap.max_price == 1000
    assert snap.median == 250
    assert snap.top3_avg == 150  # (100+150+200)/3


def test_snapshot_too_few():
    assert build_snapshot([100]) is None
    assert build_snapshot([]) is None


def test_strategy_always_cheapest():
    snap = build_snapshot([100, 150, 200, 250, 300])
    target, _ = compute_target_price(175, snap, "always_cheapest")
    assert target == 99  # 100 - 1


def test_strategy_top_3():
    snap = build_snapshot([100, 150, 200, 250, 300])
    target, _ = compute_target_price(500, snap, "top_3")
    assert target == 149  # (100+150+200)/3 - 1 = 150 - 1


def test_strategy_average():
    snap = build_snapshot([100, 200, 300])
    target, _ = compute_target_price(0, snap, "average")
    assert target == 200


def test_strategy_above_average():
    snap = build_snapshot([100, 200, 300])
    target, _ = compute_target_price(0, snap, "above_average_10")
    assert abs(target - 220) < 0.01


def test_recommend_full():
    rec = recommend(
        current_price=500,
        prices=[100, 150, 200, 250, 300, 400],
        strategy="average",
    )
    assert rec is not None
    assert rec.current == 500
    assert rec.delta < 0  # должны снизить


def test_recommend_rank():
    rec = recommend(
        current_price=1000,
        prices=[100, 200, 300, 1000, 2000],
        strategy="top_3",
    )
    # Текущая позиция 4, target должен быть в топ-3
    assert rec.rank_before > rec.rank_after


def test_recommend_no_data():
    rec = recommend(current_price=100, prices=[50], strategy="average")
    assert rec is None
