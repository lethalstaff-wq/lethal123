"""0005 — ab_tests."""

VERSION = "0005"


async def up(db) -> None:
    await db.execute(
        """
        CREATE TABLE IF NOT EXISTS ab_tests (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            name TEXT NOT NULL,
            variant_a TEXT NOT NULL,
            variant_b TEXT NOT NULL,
            a_used INTEGER NOT NULL DEFAULT 0,
            b_used INTEGER NOT NULL DEFAULT 0,
            a_conversions INTEGER NOT NULL DEFAULT 0,
            b_conversions INTEGER NOT NULL DEFAULT 0,
            is_active INTEGER NOT NULL DEFAULT 1,
            created_at INTEGER NOT NULL
        )
        """
    )


async def down(db) -> None:
    await db.execute("DROP TABLE IF EXISTS ab_tests")
