"""Lethal FunPay Bot — точка входа.

Запуск:
    cd lethal-fpbot
    python -m pip install -r requirements.txt
    BOT_TOKEN=xxx python main.py
"""

from __future__ import annotations

import asyncio
import logging

from aiogram import Bot, Dispatcher
from aiogram.client.default import DefaultBotProperties
from aiogram.enums import ParseMode

import config
from bot.handlers import get_root_router
from database.db import init_db
from services import session_pool, start_all


def _setup_logging() -> None:
    logging.basicConfig(
        level=logging.INFO,
        format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
    )


async def main() -> None:
    _setup_logging()
    config.validate()

    await init_db()

    bot = Bot(
        token=config.BOT_TOKEN,
        default=DefaultBotProperties(parse_mode=ParseMode.HTML),
    )
    dp = Dispatcher()
    dp.include_router(get_root_router())

    log = logging.getLogger(__name__)
    log.info("%s запущен. Жду апдейты…", config.BRAND_NAME)

    # Поднимаем фоновые сервисы
    bg_tasks = await start_all(bot)

    try:
        await bot.delete_webhook(drop_pending_updates=True)
        await dp.start_polling(bot)
    finally:
        log.info("Останавливаю фоновые сервисы…")
        for t in bg_tasks:
            t.cancel()
        await asyncio.gather(*bg_tasks, return_exceptions=True)
        await session_pool.close_all()
        await bot.session.close()


if __name__ == "__main__":
    try:
        asyncio.run(main())
    except (KeyboardInterrupt, SystemExit):
        pass
