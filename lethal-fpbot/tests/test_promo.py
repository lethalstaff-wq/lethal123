"""Тесты промокодов."""

from __future__ import annotations

import pytest

pytestmark = pytest.mark.asyncio


async def test_create_and_apply_promo(tmp_db):
    from database.models import create_promo_code, get_or_create_user
    from services.promo import apply_promo

    user = await get_or_create_user(1, "x")
    await create_promo_code("LETHAL10", 10, max_uses=100)
    new_amount, percent, ok = await apply_promo("LETHAL10", 1000, user["id"])
    assert ok is True
    assert percent == 10
    assert new_amount == 900


async def test_promo_one_time_per_user(tmp_db):
    from database.models import create_promo_code, get_or_create_user
    from services.promo import apply_promo

    user = await get_or_create_user(1, "x")
    await create_promo_code("ONCE", 20)
    a1 = await apply_promo("ONCE", 500, user["id"])
    assert a1[2] is True
    a2 = await apply_promo("ONCE", 500, user["id"])
    assert a2[2] is False  # уже использовал


async def test_promo_max_uses(tmp_db):
    from database.models import create_promo_code, get_or_create_user
    from services.promo import apply_promo

    await create_promo_code("LIMIT", 50, max_uses=2)
    u1 = await get_or_create_user(1, "u1")
    u2 = await get_or_create_user(2, "u2")
    u3 = await get_or_create_user(3, "u3")
    assert (await apply_promo("LIMIT", 100, u1["id"]))[2] is True
    assert (await apply_promo("LIMIT", 100, u2["id"]))[2] is True
    assert (await apply_promo("LIMIT", 100, u3["id"]))[2] is False


async def test_promo_unknown_code(tmp_db):
    from database.models import get_or_create_user
    from services.promo import apply_promo

    user = await get_or_create_user(1, "x")
    new, p, ok = await apply_promo("WRONG", 1000, user["id"])
    assert ok is False
    assert new == 1000


async def test_promo_expired(tmp_db):
    from database.models import create_promo_code, get_or_create_user
    from services.promo import apply_promo

    user = await get_or_create_user(1, "x")
    await create_promo_code("EXPIRED", 50, valid_until=1)  # 1970
    new, p, ok = await apply_promo("EXPIRED", 1000, user["id"])
    assert ok is False
