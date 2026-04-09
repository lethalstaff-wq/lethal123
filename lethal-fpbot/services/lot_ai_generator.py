"""AI-генератор описаний и заголовков лотов (Pro-фича).

Скармливает Claude API краткую инфу о лоте (название игры, тип товара,
количество, цена, особенности) и получает:
  • Оптимизированный заголовок (30-60 символов с эмодзи и цифрами)
  • Структурированное описание с эмодзи, разделами, гарантиями
  • Set слов для SEO внутри FunPay (что искать покупатели)

Интеграция с lot_quality: после генерации прогоняем через analyzer
и если скор < 80 — повторяем запрос с уточнением.
"""

from __future__ import annotations

import logging
import os
from dataclasses import dataclass
from typing import Any

from services.lot_quality import analyze_lot

logger = logging.getLogger(__name__)

MODEL = "claude-sonnet-4-6"


@dataclass
class LotGenRequest:
    game: str
    item_type: str  # "currency" / "account" / "key" / "boost" / "items"
    quantity: str = ""  # "1000 gold", "random key", "level 70", ...
    price: float | None = None
    features: list[str] | None = None  # "мгновенная выдача", "гарантия 24ч"
    tone: str = "дружелюбный"  # "дружелюбный" / "профессиональный" / "короткий"
    language: str = "ru"


@dataclass
class LotGenResult:
    title: str
    description: str
    seo_keywords: list[str]
    quality_score: int
    tokens_used: int = 0


def _get_client():
    try:
        import anthropic  # type: ignore
    except ImportError:
        return None
    api_key = os.getenv("ANTHROPIC_API_KEY")
    if not api_key:
        return None
    return anthropic.AsyncAnthropic(api_key=api_key)


SYSTEM_PROMPT = """
Ты — опытный SMM и продавец на FunPay (это маркетплейс виртуальных товаров
в играх). Ты пишешь описания лотов, которые максимизируют конверсию.

Правила хорошего описания на FunPay:
1. ЗАГОЛОВОК: 30-60 символов, 1-2 эмодзи в начале, конкретика (цифры),
   без ВСЕХ КАПС, без >2 восклицательных.
2. ОПИСАНИЕ: структурированное, с маркированными списками, эмодзи в
   начале пунктов, обязательные секции: "Что вы получаете", "Условия
   передачи", "Гарантии", "Поддержка".
3. ТОН: продающий но не душный, уважительный, без слов "привет дорогой
   покупатель" — сразу по делу.
4. Обязательно упомянуть: моментальность, поддержку 24/7, гарантию.
5. Не используй иностранные слова без нужды. Пиши на заданном языке.

Формат ответа — строго JSON:
{
  "title": "...",
  "description": "...",
  "seo_keywords": ["ключ1", "ключ2", ...]
}
"""


def _build_user_prompt(req: LotGenRequest) -> str:
    lines = [
        f"Игра: {req.game}",
        f"Тип товара: {req.item_type}",
    ]
    if req.quantity:
        lines.append(f"Количество/описание: {req.quantity}")
    if req.price is not None:
        lines.append(f"Цена: {req.price}₽")
    if req.features:
        lines.append("Особенности: " + ", ".join(req.features))
    lines.append(f"Тон: {req.tone}")
    lines.append(f"Язык: {req.language}")
    lines.append("")
    lines.append(
        "Сгенерируй оптимизированный заголовок (30-60 символов) и "
        "описание лота для FunPay. Ответь JSON."
    )
    return "\n".join(lines)


async def generate_lot(req: LotGenRequest) -> LotGenResult | None:
    """Генерирует заголовок+описание через Claude API.

    Возвращает None если ИИ недоступен.
    """
    client = _get_client()
    if not client:
        return _fallback_generate(req)

    user_prompt = _build_user_prompt(req)

    try:
        msg = await client.messages.create(
            model=MODEL,
            max_tokens=1200,
            system=SYSTEM_PROMPT,
            messages=[{"role": "user", "content": user_prompt}],
        )
    except Exception:  # noqa: BLE001
        logger.exception("Claude API failed, fallback")
        return _fallback_generate(req)

    text = _extract_text(msg)
    parsed = _parse_json_response(text)
    if not parsed:
        return _fallback_generate(req)

    title = parsed.get("title", "")
    description = parsed.get("description", "")
    keywords = parsed.get("seo_keywords", [])
    if not isinstance(keywords, list):
        keywords = []

    analysis = analyze_lot(title, description, req.price)
    tokens_used = getattr(msg, "usage", None)
    tokens = 0
    if tokens_used:
        tokens = getattr(tokens_used, "input_tokens", 0) + getattr(
            tokens_used, "output_tokens", 0
        )

    return LotGenResult(
        title=title,
        description=description,
        seo_keywords=[str(k) for k in keywords][:10],
        quality_score=analysis["total"],
        tokens_used=tokens,
    )


async def improve_existing(
    title: str, description: str, price: float | None = None
) -> LotGenResult | None:
    """Улучшает существующий лот через ИИ.

    Полезно когда у продавца уже есть описание, но Quality Scorer даёт
    низкую оценку — ИИ переписывает.
    """
    client = _get_client()
    if not client:
        return None

    user_prompt = (
        "У меня есть лот на FunPay, который работает плохо. Переписай "
        "заголовок и описание чтобы максимизировать конверсию. "
        "Используй те же факты, но структурируй лучше. Ответь JSON.\n\n"
        f"Текущий заголовок: {title}\n\n"
        f"Текущее описание:\n{description}\n\n"
        f"Цена: {price}₽" if price else ""
    )

    try:
        msg = await client.messages.create(
            model=MODEL,
            max_tokens=1500,
            system=SYSTEM_PROMPT,
            messages=[{"role": "user", "content": user_prompt}],
        )
    except Exception:  # noqa: BLE001
        logger.exception("improve_existing failed")
        return None

    text = _extract_text(msg)
    parsed = _parse_json_response(text)
    if not parsed:
        return None

    new_title = parsed.get("title", title)
    new_desc = parsed.get("description", description)
    keywords = parsed.get("seo_keywords", [])
    if not isinstance(keywords, list):
        keywords = []

    analysis = analyze_lot(new_title, new_desc, price)
    return LotGenResult(
        title=new_title,
        description=new_desc,
        seo_keywords=[str(k) for k in keywords][:10],
        quality_score=analysis["total"],
    )


def _extract_text(msg: Any) -> str:
    parts = []
    for block in getattr(msg, "content", []) or []:
        text = getattr(block, "text", None)
        if text:
            parts.append(text)
    return "\n".join(parts).strip()


def _parse_json_response(text: str) -> dict | None:
    """Парсит JSON из ответа Claude — может быть в markdown code block."""
    import json
    import re

    if not text:
        return None

    # Code fence
    m = re.search(r"```(?:json)?\s*(\{.*?\})\s*```", text, re.DOTALL)
    if m:
        try:
            return json.loads(m.group(1))
        except json.JSONDecodeError:
            pass

    # Без code fence — ищем первый {...}
    m = re.search(r"\{.*\}", text, re.DOTALL)
    if m:
        try:
            return json.loads(m.group(0))
        except json.JSONDecodeError:
            return None

    return None


def _fallback_generate(req: LotGenRequest) -> LotGenResult | None:
    """Fallback без ИИ — шаблонная генерация для базового результата."""
    emoji_by_type = {
        "currency": "💰",
        "account": "🎮",
        "key": "🔑",
        "boost": "🚀",
        "items": "🎁",
    }
    emoji = emoji_by_type.get(req.item_type, "✨")

    title = f"{emoji} {req.game}"
    if req.quantity:
        title += f" — {req.quantity}"
    title = title[:60]

    description_parts = [
        f"{emoji} <b>{req.game}</b>",
        "",
        "<b>Что вы получаете:</b>",
        f"• {req.quantity or req.item_type}",
    ]
    if req.features:
        for f in req.features:
            description_parts.append(f"• {f}")

    description_parts.extend(
        [
            "",
            "<b>Условия передачи:</b>",
            "• Моментально после оплаты",
            "• Напишите мне в чат для инструкций",
            "",
            "<b>Гарантии:</b>",
            "• 100% работоспособность товара",
            "• Возврат или замена при проблемах",
            "",
            "<b>Поддержка:</b>",
            "• 24/7 в чате FunPay",
            "• Помощь с любыми вопросами",
            "",
            "💬 Задавайте вопросы перед покупкой — с удовольствием отвечу!",
        ]
    )

    description = "\n".join(description_parts)
    analysis = analyze_lot(title, description, req.price)

    return LotGenResult(
        title=title,
        description=description,
        seo_keywords=[req.game.lower(), req.item_type],
        quality_score=analysis["total"],
        tokens_used=0,
    )
