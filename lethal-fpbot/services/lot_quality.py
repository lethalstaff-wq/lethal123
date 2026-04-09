"""Lot Quality Scorer — анализирует качество оформления лота.

Даёт score 0-100 и список конкретных советов как улучшить. Базируется
на best practices продаж на FunPay:

  • Длина заголовка 30-60 символов (короче — теряет инфу, длиннее — обрезается)
  • Наличие эмодзи в заголовке — +5-10% CTR
  • Наличие цифр в заголовке (конкретика) — лучше
  • Цена должна быть «круглой» или иметь .99 — психология цен
  • Описание должно содержать условия передачи товара
  • Описание должно содержать гарантии
  • Слишком короткое описание (<50 символов) — минус
  • Слишком длинное (>2000) — читается плохо
  • Отсутствие вопросов «что делать если X» в описании — минус
"""

from __future__ import annotations

import re
from dataclasses import dataclass, field

EMOJI_RE = re.compile(
    r"[\U0001F300-\U0001FAFF\U0001F600-\U0001F64F\U00002600-\U000027BF]"
)
DIGIT_RE = re.compile(r"\d")


@dataclass
class QualityScore:
    total: int = 100
    tips: list[tuple[str, int]] = field(default_factory=list)
    wins: list[str] = field(default_factory=list)

    @property
    def grade(self) -> str:
        if self.total >= 85:
            return "A"
        if self.total >= 70:
            return "B"
        if self.total >= 55:
            return "C"
        if self.total >= 40:
            return "D"
        return "F"

    @property
    def grade_emoji(self) -> str:
        return {"A": "🌟", "B": "⭐️", "C": "✅", "D": "⚠️", "F": "❌"}[self.grade]


def _penalize(score: QualityScore, amount: int, reason: str) -> None:
    score.total -= amount
    score.tips.append((reason, amount))


def _win(score: QualityScore, reason: str) -> None:
    score.wins.append(reason)


def analyze_title(title: str) -> QualityScore:
    score = QualityScore()
    if not title:
        _penalize(score, 50, "Название отсутствует")
        return score

    length = len(title)
    if length < 15:
        _penalize(score, 20, "Название слишком короткое (<15 символов) — добавь конкретики")
    elif length < 30:
        _penalize(score, 5, "Название коротковато, можно развернуть до 40-60 символов")
    elif length > 80:
        _penalize(score, 15, "Название слишком длинное, FunPay обрежет его")
    else:
        _win(score, "Длина заголовка оптимальна")

    if EMOJI_RE.search(title):
        _win(score, "Есть эмодзи — привлекает внимание в выдаче")
    else:
        _penalize(score, 10, "Добавь 1-2 эмодзи в начало — это +5-10% CTR")

    if DIGIT_RE.search(title):
        _win(score, "Есть цифры — даёт конкретику покупателю")
    else:
        _penalize(score, 5, "Добавь цифры (количество, процент, уровень)")

    if title.upper() == title:
        _penalize(score, 10, "ВСЁ КАПСОМ — раздражает, исправь")

    # Много восклицательных знаков
    if title.count("!") >= 3:
        _penalize(score, 8, "Слишком много восклицательных — выглядит как спам")

    return score


def analyze_description(desc: str) -> QualityScore:
    score = QualityScore()
    if not desc:
        _penalize(score, 30, "Описание пустое — покупатели любят детали")
        return score

    length = len(desc)
    if length < 50:
        _penalize(score, 20, "Описание слишком короткое (<50 символов)")
    elif length > 2000:
        _penalize(score, 10, "Описание слишком длинное — разбей на секции")
    else:
        _win(score, "Длина описания адекватная")

    lower = desc.lower()

    # Наличие ключевых блоков
    checks = [
        (
            ["гарант", "возврат", "refund", "guarantee"],
            10,
            "Добавь блок про гарантии / возврат",
            "Указаны гарантии — доверие выше",
        ),
        (
            ["как получить", "доставка", "передач", "выдача"],
            10,
            "Опиши процесс выдачи товара",
            "Процесс выдачи описан",
        ),
        (
            ["поддержк", "связь", "пишите", "вопрос"],
            8,
            "Пригласи задавать вопросы",
            "Есть приглашение к контакту",
        ),
        (
            ["отзыв", "оставьте"],
            5,
            "Упомяни что ждёшь отзыв",
            "Напоминает про отзыв",
        ),
    ]
    for keywords, penalty, tip, win_msg in checks:
        if any(kw in lower for kw in keywords):
            _win(score, win_msg)
        else:
            _penalize(score, penalty, tip)

    # Структура — наличие переносов / списков
    if "\n" in desc or "•" in desc or "–" in desc or "—" in desc:
        _win(score, "Описание структурировано")
    else:
        _penalize(score, 8, "Разбей описание на строки или пункты")

    return score


def analyze_lot(title: str, description: str, price: float | None = None) -> dict:
    """Полный анализ лота — заголовок + описание + цена."""
    title_score = analyze_title(title)
    desc_score = analyze_description(description or "")

    total = int((title_score.total + desc_score.total) / 2)

    # Анализ цены — «круглая» или .99
    price_tips: list[tuple[str, int]] = []
    if price is not None and price > 0:
        decimal = price - int(price)
        if 0.01 < decimal < 0.98:
            price_tips.append(
                ("Цена нецелая — округли до ровного числа или поставь .99", 5)
            )
            total -= 5

    total = max(0, min(100, total))
    grade = (
        "A" if total >= 85
        else "B" if total >= 70
        else "C" if total >= 55
        else "D" if total >= 40
        else "F"
    )

    return {
        "total": total,
        "grade": grade,
        "title_score": title_score.total,
        "description_score": desc_score.total,
        "tips": [
            *title_score.tips,
            *desc_score.tips,
            *price_tips,
        ],
        "wins": [
            *title_score.wins,
            *desc_score.wins,
        ],
    }


def format_report(result: dict) -> str:
    lines = [
        f"📊 <b>Quality: {result['total']}/100 (grade {result['grade']})</b>",
        "",
        f"Заголовок: {result['title_score']}/100",
        f"Описание:  {result['description_score']}/100",
    ]
    if result["wins"]:
        lines.append("")
        lines.append("✅ <b>Плюсы:</b>")
        for w in result["wins"]:
            lines.append(f"  • {w}")
    if result["tips"]:
        lines.append("")
        lines.append("💡 <b>Что улучшить:</b>")
        for tip, penalty in result["tips"]:
            lines.append(f"  • -{penalty}: {tip}")
    return "\n".join(lines)
