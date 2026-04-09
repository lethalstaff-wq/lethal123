"""Мониторинг отзывов и автоответ на них.

Раз в 5 минут парсим страницу профиля каждого аккаунта, ищем новые
отзывы без ответа и шлём шаблонный ответ из review_responses в
зависимости от рейтинга. Также — просьба об отзыве после нового заказа.
"""

from __future__ import annotations

import asyncio
import logging

from aiogram import Bot

from database.models import (
    get_review_response,
    get_settings,
    get_user_by_id,
)
from funpay.api import get_self_reviews, reply_to_review
from utils.helpers import escape_html

from . import session_pool

logger = logging.getLogger(__name__)
INTERVAL = 300


async def run(bot: Bot) -> None:
    while True:
        try:
            await _tick(bot)
        except Exception:  # noqa: BLE001
            logger.exception("review_watcher tick failed")
        await asyncio.sleep(INTERVAL)


async def _tick(bot: Bot) -> None:
    for _account_id, sess, acc in await session_pool.iter_active():
        settings = await get_settings(acc["user_id"])
        if not settings.get("review_reply"):
            continue
        user = await get_user_by_id(acc["user_id"])
        try:
            reviews = await get_self_reviews(sess)
        except Exception as exc:  # noqa: BLE001
            logger.warning("get_self_reviews failed: %s", exc)
            continue

        for rv in reviews:
            if rv.has_reply or not rv.order_id:
                continue
            template = await get_review_response(acc["user_id"], rv.rating)
            if not template:
                continue
            try:
                await reply_to_review(sess, rv.order_id, template)
                if user:
                    await bot.send_message(
                        user["telegram_id"],
                        f"⭐️ Ответил на отзыв ({rv.rating}★) от "
                        f"<b>{escape_html(rv.buyer)}</b>",
                    )
            except Exception as exc:  # noqa: BLE001
                logger.warning("reply_to_review failed: %s", exc)
