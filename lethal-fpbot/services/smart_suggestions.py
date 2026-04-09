"""Smart Suggestions — персонализированные советы продавцу.

Каждые 24 часа бот анализирует состояние пользователя и предлагает
3-5 конкретных действий для роста продаж:

  • Если конверсия чата <10% → «Попробуй включить hot leads детектор»
  • Если есть VIP-клиенты без тегов → «Отметь их тегом #vip»
  • Если автоответчик выключен при 50+ сообщений/день → «Включи автоответы»
  • Если топ-лот простаивает → «Снизь цену на Х рублей — medium competition»
  • Если нет отзывов за последние 7 дней → «Попроси прошлых покупателей»
  • Если общая выручка растёт → «Подними тариф, лимит на аккаунты»

Это не просто статистика — это actionable советы с кнопкой «Сделать».
"""

from __future__ import annotations

import logging
from dataclasses import dataclass, field
from typing import Any

from database.db import connect
from database.models import get_settings
from database.models_crm import count_by_segment, user_crm_summary
from utils.helpers import now_ts

logger = logging.getLogger(__name__)


@dataclass
class Suggestion:
    id: str
    priority: int  # 1-10
    emoji: str
    title: str
    description: str
    action_label: str = ""
    action_callback: str = ""
    metrics: dict[str, Any] = field(default_factory=dict)

    def to_dict(self) -> dict:
        return {
            "id": self.id,
            "priority": self.priority,
            "emoji": self.emoji,
            "title": self.title,
            "description": self.description,
            "action_label": self.action_label,
            "action_callback": self.action_callback,
            "metrics": self.metrics,
        }


async def generate_suggestions(user_id: int) -> list[Suggestion]:
    """Генерит список suggestions для пользователя, отсортированных по priority."""
    suggestions: list[Suggestion] = []

    settings = await get_settings(user_id)
    summary = await user_crm_summary(user_id)
    segments = await count_by_segment(user_id)

    # --- 1. Hot leads детектор ---
    if summary["total"] >= 10 and not settings.get("anti_scam"):
        suggestions.append(
            Suggestion(
                id="enable_anti_scam",
                priority=8,
                emoji="🛡",
                title="Включи антискам",
                description=(
                    "У тебя уже 10+ клиентов. Антискам-детектор защитит "
                    "от мошенников и покажет scoring риска для каждого чата."
                ),
                action_label="Включить",
                action_callback="set:toggle:anti_scam",
            )
        )

    # --- 2. Автоответчик при активных чатах ---
    if not settings.get("auto_response"):
        async with connect() as db:
            cur = await db.execute(
                """
                SELECT COUNT(*) AS c FROM customer_interactions ci
                  JOIN customers c ON c.id = ci.customer_id
                 WHERE c.user_id = ?
                   AND ci.kind = 'message_in'
                   AND ci.timestamp >= ?
                """,
                (user_id, now_ts() - 7 * 86400),
            )
            row = await cur.fetchone()
            weekly_msgs = int(row["c"]) if row else 0

        if weekly_msgs >= 20:
            suggestions.append(
                Suggestion(
                    id="enable_auto_response",
                    priority=9,
                    emoji="📨",
                    title="Настрой автоответчик",
                    description=(
                        f"У тебя {weekly_msgs} сообщений за неделю, а автоответчик "
                        f"выключен. Включи чтобы не терять лиды ночью."
                    ),
                    action_label="Настроить",
                    action_callback="onb:goto:auto_response",
                    metrics={"weekly_msgs": weekly_msgs},
                )
            )

    # --- 3. Автовыдача ---
    if not settings.get("auto_delivery"):
        async with connect() as db:
            cur = await db.execute(
                """
                SELECT COUNT(*) AS c FROM stats
                 WHERE user_id = ? AND timestamp >= ?
                """,
                (user_id, now_ts() - 7 * 86400),
            )
            row = await cur.fetchone()
            orders_week = int(row["c"]) if row else 0

        if orders_week >= 5:
            suggestions.append(
                Suggestion(
                    id="enable_auto_delivery",
                    priority=10,
                    emoji="🤖",
                    title="Настрой автовыдачу",
                    description=(
                        f"{orders_week} заказов за неделю — автовыдача сэкономит "
                        f"тебе часы времени и повысит конверсию в отзывы."
                    ),
                    action_label="Настроить",
                    action_callback="onb:goto:auto_delivery",
                )
            )

    # --- 4. VIP клиенты без тегов ---
    vip_count = segments.get("vip", 0)
    if vip_count >= 3:
        async with connect() as db:
            cur = await db.execute(
                """
                SELECT COUNT(*) AS c FROM customers c
                 WHERE c.user_id = ? AND c.segment = 'vip'
                   AND NOT EXISTS (
                     SELECT 1 FROM customer_tags t WHERE t.customer_id = c.id
                   )
                """,
                (user_id,),
            )
            row = await cur.fetchone()
            untagged_vip = int(row["c"]) if row else 0

        if untagged_vip >= 3:
            suggestions.append(
                Suggestion(
                    id="tag_vip",
                    priority=5,
                    emoji="💎",
                    title=f"{untagged_vip} VIP-клиентов без тегов",
                    description=(
                        "Отметь их тегом #vip — потом сможешь быстро отправить "
                        "им персональное предложение через 📣 Рассылку."
                    ),
                    action_label="Открыть CRM",
                    action_callback="crm:seg:vip:0",
                    metrics={"untagged_vip": untagged_vip},
                )
            )

    # --- 5. Sleeping клиенты → разбудить рассылкой ---
    sleeping = segments.get("sleeping", 0) + segments.get("churn_risk", 0)
    if sleeping >= 5:
        suggestions.append(
            Suggestion(
                id="broadcast_sleeping",
                priority=7,
                emoji="💤",
                title=f"Разбуди {sleeping} спящих клиентов",
                description=(
                    "У тебя накопились клиенты, которые давно не покупали. "
                    "Отправь им персональное предложение — конверсия "
                    "реактивации ~15-20%."
                ),
                action_label="Сделать рассылку",
                action_callback="crm:broadcast_sleeping",
                metrics={"sleeping_count": sleeping},
            )
        )

    # --- 6. Автоподнятие ---
    if not settings.get("auto_raise"):
        async with connect() as db:
            cur = await db.execute(
                "SELECT COUNT(*) AS c FROM fp_accounts WHERE user_id = ? AND is_active = 1",
                (user_id,),
            )
            row = await cur.fetchone()
            active_accounts = int(row["c"]) if row else 0

        if active_accounts > 0:
            suggestions.append(
                Suggestion(
                    id="enable_auto_raise",
                    priority=9,
                    emoji="🚀",
                    title="Включи автоподнятие",
                    description=(
                        "Каждые 4 часа твои лоты будут подниматься в топ "
                        "категории — это самый простой способ увеличить "
                        "просмотры без рекламы."
                    ),
                    action_label="Включить",
                    action_callback="set:toggle:auto_raise",
                )
            )

    # --- 7. Вечный онлайн ---
    if not settings.get("always_online"):
        suggestions.append(
            Suggestion(
                id="enable_always_online",
                priority=7,
                emoji="🟢",
                title="Включи вечный онлайн",
                description=(
                    "FunPay показывает твои лоты выше если ты 🟢 онлайн. "
                    "Бот будет поддерживать онлайн-статус 24/7."
                ),
                action_label="Включить",
                action_callback="set:toggle:always_online",
            )
        )

    # --- 8. Проблемные клиенты — добавить в ЧС? ---
    problematic = segments.get("problematic", 0)
    if problematic >= 1:
        suggestions.append(
            Suggestion(
                id="review_problematic",
                priority=6,
                emoji="🚫",
                title=f"{problematic} проблемных клиентов",
                description=(
                    "Есть клиенты с высоким % возвратов или отрицательными "
                    "отзывами. Проверь их в CRM — возможно стоит добавить в ЧС."
                ),
                action_label="Посмотреть",
                action_callback="crm:seg:problematic:0",
            )
        )

    # --- 9. Растущая выручка → апгрейд тарифа ---
    async with connect() as db:
        cur = await db.execute(
            """
            SELECT
                SUM(CASE WHEN timestamp >= ? THEN amount ELSE 0 END) AS this_week,
                SUM(CASE WHEN timestamp >= ? AND timestamp < ?
                    THEN amount ELSE 0 END) AS prev_week
              FROM stats
             WHERE user_id = ?
            """,
            (
                now_ts() - 7 * 86400,
                now_ts() - 14 * 86400,
                now_ts() - 7 * 86400,
                user_id,
            ),
        )
        row = await cur.fetchone()
        if row:
            this_week = int(row["this_week"] or 0)
            prev_week = int(row["prev_week"] or 0)
            if prev_week > 0 and this_week > prev_week * 1.3:
                growth = int((this_week - prev_week) / prev_week * 100)
                suggestions.append(
                    Suggestion(
                        id="growth_celebrate",
                        priority=4,
                        emoji="📈",
                        title=f"Выручка выросла на +{growth}%!",
                        description=(
                            f"{prev_week}₽ → {this_week}₽. Отличная динамика! "
                            "Подумай о апгрейде тарифа для большего числа "
                            "аккаунтов и фич."
                        ),
                        action_label="К тарифам",
                        action_callback="bill:open",
                    )
                )

    # Сортировка по priority
    suggestions.sort(key=lambda s: s.priority, reverse=True)
    return suggestions[:6]  # максимум 6 советов за раз


def format_suggestions_message(suggestions: list[Suggestion]) -> str:
    if not suggestions:
        return (
            "🌟 <b>Всё идеально!</b>\n\n"
            "У нас нет советов по улучшению — ты уже настроил всё что нужно.\n\n"
            "Продолжай в том же духе 🚀"
        )

    lines = [
        "💡 <b>Персональные советы</b>",
        "",
        f"Нашёл <b>{len(suggestions)}</b> способ(ов) улучшить твои продажи:",
        "",
    ]
    for i, s in enumerate(suggestions, 1):
        lines.append(f"{s.emoji} <b>{i}. {s.title}</b>")
        lines.append(f"    <i>{s.description}</i>")
        lines.append("")
    return "\n".join(lines)
