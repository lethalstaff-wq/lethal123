"""Тесты Lot Quality Scorer."""

from __future__ import annotations

from services.lot_quality import analyze_description, analyze_lot, analyze_title


def test_analyze_empty_title():
    s = analyze_title("")
    assert s.total < 100
    assert any("отсутствует" in tip.lower() for tip, _ in s.tips)


def test_analyze_good_title():
    s = analyze_title("🔥 Steam Random Premium Key — 2024 🎮")
    assert s.total >= 90
    assert "эмодзи" in " ".join(s.wins).lower() or any(
        "эмодзи" in w.lower() for w in s.wins
    )


def test_analyze_caps_title():
    s = analyze_title("ALL CAPS TITLE HERE LOUD")
    assert any("капс" in tip.lower() for tip, _ in s.tips)


def test_analyze_short_title():
    s = analyze_title("Key")
    assert s.total < 90
    assert any("короткое" in tip.lower() for tip, _ in s.tips)


def test_analyze_long_title():
    s = analyze_title("A" * 200)
    assert any("длинное" in tip.lower() for tip, _ in s.tips)


def test_analyze_empty_description():
    s = analyze_description("")
    assert s.total <= 70


def test_analyze_good_description():
    desc = (
        "Здравствуйте!\n"
        "• Вы получаете ключ моментально после оплаты\n"
        "• Гарантия 100% работоспособности\n"
        "• По вопросам — пишите, помогу\n"
        "• Буду рад вашему отзыву!"
    )
    s = analyze_description(desc)
    assert s.total >= 70
    assert len(s.wins) >= 3


def test_analyze_short_description():
    s = analyze_description("Ключ")
    assert any("короткое" in tip.lower() for tip, _ in s.tips)


def test_analyze_lot_full():
    result = analyze_lot(
        title="🎮 Steam Key — 2024",
        description="• Моментальная выдача\n• Гарантия\n• Вопросы — пишите\n• Отзыв приветствуется!",
        price=100.0,
    )
    assert "total" in result
    assert "grade" in result
    assert result["grade"] in {"A", "B", "C", "D", "F"}


def test_analyze_lot_non_round_price():
    result = analyze_lot(
        title="Lot",
        description="desc",
        price=100.50,
    )
    assert any("округли" in tip.lower() or "ровного" in tip.lower() for tip, _ in result["tips"])


def test_analyze_lot_total_in_range():
    result = analyze_lot(title="🎮 Test", description="Description text", price=100)
    assert 0 <= result["total"] <= 100
