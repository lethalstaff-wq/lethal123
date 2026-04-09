"""Тесты умного планировщика поднятий."""

from __future__ import annotations

from dataclasses import dataclass

from services.raise_scheduler import RaiseSchedule


@dataclass
class FakeLot:
    id: str
    title: str


def test_empty_schedule_returns_none():
    sched = RaiseSchedule()
    assert sched.next_lot_to_raise() is None


def test_rebuild_adds_lots():
    sched = RaiseSchedule(min_interval_sec=0, global_cooldown_sec=0)
    sched.rebuild([FakeLot(id="L1", title="World of Warcraft Gold")])
    stats = sched.stats()
    assert stats["total_lots"] == 1


def test_rebuild_removes_gone_lots():
    sched = RaiseSchedule()
    sched.rebuild([FakeLot(id="L1", title="A"), FakeLot(id="L2", title="B")])
    sched.rebuild([FakeLot(id="L1", title="A")])  # L2 ушёл
    assert sched.stats()["total_lots"] == 1


def test_priority_from_revenue():
    sched = RaiseSchedule(min_interval_sec=0, global_cooldown_sec=0)
    sched.rebuild(
        [
            FakeLot(id="L1", title="WoW Gold"),
            FakeLot(id="L2", title="Dota 2 Boost"),
        ],
        revenue_by_game={"wow": 100000, "dota2": 500},
    )
    # Первый должен быть WoW — выше выручка
    next_lot = sched.next_lot_to_raise()
    assert next_lot is not None
    assert "wow" in next_lot.title.lower() or next_lot.lot_id == "L1"


def test_mark_raised_increments():
    sched = RaiseSchedule(min_interval_sec=0, global_cooldown_sec=0)
    sched.rebuild([FakeLot(id="L1", title="CS2 skins")])
    sched.mark_raised("L1", success=True)
    stats = sched.stats()
    assert stats["total_raises"] == 1


def test_mark_raised_failure_sets_cooldown():
    sched = RaiseSchedule(min_interval_sec=0, global_cooldown_sec=0)
    sched.rebuild([FakeLot(id="L1", title="Valorant skins")])
    sched.mark_raised("L1", success=False)
    # После failure должен быть cooldown
    assert sched.next_lot_to_raise() is None
    stats = sched.stats()
    assert stats["in_cooldown"] == 1


def test_min_interval_throttles():
    sched = RaiseSchedule(min_interval_sec=1000, global_cooldown_sec=0)
    sched.rebuild(
        [FakeLot(id="L1", title="WoW"), FakeLot(id="L2", title="Dota 2")]
    )
    # Первый — ок, но после mark_raised второй заблочен глобальным интервалом
    first = sched.next_lot_to_raise()
    assert first is not None
    sched.mark_raised(first.lot_id, success=True)
    second = sched.next_lot_to_raise()
    assert second is None  # min_interval ещё не прошёл
