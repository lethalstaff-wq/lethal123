"""ИИ арбитраж-ассистент (Pro).

Детектит появление модератора в чате, скачивает всю переписку,
скармливает Claude API и возвращает текст защиты продавца.
Отдаёт как обычное сообщение в Telegram — продавец копирует руками.

Маркеры присутствия модератора (эвристика):
  • в чате появился пользователь с тегом «Поддержка» или «Модератор»
  • системное сообщение «Открыт спор»
"""

from __future__ import annotations

import logging
import os
from typing import Any

from funpay.api import get_chat_messages

logger = logging.getLogger(__name__)


def _get_client():
    try:
        import anthropic  # type: ignore
    except ImportError:
        return None
    api_key = os.getenv("ANTHROPIC_API_KEY")
    if not api_key:
        return None
    return anthropic.AsyncAnthropic(api_key=api_key)


def is_moderator_present(messages: list[dict]) -> bool:
    for m in messages:
        author = (m.get("author") or "").lower()
        text = (m.get("text") or "").lower()
        if "support" in author or "модератор" in author or "поддержка" in author:
            return True
        if "открыт спор" in text or "арбитраж" in text:
            return True
    return False


async def build_defense(sess, chat_id: str) -> str | None:
    msgs = await get_chat_messages(sess, chat_id)
    if not msgs:
        return None

    transcript_lines = [
        f"[{m.get('author', '?')}] {m.get('text', '')}" for m in msgs
    ]
    transcript = "\n".join(transcript_lines)

    client = _get_client()
    if not client:
        return (
            "⚠️ Ключ ANTHROPIC_API_KEY не задан. Подключи Claude API "
            "чтобы автоматически готовить защиту."
        )

    system = (
        "Ты — арбитражный ассистент продавца на FunPay. На входе — "
        "переписка с покупателем. Твоя задача:\n"
        "1) Кратко проанализируй кто прав\n"
        "2) Перечисли ключевые цитаты-доказательства продавца\n"
        "3) Сгенерируй текст-защиту 5-8 предложений, который продавец "
        "сможет вставить в спор. Тон — вежливый, фактический, без эмоций."
    )
    try:
        msg = await client.messages.create(
            model="claude-opus-4-6",
            max_tokens=1200,
            system=system,
            messages=[
                {"role": "user", "content": f"Переписка:\n\n{transcript}"}
            ],
        )
        return _extract_text(msg)
    except Exception:  # noqa: BLE001
        logger.exception("arbitrage_assist.build_defense failed")
        return None


def _extract_text(msg: Any) -> str:
    parts = []
    for block in getattr(msg, "content", []) or []:
        text = getattr(block, "text", None)
        if text:
            parts.append(text)
    return "\n".join(parts).strip()
