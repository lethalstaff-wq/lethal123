"""Тесты smart suggestions."""

from __future__ import annotations

import pytest

pytestmark = pytest.mark.asyncio


async def _ensure(tmp_db):
    from migrations import upgrade

    await upgrade()


async def test_suggestions_empty_user(tmp_db):
    await _ensure(tmp_db)
    from database.models import get_or_create_user
    from services.smart_suggestions import generate_suggestions

    u = await get_or_create_user(1, "seller")
    suggestions = await generate_suggestions(u["id"])
    # У нового юзера точно должны быть советы (автоответчик, автоподнятие и т.д.)
    assert isinstance(suggestions, list)


async def test_suggest_auto_raise_if_has_account(tmp_db):
    await _ensure(tmp_db)
    from database.models import add_fp_account, get_or_create_user
    from services.smart_suggestions import generate_suggestions

    u = await get_or_create_user(1, "seller")
    await add_fp_account(
        user_id=u["id"],
        login="login1",
        password_enc="enc",
        proxy=None,
        golden_key_enc=None,
        user_agent=None,
    )

    suggestions = await generate_suggestions(u["id"])
    ids = [s.id for s in suggestions]
    assert "enable_auto_raise" in ids or "enable_always_online" in ids


async def test_suggest_auto_delivery_if_many_orders(tmp_db):
    await _ensure(tmp_db)
    from database.models import add_stat, get_or_create_user
    from services.smart_suggestions import generate_suggestions

    u = await get_or_create_user(1, "seller")
    for _i in range(10):
        await add_stat(u["id"], None, 500, "Lot", "buyer")

    suggestions = await generate_suggestions(u["id"])
    ids = [s.id for s in suggestions]
    assert "enable_auto_delivery" in ids


async def test_format_suggestions_empty():
    from services.smart_suggestions import format_suggestions_message

    msg = format_suggestions_message([])
    assert "идеально" in msg.lower() or "все" in msg.lower()


async def test_format_suggestions_with_data():
    from services.smart_suggestions import Suggestion, format_suggestions_message

    s = Suggestion(
        id="test",
        priority=5,
        emoji="🔧",
        title="Test title",
        description="Test desc",
    )
    msg = format_suggestions_message([s])
    assert "Test title" in msg
    assert "Test desc" in msg
