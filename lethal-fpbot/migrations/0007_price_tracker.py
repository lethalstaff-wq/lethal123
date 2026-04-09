"""0007 — price tracker history."""

VERSION = "0007"


async def up(db) -> None:
    await db.execute(
        """
        CREATE TABLE IF NOT EXISTS lot_price_history (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            fp_account_id INTEGER,
            lot_id TEXT NOT NULL,
            lot_title TEXT,
            price REAL NOT NULL,
            currency TEXT,
            snapshot_ts INTEGER NOT NULL,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
            FOREIGN KEY (fp_account_id) REFERENCES fp_accounts(id) ON DELETE SET NULL
        )
        """
    )
    await db.execute(
        "CREATE INDEX IF NOT EXISTS idx_price_history_user ON lot_price_history(user_id)"
    )
    await db.execute(
        "CREATE INDEX IF NOT EXISTS idx_price_history_lot ON lot_price_history(lot_id, snapshot_ts)"
    )

    await db.execute(
        """
        CREATE TABLE IF NOT EXISTS lot_templates (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            name TEXT NOT NULL,
            game TEXT,
            item_type TEXT,
            title_template TEXT NOT NULL,
            description_template TEXT NOT NULL,
            default_price REAL,
            use_count INTEGER NOT NULL DEFAULT 0,
            created_at INTEGER NOT NULL,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        )
        """
    )
    await db.execute(
        "CREATE INDEX IF NOT EXISTS idx_templates_user ON lot_templates(user_id)"
    )


async def down(db) -> None:
    await db.execute("DROP TABLE IF EXISTS lot_price_history")
    await db.execute("DROP TABLE IF EXISTS lot_templates")
