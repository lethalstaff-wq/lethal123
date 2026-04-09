"""Тесты rich order notifier."""

from __future__ import annotations

from services.order_notifier import (
    _buyer_trust_badge,
    _lot_emoji,
)


def test_lot_emoji_gold():
    assert _lot_emoji("World of Warcraft Gold") == "💰"


def test_lot_emoji_account():
    assert _lot_emoji("Steam account Global Elite") == "🎮"


def test_lot_emoji_key():
    assert _lot_emoji("Random Steam key") == "🔑"


def test_lot_emoji_boost():
    assert _lot_emoji("CS2 boost rank") == "🚀"


def test_lot_emoji_generic():
    assert _lot_emoji("что-то странное") == "📦"


def test_buyer_trust_new():
    assert _buyer_trust_badge(None) == "🆕"
    assert _buyer_trust_badge({"orders_count": 0, "reviews_negative": 0}) == "🆕"


def test_buyer_trust_regular():
    assert _buyer_trust_badge({"orders_count": 2, "reviews_negative": 0}) == "👤"


def test_buyer_trust_vip():
    assert _buyer_trust_badge({"orders_count": 5, "reviews_negative": 0}) == "💎"


def test_buyer_trust_problematic():
    assert _buyer_trust_badge({"orders_count": 1, "reviews_negative": 2}) == "🚫"
