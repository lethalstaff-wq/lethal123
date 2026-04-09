"""Раннер миграций.

Сканирует migrations/ на файлы NNNN_*.py, собирает их в порядок,
сверяется с таблицей _migrations и применяет недостающие.
"""

from __future__ import annotations

import argparse
import asyncio
import importlib
import logging
import re
import sys
from pathlib import Path

import aiosqlite

import config

logger = logging.getLogger(__name__)
MIGRATIONS_DIR = Path(__file__).resolve().parent
NAME_RE = re.compile(r"^(\d{4})_([a-z0-9_]+)\.py$")


async def _ensure_table(db: aiosqlite.Connection) -> None:
    await db.execute(
        """
        CREATE TABLE IF NOT EXISTS _migrations (
            version TEXT PRIMARY KEY,
            applied_at INTEGER NOT NULL
        )
        """
    )
    await db.commit()


def _scan() -> list[tuple[str, str]]:
    """Возвращает [(version, module_name), ...] отсортированные по версии."""
    out = []
    for p in MIGRATIONS_DIR.glob("[0-9][0-9][0-9][0-9]_*.py"):
        m = NAME_RE.match(p.name)
        if not m:
            continue
        out.append((m.group(1), p.stem))
    out.sort(key=lambda x: x[0])
    return out


async def _applied_versions(db: aiosqlite.Connection) -> set[str]:
    cur = await db.execute("SELECT version FROM _migrations")
    rows = await cur.fetchall()
    return {r[0] for r in rows}


async def upgrade(target: str | None = None) -> int:
    """Применяет все недостающие миграции до target (или до конца)."""
    applied_count = 0
    async with aiosqlite.connect(config.DB_PATH) as db:
        db.row_factory = aiosqlite.Row
        await _ensure_table(db)
        applied = await _applied_versions(db)

        for version, mod_name in _scan():
            if version in applied:
                continue
            if target and version > target:
                break
            module = importlib.import_module(f"migrations.{mod_name}")
            logger.info("Apply migration %s", version)
            await module.up(db)
            await db.execute(
                "INSERT INTO _migrations (version, applied_at) VALUES (?, strftime('%s','now'))",
                (version,),
            )
            await db.commit()
            applied_count += 1
    return applied_count


async def downgrade(target: str) -> int:
    """Откатывает миграции выше target."""
    rolled = 0
    async with aiosqlite.connect(config.DB_PATH) as db:
        db.row_factory = aiosqlite.Row
        await _ensure_table(db)
        applied = sorted(await _applied_versions(db), reverse=True)
        for version in applied:
            if version <= target:
                break
            mod_name = next(
                (m for v, m in _scan() if v == version), None
            )
            if not mod_name:
                continue
            module = importlib.import_module(f"migrations.{mod_name}")
            logger.info("Revert migration %s", version)
            if hasattr(module, "down"):
                await module.down(db)
            await db.execute(
                "DELETE FROM _migrations WHERE version = ?", (version,)
            )
            await db.commit()
            rolled += 1
    return rolled


async def current_version() -> str | None:
    async with aiosqlite.connect(config.DB_PATH) as db:
        await _ensure_table(db)
        cur = await db.execute(
            "SELECT version FROM _migrations ORDER BY version DESC LIMIT 1"
        )
        row = await cur.fetchone()
        return row[0] if row else None


async def list_applied() -> list[str]:
    async with aiosqlite.connect(config.DB_PATH) as db:
        await _ensure_table(db)
        cur = await db.execute(
            "SELECT version FROM _migrations ORDER BY version"
        )
        return [r[0] for r in await cur.fetchall()]


async def list_pending() -> list[str]:
    async with aiosqlite.connect(config.DB_PATH) as db:
        await _ensure_table(db)
        applied = await _applied_versions(db)
    return [v for v, _ in _scan() if v not in applied]


def _main() -> None:
    parser = argparse.ArgumentParser(prog="migrations")
    sub = parser.add_subparsers(dest="cmd")
    sub.add_parser("upgrade")
    sub.add_parser("status")
    p_down = sub.add_parser("downgrade")
    p_down.add_argument("target")
    args = parser.parse_args()

    logging.basicConfig(level=logging.INFO)

    if args.cmd == "upgrade":
        n = asyncio.run(upgrade())
        print(f"Applied {n} migration(s)")
    elif args.cmd == "downgrade":
        n = asyncio.run(downgrade(args.target))
        print(f"Reverted {n} migration(s)")
    elif args.cmd == "status":
        applied = asyncio.run(list_applied())
        pending = asyncio.run(list_pending())
        print(f"Applied: {len(applied)}")
        for v in applied:
            print(f"  ✓ {v}")
        print(f"Pending: {len(pending)}")
        for v in pending:
            print(f"  ◯ {v}")
    else:
        parser.print_help()
        sys.exit(1)


if __name__ == "__main__":
    _main()
