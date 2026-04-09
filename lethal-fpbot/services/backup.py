"""Ежедневный бэкап SQLite-базы.

Сохраняет копию DB_PATH в backups/lethal_fpbot-<YYYY-MM-DD>.db,
держит последние 7 бэкапов, старые удаляет. Использует sqlite3 backup
API через aiosqlite — это безопасно даже под write-нагрузкой.
"""

from __future__ import annotations

import asyncio
import logging
from datetime import datetime
from pathlib import Path

import aiosqlite
from aiogram import Bot

from config import BASE_DIR, DB_PATH

logger = logging.getLogger(__name__)
INTERVAL = 24 * 3600
KEEP_LAST = 7

BACKUP_DIR = BASE_DIR / "backups"


async def run(bot: Bot) -> None:
    BACKUP_DIR.mkdir(exist_ok=True)
    while True:
        try:
            await _make_backup()
            _rotate()
            # Опционально пушим в S3 если настроено
            try:
                from .s3_backup import upload_db_to_s3

                key = await upload_db_to_s3()
                if key:
                    logger.info("S3 backup ok: %s", key)
            except Exception:  # noqa: BLE001
                logger.exception("S3 backup failed (non-fatal)")
        except Exception:  # noqa: BLE001
            logger.exception("backup tick failed")
        await asyncio.sleep(INTERVAL)


async def _make_backup() -> Path:
    date = datetime.utcnow().strftime("%Y-%m-%d_%H%M")
    target = BACKUP_DIR / f"lethal_fpbot-{date}.db"
    async with aiosqlite.connect(DB_PATH) as src:
        async with aiosqlite.connect(str(target)) as dst:
            await src.backup(dst)
    logger.info("Бэкап БД создан: %s", target)
    return target


def _rotate() -> None:
    files = sorted(
        BACKUP_DIR.glob("lethal_fpbot-*.db"),
        key=lambda p: p.stat().st_mtime,
        reverse=True,
    )
    for old in files[KEEP_LAST:]:
        try:
            old.unlink()
            logger.info("Удалён старый бэкап: %s", old.name)
        except OSError:
            pass
