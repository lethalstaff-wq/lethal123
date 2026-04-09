"""Экспорт статистики в CSV / Excel / JSON.

Pro-фича: пользователь может скачать свою статистику за любой период
в нужном формате. Удобно для налоговой отчётности и аналитики в
сторонних инструментах.

Генерация в памяти (BytesIO) — файл сразу отсылается как document.
"""

from __future__ import annotations

import csv
import io
import json
from datetime import UTC, datetime

from database.db import connect

# ------------------------------- CSV ---------------------------------------


async def export_stats_csv(
    user_id: int, start_ts: int, end_ts: int
) -> bytes:
    """Экспорт stats в CSV."""
    buf = io.StringIO()
    writer = csv.writer(buf)
    writer.writerow(
        ["timestamp", "date", "lot_name", "buyer", "amount", "fp_account_id"]
    )

    async with connect() as db:
        cur = await db.execute(
            """
            SELECT * FROM stats
             WHERE user_id = ? AND timestamp >= ? AND timestamp <= ?
             ORDER BY timestamp
            """,
            (user_id, start_ts, end_ts),
        )
        rows = await cur.fetchall()

    for row in rows:
        dt = datetime.fromtimestamp(row["timestamp"], tz=UTC)
        writer.writerow(
            [
                row["timestamp"],
                dt.strftime("%Y-%m-%d %H:%M:%S"),
                row["lot_name"] or "",
                row["buyer"] or "",
                row["amount"],
                row["fp_account_id"] or "",
            ]
        )

    return buf.getvalue().encode("utf-8-sig")  # BOM для Excel


async def export_customers_csv(user_id: int) -> bytes:
    buf = io.StringIO()
    writer = csv.writer(buf)
    writer.writerow(
        [
            "fp_username",
            "segment",
            "orders_count",
            "total_spent",
            "avg_order_value",
            "ltv",
            "refund_count",
            "reviews_positive",
            "reviews_negative",
            "first_seen",
            "last_seen",
            "last_order",
        ]
    )

    async with connect() as db:
        cur = await db.execute(
            "SELECT * FROM customers WHERE user_id = ? ORDER BY total_spent DESC",
            (user_id,),
        )
        rows = await cur.fetchall()

    for row in rows:
        def _fmt_date(ts):
            return (
                datetime.fromtimestamp(ts, tz=UTC).strftime("%Y-%m-%d")
                if ts
                else ""
            )

        writer.writerow(
            [
                row["fp_username"],
                row["segment"],
                row["orders_count"],
                row["total_spent"],
                round(row["avg_order_value"], 2),
                round(row["ltv"], 2),
                row["refund_count"],
                row["reviews_positive"],
                row["reviews_negative"],
                _fmt_date(row["first_seen"]),
                _fmt_date(row["last_seen"]),
                _fmt_date(row["last_order_ts"]),
            ]
        )

    return buf.getvalue().encode("utf-8-sig")


# ------------------------------- JSON --------------------------------------


async def export_all_json(user_id: int) -> bytes:
    """Полный дамп — stats + customers + interactions + settings."""
    result: dict = {}

    async with connect() as db:
        # Stats
        cur = await db.execute(
            "SELECT * FROM stats WHERE user_id = ? ORDER BY timestamp",
            (user_id,),
        )
        result["stats"] = [dict(r) for r in await cur.fetchall()]

        # Customers
        cur = await db.execute(
            "SELECT * FROM customers WHERE user_id = ? ORDER BY id",
            (user_id,),
        )
        result["customers"] = [dict(r) for r in await cur.fetchall()]

        # Interactions — только последние 1000 на клиента, иначе много
        cur = await db.execute(
            """
            SELECT ci.* FROM customer_interactions ci
              JOIN customers c ON c.id = ci.customer_id
             WHERE c.user_id = ?
             ORDER BY ci.timestamp DESC
             LIMIT 5000
            """,
            (user_id,),
        )
        result["interactions"] = [dict(r) for r in await cur.fetchall()]

        # Settings
        cur = await db.execute(
            "SELECT * FROM settings WHERE user_id = ?", (user_id,)
        )
        s = await cur.fetchone()
        result["settings"] = dict(s) if s else {}

    result["exported_at"] = datetime.now(tz=UTC).isoformat()
    result["user_id"] = user_id

    return json.dumps(result, ensure_ascii=False, indent=2).encode("utf-8")


# ------------------------------- tax report -------------------------------


async def generate_tax_report(
    user_id: int, start_ts: int, end_ts: int
) -> bytes:
    """Простая сводка для самозанятого/ИП.

    Группировка по месяцам, итоги — выручка, кол-во продаж, средний чек.
    Формат — текст с Unicode-таблицей, отдаётся как .txt файл.
    """
    async with connect() as db:
        cur = await db.execute(
            """
            SELECT
                strftime('%Y-%m', timestamp, 'unixepoch') AS month,
                COUNT(*) AS cnt,
                SUM(amount) AS total
              FROM stats
             WHERE user_id = ? AND timestamp >= ? AND timestamp <= ?
             GROUP BY month
             ORDER BY month
            """,
            (user_id, start_ts, end_ts),
        )
        rows = await cur.fetchall()

    lines = [
        "ОТЧЁТ ПО ВЫРУЧКЕ FUNPAY",
        "=" * 60,
        f"Период: {datetime.fromtimestamp(start_ts, tz=UTC).strftime('%Y-%m-%d')} "
        f"— {datetime.fromtimestamp(end_ts, tz=UTC).strftime('%Y-%m-%d')}",
        "",
        f"{'Месяц':<12} {'Заказов':>10} {'Выручка, ₽':>15} {'Средний чек':>15}",
        "-" * 60,
    ]

    total_orders = 0
    total_revenue = 0
    for row in rows:
        month = row["month"]
        cnt = int(row["cnt"])
        total = int(row["total"] or 0)
        avg = total / cnt if cnt else 0
        lines.append(f"{month:<12} {cnt:>10} {total:>15,} {avg:>15,.0f}".replace(",", " "))
        total_orders += cnt
        total_revenue += total

    lines.append("-" * 60)
    avg_total = total_revenue / total_orders if total_orders else 0
    lines.append(
        f"{'ИТОГО':<12} {total_orders:>10} {total_revenue:>15,} {avg_total:>15,.0f}".replace(",", " ")
    )
    lines.append("")
    lines.append("Сгенерировано: " + datetime.now(tz=UTC).isoformat())
    lines.append("Lethal FunPay Bot")

    return "\n".join(lines).encode("utf-8")
