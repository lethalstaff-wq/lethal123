"""A/B тестирование текстов автоответов / воронки / кросселла.

Использование:
    from services.ab_testing import pick_variant, record_conversion

    text, test_id, variant = await pick_variant(user_id, "funnel")
    # ... шлём text ...
    # Если покупатель купил после показа:
    await record_conversion(test_id, variant)
"""

from __future__ import annotations

import logging
import random

from database.models import increment_ab_variant, list_ab_tests

logger = logging.getLogger(__name__)


async def pick_variant(
    user_id: int, name: str
) -> tuple[str | None, int | None, str | None]:
    """Выбирает случайный вариант (a/b) активного теста по имени.

    Если активных тестов с таким именем нет — возвращает (None, None, None)
    и вызывающий код использует fallback-текст из настроек.
    """
    tests = await list_ab_tests(user_id)
    candidates = [
        t for t in tests if t.get("is_active") and t.get("name") == name
    ]
    if not candidates:
        return None, None, None
    test = random.choice(candidates)
    variant = random.choice(["a", "b"])
    text = test["variant_a"] if variant == "a" else test["variant_b"]
    await increment_ab_variant(test["id"], variant, conversion=False)
    return text, test["id"], variant


async def record_conversion(test_id: int, variant: str) -> None:
    """Помечает конверсию (например, после успешной покупки)."""
    await increment_ab_variant(test_id, variant, conversion=True)


def calc_winner(test: dict) -> dict:
    """Возвращает простую сводку: какой вариант лидирует и его конверсия."""
    a_used = test.get("a_used") or 0
    b_used = test.get("b_used") or 0
    a_conv = test.get("a_conversions") or 0
    b_conv = test.get("b_conversions") or 0
    a_rate = (a_conv / a_used) if a_used else 0
    b_rate = (b_conv / b_used) if b_used else 0
    winner = None
    if a_used and b_used:
        winner = "a" if a_rate > b_rate else ("b" if b_rate > a_rate else None)
    return {
        "a_rate": a_rate,
        "b_rate": b_rate,
        "winner": winner,
        "samples_total": a_used + b_used,
    }
