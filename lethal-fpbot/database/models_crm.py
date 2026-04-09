"""CRM — клиенты, взаимодействия, теги, заметки.

Центральная идея: каждый FP-покупатель (fp_username), с которым
продавец когда-либо контактировал, становится записью в customers.
Для каждого считаем метрики: orders_count, total_spent, avg_order_value,
LTV, refund_count, reviews_positive/negative, сегмент.

Все операции order_watcher / chat_watcher / review_watcher должны
дёргать touch_customer() чтобы CRM знал про контакт и обновлял
метрики.
"""

from __future__ import annotations

from typing import Any

from database.db import connect
from utils.helpers import now_ts

# ----------------------------- SEGMENTS ------------------------------------

SEGMENT_NEW = "new"  # до первой покупки или <7 дней с регистрации
SEGMENT_REGULAR = "regular"  # 1-3 покупки
SEGMENT_VIP = "vip"  # 4+ покупок или LTV > 5000
SEGMENT_SLEEPING = "sleeping"  # нет покупок >30 дней после предыдущей
SEGMENT_CHURN_RISK = "churn_risk"  # нет покупок >90 дней при LTV>1000
SEGMENT_PROBLEMATIC = "problematic"  # >30% refund'ов или 2+ отрицательных отзыва
SEGMENT_LOST = "lost"  # не видели >180 дней

ALL_SEGMENTS = [
    SEGMENT_NEW,
    SEGMENT_REGULAR,
    SEGMENT_VIP,
    SEGMENT_SLEEPING,
    SEGMENT_CHURN_RISK,
    SEGMENT_PROBLEMATIC,
    SEGMENT_LOST,
]

SEGMENT_EMOJI = {
    SEGMENT_NEW: "🆕",
    SEGMENT_REGULAR: "👤",
    SEGMENT_VIP: "💎",
    SEGMENT_SLEEPING: "💤",
    SEGMENT_CHURN_RISK: "⚠️",
    SEGMENT_PROBLEMATIC: "🚫",
    SEGMENT_LOST: "❌",
}

SEGMENT_NAMES = {
    SEGMENT_NEW: "Новый",
    SEGMENT_REGULAR: "Постоянный",
    SEGMENT_VIP: "VIP",
    SEGMENT_SLEEPING: "Спящий",
    SEGMENT_CHURN_RISK: "Риск ухода",
    SEGMENT_PROBLEMATIC: "Проблемный",
    SEGMENT_LOST: "Потерян",
}


# ----------------------------- CUSTOMERS -----------------------------------

async def get_customer(user_id: int, fp_username: str) -> dict | None:
    async with connect() as db:
        cur = await db.execute(
            "SELECT * FROM customers WHERE user_id = ? AND fp_username = ?",
            (user_id, fp_username),
        )
        row = await cur.fetchone()
        return dict(row) if row else None


async def get_customer_by_id(customer_id: int) -> dict | None:
    async with connect() as db:
        cur = await db.execute(
            "SELECT * FROM customers WHERE id = ?", (customer_id,)
        )
        row = await cur.fetchone()
        return dict(row) if row else None


async def create_customer(user_id: int, fp_username: str) -> int:
    """Создаёт клиента если не существует. Возвращает id."""
    existing = await get_customer(user_id, fp_username)
    if existing:
        return int(existing["id"])
    async with connect() as db:
        cur = await db.execute(
            """
            INSERT INTO customers
                (user_id, fp_username, first_seen, last_seen, created_at)
            VALUES (?, ?, ?, ?, ?)
            """,
            (user_id, fp_username, now_ts(), now_ts(), now_ts()),
        )
        await db.commit()
        return int(cur.lastrowid or 0)


async def touch_customer(
    user_id: int,
    fp_username: str,
    *,
    kind: str,
    details: str | None = None,
    amount: int | None = None,
) -> int:
    """Фиксирует контакт с клиентом.

    kind: "message_in" / "message_out" / "order" / "review_positive"
          / "review_negative" / "refund"

    Обновляет метрики customers и пишет запись в customer_interactions.
    Возвращает id клиента.
    """
    customer_id = await create_customer(user_id, fp_username)

    async with connect() as db:
        # Инкрементим нужные поля
        if kind == "order" and amount:
            await db.execute(
                """
                UPDATE customers
                   SET orders_count = orders_count + 1,
                       total_spent = total_spent + ?,
                       last_order_ts = ?,
                       last_seen = ?,
                       avg_order_value = CAST(total_spent + ? AS REAL) / (orders_count + 1)
                 WHERE id = ?
                """,
                (amount, now_ts(), now_ts(), amount, customer_id),
            )
        elif kind == "message_in" or kind == "message_out":
            await db.execute(
                """
                UPDATE customers
                   SET messages_count = messages_count + 1,
                       last_seen = ?
                 WHERE id = ?
                """,
                (now_ts(), customer_id),
            )
        elif kind == "review_positive":
            await db.execute(
                """
                UPDATE customers
                   SET reviews_given = reviews_given + 1,
                       reviews_positive = reviews_positive + 1,
                       last_seen = ?
                 WHERE id = ?
                """,
                (now_ts(), customer_id),
            )
        elif kind == "review_negative":
            await db.execute(
                """
                UPDATE customers
                   SET reviews_given = reviews_given + 1,
                       reviews_negative = reviews_negative + 1,
                       last_seen = ?
                 WHERE id = ?
                """,
                (now_ts(), customer_id),
            )
        elif kind == "refund":
            await db.execute(
                """
                UPDATE customers
                   SET refund_count = refund_count + 1,
                       last_seen = ?
                 WHERE id = ?
                """,
                (now_ts(), customer_id),
            )
        else:
            await db.execute(
                "UPDATE customers SET last_seen = ? WHERE id = ?",
                (now_ts(), customer_id),
            )

        # Interaction log
        await db.execute(
            """
            INSERT INTO customer_interactions
                (customer_id, kind, details, amount, timestamp)
            VALUES (?, ?, ?, ?, ?)
            """,
            (customer_id, kind, details, amount, now_ts()),
        )
        await db.commit()

    # Пересчёт сегмента и LTV
    await _recompute_metrics(customer_id)
    return customer_id


async def _recompute_metrics(customer_id: int) -> None:
    """Пересчёт LTV и сегмента клиента."""
    async with connect() as db:
        cur = await db.execute(
            "SELECT * FROM customers WHERE id = ?", (customer_id,)
        )
        c = await cur.fetchone()
        if not c:
            return
        c = dict(c)

    # LTV = total_spent (в простой форме) + бонус за отзывы и повторные покупки
    ltv = float(c["total_spent"])
    if c["reviews_positive"] > 0:
        ltv *= 1.05  # +5% за хорошие отзывы
    if c["orders_count"] >= 3:
        ltv *= 1.10  # +10% за постоянство
    if c["refund_count"] > 0:
        ltv *= 0.9  # -10% за проблемные рефанды

    # Сегментация
    now = now_ts()
    has_orders = c["orders_count"] > 0
    days_since_last_order = (
        (now - c["last_order_ts"]) // 86400 if c["last_order_ts"] else 0
    )
    days_since_seen = (now - c["last_seen"]) // 86400 if c["last_seen"] else 0

    refund_rate = (
        c["refund_count"] / max(c["orders_count"], 1) if c["orders_count"] else 0
    )

    # Приоритеты: проблемный > VIP > обычная последовательность
    if refund_rate > 0.3 or c["reviews_negative"] >= 2:
        segment = SEGMENT_PROBLEMATIC
    elif has_orders and (c["orders_count"] >= 4 or c["total_spent"] >= 5000):
        # VIP вычисляем ДО проверок на sleeping/lost чтобы VIP не "протухал"
        # из-за давности последней покупки — если есть 4+ покупок, он VIP пока
        # не станет churn_risk.
        if days_since_last_order > 90:
            segment = SEGMENT_CHURN_RISK
        else:
            segment = SEGMENT_VIP
    elif has_orders and days_since_last_order > 180:
        segment = SEGMENT_LOST
    elif has_orders and days_since_last_order > 90 and c["total_spent"] > 1000:
        segment = SEGMENT_CHURN_RISK
    elif has_orders and days_since_last_order > 30:
        segment = SEGMENT_SLEEPING
    elif has_orders:
        segment = SEGMENT_REGULAR
    else:
        # Нет заказов
        if days_since_seen > 180:
            segment = SEGMENT_LOST
        else:
            segment = SEGMENT_NEW

    async with connect() as db:
        await db.execute(
            "UPDATE customers SET ltv = ?, segment = ? WHERE id = ?",
            (ltv, segment, customer_id),
        )
        await db.commit()


async def list_customers(
    user_id: int,
    segment: str | None = None,
    limit: int = 50,
    offset: int = 0,
    order_by: str = "last_seen",
) -> list[dict]:
    allowed_order = {
        "last_seen",
        "total_spent",
        "orders_count",
        "ltv",
        "first_seen",
    }
    if order_by not in allowed_order:
        order_by = "last_seen"

    query = "SELECT * FROM customers WHERE user_id = ?"
    params: list = [user_id]
    if segment:
        query += " AND segment = ?"
        params.append(segment)
    query += f" ORDER BY {order_by} DESC LIMIT ? OFFSET ?"
    params.extend([limit, offset])

    async with connect() as db:
        cur = await db.execute(query, tuple(params))
        return [dict(r) for r in await cur.fetchall()]


async def search_customers(user_id: int, query: str, limit: int = 20) -> list[dict]:
    async with connect() as db:
        cur = await db.execute(
            """
            SELECT * FROM customers
             WHERE user_id = ? AND fp_username LIKE ?
             ORDER BY last_seen DESC
             LIMIT ?
            """,
            (user_id, f"%{query}%", limit),
        )
        return [dict(r) for r in await cur.fetchall()]


async def count_by_segment(user_id: int) -> dict[str, int]:
    async with connect() as db:
        cur = await db.execute(
            """
            SELECT segment, COUNT(*) AS cnt
              FROM customers
             WHERE user_id = ?
             GROUP BY segment
            """,
            (user_id,),
        )
        return {row["segment"]: int(row["cnt"]) for row in await cur.fetchall()}


# ----------------------------- INTERACTIONS --------------------------------

async def list_interactions(customer_id: int, limit: int = 50) -> list[dict]:
    async with connect() as db:
        cur = await db.execute(
            """
            SELECT * FROM customer_interactions
             WHERE customer_id = ?
             ORDER BY timestamp DESC
             LIMIT ?
            """,
            (customer_id, limit),
        )
        return [dict(r) for r in await cur.fetchall()]


# ----------------------------- TAGS ----------------------------------------

async def add_tag(customer_id: int, tag: str) -> bool:
    tag = tag.strip().lower()[:32]
    if not tag:
        return False
    async with connect() as db:
        try:
            await db.execute(
                """
                INSERT INTO customer_tags (customer_id, tag, created_at)
                VALUES (?, ?, ?)
                """,
                (customer_id, tag, now_ts()),
            )
            await db.commit()
            return True
        except Exception:
            return False


async def remove_tag(customer_id: int, tag: str) -> bool:
    async with connect() as db:
        cur = await db.execute(
            "DELETE FROM customer_tags WHERE customer_id = ? AND tag = ?",
            (customer_id, tag.strip().lower()),
        )
        await db.commit()
        return (cur.rowcount or 0) > 0


async def list_tags(customer_id: int) -> list[str]:
    async with connect() as db:
        cur = await db.execute(
            "SELECT tag FROM customer_tags WHERE customer_id = ? ORDER BY tag",
            (customer_id,),
        )
        return [r["tag"] for r in await cur.fetchall()]


async def find_by_tag(user_id: int, tag: str, limit: int = 50) -> list[dict]:
    async with connect() as db:
        cur = await db.execute(
            """
            SELECT c.* FROM customers c
              JOIN customer_tags t ON t.customer_id = c.id
             WHERE c.user_id = ? AND t.tag = ?
             ORDER BY c.last_seen DESC
             LIMIT ?
            """,
            (user_id, tag.strip().lower(), limit),
        )
        return [dict(r) for r in await cur.fetchall()]


# ----------------------------- NOTES ---------------------------------------

async def add_note(customer_id: int, text: str) -> int:
    async with connect() as db:
        cur = await db.execute(
            """
            INSERT INTO customer_notes (customer_id, text, created_at)
            VALUES (?, ?, ?)
            """,
            (customer_id, text, now_ts()),
        )
        await db.commit()
        return int(cur.lastrowid or 0)


async def list_notes(customer_id: int) -> list[dict]:
    async with connect() as db:
        cur = await db.execute(
            """
            SELECT * FROM customer_notes
             WHERE customer_id = ?
             ORDER BY created_at DESC
            """,
            (customer_id,),
        )
        return [dict(r) for r in await cur.fetchall()]


async def delete_note(note_id: int, customer_id: int) -> bool:
    async with connect() as db:
        cur = await db.execute(
            "DELETE FROM customer_notes WHERE id = ? AND customer_id = ?",
            (note_id, customer_id),
        )
        await db.commit()
        return (cur.rowcount or 0) > 0


# ----------------------------- AGGREGATES ----------------------------------

async def user_crm_summary(user_id: int) -> dict[str, Any]:
    """Глобальная сводка по всем клиентам одного пользователя."""
    async with connect() as db:
        cur = await db.execute(
            """
            SELECT
                COUNT(*) AS total,
                COALESCE(SUM(total_spent), 0) AS total_revenue,
                COALESCE(AVG(avg_order_value), 0) AS avg_aov,
                COALESCE(AVG(ltv), 0) AS avg_ltv,
                COALESCE(SUM(orders_count), 0) AS total_orders,
                COALESCE(SUM(CASE WHEN orders_count > 1 THEN 1 ELSE 0 END), 0) AS repeat_buyers
              FROM customers
             WHERE user_id = ?
            """,
            (user_id,),
        )
        row = await cur.fetchone()

    if not row:
        return {
            "total": 0,
            "total_revenue": 0,
            "avg_aov": 0,
            "avg_ltv": 0,
            "total_orders": 0,
            "repeat_buyers": 0,
            "repeat_rate": 0.0,
        }

    r = dict(row)
    repeat_rate = (
        r["repeat_buyers"] / r["total"] * 100 if r["total"] else 0
    )
    r["repeat_rate"] = round(repeat_rate, 1)
    return r
