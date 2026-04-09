"""Тесты bulk-загрузки."""

from __future__ import annotations

import pytest

from services.bulk import parse_csv

pytestmark = pytest.mark.asyncio


def test_parse_csv_basic():
    text = """title,price,currency,description
Steam Key,50,RUB,Случайный ключ
Game Coins,100,RUB,Игровая валюта
"""
    rows = parse_csv(text)
    assert len(rows) == 2
    assert rows[0]["title"] == "Steam Key"
    assert rows[0]["price"] == 50.0
    assert rows[0]["currency"] == "RUB"


def test_parse_csv_skips_empty_titles():
    text = """title,price
Valid,100
,50
,
"""
    rows = parse_csv(text)
    assert len(rows) == 1
    assert rows[0]["title"] == "Valid"


def test_parse_csv_invalid_price():
    text = """title,price
Item,not-a-number
"""
    rows = parse_csv(text)
    assert rows[0]["price"] == 0.0


async def test_import_lots(tmp_db):
    from database.models import (
        get_or_create_user,
        list_auto_delivery,
    )
    from services.bulk import import_lots_for_user

    user = await get_or_create_user(1, "x")
    rows = [
        {"title": "Lot A", "price": 100, "currency": "RUB", "description": ""},
        {"title": "Lot B", "price": 200, "currency": "RUB", "description": "desc"},
    ]
    count = await import_lots_for_user(user["id"], rows)
    assert count == 2
    rules = await list_auto_delivery(user["id"])
    assert len(rules) == 2
    assert {r["lot_name"] for r in rules} == {"Lot A", "Lot B"}
