"""Смарт-прайсинг (Pro): подсказки по цене на основе цен конкурентов.

Скелет: раз в час ищет лоты пользователя и сравнивает их цену со
средней по категории (через парсинг страницы категории). Если наша
цена выше средней на >10% — шлёт предупреждение в Telegram.
Авто-снижение делает только если включён auto_price_adjust.
"""

from __future__ import annotations

import asyncio
import logging
import re

from aiogram import Bot

from database.models import get_settings, get_user_by_id
from funpay.api import get_lots
from utils.helpers import escape_html

from . import session_pool

logger = logging.getLogger(__name__)
INTERVAL = 3600


async def run(bot: Bot) -> None:
    while True:
        try:
            await _tick(bot)
        except Exception:  # noqa: BLE001
            logger.exception("smart_pricing tick failed")
        await asyncio.sleep(INTERVAL)


async def _tick(bot: Bot) -> None:
    for _account_id, sess, acc in await session_pool.iter_active():
        settings = await get_settings(acc["user_id"])
        if not settings.get("smart_pricing"):
            continue
        if not sess.user_id:
            await sess.restore()
        if not sess.user_id:
            continue
        my_lots = await get_lots(sess, sess.user_id)
        user = await get_user_by_id(acc["user_id"])
        if not user:
            continue
        # упрощённо: для каждого лота смотрим страницу /lots/<id>/
        for lot in my_lots[:5]:  # топ-5 лотов чтобы не вешать FunPay
            if not lot.id or not lot.price:
                continue
            try:
                status, html = await sess.get(f"/lots/{lot.id}/")
                if status != 200:
                    continue
                others = [
                    float(x) for x in re.findall(r'data-s="([\d\.]+)"', html)
                ]
                others = [p for p in others if p > 0]
                if not others:
                    continue
                avg = sum(others) / len(others)
                if lot.price > avg * 1.10:
                    await bot.send_message(
                        user["telegram_id"],
                        (
                            f"💸 <b>Смарт-прайсинг</b>\n"
                            f"Лот <b>{escape_html(lot.title)}</b> "
                            f"стоит <b>{lot.price}</b>, средняя по категории "
                            f"<b>{avg:.2f}</b>. Подумай о снижении."
                        ),
                    )
            except Exception:  # noqa: BLE001
                logger.exception("smart_pricing scan failed")
