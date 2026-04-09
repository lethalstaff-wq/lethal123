"""Тесты CRM-модуля."""

from __future__ import annotations

import pytest

pytestmark = pytest.mark.asyncio


async def _apply_crm_migration(tmp_db) -> None:
    """Применяет миграцию CRM-таблиц вручную для теста."""
    import aiosqlite

    import config
    from migrations import _0006_crm as mig  # type: ignore

    async with aiosqlite.connect(config.DB_PATH) as db:
        await mig.up(db)
        await db.commit()


async def _ensure_crm_tables(tmp_db) -> None:
    # Сам tmp_db уже гонит init_db который создаёт базовые таблицы.
    # Но CRM-таблицы идут через миграцию — запускаем runner.
    from migrations import upgrade

    await upgrade()


async def test_create_customer(tmp_db):
    await _ensure_crm_tables(tmp_db)
    from database.models import get_or_create_user
    from database.models_crm import create_customer, get_customer

    u = await get_or_create_user(1, "seller")
    cid = await create_customer(u["id"], "buyer1")
    assert cid > 0

    customer = await get_customer(u["id"], "buyer1")
    assert customer is not None
    assert customer["fp_username"] == "buyer1"
    assert customer["segment"] == "new"


async def test_create_customer_idempotent(tmp_db):
    await _ensure_crm_tables(tmp_db)
    from database.models import get_or_create_user
    from database.models_crm import create_customer

    u = await get_or_create_user(1, "seller")
    cid1 = await create_customer(u["id"], "same")
    cid2 = await create_customer(u["id"], "same")
    assert cid1 == cid2


async def test_touch_customer_order_updates_metrics(tmp_db):
    await _ensure_crm_tables(tmp_db)
    from database.models import get_or_create_user
    from database.models_crm import get_customer, touch_customer

    u = await get_or_create_user(1, "seller")
    await touch_customer(
        user_id=u["id"], fp_username="alice", kind="order", amount=500
    )
    await touch_customer(
        user_id=u["id"], fp_username="alice", kind="order", amount=1500
    )

    c = await get_customer(u["id"], "alice")
    assert c["orders_count"] == 2
    assert c["total_spent"] == 2000
    assert abs(c["avg_order_value"] - 1000) < 0.01


async def test_segmentation_new_customer(tmp_db):
    await _ensure_crm_tables(tmp_db)
    from database.models import get_or_create_user
    from database.models_crm import get_customer, touch_customer

    u = await get_or_create_user(1, "seller")
    await touch_customer(u["id"], "newbie", kind="message_in")
    c = await get_customer(u["id"], "newbie")
    assert c["segment"] == "new"


async def test_segmentation_vip_customer(tmp_db):
    await _ensure_crm_tables(tmp_db)
    from database.models import get_or_create_user
    from database.models_crm import get_customer, touch_customer

    u = await get_or_create_user(1, "seller")
    # 5 заказов = VIP
    for _i in range(5):
        await touch_customer(
            u["id"], "bigspender", kind="order", amount=1200
        )
    c = await get_customer(u["id"], "bigspender")
    assert c["segment"] == "vip"
    assert c["orders_count"] == 5
    assert c["total_spent"] == 6000


async def test_segmentation_problematic(tmp_db):
    await _ensure_crm_tables(tmp_db)
    from database.models import get_or_create_user
    from database.models_crm import get_customer, touch_customer

    u = await get_or_create_user(1, "seller")
    # 1 заказ + 2 отрицательных отзыва = problematic
    await touch_customer(u["id"], "angrybuyer", kind="order", amount=500)
    await touch_customer(u["id"], "angrybuyer", kind="review_negative")
    await touch_customer(u["id"], "angrybuyer", kind="review_negative")

    c = await get_customer(u["id"], "angrybuyer")
    assert c["segment"] == "problematic"


async def test_tags_crud(tmp_db):
    await _ensure_crm_tables(tmp_db)
    from database.models import get_or_create_user
    from database.models_crm import (
        add_tag,
        create_customer,
        list_tags,
        remove_tag,
    )

    u = await get_or_create_user(1, "seller")
    cid = await create_customer(u["id"], "tagged")
    assert await add_tag(cid, "vip") is True
    assert await add_tag(cid, "важный") is True
    tags = await list_tags(cid)
    assert "vip" in tags
    assert "важный" in tags
    assert await remove_tag(cid, "vip") is True
    tags = await list_tags(cid)
    assert "vip" not in tags


async def test_notes_crud(tmp_db):
    await _ensure_crm_tables(tmp_db)
    from database.models import get_or_create_user
    from database.models_crm import (
        add_note,
        create_customer,
        delete_note,
        list_notes,
    )

    u = await get_or_create_user(1, "seller")
    cid = await create_customer(u["id"], "noted")
    note_id = await add_note(cid, "Любит торговаться")
    await add_note(cid, "Покупает на праздники")

    notes = await list_notes(cid)
    assert len(notes) == 2
    assert any("торговаться" in n["text"] for n in notes)

    await delete_note(note_id, cid)
    notes = await list_notes(cid)
    assert len(notes) == 1


async def test_interactions_log(tmp_db):
    await _ensure_crm_tables(tmp_db)
    from database.models import get_or_create_user
    from database.models_crm import (
        list_interactions,
        touch_customer,
    )

    u = await get_or_create_user(1, "seller")
    await touch_customer(u["id"], "bob", kind="message_in", details="привет")
    await touch_customer(u["id"], "bob", kind="order", amount=300)

    # Нужен id
    from database.models_crm import get_customer

    c = await get_customer(u["id"], "bob")
    events = await list_interactions(c["id"])
    assert len(events) == 2
    kinds = {e["kind"] for e in events}
    assert "message_in" in kinds
    assert "order" in kinds


async def test_search_customers(tmp_db):
    await _ensure_crm_tables(tmp_db)
    from database.models import get_or_create_user
    from database.models_crm import (
        create_customer,
        search_customers,
    )

    u = await get_or_create_user(1, "seller")
    await create_customer(u["id"], "alice_2024")
    await create_customer(u["id"], "bob_xx")
    await create_customer(u["id"], "charlie_2024")

    results = await search_customers(u["id"], "2024")
    assert len(results) == 2


async def test_crm_summary_empty(tmp_db):
    await _ensure_crm_tables(tmp_db)
    from database.models import get_or_create_user
    from database.models_crm import user_crm_summary

    u = await get_or_create_user(1, "seller")
    s = await user_crm_summary(u["id"])
    assert s["total"] == 0
    assert s["total_revenue"] == 0


async def test_crm_summary_with_data(tmp_db):
    await _ensure_crm_tables(tmp_db)
    from database.models import get_or_create_user
    from database.models_crm import touch_customer, user_crm_summary

    u = await get_or_create_user(1, "seller")
    await touch_customer(u["id"], "c1", kind="order", amount=500)
    await touch_customer(u["id"], "c2", kind="order", amount=1000)
    await touch_customer(u["id"], "c2", kind="order", amount=2000)  # repeat

    s = await user_crm_summary(u["id"])
    assert s["total"] == 2
    assert s["total_revenue"] == 3500
    assert s["repeat_buyers"] == 1
    assert s["repeat_rate"] == 50.0


async def test_count_by_segment(tmp_db):
    await _ensure_crm_tables(tmp_db)
    from database.models import get_or_create_user
    from database.models_crm import count_by_segment, touch_customer

    u = await get_or_create_user(1, "seller")
    await touch_customer(u["id"], "newcomer", kind="message_in")  # new
    await touch_customer(u["id"], "buyer", kind="order", amount=100)  # regular

    segs = await count_by_segment(u["id"])
    assert segs.get("new", 0) + segs.get("regular", 0) == 2
