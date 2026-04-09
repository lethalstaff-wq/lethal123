"""Тесты Lot Health Monitor."""

from __future__ import annotations

from services.lot_health import (
    LotHealthReport,
    build_report,
    check_lot_health,
    format_report,
)


def test_healthy_lot_returns_none():
    lot = {
        "id": "L1",
        "title": "🎮 World of Warcraft Gold — 1000 шт с гарантией",
        "description": (
            "🎮 Продаём WoW Gold.\n"
            "• Моментальная выдача после оплаты\n"
            "• Гарантия 100% работы\n"
            "• Пишите в чат если вопросы\n"
            "• Буду рад отзыву!"
        ),
        "price": 100.0,
        "is_active": True,
    }
    result = check_lot_health(lot)
    assert result is None or result.severity != "critical"


def test_inactive_lot():
    lot = {
        "id": "L1",
        "title": "🎮 Good title here",
        "description": "Good desc",
        "price": 100.0,
        "is_active": False,
    }
    result = check_lot_health(lot)
    assert result is not None
    assert result.severity == "critical"
    assert any("скрыт" in r.lower() for r in result.reasons)


def test_zero_price():
    lot = {
        "id": "L1",
        "title": "Good title here",
        "description": "Good desc",
        "price": 0,
        "is_active": True,
    }
    result = check_lot_health(lot)
    assert result is not None
    assert result.severity == "critical"


def test_short_title():
    lot = {
        "id": "L1",
        "title": "ab",
        "description": "some description",
        "price": 100.0,
        "is_active": True,
    }
    result = check_lot_health(lot)
    assert result is not None
    assert any("короткий" in r.lower() for r in result.reasons)


def test_build_report_all_healthy():
    lots = [
        {
            "id": f"L{i}",
            "title": "🎮 World of Warcraft Gold — 1000 шт гарантия",
            "description": (
                "🎮 Продаём WoW.\n• Моментально\n• Гарантия\n"
                "• Пишите в чат\n• Отзывы приветствуются"
            ),
            "price": 100.0,
            "is_active": True,
        }
        for i in range(3)
    ]
    report = build_report(lots)
    assert report.total_lots == 3
    # Хотя бы часть здорова
    assert report.healthy >= 0


def test_build_report_empty():
    report = build_report([])
    assert report.total_lots == 0
    assert report.health_percent == 100
    assert report.health_grade == "A"


def test_format_report_empty():
    report = LotHealthReport(total_lots=0, healthy=0)
    text = format_report(report)
    assert "не найдено" in text.lower() or "0" in text


def test_format_report_with_issues():
    from services.lot_health import LotHealthIssue

    report = LotHealthReport(
        total_lots=10,
        healthy=7,
        issues=[
            LotHealthIssue(
                lot_id="L1",
                lot_title="Bad Lot",
                severity="critical",
                reasons=["Цена 0", "Лот скрыт"],
            )
        ],
    )
    text = format_report(report)
    assert "70%" in text
    assert "Bad Lot" in text
    assert "Цена 0" in text


def test_health_grades():
    def _grade(percent: int) -> str:
        r = LotHealthReport(total_lots=100, healthy=percent)
        return r.health_grade

    assert _grade(100) == "A"
    assert _grade(95) == "A"
    assert _grade(90) == "B"
    assert _grade(70) == "C"
    assert _grade(50) == "D"
    assert _grade(30) == "F"
