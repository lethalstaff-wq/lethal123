"""0002 — добавление promo_codes / promo_redemptions."""

VERSION = "0002"


async def up(db) -> None:
    await db.execute(
        """
        CREATE TABLE IF NOT EXISTS promo_codes (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            code TEXT NOT NULL UNIQUE,
            discount_percent INTEGER NOT NULL,
            max_uses INTEGER NOT NULL DEFAULT 0,
            used_count INTEGER NOT NULL DEFAULT 0,
            valid_until INTEGER,
            created_at INTEGER NOT NULL
        )
        """
    )
    await db.execute(
        """
        CREATE TABLE IF NOT EXISTS promo_redemptions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            promo_id INTEGER NOT NULL,
            redeemed_at INTEGER NOT NULL,
            UNIQUE(user_id, promo_id)
        )
        """
    )


async def down(db) -> None:
    await db.execute("DROP TABLE IF EXISTS promo_redemptions")
    await db.execute("DROP TABLE IF EXISTS promo_codes")
