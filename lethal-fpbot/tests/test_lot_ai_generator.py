"""Тесты AI-генератора описаний лотов."""

from __future__ import annotations

import pytest

pytestmark = pytest.mark.asyncio


def test_fallback_currency():
    from services.lot_ai_generator import (
        LotGenRequest,
        _fallback_generate,
    )

    req = LotGenRequest(
        game="World of Warcraft",
        item_type="currency",
        quantity="1000 Gold",
        price=500.0,
        features=["мгновенная выдача", "гарантия"],
    )
    result = _fallback_generate(req)
    assert result is not None
    assert "World of Warcraft" in result.title
    assert "1000 Gold" in result.title or "1000 Gold" in result.description
    assert result.quality_score > 0


def test_fallback_account():
    from services.lot_ai_generator import (
        LotGenRequest,
        _fallback_generate,
    )

    req = LotGenRequest(game="CS2", item_type="account", quantity="Global Elite")
    result = _fallback_generate(req)
    assert result is not None
    assert "CS2" in result.title
    assert "🎮" in result.title  # emoji для account


def test_fallback_key():
    from services.lot_ai_generator import LotGenRequest, _fallback_generate

    req = LotGenRequest(game="Steam", item_type="key", quantity="Random")
    result = _fallback_generate(req)
    assert result is not None
    assert "🔑" in result.title


def test_parse_json_response_code_fence():
    from services.lot_ai_generator import _parse_json_response

    text = '```json\n{"title": "Test", "description": "Desc"}\n```'
    parsed = _parse_json_response(text)
    assert parsed is not None
    assert parsed["title"] == "Test"


def test_parse_json_response_plain():
    from services.lot_ai_generator import _parse_json_response

    text = 'Here: {"title": "Test"}'
    parsed = _parse_json_response(text)
    assert parsed is not None


def test_parse_json_response_invalid():
    from services.lot_ai_generator import _parse_json_response

    assert _parse_json_response("") is None
    assert _parse_json_response("no json here") is None


async def test_generate_lot_without_api(monkeypatch):
    """Без ANTHROPIC_API_KEY должна сработать fallback генерация."""
    monkeypatch.delenv("ANTHROPIC_API_KEY", raising=False)
    from services.lot_ai_generator import LotGenRequest, generate_lot

    req = LotGenRequest(game="Test", item_type="currency", quantity="100")
    result = await generate_lot(req)
    assert result is not None
    # Fallback дал результат
    assert result.title
    assert result.description
