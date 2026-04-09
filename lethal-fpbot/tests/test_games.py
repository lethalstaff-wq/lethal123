"""Тесты каталога игр и матчеров."""

from __future__ import annotations

from games import GAMES, GAMES_BY_ID, GAMES_BY_NAME
from games.matchers import (
    detect_game_from_lot,
    detect_lot_type,
    extract_amount_from_lot,
    find_game_by_alias,
    find_game_by_name,
    list_categories,
    list_games_by_category,
)


def test_catalog_indexes_match():
    assert len(GAMES_BY_ID) == len(GAMES)
    assert len(GAMES_BY_NAME) == len(GAMES)
    for g in GAMES:
        assert GAMES_BY_ID[g["id"]] is g


def test_find_by_name():
    assert find_game_by_name("Counter-Strike 2")["id"] == "csgo"
    assert find_game_by_name("counter-strike 2")["id"] == "csgo"
    assert find_game_by_name("nonexistent") is None
    assert find_game_by_name("") is None


def test_find_by_alias_picks_longest():
    # 'world of warcraft' длиннее чем 'wow' — должен взять wow по id
    g = find_game_by_alias("Покупаю World of Warcraft Gold")
    assert g["id"] == "wow"

    g2 = find_game_by_alias("CS2 skins for sale")
    assert g2["id"] == "csgo"


def test_detect_game_from_lot_chain():
    # Прямое имя
    assert detect_game_from_lot("Dota 2")["id"] == "dota2"
    # Через алиас
    assert detect_game_from_lot("дота 2 mmr boost")["id"] == "dota2"
    assert detect_game_from_lot("random alien game") is None


def test_categories_present():
    cats = list_categories()
    assert "shooter" in cats
    assert "mmo" in cats
    assert "mobile" in cats


def test_games_by_category():
    shooters = list_games_by_category("shooter")
    assert all(g["category"] == "shooter" for g in shooters)
    assert any(g["id"] == "csgo" for g in shooters)


def test_extract_amount():
    assert extract_amount_from_lot("1000 голд") == 1000
    assert extract_amount_from_lot("5к gold") == 5000
    assert extract_amount_from_lot("2.5кк") == 2500000
    assert extract_amount_from_lot("no numbers here") is None


def test_detect_lot_type():
    assert detect_lot_type("Steam Random Key") == "key"
    assert detect_lot_type("WoW gold 100k") == "currency"
    assert detect_lot_type("GTA V Modded Account") == "account"
    assert detect_lot_type("CS2 leveling boost") == "boost"
    assert detect_lot_type("какая-то фигня") == "unknown"
