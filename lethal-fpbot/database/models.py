"""CRUD-обёртки над таблицами SQLite.

Каждая функция возвращает обычные dict / list[dict], чтобы хендлерам
не приходилось импортировать aiosqlite. Все потенциально-секретные поля
(пароль, golden_key) хранятся уже зашифрованными — шифрование делается
на уровне хендлеров через utils.encryption.
"""

from __future__ import annotations

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
