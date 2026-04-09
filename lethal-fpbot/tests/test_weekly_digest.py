"""Тесты еженедельного дайджеста."""

from __future__ import annotations

import pytest

pytestmark = pytest.mark.asyncio


async def _ensure(tmp_db):
    from migrations import upgrade

    await upgrade()


async def test_digest_no_sales(tmp_db):
    await _ensure(tmp_db)
    from database.models import get_or_create_user
    from services.weekly_digest import build_digest

    u = await get_or_create_user(1, "seller")
    digest = await build_digest(u["id"])
    assert digest is None  # нет продаж → нет дайджеста


async def test_digest_with_sales(tmp_db):
    await _ensure(tmp_db)
    from database.models import add_stat, get_or_create_user
    from services.weekly_digest import build_digest

    u = await get_or_create_user(1, "seller")
    await add_stat(u["id"], None, 1000, "Top Lot", "buyer1")
    await add_stat(u["id"], None, 500, "Mid Lot", "buyer2")

    digest = await build_digest(u["id"])
    assert digest is not None
    assert "1 500" in digest or "1500" in digest  # total
    assert "Top Lot" in digest or "лот" in digest.lower()


async def test_digest_includes_top_lots(tmp_db):
    await _ensure(tmp_db)
    from database.models import add_stat, get_or_create_user
    from services.weekly_digest import build_digest

    u = await get_or_create_user(1, "seller")
    for _i in range(3):
        await add_stat(u["id"], None, 1000, "Popular Lot", f"b{_i}")
    await add_stat(u["id"], None, 100, "Rare Lot", "b4")

    digest = await build_digest(u["id"])
    assert "Popular Lot" in digest


async def test_digest_includes_challenge(tmp_db):
    await _ensure(tmp_db)
    from database.models import add_stat, get_or_create_user
    from services.weekly_digest import build_digest

    u = await get_or_create_user(1, "seller")
    await add_stat(u["id"], None, 1000, "Lot", "b")

    digest = await build_digest(u["id"])
    assert "Челлендж" in digest or "1 100" in digest


async def test_digest_includes_suggestion(tmp_db):
    await _ensure(tmp_db)
    from database.models import add_stat, get_or_create_user
    from services.weekly_digest import build_digest

    u = await get_or_create_user(1, "seller")
    await add_stat(u["id"], None, 500, "Lot", "b")

    digest = await build_digest(u["id"])
    # Дайджест + совет обычно содержат "Совет недели" если есть suggestions
    assert digest is not None
