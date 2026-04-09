"""Тесты price tracker + lot templates."""

from __future__ import annotations

import pytest

pytestmark = pytest.mark.asyncio


async def _ensure(tmp_db):
    from migrations import upgrade

    await upgrade()


async def test_record_snapshot(tmp_db):
    await _ensure(tmp_db)
    from database.models import get_or_create_user
    from database.models_price import get_lot_history, record_snapshot

    u = await get_or_create_user(1, "seller")
    await record_snapshot(u["id"], None, "L1", "Lot 1", 500.0, "₽")
    await record_snapshot(u["id"], None, "L1", "Lot 1", 600.0, "₽")

    history = await get_lot_history(u["id"], "L1")
    assert len(history) == 2
    assert history[0]["price"] == 600  # DESC order


async def test_price_change_detection(tmp_db):
    await _ensure(tmp_db)
    import time

    from database.db import connect
    from database.models import get_or_create_user
    from database.models_price import get_lot_price_change, record_snapshot
    from utils.helpers import now_ts

    u = await get_or_create_user(1, "seller")

    # Старая цена — 8 дней назад
    async with connect() as db:
        await db.execute(
            """
            INSERT INTO lot_price_history
                (user_id, fp_account_id, lot_id, lot_title, price, snapshot_ts)
            VALUES (?, ?, ?, ?, ?, ?)
            """,
            (u["id"], None, "L1", "Lot", 500.0, now_ts() - 8 * 86400),
        )
        await db.commit()

    # Новая цена
    await record_snapshot(u["id"], None, "L1", "Lot", 600.0)

    change = await get_lot_price_change(u["id"], "L1", window_days=7)
    assert change is not None
    assert change["direction"] == "up"
    assert change["delta"] == 100
    assert change["pct"] == 20


async def test_detect_anomalies_empty(tmp_db):
    await _ensure(tmp_db)
    from database.models import get_or_create_user
    from database.models_price import detect_anomalies

    u = await get_or_create_user(1, "seller")
    anomalies = await detect_anomalies(u["id"])
    assert anomalies == []


async def test_template_crud(tmp_db):
    await _ensure(tmp_db)
    from database.models import get_or_create_user
    from database.models_price import (
        delete_template,
        get_template,
        list_templates,
        save_template,
    )

    u = await get_or_create_user(1, "seller")
    tid = await save_template(
        user_id=u["id"],
        name="WoW Gold",
        title_template="💰 WoW Gold {quantity} — мгновенная выдача",
        description_template="Продаю WoW Gold. Быстрая выдача.",
        game="World of Warcraft",
        item_type="currency",
        default_price=10.0,
    )
    assert tid > 0

    tpl = await get_template(tid, u["id"])
    assert tpl is not None
    assert tpl["name"] == "WoW Gold"

    templates = await list_templates(u["id"])
    assert len(templates) == 1

    await delete_template(tid, u["id"])
    templates = await list_templates(u["id"])
    assert len(templates) == 0


async def test_template_increment_use(tmp_db):
    await _ensure(tmp_db)
    from database.models import get_or_create_user
    from database.models_price import (
        get_template,
        increment_template_use,
        save_template,
    )

    u = await get_or_create_user(1, "seller")
    tid = await save_template(
        user_id=u["id"],
        name="T",
        title_template="Title",
        description_template="Desc",
    )
    await increment_template_use(tid)
    await increment_template_use(tid)
    tpl = await get_template(tid, u["id"])
    assert tpl["use_count"] == 2
