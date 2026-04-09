"""Тесты A/B тестирования."""

from __future__ import annotations

import pytest

from services.ab_testing import calc_winner

pytestmark = pytest.mark.asyncio


def test_calc_winner_a():
    test = {"a_used": 100, "b_used": 100, "a_conversions": 20, "b_conversions": 10}
    w = calc_winner(test)
    assert w["winner"] == "a"
    assert w["a_rate"] == 0.2
    assert w["b_rate"] == 0.1


def test_calc_winner_b():
    test = {"a_used": 100, "b_used": 100, "a_conversions": 5, "b_conversions": 30}
    assert calc_winner(test)["winner"] == "b"


def test_calc_winner_tie():
    test = {"a_used": 50, "b_used": 50, "a_conversions": 10, "b_conversions": 10}
    assert calc_winner(test)["winner"] is None


def test_calc_winner_no_data():
    test = {"a_used": 0, "b_used": 0, "a_conversions": 0, "b_conversions": 0}
    w = calc_winner(test)
    assert w["winner"] is None
    assert w["samples_total"] == 0


async def test_ab_test_crud(tmp_db):
    from database.models import (
        create_ab_test,
        delete_ab_test,
        get_or_create_user,
        increment_ab_variant,
        list_ab_tests,
    )

    u = await get_or_create_user(1, "x")
    tid = await create_ab_test(u["id"], "funnel", "вариант А", "вариант Б")
    tests = await list_ab_tests(u["id"])
    assert len(tests) == 1
    assert tests[0]["name"] == "funnel"

    await increment_ab_variant(tid, "a", conversion=False)
    await increment_ab_variant(tid, "a", conversion=True)
    await increment_ab_variant(tid, "b", conversion=False)
    tests = await list_ab_tests(u["id"])
    assert tests[0]["a_used"] == 2
    assert tests[0]["a_conversions"] == 1
    assert tests[0]["b_used"] == 1

    assert await delete_ab_test(tid, u["id"]) is True
    assert await list_ab_tests(u["id"]) == []
