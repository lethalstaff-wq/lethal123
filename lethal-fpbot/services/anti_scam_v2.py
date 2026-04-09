"""Продвинутый антискам — scoring 0-100 по множеству сигналов.

Факторы (каждый даёт от 0 до N очков «подозрительности»):

  • registered_today:         +30
  • registered_this_week:     +15
  • zero_reviews:             +25
  • less_than_3_reviews:      +10
  • has_negative_reviews:     +15 (если >30% отрицательных)
  • high_refund_rate:         +20 (>50% refund'ов)
  • no_purchases:             +10
  • suspicious_username_pattern: +10 (user0001, asdfgh)
  • ip_proxy_match_other_user: +15 (если доступно)
  • asks_for_contact_outside:  +20 (через регулярки в сообщении)
  • urgency_pressure:          +10 («срочно», «прямо сейчас»)
  • price_negotiation_abuse:   +5

Score 0-30 = зелёный (ok), 30-60 = жёлтый (warn), 60+ = красный (block).
Бот решает что делать: зелёный = игнорируем, жёлтый = alert в ТГ,
красный = alert + авто-блок (если включено).
"""

from __future__ import annotations

import logging
import re
import time
from dataclasses import dataclass, field
from typing import Any

logger = logging.getLogger(__name__)


@dataclass
class ScamScore:
    total: int = 0
    signals: list[tuple[str, int, str]] = field(default_factory=list)

    def add(self, name: str, weight: int, note: str = "") -> None:
        self.total += weight
        self.signals.append((name, weight, note))

    @property
    def level(self) -> str:
        if self.total >= 60:
            return "red"
        if self.total >= 30:
            return "yellow"
        return "green"

    @property
    def color_emoji(self) -> str:
        return {"green": "🟢", "yellow": "🟡", "red": "🔴"}[self.level]


# ------------------------- эвристики по тексту -----------------------------

_CONTACT_OUTSIDE = re.compile(
    r"(telegram|тг|телег|discord|дискорд|whatsapp|viber|@\w+|\+?\d{10,})",
    re.IGNORECASE,
)
_URGENCY = re.compile(
    r"\b(срочно|прямо сейчас|asap|немедлен|как можно быстрее)\b",
    re.IGNORECASE,
)
_AGGRESSIVE_NEGOTIATION = re.compile(
    r"(скидк[а-я]+\s+50|дай\s+за|давай\s+дешевле|последняя\s+цена)",
    re.IGNORECASE,
)
_SUSPICIOUS_USERNAME = re.compile(r"^(user|buyer|test|noob)\d{3,}$", re.IGNORECASE)


def score_from_profile(profile: dict[str, Any] | None) -> ScamScore:
    """Анализ FP-профиля покупателя."""
    score = ScamScore()
    if not profile:
        return score

    # Дата регистрации
    reg_text = (profile.get("registered_text") or "").lower()
    if any(kw in reg_text for kw in ("сегодня", "today", "вчера", "yesterday")):
        score.add("registered_recent", 30, reg_text)
    elif "недел" in reg_text or "week" in reg_text:
        score.add("registered_this_week", 15, reg_text)

    # Отзывы
    reviews = int(profile.get("reviews_count") or 0)
    if reviews == 0:
        score.add("zero_reviews", 25, f"reviews={reviews}")
    elif reviews < 3:
        score.add("less_than_3_reviews", 10, f"reviews={reviews}")

    # Покупки
    purchases = int(profile.get("purchases_count") or 0)
    if purchases == 0:
        score.add("no_purchases", 10, f"purchases={purchases}")

    # Подозрительный ник
    username = profile.get("username") or ""
    if _SUSPICIOUS_USERNAME.match(username):
        score.add("suspicious_username_pattern", 10, username)

    return score


def score_from_message(text: str) -> ScamScore:
    """Анализ текста сообщения покупателя."""
    score = ScamScore()
    if not text:
        return score

    if _CONTACT_OUTSIDE.search(text):
        score.add("asks_contact_outside", 20, "matched pattern")
    if _URGENCY.search(text):
        score.add("urgency_pressure", 10, "matched pattern")
    if _AGGRESSIVE_NEGOTIATION.search(text):
        score.add("price_negotiation_abuse", 5, "matched pattern")

    return score


def combine(*scores: ScamScore) -> ScamScore:
    """Объединяет несколько ScamScore в один — total суммируется."""
    out = ScamScore()
    for s in scores:
        out.total += s.total
        out.signals.extend(s.signals)
    return out


def format_alert(score: ScamScore, buyer: str) -> str:
    header = {
        "green": "✅ Антискам: всё чисто",
        "yellow": "🟡 Антискам: будь внимателен",
        "red": "🔴 <b>Антискам: высокий риск</b>",
    }[score.level]

    lines = [
        header,
        f"Покупатель: <b>{buyer}</b>",
        f"Scam-score: <b>{score.total}/100</b> {score.color_emoji}",
        "",
        "<b>Сигналы:</b>",
    ]
    for name, weight, note in score.signals:
        lines.append(f"• +{weight} {name}: {note}")
    return "\n".join(lines)


# ------------------------- кэш результатов ---------------------------------

_cache: dict[str, tuple[ScamScore, float]] = {}
_TTL = 300  # 5 минут


def cached_score(username: str, score: ScamScore) -> None:
    _cache[username] = (score, time.time() + _TTL)


def get_cached_score(username: str) -> ScamScore | None:
    item = _cache.get(username)
    if not item:
        return None
    score, expires = item
    if expires < time.time():
        _cache.pop(username, None)
        return None
    return score
