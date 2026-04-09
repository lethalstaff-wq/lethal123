"""Тесты экспорта статистики."""

from __future__ import annotations

import json

import pytest

pytestmark = pytest.mark.asyncio


async def _ensure(tmp_db):
    from migrations import upgrade

    await upgrade()


async def test_csv_empty(tmp_db):
    await _ensure(tmp_db)
    from database.models import get_or_create_user
    from services.stats_exporter import export_stats_csv

    u = await get_or_create_user(1, "x")
    data = await export_stats_csv(u["id"], 0, 9999999999)
    text = data.decode("utf-8-sig")
    # Только заголовок
    assert "timestamp" in text
    assert "lot_name" in text
    lines = [line for line in text.split("\n") if line.strip()]
    assert len(lines) == 1


async def test_csv_with_data(tmp_db):
    await _ensure(tmp_db)
    from database.models import add_stat, get_or_create_user
    from services.stats_exporter import export_stats_csv

    u = await get_or_create_user(1, "x")
    await add_stat(u["id"], None, 100, "Lot A", "buyer1")
    await add_stat(u["id"], None, 200, "Lot B", "buyer2")

    data = await export_stats_csv(u["id"], 0, 9999999999)
    text = data.decode("utf-8-sig")
    assert "Lot A" in text
    assert "Lot B" in text
    assert "buyer1" in text


async def test_customers_csv_empty(tmp_db):
    await _ensure(tmp_db)
    from database.models import get_or_create_user
    from services.stats_exporter import export_customers_csv

    u = await get_or_create_user(1, "x")
    data = await export_customers_csv(u["id"])
    text = data.decode("utf-8-sig")
    assert "fp_username" in text
    assert "segment" in text


async def test_customers_csv_with_data(tmp_db):
    await _ensure(tmp_db)
    from database.models import get_or_create_user
    from database.models_crm import touch_customer
    from services.stats_exporter import export_customers_csv

    u = await get_or_create_user(1, "x")
    await touch_customer(u["id"], "alice", kind="order", amount=500)
    await touch_customer(u["id"], "bob", kind="message_in")

    data = await export_customers_csv(u["id"])
    text = data.decode("utf-8-sig")
    assert "alice" in text
    assert "bob" in text
    assert "500" in text


async def test_json_export(tmp_db):
    await _ensure(tmp_db)
    from database.models import add_stat, get_or_create_user
    from services.stats_exporter import export_all_json

    u = await get_or_create_user(1, "x")
    await add_stat(u["id"], None, 100, "Lot", "buyer")

    data = await export_all_json(u["id"])
    parsed = json.loads(data)
    assert "stats" in parsed
    assert "customers" in parsed
    assert "settings" in parsed
    assert parsed["user_id"] == u["id"]
    assert len(parsed["stats"]) == 1


async def test_tax_report(tmp_db):
    await _ensure(tmp_db)
    from database.models import add_stat, get_or_create_user
    from services.stats_exporter import generate_tax_report

    u = await get_or_create_user(1, "x")
    await add_stat(u["id"], None, 1000, "A", "buyer")
    await add_stat(u["id"], None, 2000, "B", "buyer")

    data = await generate_tax_report(u["id"], 0, 9999999999)
    text = data.decode("utf-8")
    assert "ОТЧЁТ" in text
    assert "ИТОГО" in text
    # 1000 + 2000 = 3000
    assert "3" in text and "000" in text
