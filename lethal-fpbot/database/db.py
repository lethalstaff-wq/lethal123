"""Инициализация SQLite + миграции таблиц."""

from __future__ import annotations

import logging
from collections.abc import AsyncIterator
from contextlib import asynccontextmanager

import aiosqlite

from config import DB_PATH

logger = logging.getLogger(__name__)


SCHEMA: list[str] = [
    """
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        telegram_id INTEGER NOT NULL UNIQUE,
        username TEXT,
        subscription_tier TEXT,
        subscription_expires INTEGER,
        referral_code TEXT UNIQUE,
        referred_by INTEGER,
        balance INTEGER NOT NULL DEFAULT 0,
        created_at INTEGER NOT NULL
    )
    """,
    """
    CREATE TABLE IF NOT EXISTS fp_accounts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        login TEXT NOT NULL,
        password TEXT NOT NULL,
        proxy TEXT,
        golden_key TEXT,
        user_agent TEXT,
        is_active INTEGER NOT NULL DEFAULT 1,
        is_online INTEGER NOT NULL DEFAULT 0,
        last_session_update INTEGER,
        created_at INTEGER NOT NULL,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
    """,
    """
    CREATE TABLE IF NOT EXISTS auto_responses (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        trigger_words TEXT NOT NULL,
        response_text TEXT NOT NULL,
        is_active INTEGER NOT NULL DEFAULT 1,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
    """,
    """
    CREATE TABLE IF NOT EXISTS auto_delivery (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        fp_account_id INTEGER,
        lot_name TEXT NOT NULL,
        items TEXT NOT NULL,
        template TEXT,
        is_active INTEGER NOT NULL DEFAULT 1,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (fp_account_id) REFERENCES fp_accounts(id) ON DELETE CASCADE
    )
    """,
    """
    CREATE TABLE IF NOT EXISTS prepared_texts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        name TEXT NOT NULL,
        text TEXT NOT NULL,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
    """,
    """
    CREATE TABLE IF NOT EXISTS review_responses (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        rating INTEGER NOT NULL,
        response_text TEXT NOT NULL,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
    """,
    """
    CREATE TABLE IF NOT EXISTS blacklist (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        buyer_name TEXT NOT NULL,
        reason TEXT,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
    """,
    """
    CREATE TABLE IF NOT EXISTS stats (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        fp_account_id INTEGER,
        amount INTEGER NOT NULL,
        lot_name TEXT,
        buyer TEXT,
        timestamp INTEGER NOT NULL,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (fp_account_id) REFERENCES fp_accounts(id) ON DELETE SET NULL
    )
    """,
    """
    CREATE TABLE IF NOT EXISTS competitors (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        competitor_url TEXT NOT NULL,
        last_price REAL,
        last_checked INTEGER,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
    """,
    """
    CREATE TABLE IF NOT EXISTS chat_state (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        account_id INTEGER NOT NULL,
        fp_chat_id TEXT NOT NULL,
        interlocutor TEXT,
        last_message_id TEXT,
        last_buyer_msg_ts INTEGER,
        funnel_sent INTEGER NOT NULL DEFAULT 0,
        UNIQUE(account_id, fp_chat_id),
        FOREIGN KEY (account_id) REFERENCES fp_accounts(id) ON DELETE CASCADE
    )
    """,
    """
    CREATE TABLE IF NOT EXISTS orders_seen (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        account_id INTEGER NOT NULL,
        order_id TEXT NOT NULL,
        status TEXT,
        buyer TEXT,
        amount REAL,
        lot_name TEXT,
        first_seen INTEGER NOT NULL,
        last_seen INTEGER NOT NULL,
        confirm_asked INTEGER NOT NULL DEFAULT 0,
        complaint_filed INTEGER NOT NULL DEFAULT 0,
        review_asked INTEGER NOT NULL DEFAULT 0,
        delivered INTEGER NOT NULL DEFAULT 0,
        UNIQUE(account_id, order_id),
        FOREIGN KEY (account_id) REFERENCES fp_accounts(id) ON DELETE CASCADE
    )
    """,
    """
    CREATE TABLE IF NOT EXISTS pending_payments (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        tier TEXT NOT NULL,
        amount INTEGER NOT NULL,
        status TEXT NOT NULL DEFAULT 'pending',
        created_at INTEGER NOT NULL,
        approved_at INTEGER,
        admin_note TEXT,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
    """,
    """
    CREATE TABLE IF NOT EXISTS settings (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL UNIQUE,
        auto_raise INTEGER NOT NULL DEFAULT 0,
        raise_interval INTEGER NOT NULL DEFAULT 240,
        auto_delivery INTEGER NOT NULL DEFAULT 0,
        auto_response INTEGER NOT NULL DEFAULT 0,
        always_online INTEGER NOT NULL DEFAULT 0,
        ask_review INTEGER NOT NULL DEFAULT 0,
        ask_confirm INTEGER NOT NULL DEFAULT 0,
        confirm_minutes INTEGER NOT NULL DEFAULT 30,
        auto_complaint INTEGER NOT NULL DEFAULT 0,
        complaint_hours INTEGER NOT NULL DEFAULT 24,
        complaint_text TEXT,
        review_reply INTEGER NOT NULL DEFAULT 0,
        cross_sell INTEGER NOT NULL DEFAULT 0,
        cross_sell_text TEXT,
        funnel_enabled INTEGER NOT NULL DEFAULT 0,
        funnel_delay_minutes INTEGER NOT NULL DEFAULT 60,
        funnel_text TEXT,
        anti_scam INTEGER NOT NULL DEFAULT 0,
        smart_pricing INTEGER NOT NULL DEFAULT 0,
        auto_price_adjust INTEGER NOT NULL DEFAULT 0,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
    """,
]


INDEXES: list[str] = [
    "CREATE INDEX IF NOT EXISTS idx_fp_user ON fp_accounts(user_id)",
    "CREATE INDEX IF NOT EXISTS idx_stats_user ON stats(user_id)",
    "CREATE INDEX IF NOT EXISTS idx_users_tg ON users(telegram_id)",
    "CREATE INDEX IF NOT EXISTS idx_chat_state_acc ON chat_state(account_id)",
    "CREATE INDEX IF NOT EXISTS idx_orders_acc ON orders_seen(account_id)",
    "CREATE INDEX IF NOT EXISTS idx_pending_user ON pending_payments(user_id)",
    "CREATE INDEX IF NOT EXISTS idx_autoresp_user ON auto_responses(user_id)",
    "CREATE INDEX IF NOT EXISTS idx_autodel_user ON auto_delivery(user_id)",
]


async def init_db() -> None:
    """Создаёт таблицы и индексы при первом запуске."""
    async with aiosqlite.connect(DB_PATH) as db:
        await db.execute("PRAGMA foreign_keys = ON")
        await db.execute("PRAGMA journal_mode = WAL")
        for stmt in SCHEMA:
            await db.execute(stmt)
        for stmt in INDEXES:
            await db.execute(stmt)
        await db.commit()
    logger.info("База данных инициализирована: %s", DB_PATH)


@asynccontextmanager
async def connect() -> AsyncIterator[aiosqlite.Connection]:
    """Контекстный коннект с включёнными FK и row factory."""
    async with aiosqlite.connect(DB_PATH) as db:
        await db.execute("PRAGMA foreign_keys = ON")
        db.row_factory = aiosqlite.Row
        yield db
