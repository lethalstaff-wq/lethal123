"""0004 — audit_log."""

VERSION = "0004"


async def up(db) -> None:
    await db.execute(
        """
        CREATE TABLE IF NOT EXISTS audit_log (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER,
            action TEXT NOT NULL,
            details TEXT,
            ip TEXT,
            created_at INTEGER NOT NULL
        )
        """
    )


async def down(db) -> None:
    await db.execute("DROP TABLE IF EXISTS audit_log")
