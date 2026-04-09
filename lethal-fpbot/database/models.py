"""CRUD-обёртки над таблицами SQLite.

Каждая функция возвращает обычные dict / list[dict], чтобы хендлерам
не приходилось импортировать aiosqlite. Все потенциально-секретные поля
(пароль, golden_key) хранятся уже зашифрованными — шифрование делается
на уровне хендлеров через utils.encryption.
"""

from __future__ import annotations

import json
from typing import Any

from .db import connect
from utils.helpers import gen_referral_code, now_ts


# ----------------------------- USERS ---------------------------------------

async def get_or_create_user(
    telegram_id: int, username: str | None, referred_by: int | None = None
) -> dict[str, Any]:
    """Возвращает пользователя, создаёт если не существует."""
    async with connect() as db:
        cur = await db.execute(
            "SELECT * FROM users WHERE telegram_id = ?", (telegram_id,)
        )
        row = await cur.fetchone()
        if row:
            # Обновим username если изменился
            if username and row["username"] != username:
                await db.execute(
                    "UPDATE users SET username = ? WHERE id = ?",
                    (username, row["id"]),
                )
                await db.commit()
            return dict(row)

        # Гарантируем уникальность реф-кода
        for _ in range(10):
            code = gen_referral_code()
            cur2 = await db.execute(
                "SELECT 1 FROM users WHERE referral_code = ?", (code,)
            )
            if not await cur2.fetchone():
                break

        await db.execute(
            """
            INSERT INTO users
                (telegram_id, username, referral_code, referred_by, created_at)
            VALUES (?, ?, ?, ?, ?)
            """,
            (telegram_id, username, code, referred_by, now_ts()),
        )
        await db.commit()

        cur3 = await db.execute(
            "SELECT * FROM users WHERE telegram_id = ?", (telegram_id,)
        )
        new_row = await cur3.fetchone()
        # Заводим дефолтные настройки
        await db.execute(
            "INSERT OR IGNORE INTO settings (user_id) VALUES (?)",
            (new_row["id"],),
        )
        await db.commit()
        return dict(new_row)


async def get_user_by_tg(telegram_id: int) -> dict[str, Any] | None:
    async with connect() as db:
        cur = await db.execute(
            "SELECT * FROM users WHERE telegram_id = ?", (telegram_id,)
        )
        row = await cur.fetchone()
        return dict(row) if row else None


async def update_user_subscription(
    user_id: int, tier: str, expires_ts: int
) -> None:
    async with connect() as db:
        await db.execute(
            """
            UPDATE users
               SET subscription_tier = ?, subscription_expires = ?
             WHERE id = ?
            """,
            (tier, expires_ts, user_id),
        )
        await db.commit()


# --------------------------- FP ACCOUNTS -----------------------------------

async def add_fp_account(
    user_id: int,
    login: str,
    password_enc: str,
    proxy: str | None,
    golden_key_enc: str | None,
    user_agent: str | None,
) -> int:
    async with connect() as db:
        cur = await db.execute(
            """
            INSERT INTO fp_accounts
                (user_id, login, password, proxy, golden_key,
                 user_agent, last_session_update, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                user_id,
                login,
                password_enc,
                proxy,
                golden_key_enc,
                user_agent,
                now_ts(),
                now_ts(),
            ),
        )
        await db.commit()
        return cur.lastrowid or 0


async def list_fp_accounts(user_id: int) -> list[dict[str, Any]]:
    async with connect() as db:
        cur = await db.execute(
            "SELECT * FROM fp_accounts WHERE user_id = ? ORDER BY id",
            (user_id,),
        )
        rows = await cur.fetchall()
        return [dict(r) for r in rows]


async def count_fp_accounts(user_id: int) -> int:
    async with connect() as db:
        cur = await db.execute(
            "SELECT COUNT(*) AS c FROM fp_accounts WHERE user_id = ?",
            (user_id,),
        )
        row = await cur.fetchone()
        return int(row["c"]) if row else 0


async def get_fp_account(account_id: int, user_id: int) -> dict[str, Any] | None:
    async with connect() as db:
        cur = await db.execute(
            "SELECT * FROM fp_accounts WHERE id = ? AND user_id = ?",
            (account_id, user_id),
        )
        row = await cur.fetchone()
        return dict(row) if row else None


async def delete_fp_account(account_id: int, user_id: int) -> bool:
    async with connect() as db:
        cur = await db.execute(
            "DELETE FROM fp_accounts WHERE id = ? AND user_id = ?",
            (account_id, user_id),
        )
        await db.commit()
        return (cur.rowcount or 0) > 0


async def update_fp_session(
    account_id: int, golden_key_enc: str, is_online: bool
) -> None:
    async with connect() as db:
        await db.execute(
            """
            UPDATE fp_accounts
               SET golden_key = ?, is_online = ?, last_session_update = ?
             WHERE id = ?
            """,
            (golden_key_enc, 1 if is_online else 0, now_ts(), account_id),
        )
        await db.commit()


async def update_fp_proxy(account_id: int, user_id: int, proxy: str | None) -> bool:
    async with connect() as db:
        cur = await db.execute(
            "UPDATE fp_accounts SET proxy = ? WHERE id = ? AND user_id = ?",
            (proxy, account_id, user_id),
        )
        await db.commit()
        return (cur.rowcount or 0) > 0


# ---------------------------- SETTINGS -------------------------------------

async def get_settings(user_id: int) -> dict[str, Any]:
    async with connect() as db:
        cur = await db.execute(
            "SELECT * FROM settings WHERE user_id = ?", (user_id,)
        )
        row = await cur.fetchone()
        if row:
            return dict(row)
        await db.execute(
            "INSERT INTO settings (user_id) VALUES (?)", (user_id,)
        )
        await db.commit()
        cur2 = await db.execute(
            "SELECT * FROM settings WHERE user_id = ?", (user_id,)
        )
        return dict(await cur2.fetchone())


async def update_setting(user_id: int, key: str, value: Any) -> None:
    # whitelistим имена колонок чтобы избежать SQL-инъекции
    allowed = {
        "auto_raise", "raise_interval", "auto_delivery", "auto_response",
        "always_online", "ask_review", "ask_confirm", "confirm_minutes",
        "auto_complaint", "complaint_hours", "complaint_text",
        "review_reply", "cross_sell", "cross_sell_text",
        "funnel_enabled", "funnel_delay_minutes", "funnel_text",
        "anti_scam", "smart_pricing", "auto_price_adjust",
    }
    if key not in allowed:
        raise ValueError(f"Недопустимое поле настроек: {key}")
    async with connect() as db:
        await db.execute(
            f"UPDATE settings SET {key} = ? WHERE user_id = ?",
            (value, user_id),
        )
        await db.commit()


async def list_active_fp_accounts() -> list[dict[str, Any]]:
    """Глобально все активные ФП-аккаунты — для фоновых задач."""
    async with connect() as db:
        cur = await db.execute(
            "SELECT * FROM fp_accounts WHERE is_active = 1"
        )
        rows = await cur.fetchall()
        return [dict(r) for r in rows]


async def get_user_by_id(user_id: int) -> dict[str, Any] | None:
    async with connect() as db:
        cur = await db.execute(
            "SELECT * FROM users WHERE id = ?", (user_id,)
        )
        row = await cur.fetchone()
        return dict(row) if row else None


async def add_balance(user_id: int, delta: int) -> None:
    async with connect() as db:
        await db.execute(
            "UPDATE users SET balance = balance + ? WHERE id = ?",
            (delta, user_id),
        )
        await db.commit()


# -------------------------- AUTO RESPONSES ---------------------------------

async def list_auto_responses(user_id: int) -> list[dict[str, Any]]:
    async with connect() as db:
        cur = await db.execute(
            "SELECT * FROM auto_responses WHERE user_id = ? ORDER BY id",
            (user_id,),
        )
        rows = await cur.fetchall()
        out = []
        for r in rows:
            d = dict(r)
            try:
                d["trigger_words"] = json.loads(d["trigger_words"])
            except (json.JSONDecodeError, TypeError):
                d["trigger_words"] = []
            out.append(d)
        return out


async def add_auto_response(
    user_id: int, triggers: list[str], response: str
) -> int:
    async with connect() as db:
        cur = await db.execute(
            """
            INSERT INTO auto_responses
                (user_id, trigger_words, response_text, is_active)
            VALUES (?, ?, ?, 1)
            """,
            (user_id, json.dumps(triggers, ensure_ascii=False), response),
        )
        await db.commit()
        return cur.lastrowid or 0


async def delete_auto_response(rid: int, user_id: int) -> bool:
    async with connect() as db:
        cur = await db.execute(
            "DELETE FROM auto_responses WHERE id = ? AND user_id = ?",
            (rid, user_id),
        )
        await db.commit()
        return (cur.rowcount or 0) > 0


async def find_matching_response(user_id: int, text: str) -> str | None:
    """Находит первый подходящий ответ по триггерам."""
    if not text:
        return None
    text_low = text.lower()
    rules = await list_auto_responses(user_id)
    for r in rules:
        if not r.get("is_active"):
            continue
        for trig in r["trigger_words"]:
            if trig and trig.lower() in text_low:
                return r["response_text"]
    return None


# -------------------------- AUTO DELIVERY ----------------------------------

async def list_auto_delivery(user_id: int) -> list[dict[str, Any]]:
    async with connect() as db:
        cur = await db.execute(
            "SELECT * FROM auto_delivery WHERE user_id = ? ORDER BY id",
            (user_id,),
        )
        rows = await cur.fetchall()
        out = []
        for r in rows:
            d = dict(r)
            try:
                d["items"] = json.loads(d["items"])
            except (json.JSONDecodeError, TypeError):
                d["items"] = []
            out.append(d)
        return out


async def add_auto_delivery(
    user_id: int,
    fp_account_id: int | None,
    lot_name: str,
    items: list[str],
    template: str | None,
) -> int:
    async with connect() as db:
        cur = await db.execute(
            """
            INSERT INTO auto_delivery
                (user_id, fp_account_id, lot_name, items, template, is_active)
            VALUES (?, ?, ?, ?, ?, 1)
            """,
            (
                user_id,
                fp_account_id,
                lot_name,
                json.dumps(items, ensure_ascii=False),
                template,
            ),
        )
        await db.commit()
        return cur.lastrowid or 0


async def delete_auto_delivery(rid: int, user_id: int) -> bool:
    async with connect() as db:
        cur = await db.execute(
            "DELETE FROM auto_delivery WHERE id = ? AND user_id = ?",
            (rid, user_id),
        )
        await db.commit()
        return (cur.rowcount or 0) > 0


async def pop_auto_delivery_item(rid: int) -> str | None:
    """Берёт первый товар из items и удаляет его. Атомарно — через запрос."""
    async with connect() as db:
        cur = await db.execute(
            "SELECT items, template FROM auto_delivery WHERE id = ?", (rid,)
        )
        row = await cur.fetchone()
        if not row:
            return None
        try:
            items = json.loads(row["items"])
        except (json.JSONDecodeError, TypeError):
            return None
        if not items:
            return None
        item = items.pop(0)
        await db.execute(
            "UPDATE auto_delivery SET items = ? WHERE id = ?",
            (json.dumps(items, ensure_ascii=False), rid),
        )
        await db.commit()
        return item


async def find_delivery_for_lot(
    user_id: int, lot_name: str, fp_account_id: int | None = None
) -> dict[str, Any] | None:
    """Ищет правило автовыдачи для лота (case-insensitive по подстроке)."""
    items = await list_auto_delivery(user_id)
    needle = (lot_name or "").lower()
    for it in items:
        if not it.get("is_active"):
            continue
        if fp_account_id and it.get("fp_account_id") not in (None, fp_account_id):
            continue
        if it["lot_name"].lower() in needle or needle in it["lot_name"].lower():
            return it
    return None


# -------------------------- PREPARED TEXTS ---------------------------------

async def list_texts(user_id: int) -> list[dict[str, Any]]:
    async with connect() as db:
        cur = await db.execute(
            "SELECT * FROM prepared_texts WHERE user_id = ? ORDER BY id",
            (user_id,),
        )
        return [dict(r) for r in await cur.fetchall()]


async def add_text(user_id: int, name: str, text: str) -> int:
    async with connect() as db:
        cur = await db.execute(
            "INSERT INTO prepared_texts (user_id, name, text) VALUES (?, ?, ?)",
            (user_id, name, text),
        )
        await db.commit()
        return cur.lastrowid or 0


async def delete_text(tid: int, user_id: int) -> bool:
    async with connect() as db:
        cur = await db.execute(
            "DELETE FROM prepared_texts WHERE id = ? AND user_id = ?",
            (tid, user_id),
        )
        await db.commit()
        return (cur.rowcount or 0) > 0


async def get_text(tid: int, user_id: int) -> dict[str, Any] | None:
    async with connect() as db:
        cur = await db.execute(
            "SELECT * FROM prepared_texts WHERE id = ? AND user_id = ?",
            (tid, user_id),
        )
        row = await cur.fetchone()
        return dict(row) if row else None


# ------------------------- REVIEW RESPONSES --------------------------------

async def list_review_responses(user_id: int) -> list[dict[str, Any]]:
    async with connect() as db:
        cur = await db.execute(
            "SELECT * FROM review_responses WHERE user_id = ? ORDER BY rating",
            (user_id,),
        )
        return [dict(r) for r in await cur.fetchall()]


async def set_review_response(user_id: int, rating: int, text: str) -> None:
    async with connect() as db:
        cur = await db.execute(
            "SELECT id FROM review_responses WHERE user_id = ? AND rating = ?",
            (user_id, rating),
        )
        row = await cur.fetchone()
        if row:
            await db.execute(
                "UPDATE review_responses SET response_text = ? WHERE id = ?",
                (text, row["id"]),
            )
        else:
            await db.execute(
                """
                INSERT INTO review_responses (user_id, rating, response_text)
                VALUES (?, ?, ?)
                """,
                (user_id, rating, text),
            )
        await db.commit()


async def get_review_response(user_id: int, rating: int) -> str | None:
    async with connect() as db:
        cur = await db.execute(
            """
            SELECT response_text FROM review_responses
            WHERE user_id = ? AND rating = ?
            """,
            (user_id, rating),
        )
        row = await cur.fetchone()
        return row["response_text"] if row else None


# -------------------------- BLACKLIST --------------------------------------

async def list_blacklist(user_id: int) -> list[dict[str, Any]]:
    async with connect() as db:
        cur = await db.execute(
            "SELECT * FROM blacklist WHERE user_id = ? ORDER BY id",
            (user_id,),
        )
        return [dict(r) for r in await cur.fetchall()]


async def add_to_blacklist(
    user_id: int, buyer_name: str, reason: str | None
) -> int:
    async with connect() as db:
        cur = await db.execute(
            "INSERT INTO blacklist (user_id, buyer_name, reason) VALUES (?, ?, ?)",
            (user_id, buyer_name, reason),
        )
        await db.commit()
        return cur.lastrowid or 0


async def is_blacklisted(user_id: int, buyer_name: str) -> bool:
    async with connect() as db:
        cur = await db.execute(
            "SELECT 1 FROM blacklist WHERE user_id = ? AND buyer_name = ?",
            (user_id, buyer_name),
        )
        return bool(await cur.fetchone())


async def remove_from_blacklist(bid: int, user_id: int) -> bool:
    async with connect() as db:
        cur = await db.execute(
            "DELETE FROM blacklist WHERE id = ? AND user_id = ?",
            (bid, user_id),
        )
        await db.commit()
        return (cur.rowcount or 0) > 0


# -------------------------- STATS ------------------------------------------

async def add_stat(
    user_id: int,
    fp_account_id: int | None,
    amount: int,
    lot_name: str | None,
    buyer: str | None,
) -> None:
    async with connect() as db:
        await db.execute(
            """
            INSERT INTO stats
                (user_id, fp_account_id, amount, lot_name, buyer, timestamp)
            VALUES (?, ?, ?, ?, ?, ?)
            """,
            (user_id, fp_account_id, amount, lot_name, buyer, now_ts()),
        )
        await db.commit()


async def stats_summary(user_id: int, since_ts: int) -> dict[str, Any]:
    async with connect() as db:
        cur = await db.execute(
            """
            SELECT COUNT(*) AS cnt, COALESCE(SUM(amount), 0) AS total
              FROM stats
             WHERE user_id = ? AND timestamp >= ?
            """,
            (user_id, since_ts),
        )
        row = await cur.fetchone()
        return {"count": int(row["cnt"]), "total": int(row["total"])}


async def stats_top_lots(user_id: int, since_ts: int, limit: int = 5) -> list[dict]:
    async with connect() as db:
        cur = await db.execute(
            """
            SELECT lot_name, COUNT(*) AS cnt, SUM(amount) AS total
              FROM stats
             WHERE user_id = ? AND timestamp >= ?
             GROUP BY lot_name
             ORDER BY total DESC
             LIMIT ?
            """,
            (user_id, since_ts, limit),
        )
        return [dict(r) for r in await cur.fetchall()]


# -------------------------- COMPETITORS ------------------------------------

async def list_competitors(user_id: int) -> list[dict[str, Any]]:
    async with connect() as db:
        cur = await db.execute(
            "SELECT * FROM competitors WHERE user_id = ? ORDER BY id",
            (user_id,),
        )
        return [dict(r) for r in await cur.fetchall()]


async def add_competitor(user_id: int, url: str) -> int:
    async with connect() as db:
        cur = await db.execute(
            """
            INSERT INTO competitors (user_id, competitor_url, last_checked)
            VALUES (?, ?, ?)
            """,
            (user_id, url, now_ts()),
        )
        await db.commit()
        return cur.lastrowid or 0


async def update_competitor_price(cid: int, price: float) -> None:
    async with connect() as db:
        await db.execute(
            """
            UPDATE competitors
               SET last_price = ?, last_checked = ?
             WHERE id = ?
            """,
            (price, now_ts(), cid),
        )
        await db.commit()


# -------------------------- CHAT STATE -------------------------------------

async def get_chat_state(account_id: int, fp_chat_id: str) -> dict | None:
    async with connect() as db:
        cur = await db.execute(
            """
            SELECT * FROM chat_state
             WHERE account_id = ? AND fp_chat_id = ?
            """,
            (account_id, fp_chat_id),
        )
        row = await cur.fetchone()
        return dict(row) if row else None


async def upsert_chat_state(
    account_id: int,
    fp_chat_id: str,
    interlocutor: str | None,
    last_message_id: str | None,
    last_buyer_msg_ts: int | None = None,
) -> None:
    async with connect() as db:
        cur = await db.execute(
            """
            SELECT id FROM chat_state
             WHERE account_id = ? AND fp_chat_id = ?
            """,
            (account_id, fp_chat_id),
        )
        row = await cur.fetchone()
        if row:
            await db.execute(
                """
                UPDATE chat_state
                   SET interlocutor = COALESCE(?, interlocutor),
                       last_message_id = COALESCE(?, last_message_id),
                       last_buyer_msg_ts = COALESCE(?, last_buyer_msg_ts)
                 WHERE id = ?
                """,
                (
                    interlocutor,
                    last_message_id,
                    last_buyer_msg_ts,
                    row["id"],
                ),
            )
        else:
            await db.execute(
                """
                INSERT INTO chat_state
                    (account_id, fp_chat_id, interlocutor,
                     last_message_id, last_buyer_msg_ts)
                VALUES (?, ?, ?, ?, ?)
                """,
                (
                    account_id,
                    fp_chat_id,
                    interlocutor,
                    last_message_id,
                    last_buyer_msg_ts,
                ),
            )
        await db.commit()


async def list_funnel_candidates(min_age_sec: int) -> list[dict]:
    """Чаты, где покупатель писал, но мы не отвечали и воронку не слали."""
    threshold = now_ts() - min_age_sec
    async with connect() as db:
        cur = await db.execute(
            """
            SELECT cs.*, fa.user_id
              FROM chat_state cs
              JOIN fp_accounts fa ON fa.id = cs.account_id
             WHERE cs.funnel_sent = 0
               AND cs.last_buyer_msg_ts IS NOT NULL
               AND cs.last_buyer_msg_ts <= ?
            """,
            (threshold,),
        )
        return [dict(r) for r in await cur.fetchall()]


async def mark_funnel_sent(state_id: int) -> None:
    async with connect() as db:
        await db.execute(
            "UPDATE chat_state SET funnel_sent = 1 WHERE id = ?", (state_id,)
        )
        await db.commit()


# -------------------------- ORDERS SEEN ------------------------------------

async def upsert_order(
    account_id: int,
    order_id: str,
    status: str,
    buyer: str | None,
    amount: float | None,
    lot_name: str | None,
) -> tuple[bool, dict]:
    """Создаёт или обновляет запись о заказе.

    Возвращает (is_new, row).
    """
    async with connect() as db:
        cur = await db.execute(
            """
            SELECT * FROM orders_seen
             WHERE account_id = ? AND order_id = ?
            """,
            (account_id, order_id),
        )
        row = await cur.fetchone()
        if row:
            await db.execute(
                """
                UPDATE orders_seen
                   SET status = ?, last_seen = ?
                 WHERE id = ?
                """,
                (status, now_ts(), row["id"]),
            )
            await db.commit()
            return False, dict(row)

        await db.execute(
            """
            INSERT INTO orders_seen
                (account_id, order_id, status, buyer, amount,
                 lot_name, first_seen, last_seen)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                account_id,
                order_id,
                status,
                buyer,
                amount,
                lot_name,
                now_ts(),
                now_ts(),
            ),
        )
        await db.commit()
        cur2 = await db.execute(
            """
            SELECT * FROM orders_seen
             WHERE account_id = ? AND order_id = ?
            """,
            (account_id, order_id),
        )
        return True, dict(await cur2.fetchone())


async def mark_order_flag(order_row_id: int, flag: str) -> None:
    allowed = {"confirm_asked", "complaint_filed", "review_asked", "delivered"}
    if flag not in allowed:
        raise ValueError(flag)
    async with connect() as db:
        await db.execute(
            f"UPDATE orders_seen SET {flag} = 1 WHERE id = ?",
            (order_row_id,),
        )
        await db.commit()


async def list_open_orders_for_account(account_id: int) -> list[dict]:
    async with connect() as db:
        cur = await db.execute(
            """
            SELECT * FROM orders_seen
             WHERE account_id = ? AND status NOT IN ('closed', 'refunded')
            """,
            (account_id,),
        )
        return [dict(r) for r in await cur.fetchall()]


# -------------------------- PENDING PAYMENTS -------------------------------

async def create_payment(user_id: int, tier: str, amount: int) -> int:
    async with connect() as db:
        cur = await db.execute(
            """
            INSERT INTO pending_payments
                (user_id, tier, amount, status, created_at)
            VALUES (?, ?, ?, 'pending', ?)
            """,
            (user_id, tier, amount, now_ts()),
        )
        await db.commit()
        return cur.lastrowid or 0


async def list_pending_payments() -> list[dict]:
    async with connect() as db:
        cur = await db.execute(
            "SELECT * FROM pending_payments WHERE status = 'pending'"
        )
        return [dict(r) for r in await cur.fetchall()]


async def set_payment_status(
    payment_id: int, status: str, note: str | None = None
) -> dict | None:
    async with connect() as db:
        await db.execute(
            """
            UPDATE pending_payments
               SET status = ?, approved_at = ?, admin_note = ?
             WHERE id = ?
            """,
            (status, now_ts(), note, payment_id),
        )
        await db.commit()
        cur = await db.execute(
            "SELECT * FROM pending_payments WHERE id = ?", (payment_id,)
        )
        row = await cur.fetchone()
        return dict(row) if row else None
