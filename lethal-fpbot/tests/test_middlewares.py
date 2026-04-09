"""Тесты helper'а проверки тарифа."""

from __future__ import annotations

from bot.middlewares.subscription import has_tier
from config import TIER_PRO, TIER_STANDARD, TIER_STARTER
from utils.helpers import now_ts


def _user(tier=None, expires=None):
    return {
        "subscription_tier": tier,
        "subscription_expires": expires,
    }


def test_no_tier():
    assert has_tier(_user(), TIER_STARTER) is False
    assert has_tier(_user(), TIER_PRO) is False


def test_starter_user():
    u = _user(TIER_STARTER, now_ts() + 3600)
    assert has_tier(u, TIER_STARTER) is True
    assert has_tier(u, TIER_STANDARD) is False
    assert has_tier(u, TIER_PRO) is False


def test_pro_user_can_use_anything():
    u = _user(TIER_PRO, now_ts() + 3600)
    assert has_tier(u, TIER_STARTER) is True
    assert has_tier(u, TIER_STANDARD) is True
    assert has_tier(u, TIER_PRO) is True


def test_expired_subscription():
    u = _user(TIER_PRO, now_ts() - 1)
    assert has_tier(u, TIER_STARTER) is False
    assert has_tier(u, TIER_PRO) is False


def test_standard_user():
    u = _user(TIER_STANDARD, now_ts() + 100)
    assert has_tier(u, TIER_STARTER) is True
    assert has_tier(u, TIER_STANDARD) is True
    assert has_tier(u, TIER_PRO) is False
