"""Интеграционные тесты CRUD на временной SQLite."""

from __future__ import annotations

import pytest

pytestmark = pytest.mark.asyncio


async def test_user_create_idempotent(tmp_db):
    from database.models import get_or_create_user

    u1 = await get_or_create_user(123, "alice")
    u2 = await get_or_create_user(123, "alice")
    assert u1["id"] == u2["id"]
    assert u1["referral_code"]


async def test_username_updates(tmp_db):
    from database.models import get_or_create_user

    u1 = await get_or_create_user(123, "alice")
    u2 = await get_or_create_user(123, "bob")
    assert u1["id"] == u2["id"]
    assert u2["username"] == "bob"


async def test_settings_default(tmp_db):
    from database.models import get_or_create_user, get_settings

    u = await get_or_create_user(1, "x")
    s = await get_settings(u["id"])
    assert s["auto_raise"] == 0
    assert s["raise_interval"] == 240


async def test_settings_update(tmp_db):
    from database.models import get_or_create_user, get_settings, update_setting

    u = await get_or_create_user(1, "x")
    await update_setting(u["id"], "auto_raise", 1)
    s = await get_settings(u["id"])
    assert s["auto_raise"] == 1


async def test_settings_invalid_field(tmp_db):
    from database.models import get_or_create_user, update_setting

    u = await get_or_create_user(1, "x")
    with pytest.raises(ValueError):
        await update_setting(u["id"], "DROP TABLE users", 1)


async def test_auto_response_crud(tmp_db):
    from database.models import (
        add_auto_response,
        delete_auto_response,
        find_matching_response,
        get_or_create_user,
        list_auto_responses,
    )

    u = await get_or_create_user(1, "x")
    rid = await add_auto_response(u["id"], ["привет", "hi"], "Здарова!")
    rules = await list_auto_responses(u["id"])
    assert len(rules) == 1
    assert rules[0]["trigger_words"] == ["привет", "hi"]

    # Match
    assert await find_matching_response(u["id"], "Привет, как дела?") == "Здарова!"
    assert await find_matching_response(u["id"], "HI bro") == "Здарова!"
    assert await find_matching_response(u["id"], "ничего общего") is None

    # Delete
    assert await delete_auto_response(rid, u["id"]) is True
    assert await list_auto_responses(u["id"]) == []


async def test_auto_delivery_pop(tmp_db):
    from database.models import (
        add_auto_delivery,
        get_or_create_user,
        list_auto_delivery,
        pop_auto_delivery_item,
    )

    u = await get_or_create_user(1, "x")
    rid = await add_auto_delivery(
        user_id=u["id"],
        fp_account_id=None,
        lot_name="Steam Random Key",
        items=["KEY1", "KEY2", "KEY3"],
        template=None,
    )

    assert await pop_auto_delivery_item(rid) == "KEY1"
    assert await pop_auto_delivery_item(rid) == "KEY2"
    rules = await list_auto_delivery(u["id"])
    assert rules[0]["items"] == ["KEY3"]
    assert await pop_auto_delivery_item(rid) == "KEY3"
    assert await pop_auto_delivery_item(rid) is None


async def test_find_delivery_for_lot(tmp_db):
    from database.models import (
        add_auto_delivery,
        find_delivery_for_lot,
        get_or_create_user,
    )

    u = await get_or_create_user(1, "x")
    await add_auto_delivery(
        user_id=u["id"],
        fp_account_id=None,
        lot_name="Steam Random",
        items=["a"],
        template=None,
    )
    found = await find_delivery_for_lot(u["id"], "Steam Random Key — Premium")
    assert found is not None
    assert found["lot_name"] == "Steam Random"
    assert await find_delivery_for_lot(u["id"], "Other lot") is None


async def test_blacklist(tmp_db):
    from database.models import (
        add_to_blacklist,
        get_or_create_user,
        is_blacklisted,
    )

    u = await get_or_create_user(1, "x")
    await add_to_blacklist(u["id"], "scammer", "tried fraud")
    assert await is_blacklisted(u["id"], "scammer") is True
    assert await is_blacklisted(u["id"], "good_guy") is False


async def test_stats_summary(tmp_db):
    from database.models import add_stat, get_or_create_user, stats_summary
    from utils.helpers import now_ts

    u = await get_or_create_user(1, "x")
    await add_stat(u["id"], None, 100, "Lot A", "buyer1")
    await add_stat(u["id"], None, 250, "Lot A", "buyer2")
    await add_stat(u["id"], None, 50, "Lot B", "buyer3")

    summary = await stats_summary(u["id"], 0)
    assert summary["count"] == 3
    assert summary["total"] == 400


async def test_orders_seen_idempotent(tmp_db):
    from database.models import (
        add_fp_account,
        get_or_create_user,
        upsert_order,
    )

    u = await get_or_create_user(1, "x")
    acc_id = await add_fp_account(
        user_id=u["id"],
        login="acc",
        password_enc="enc",
        proxy=None,
        golden_key_enc=None,
        user_agent=None,
    )

    is_new1, _ = await upsert_order(acc_id, "ORD-1", "paid", "buyer", 100.0, "Lot")
    is_new2, _ = await upsert_order(acc_id, "ORD-1", "closed", "buyer", 100.0, "Lot")
    assert is_new1 is True
    assert is_new2 is False


async def test_pending_payment_flow(tmp_db):
    from database.models import (
        create_payment,
        get_or_create_user,
        list_pending_payments,
        set_payment_status,
    )

    u = await get_or_create_user(1, "x")
    pid = await create_payment(u["id"], "pro", 1500)
    pending = await list_pending_payments()
    assert len(pending) == 1
    assert pending[0]["id"] == pid

    row = await set_payment_status(pid, "approved", "ok")
    assert row["status"] == "approved"
    assert await list_pending_payments() == []
