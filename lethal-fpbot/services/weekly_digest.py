"""Еженедельный дайджест — автоматический отчёт по понедельникам.

Каждый понедельник в 10:00 UTC бот присылает пользователю красивую
сводку за неделю:
  • Выручка: Х₽ (±% к прошлой неделе)
  • Заказов: Y (±%)
  • Средний чек: Z₽
  • Топ-3 лотов
  • Новые клиенты: N
  • Сегменты CRM
  • Топ советов от smart_suggestions
  • График выручки за неделю (PNG)

Плюс еженедельный челлендж: «На прошлой неделе был X₽, давай в этой
пробьём X*1.1?»

Отключается в настройках уведомлений.
"""

from __future__ import annotations

import asyncio
import logging
from datetime import UTC, datetime

from aiogram import Bot
from aiogram.types import BufferedInputFile

from database.db import connect
from database.models import get_settings, stats_summary, stats_top_lots
from database.models_crm import count_by_segment, user_crm_summary
from utils.helpers import now_ts

logger = logging.getLogger(__name__)

# Раз в час проверяем, не наступил ли понедельник 10:00
INTERVAL = 3600


async def run(bot: Bot) -> None:
    last_sent_key: str | None = None
    while True:
        try:
            now = datetime.now(tz=UTC)
            if now.weekday() == 0 and now.hour == 10:  # Monday 10am UTC
                key = f"{now.year}-W{now.isocalendar().week}"
                if key != last_sent_key:
                    await _send_all_digests(bot)
                    last_sent_key = key
        except Exception:  # noqa: BLE001
            logger.exception("weekly_digest tick failed")
        await asyncio.sleep(INTERVAL)


async def _send_all_digests(bot: Bot) -> None:
    """Пройти по всем пользователям и отправить дайджест."""
    async with connect() as db:
        cur = await db.execute("SELECT id, telegram_id FROM users")
        users = [dict(r) for r in await cur.fetchall()]

    for user in users:
        try:
            settings = await get_settings(user["id"])
            # Не отправляем если явно выключено
            if settings.get("weekly_digest_disabled"):
                continue

            digest = await build_digest(user["id"])
            if not digest:
                continue
            await bot.send_message(user["telegram_id"], digest)

            # Плюс график, если доступен matplotlib
            try:
                from services.dashboard import (
                    collect_revenue_by_day,
                    revenue_by_day,
                )

                data = await collect_revenue_by_day(user["id"], days=7)
                png = revenue_by_day(data, days=7)
                if png:
                    await bot.send_photo(
                        user["telegram_id"],
                        BufferedInputFile(png, filename="weekly.png"),
                        caption="📊 Динамика выручки за неделю",
                    )
            except Exception:  # noqa: BLE001
                logger.exception("weekly chart failed")

        except Exception:  # noqa: BLE001
            logger.exception("weekly digest for user %s failed", user["id"])


async def build_digest(user_id: int) -> str | None:
    """Собирает текст дайджеста для одного пользователя."""
    week_ago = now_ts() - 7 * 86400
    two_weeks_ago = now_ts() - 14 * 86400

    current = await stats_summary(user_id, week_ago)
    if current["count"] == 0:
        return None  # нет продаж — не спамим

    previous = await stats_summary(user_id, two_weeks_ago)
    previous["total"] -= current["total"]
    previous["count"] -= current["count"]

    def _diff_pct(new: int, old: int) -> str:
        if old <= 0:
            return "новый" if new > 0 else "0"
        pct = (new - old) / old * 100
        sign = "+" if pct >= 0 else ""
        return f"{sign}{pct:.0f}%"

    top_lots = await stats_top_lots(user_id, week_ago, limit=3)
    summary = await user_crm_summary(user_id)
    segments = await count_by_segment(user_id)

    lines = [
        "📅 <b>Ваша неделя на FunPay</b>",
        "",
        f"💰 Выручка: <b>{current['total']:,}₽</b> ({_diff_pct(current['total'], previous['total'])})".replace(",", " "),
        f"📦 Заказов: <b>{current['count']}</b> ({_diff_pct(current['count'], previous['count'])})",
    ]
    if current["count"] > 0:
        avg = current["total"] / current["count"]
        lines.append(f"🧾 Средний чек: <b>{avg:.0f}₽</b>")

    if top_lots:
        lines.append("")
        lines.append("🏆 <b>Топ-3 лотов:</b>")
        for lot_row in top_lots:
            name = lot_row.get("lot_name", "—") or "—"
            total = int(lot_row.get("total", 0) or 0)
            cnt = int(lot_row.get("cnt", 0) or 0)
            lines.append(f"  • {name} — {total}₽ ({cnt} шт)")

    if summary["total"] > 0:
        lines.append("")
        lines.append(
            f"📇 В CRM: <b>{summary['total']}</b> клиентов, "
            f"repeat rate <b>{summary['repeat_rate']}%</b>"
        )
        if segments.get("vip"):
            lines.append(f"   💎 VIP: {segments['vip']}")
        if segments.get("churn_risk"):
            lines.append(f"   ⚠️ Риск ухода: {segments['churn_risk']}")

    # Совет недели
    try:
        from services.smart_suggestions import generate_suggestions

        suggestions = await generate_suggestions(user_id)
        if suggestions:
            top = suggestions[0]
            lines.append("")
            lines.append("💡 <b>Совет недели:</b>")
            lines.append(f"{top.emoji} {top.title}")
            lines.append(f"<i>{top.description}</i>")
    except Exception:  # noqa: BLE001
        pass

    # Челлендж
    if current["total"] > 0:
        target = int(current["total"] * 1.1)
        lines.append("")
        lines.append(f"🎯 <b>Челлендж:</b> побей {target:,}₽ на этой неделе!".replace(",", " "))

    lines.append("")
    lines.append("<i>Отключить дайджест: /notifications</i>")

    return "\n".join(lines)
