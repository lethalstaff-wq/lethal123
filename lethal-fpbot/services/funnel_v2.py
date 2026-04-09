"""Многошаговая воронка продаж с A/B-тестами и персонализацией.

Отличия от базовой funnel.py:
  • Multi-step: последовательность сообщений с разными интервалами
    (1ч → 24ч → 72ч), каждый шаг останавливается если покупатель ответил/купил
  • Персонализация: текст подставляется из шаблона с {buyer}, {lot}, {discount}
  • A/B варианты: два шаблона для одного шага, случайный выбор
  • Auto-stop: если детектим что покупатель написал «купил» / «не интересно»
  • Генерация персонального промокода на 2-3 шаге
  • Трекинг конверсии каждого шага
"""

from __future__ import annotations

import logging
import random
from dataclasses import dataclass, field

logger = logging.getLogger(__name__)


@dataclass
class FunnelStep:
    delay_minutes: int
    templates: list[str]  # несколько вариантов для A/B
    generate_promo: bool = False
    stop_keywords: list[str] = field(default_factory=lambda: [
        "купил", "купила", "взял", "взяла", "не надо", "не интересно",
        "спасибо не надо", "не актуально"
    ])


# Дефолтная воронка — 3 шага
DEFAULT_FUNNEL: list[FunnelStep] = [
    FunnelStep(
        delay_minutes=60,
        templates=[
            "👋 Здравствуйте, {buyer}! Вы интересовались <b>{lot}</b>. "
            "Актуально ли предложение? Готов ответить на любые вопросы.",
            "Привет, {buyer}! Напомнить про <b>{lot}</b>? "
            "Если нужна дополнительная информация — задавайте.",
        ],
    ),
    FunnelStep(
        delay_minutes=24 * 60,
        templates=[
            "Снова я 😊 По <b>{lot}</b> держу для вас позицию. "
            "Готов дать скидку {discount}% — прямо сейчас возьмёте?",
            "Подумали насчёт <b>{lot}</b>? Специально для вас -{discount}%, "
            "промокод: <code>{promo}</code> — действителен 24 часа.",
        ],
        generate_promo=True,
    ),
    FunnelStep(
        delay_minutes=72 * 60,
        templates=[
            "Последнее напоминание по <b>{lot}</b>. Через сутки снимаю резерв. "
            "Если нужно — дайте знать, сделаем скидку.",
            "Если <b>{lot}</b> больше не нужен — без обид, просто отпишите «не надо». "
            "Иначе продолжу напоминать по нашим стандартам.",
        ],
    ),
]


def should_stop_funnel(last_message_from_buyer: str, keywords: list[str]) -> bool:
    if not last_message_from_buyer:
        return False
    text_low = last_message_from_buyer.lower()
    return any(kw in text_low for kw in keywords)


def pick_template(step: FunnelStep) -> str:
    return random.choice(step.templates) if step.templates else ""


def render_funnel_message(
    template: str, buyer: str, lot: str, discount: int = 0, promo: str = ""
) -> str:
    try:
        return template.format(
            buyer=buyer or "друг",
            lot=lot or "лот",
            discount=discount,
            promo=promo,
        )
    except (KeyError, IndexError):
        return template


def generate_personal_promo(user_id: int, chat_id: str) -> str:
    """Генерирует код вида FNL-XXXXX-XXXXX по user/chat.

    Реальный промокод нужно сохранить через services.promo — эта функция
    только формирует строку. В проде вызывающий код делает:

        code = generate_personal_promo(user_id, chat_id)
        await create_promo_code(code, discount_percent=5, max_uses=1, valid_until=...)
    """
    import hashlib
    import secrets

    base = f"{user_id}:{chat_id}:{secrets.token_hex(4)}"
    digest = hashlib.sha1(base.encode()).hexdigest()[:10].upper()
    return f"FNL-{digest[:5]}-{digest[5:]}"


@dataclass
class FunnelState:
    step_index: int = 0
    last_sent_ts: int = 0
    total_sent: int = 0
    stopped: bool = False
    conversion: bool = False
    promos_generated: list[str] = field(default_factory=list)

    def advance(self) -> None:
        self.step_index += 1
        self.total_sent += 1

    def mark_stopped(self, reason: str = "") -> None:
        self.stopped = True

    def mark_converted(self) -> None:
        self.conversion = True
        self.stopped = True
