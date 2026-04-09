"""Тесты нативных Telegram Payments."""

from __future__ import annotations


def test_parse_payload_valid():
    from services.tg_payments import parse_payload

    assert parse_payload("sub:42:pro") == (42, "pro")
    assert parse_payload("sub:1:starter") == (1, "starter")


def test_parse_payload_invalid():
    from services.tg_payments import parse_payload

    assert parse_payload("") is None
    assert parse_payload("garbage") is None
    assert parse_payload("sub:abc:pro") is None
    assert parse_payload("sub:1") is None
    assert parse_payload("other:1:pro") is None


def test_is_native_payments_enabled_without_token(monkeypatch):
    monkeypatch.delenv("TG_PAYMENT_PROVIDER_TOKEN", raising=False)
    monkeypatch.delenv("TG_STARS_ENABLED", raising=False)
    # Re-import чтобы перечитать env
    import importlib

    import services.tg_payments as mod

    importlib.reload(mod)
    assert mod.is_native_payments_enabled() is False


def test_is_native_payments_enabled_with_token(monkeypatch):
    monkeypatch.setenv("TG_PAYMENT_PROVIDER_TOKEN", "12345:TEST:token")
    import importlib

    import services.tg_payments as mod

    importlib.reload(mod)
    assert mod.is_native_payments_enabled() is True


def test_stars_enabled(monkeypatch):
    monkeypatch.setenv("TG_STARS_ENABLED", "1")
    import importlib

    import services.tg_payments as mod

    importlib.reload(mod)
    assert mod.STARS_ENABLED is True
    assert mod.is_native_payments_enabled() is True
