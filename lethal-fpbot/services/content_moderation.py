"""Модерация ИСХОДЯЩИХ сообщений бота.

Защищает продавца от бана на FunPay:
  • Блокирует упоминания сторонних мессенджеров (TG, Discord, WA)
    — FunPay за это блокирует аккаунты
  • Блокирует грубые слова и оскорбления
  • Блокирует внешние ссылки (кроме whitelist домейнов)
  • Предлагает замены для запрещённых фраз
  • Даёт score «риска блокировки» 0-100

Использование:
    from services.content_moderation import check_outgoing

    result = check_outgoing("Напиши мне в телеграм @alice")
    if result.blocked:
        raise ValueError(result.reason)
    # Или можно применить auto-replace:
    safe_text = result.safe_text
"""

from __future__ import annotations

import logging
import re
from dataclasses import dataclass, field

logger = logging.getLogger(__name__)


# Паттерны запрещённого
_FORBIDDEN: list[tuple[re.Pattern, int, str, str]] = [
    # (pattern, risk_weight, reason, replacement)
    (
        re.compile(r"(?:telegram|telega|телеграм|тг)[\s\.:]*(?:@?\w+)?", re.I),
        80,
        "упоминание Telegram",
        "[внешний мессенджер]",
    ),
    (
        re.compile(r"(?:discord|дискорд)[\s\.:]*\w*", re.I),
        80,
        "упоминание Discord",
        "[внешний мессенджер]",
    ),
    (
        re.compile(r"(?:whatsapp|whats\s*app|вотсап|ватсап)", re.I),
        80,
        "упоминание WhatsApp",
        "[внешний мессенджер]",
    ),
    (
        re.compile(r"(?:viber|вайбер)", re.I),
        70,
        "упоминание Viber",
        "[внешний мессенджер]",
    ),
    (re.compile(r"t\.me/\w+", re.I), 90, "ссылка t.me", "[ссылка]"),
    (re.compile(r"@[\w_]{3,}"), 50, "телеграм-хэндл", "[никнейм]"),
    (re.compile(r"\+?\d{10,15}"), 40, "номер телефона", "[номер]"),
    (
        re.compile(r"https?://(?!funpay\.com)[\w\-.]+", re.I),
        60,
        "внешняя ссылка",
        "[ссылка]",
    ),
]

# Мягкие замены (лёгкие)
_SOFT_REPLACEMENTS: list[tuple[re.Pattern, int, str, str]] = [
    (re.compile(r"\bлох\b", re.I), 20, "оскорбление", "уважаемый"),
    (re.compile(r"\bдурак\b", re.I), 20, "оскорбление", "невнимательный"),
    (re.compile(r"\bидиот\b", re.I), 25, "оскорбление", "невнимательный"),
]


@dataclass
class ModerationResult:
    original: str
    safe_text: str
    risk_score: int = 0
    blocked: bool = False
    matches: list[tuple[str, int]] = field(default_factory=list)

    @property
    def reason(self) -> str:
        if not self.matches:
            return ""
        top = max(self.matches, key=lambda x: x[1])
        return f"Заблокировано: {top[0]}"


def check_outgoing(
    text: str, *, block_threshold: int = 60
) -> ModerationResult:
    """Проверяет исходящий текст. Если суммарный риск >= block_threshold —
    помечаем как blocked.

    safe_text всегда содержит версию с заменами (даже если blocked=True),
    чтобы UI мог показать «нельзя отправить такое, но вот безопасная версия».
    """
    if not text:
        return ModerationResult(original=text or "", safe_text=text or "")

    safe_text = text
    risk = 0
    matches: list[tuple[str, int]] = []

    for pattern, weight, reason, replacement in _FORBIDDEN + _SOFT_REPLACEMENTS:
        if pattern.search(safe_text):
            matches.append((reason, weight))
            risk += weight
            safe_text = pattern.sub(replacement, safe_text)

    blocked = risk >= block_threshold
    return ModerationResult(
        original=text,
        safe_text=safe_text,
        risk_score=risk,
        blocked=blocked,
        matches=matches,
    )


def is_safe(text: str) -> bool:
    """Быстрая проверка: без блокирующего контента?"""
    return check_outgoing(text).risk_score < 60


def format_block_message(result: ModerationResult) -> str:
    lines = [
        "🚫 <b>Сообщение заблокировано модерацией</b>",
        "",
        f"Риск: <b>{result.risk_score}</b>",
        f"Причина: {result.reason}",
        "",
        "<b>Сработали сигналы:</b>",
    ]
    for reason, weight in result.matches:
        lines.append(f"• +{weight} {reason}")
    lines.append("")
    lines.append("<b>Безопасная версия:</b>")
    lines.append(f"<code>{result.safe_text}</code>")
    return "\n".join(lines)
