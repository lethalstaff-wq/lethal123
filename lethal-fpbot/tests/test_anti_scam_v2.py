"""Тесты продвинутого антискама."""

from __future__ import annotations

from services.anti_scam_v2 import (
    ScamScore,
    combine,
    score_from_message,
    score_from_profile,
)


def test_empty_profile_is_green():
    score = score_from_profile(None)
    assert score.total == 0
    assert score.level == "green"


def test_fresh_account_no_reviews():
    score = score_from_profile(
        {
            "username": "noobnewbie",
            "reviews_count": 0,
            "registered_text": "сегодня",
            "purchases_count": 0,
        }
    )
    assert score.total >= 55  # зарег сегодня + нет отзывов + нет покупок
    assert score.level == "red"


def test_suspicious_username():
    score = score_from_profile(
        {
            "username": "user12345",
            "reviews_count": 5,
            "registered_text": "год назад",
        }
    )
    assert any(s[0] == "suspicious_username_pattern" for s in score.signals)


def test_contact_outside():
    score = score_from_message("Напиши мне в telegram @alice")
    assert score.total == 20
    assert any("contact_outside" in s[0] for s in score.signals)


def test_urgency():
    score = score_from_message("Срочно нужно, прямо сейчас!")
    assert score.total >= 10


def test_multiple_signals_in_message():
    score = score_from_message("Срочно! Напиши в telegram @me")
    assert score.total >= 30  # urgency 10 + contact 20


def test_combine_scores():
    profile = score_from_profile({"reviews_count": 0, "registered_text": "вчера"})
    message = score_from_message("telegram @alice")
    combined = combine(profile, message)
    assert combined.total == profile.total + message.total


def test_score_levels():
    def make(total: int) -> ScamScore:
        s = ScamScore()
        s.total = total
        return s

    assert make(0).level == "green"
    assert make(29).level == "green"
    assert make(30).level == "yellow"
    assert make(59).level == "yellow"
    assert make(60).level == "red"
    assert make(100).level == "red"


def test_emoji_per_level():
    def with_level(total: int) -> str:
        s = ScamScore()
        s.total = total
        return s.color_emoji

    assert with_level(10) == "🟢"
    assert with_level(50) == "🟡"
    assert with_level(80) == "🔴"
