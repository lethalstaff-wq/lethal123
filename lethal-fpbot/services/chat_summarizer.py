"""AI-саммаризация длинных диалогов (Pro-фича).

Когда продавец открывает чат с постоянным клиентом или приходит в
старый разговор — полезно увидеть краткое саммари переписки вместо
скролла 50+ сообщений.

Использует Claude Haiku (быстрая и дешёвая модель) для генерации:
  • Что хочет покупатель (1-2 предложения)
  • Ключевые факты сделки (цена, условия, договорённости)
  • Текущий статус диалога (ожидает оплаты / получил товар / спор)
  • Рекомендация что делать продавцу

Плюс простая fallback-саммаризация без API: топ-3 самых длинных
сообщения покупателя + последние 2-3 сообщения.
"""

from __future__ import annotations

import logging
import os
from dataclasses import dataclass

logger = logging.getLogger(__name__)


@dataclass
class ChatSummary:
    what_buyer_wants: str
    key_facts: list[str]
    status: str
    recommendation: str
    message_count: int
    used_ai: bool


def _get_client():
    try:
        import anthropic  # type: ignore
    except ImportError:
        return None
    api_key = os.getenv("ANTHROPIC_API_KEY")
    if not api_key:
        return None
    return anthropic.AsyncAnthropic(api_key=api_key)


SYSTEM = """
Ты — помощник продавца на FunPay. На входе — переписка с покупателем.
Твоя задача — кратко восстановить контекст чтобы продавец мог быстро
вернуться в разговор.

Отвечай строго JSON такого вида:
{
  "what_buyer_wants": "Краткая суть запроса в 1-2 предложениях",
  "key_facts": ["Факт 1", "Факт 2", "Факт 3"],
  "status": "Одна из: ожидает ответа / оплачено / получил товар / спор / завершено",
  "recommendation": "Что делать продавцу прямо сейчас (1-2 предложения)"
}
"""


async def summarize(messages: list[dict], *, self_username: str = "") -> ChatSummary:
    """Саммаризует сообщения чата.

    messages — список [{"author": str, "text": str, "id": str}, ...]
    self_username — ник продавца (мы), чтобы отделять свои от покупателя.
    """
    if not messages:
        return ChatSummary(
            what_buyer_wants="Нет сообщений",
            key_facts=[],
            status="нет данных",
            recommendation="—",
            message_count=0,
            used_ai=False,
        )

    client = _get_client()
    if not client:
        return _fallback_summary(messages, self_username)

    # Собираем транскрипт
    lines = []
    for msg in messages[-50:]:  # Берём последние 50 чтобы не выйти за лимит
        role = "ПРОДАВЕЦ" if msg.get("author") == self_username else "ПОКУПАТЕЛЬ"
        text = (msg.get("text") or "").strip()
        if text:
            lines.append(f"{role}: {text}")

    transcript = "\n".join(lines)

    try:
        msg_ai = await client.messages.create(
            model="claude-haiku-4-5-20251001",
            max_tokens=600,
            system=SYSTEM,
            messages=[{"role": "user", "content": f"Переписка:\n\n{transcript}"}],
        )
        text = _extract_text(msg_ai)
        parsed = _parse_json(text)
        if parsed:
            return ChatSummary(
                what_buyer_wants=parsed.get("what_buyer_wants", ""),
                key_facts=list(parsed.get("key_facts", []))[:5],
                status=parsed.get("status", ""),
                recommendation=parsed.get("recommendation", ""),
                message_count=len(messages),
                used_ai=True,
            )
    except Exception:  # noqa: BLE001
        logger.exception("chat_summarizer AI call failed, using fallback")

    return _fallback_summary(messages, self_username)


def _fallback_summary(messages: list[dict], self_username: str) -> ChatSummary:
    """Эвристическая саммаризация без ИИ."""
    buyer_msgs = [
        m for m in messages if m.get("author") and m.get("author") != self_username
    ]

    # Самое длинное сообщение покупателя — обычно самое содержательное
    longest_buyer = max(
        (m.get("text", "") for m in buyer_msgs),
        key=len,
        default="",
    )
    last_few = [m.get("text", "") for m in messages[-3:] if m.get("text")]

    what = longest_buyer[:200] if longest_buyer else "—"

    status = "ожидает ответа"
    if not messages:
        status = "пусто"
    elif messages[-1].get("author") == self_username:
        status = "ждём ответа покупателя"

    return ChatSummary(
        what_buyer_wants=what,
        key_facts=last_few,
        status=status,
        recommendation="Прочти последние сообщения и ответь как обычно.",
        message_count=len(messages),
        used_ai=False,
    )


def _extract_text(msg) -> str:
    parts = []
    for block in getattr(msg, "content", []) or []:
        text = getattr(block, "text", None)
        if text:
            parts.append(text)
    return "\n".join(parts).strip()


def _parse_json(text: str) -> dict | None:
    import json
    import re

    if not text:
        return None
    m = re.search(r"\{.*\}", text, re.DOTALL)
    if not m:
        return None
    try:
        return json.loads(m.group(0))
    except json.JSONDecodeError:
        return None


def format_summary(summary: ChatSummary) -> str:
    ai_badge = "🤖 AI" if summary.used_ai else "📝 Эвристика"
    lines = [
        f"📋 <b>Саммари чата</b> ({summary.message_count} сообщ.) {ai_badge}",
        "",
        "🎯 <b>Что хочет покупатель:</b>",
        summary.what_buyer_wants,
    ]
    if summary.key_facts:
        lines.append("")
        lines.append("📌 <b>Ключевые факты:</b>")
        for f in summary.key_facts:
            lines.append(f"• {f}")
    if summary.status:
        lines.append("")
        lines.append(f"📊 Статус: <b>{summary.status}</b>")
    if summary.recommendation:
        lines.append("")
        lines.append(f"💡 <i>{summary.recommendation}</i>")
    return "\n".join(lines)
