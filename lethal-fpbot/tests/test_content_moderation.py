"""Тесты модерации исходящих сообщений."""

from __future__ import annotations

from services.content_moderation import check_outgoing, is_safe


def test_safe_text_passes():
    r = check_outgoing("Спасибо за покупку, удачи!")
    assert r.blocked is False
    assert r.risk_score == 0
    assert r.safe_text == r.original


def test_telegram_mention_blocked():
    r = check_outgoing("Напиши мне в телеграм @alice")
    assert r.blocked is True
    assert r.risk_score >= 60
    assert "telegram" not in r.safe_text.lower() or "[" in r.safe_text


def test_discord_blocked():
    r = check_outgoing("Я в дискорде, напиши туда")
    assert r.blocked is True


def test_whatsapp_blocked():
    r = check_outgoing("Whatsapp +79001234567")
    assert r.blocked is True


def test_phone_number_flagged():
    r = check_outgoing("Мой номер +79001234567")
    # только номер — middle risk
    assert r.risk_score >= 40


def test_t_me_link_blocked():
    r = check_outgoing("Заходи на t.me/mychannel")
    assert r.blocked is True


def test_external_url_flagged():
    r = check_outgoing("Подробнее на https://example.com/details")
    assert r.risk_score >= 60


def test_funpay_url_allowed():
    r = check_outgoing("Смотри https://funpay.com/users/123")
    assert r.blocked is False


def test_soft_replacements():
    r = check_outgoing("Ты лох, не умеешь читать")
    assert "уважаемый" in r.safe_text
    assert "лох" not in r.safe_text


def test_is_safe_helper():
    assert is_safe("hello world")
    assert not is_safe("telegram @hacker")


def test_safe_text_replaces():
    r = check_outgoing("Напиши мне в telegram")
    assert "[внешний мессенджер]" in r.safe_text
