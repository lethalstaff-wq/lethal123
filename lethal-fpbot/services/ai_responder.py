"""ИИ-ответы через Claude API (Pro).

Тонкая обёртка над anthropic SDK. Грузим ключ из ANTHROPIC_API_KEY
в окружении. Если ключа нет — функции возвращают None и хендлеры
показывают пользователю заглушку.

Используем claude-sonnet-4-6 — он быстрый, дешёвый и умный.
Для арбитража можно поднять до Opus.
"""

from __future__ import annotations

import logging
import os
from typing import Any

logger = logging.getLogger(__name__)

MODEL_FAST = "claude-sonnet-4-6"
MODEL_SMART = "claude-opus-4-6"


def _get_client():
    try:
        import anthropic  # type: ignore
    except ImportError:
        logger.warning("anthropic SDK не установлен; ИИ-фичи отключены")
        return None
    api_key = os.getenv("ANTHROPIC_API_KEY")
    if not api_key:
        logger.warning("ANTHROPIC_API_KEY не задан; ИИ-фичи отключены")
        return None
    return anthropic.AsyncAnthropic(api_key=api_key)


async def reply_to_buyer(buyer_message: str, context: str = "") -> str | None:
    """Сгенерировать ответ покупателю."""
    client = _get_client()
    if not client:
        return None
    system = (
        "Ты — вежливый продавец на FunPay. Отвечай коротко, по делу, "
        "дружелюбно, без воды. Никаких эмодзи кроме самых необходимых. "
        "Не обещай того, что не входит в описание лота."
    )
    user = f"Контекст: {context}\n\nСообщение покупателя: {buyer_message}"
    try:
        msg = await client.messages.create(
            model=MODEL_FAST,
            max_tokens=400,
            system=system,
            messages=[{"role": "user", "content": user}],
        )
        return _extract_text(msg)
    except Exception:  # noqa: BLE001
        logger.exception("ai_responder.reply_to_buyer failed")
        return None


async def reply_to_review(rating: int, review_text: str) -> str | None:
    client = _get_client()
    if not client:
        return None
    system = (
        "Ты — продавец на FunPay, отвечаешь на отзывы покупателей. "
        "Тон вежливый, благодарный за положительные и спокойно-аргументированный "
        "за отрицательные. Без агрессии и оправданий, кратко."
    )
    user = f"Рейтинг: {rating}/5\nОтзыв покупателя: {review_text}"
    try:
        msg = await client.messages.create(
            model=MODEL_FAST,
            max_tokens=300,
            system=system,
            messages=[{"role": "user", "content": user}],
        )
        return _extract_text(msg)
    except Exception:  # noqa: BLE001
        logger.exception("ai_responder.reply_to_review failed")
        return None


def _extract_text(msg: Any) -> str:
    parts = []
    for block in getattr(msg, "content", []) or []:
        text = getattr(block, "text", None)
        if text:
            parts.append(text)
    return "\n".join(parts).strip()
