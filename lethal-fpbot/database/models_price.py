"""Price Tracker — история цен лотов продавца.

Каждый день (или по запросу) снимаем текущие цены всех лотов и
пишем в lot_price_history. По этой истории потом строим графики,
ищем аномалии («цена упала на 50%») и даём советы smart_pricing.
"""

from __future__ import annotations

from typing import Any

from database.db import connect
from utils.helpers import now_ts


async def record_snapshot(
    user_id: int,
    fp_account_id: int | None,
    lot_id: str,
    lot_title: str | None,
    price: float,
    currency: str | None = None,
) -> int:
    async with connect() as db:
        cur = await db.execute(
            """
            INSERT INTO lot_price_history
                (user_id, fp_account_id, lot_id, lot_title, price, currency, snapshot_ts)
            VALUES (?, ?, ?, ?, ?, ?, ?)
            """,
            (user_id, fp_account_id, lot_id, lot_title, price, currency, now_ts()),
        )
        await db.commit()
        return int(cur.lastrowid or 0)


async def get_lot_history(
    user_id: int, lot_id: str, limit: int = 100
) -> list[dict[str, Any]]:
    async with connect() as db:
        cur = await db.execute(
            """
            SELECT * FROM lot_price_history
             WHERE user_id = ? AND lot_id = ?
             ORDER BY snapshot_ts DESC
             LIMIT ?
            """,
            (user_id, lot_id, limit),
        )
        return [dict(r) for r in await cur.fetchall()]


async def get_lot_price_change(
    user_id: int, lot_id: str, window_days: int = 7
) -> dict[str, Any] | None:
    """Сравнивает текущую цену с ценой N дней назад."""
    async with connect() as db:
        cur = await db.execute(
            """
            SELECT price, snapshot_ts FROM lot_price_history
             WHERE user_id = ? AND lot_id = ?
             ORDER BY snapshot_ts DESC
             LIMIT 1
            """,
            (user_id, lot_id),
        )
        last_row = await cur.fetchone()
        if not last_row:
            return None

        cur = await db.execute(
            """
            SELECT price FROM lot_price_history
             WHERE user_id = ? AND lot_id = ? AND snapshot_ts <= ?
             ORDER BY snapshot_ts DESC
             LIMIT 1
            """,
            (user_id, lot_id, now_ts() - window_days * 86400),
        )
        old_row = await cur.fetchone()

    if not old_row:
        return None

    current = float(last_row["price"])
    old = float(old_row["price"])
    if old == 0:
        return None

    delta = current - old
    pct = (delta / old) * 100

    return {
        "current": current,
        "old": old,
        "delta": delta,
        "pct": round(pct, 1),
        "direction": "up" if delta > 0 else ("down" if delta < 0 else "flat"),
    }


async def list_lots_with_history(user_id: int) -> list[str]:
    """Возвращает список уникальных lot_id для которых есть история."""
    async with connect() as db:
        cur = await db.execute(
            """
            SELECT DISTINCT lot_id FROM lot_price_history
             WHERE user_id = ?
            """,
            (user_id,),
        )
        return [r["lot_id"] for r in await cur.fetchall()]


async def detect_anomalies(user_id: int, threshold_pct: float = 20.0) -> list[dict]:
    """Находит лоты с резким изменением цены (>threshold% за неделю)."""
    lot_ids = await list_lots_with_history(user_id)
    anomalies = []
    for lot_id in lot_ids:
        change = await get_lot_price_change(user_id, lot_id, window_days=7)
        if change and abs(change["pct"]) >= threshold_pct:
            anomalies.append(
                {
                    "lot_id": lot_id,
                    "change": change,
                }
            )
    return anomalies


# --------------------- lot templates --------------------------------------


async def save_template(
    user_id: int,
    name: str,
    title_template: str,
    description_template: str,
    game: str | None = None,
    item_type: str | None = None,
    default_price: float | None = None,
) -> int:
    async with connect() as db:
        cur = await db.execute(
            """
            INSERT INTO lot_templates
                (user_id, name, game, item_type, title_template,
                 description_template, default_price, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                user_id,
                name[:100],
                game,
                item_type,
                title_template[:500],
                description_template[:3000],
                default_price,
                now_ts(),
            ),
        )
        await db.commit()
        return int(cur.lastrowid or 0)


async def list_templates(user_id: int) -> list[dict[str, Any]]:
    async with connect() as db:
        cur = await db.execute(
            """
            SELECT * FROM lot_templates
             WHERE user_id = ?
             ORDER BY use_count DESC, created_at DESC
            """,
            (user_id,),
        )
        return [dict(r) for r in await cur.fetchall()]


async def get_template(template_id: int, user_id: int) -> dict[str, Any] | None:
    async with connect() as db:
        cur = await db.execute(
            "SELECT * FROM lot_templates WHERE id = ? AND user_id = ?",
            (template_id, user_id),
        )
        row = await cur.fetchone()
        return dict(row) if row else None


async def delete_template(template_id: int, user_id: int) -> bool:
    async with connect() as db:
        cur = await db.execute(
            "DELETE FROM lot_templates WHERE id = ? AND user_id = ?",
            (template_id, user_id),
        )
        await db.commit()
        return (cur.rowcount or 0) > 0


async def increment_template_use(template_id: int) -> None:
    async with connect() as db:
        await db.execute(
            "UPDATE lot_templates SET use_count = use_count + 1 WHERE id = ?",
            (template_id,),
        )
        await db.commit()
