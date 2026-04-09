"""Детектор «горячих лидов» — покупателей готовых купить прямо сейчас.

Анализирует текст сообщения и выдаёт score 0-100 «готовность к покупке».
Если score >= 70 — бот отправляет алёрт продавцу «🔥 ГОРЯЧИЙ ЛИД»
с рекомендацией ответить в течение 2-3 минут.

Фишка: обычный чат-watcher пересылает все сообщения, но hot_leads
выделяет среди них те что ведут к деньгам. В реальном SaaS-боте
это одна из самых ценных фич — повышает конверсию чата в продажу
на 30-50%.
"""

from __future__ import annotations

import logging
import re
from dataclasses import dataclass, field

logger = logging.getLogger(__name__)


# Паттерны с весами
_SIGNALS: list[tuple[re.Pattern, int, str]] = [
    # Прямое намерение купить
    (re.compile(r"\bкуплю\b", re.I), 40, "прямое 'куплю'"),
    (re.compile(r"\bпокупаю\b", re.I), 40, "прямое 'покупаю'"),
    (re.compile(r"\bбер[уё]\b", re.I), 35, "'беру'"),
    (re.compile(r"\bwant\s+to\s+buy\b", re.I), 35, "want to buy"),
    (re.compile(r"\bi\s+buy\b", re.I), 30, "i buy"),

    # Готовность платить
    (re.compile(r"готов\s+(купить|оплатить|заплатить)", re.I), 45, "готов купить"),
    (re.compile(r"ready\s+to\s+(buy|pay)", re.I), 45, "ready to buy/pay"),
    (re.compile(r"\bсколько\s+стоит\b", re.I), 20, "сколько стоит"),
    (re.compile(r"\bhow\s+much\b", re.I), 20, "how much"),
    (re.compile(r"\bцена\?*\s*$", re.I), 15, "'цена?' в конце"),

    # Вопросы по наличию
    (re.compile(r"\bесть\s+в\s+нали", re.I), 25, "есть в наличии"),
    (re.compile(r"\bin\s+stock\b", re.I), 25, "in stock"),
    (re.compile(r"\bсвобод[но]н\b", re.I), 15, "свободен/но"),

    # Срочность (положительная — не путать со scam urgency)
    (re.compile(r"\bсейчас\s+куплю\b", re.I), 35, "сейчас куплю"),
    (re.compile(r"\bщас\s+куплю\b", re.I), 35, "щас куплю"),

    # Торг (готовность к сделке)
    (re.compile(r"скидк[уи]\s+будет", re.I), 15, "скидку будет"),
    (re.compile(r"последн[яе][яе]\s+цена", re.I), 15, "последняя цена"),

    # Реквизиты/способ оплаты
    (re.compile(r"(карт|киви|qiwi|крипт|сбербанк|тинькофф|юmoney)", re.I), 20, "упомянул способ оплаты"),

    # Просит скинуть товар
    (re.compile(r"(скинь|отправ|send|отправляй)", re.I), 10, "просит отправить"),
]


@dataclass
class LeadScore:
    total: int = 0
    max_cap: int = 100
    matches: list[tuple[str, int]] = field(default_factory=list)

    @property
    def level(self) -> str:
        if self.total >= 70:
            return "hot"
        if self.total >= 40:
            return "warm"
        if self.total >= 15:
            return "cool"
        return "cold"

    @property
    def emoji(self) -> str:
        return {"hot": "🔥", "warm": "♨️", "cool": "❄️", "cold": "🧊"}[self.level]

    @property
    def capped_total(self) -> int:
        return min(self.total, self.max_cap)


def score_message(text: str) -> LeadScore:
    """Возвращает LeadScore для сообщения покупателя."""
    score = LeadScore()
    if not text:
        return score
    for pattern, weight, name in _SIGNALS:
        if pattern.search(text):
            score.total += weight
            score.matches.append((name, weight))
    return score


def should_alert(score: LeadScore) -> bool:
    """Нужно ли слать алерт продавцу."""
    return score.level in ("hot", "warm")


def format_alert(score: LeadScore, buyer: str, text: str, account_login: str) -> str:
    title = {
        "hot": "🔥 <b>ГОРЯЧИЙ ЛИД!</b>",
        "warm": "♨️ <b>Тёплый лид</b>",
    }.get(score.level, "Лид")

    lines = [
        title,
        f"<b>[{account_login}]</b>",
        f"От: <b>{buyer}</b>",
        f"Текст: {text[:200]}",
        "",
        f"Score: <b>{score.capped_total}/100</b> {score.emoji}",
        "Сигналы:",
    ]
    for name, weight in score.matches[:5]:
        lines.append(f"• +{weight} {name}")
    if score.level == "hot":
        lines.append("")
        lines.append(
            "⚡️ <i>Рекомендация: ответь в течение 2-3 минут, "
            "конверсия такого чата в продажу ~60%</i>"
        )
    return "\n".join(lines)


# ------------------------- аналитика ---------------------------------------


def lead_source_breakdown(matches: list[tuple[str, int]]) -> dict[str, int]:
    """Распределение вклада разных сигналов — для аналитики."""
    breakdown: dict[str, int] = {}
    for name, weight in matches:
        breakdown[name] = breakdown.get(name, 0) + weight
    return breakdown
