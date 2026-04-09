"""Тесты детектора горячих лидов."""

from __future__ import annotations

from services.hot_leads import (
    LeadScore,
    lead_source_breakdown,
    score_message,
    should_alert,
)


def test_empty_text():
    score = score_message("")
    assert score.total == 0
    assert score.level == "cold"


def test_direct_buy():
    score = score_message("куплю этот лот")
    assert score.total >= 40
    assert score.level in ("hot", "warm")
    assert should_alert(score)


def test_beru():
    score = score_message("беру, сколько?")
    assert score.total >= 35


def test_how_much():
    score = score_message("how much?")
    assert score.total >= 20
    assert score.level == "cool"
    assert not should_alert(score)


def test_want_to_buy_english():
    score = score_message("i want to buy this lot asap")
    # 'want to buy' (35) — "cool", но при комбинации с чем-то ещё становится warm
    assert score.total >= 35
    assert score.level in ("cool", "warm", "hot")


def test_cold_message():
    score = score_message("привет, как жизнь?")
    assert score.level == "cold"
    assert not should_alert(score)


def test_combined_signals():
    # куплю + карта + срочно
    score = score_message("щас куплю, скину на карту сейчас")
    assert score.total >= 55
    assert score.level == "hot"


def test_level_thresholds():
    def at(total: int) -> str:
        s = LeadScore(total=total)
        return s.level

    assert at(0) == "cold"
    assert at(14) == "cold"
    assert at(15) == "cool"
    assert at(39) == "cool"
    assert at(40) == "warm"
    assert at(69) == "warm"
    assert at(70) == "hot"
    assert at(100) == "hot"


def test_score_capped():
    s = LeadScore(total=250)
    assert s.capped_total == 100


def test_lead_source_breakdown():
    breakdown = lead_source_breakdown(
        [("куплю", 40), ("беру", 35), ("куплю", 40)]
    )
    assert breakdown["куплю"] == 80
    assert breakdown["беру"] == 35
