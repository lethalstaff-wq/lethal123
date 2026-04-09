"""0003 — notification_prefs."""

VERSION = "0003"


async def up(db) -> None:
    await db.execute(
        """
        CREATE TABLE IF NOT EXISTS notification_prefs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL UNIQUE,
            notify_new_order INTEGER NOT NULL DEFAULT 1,
            notify_new_message INTEGER NOT NULL DEFAULT 1,
            notify_new_review INTEGER NOT NULL DEFAULT 1,
            notify_session_lost INTEGER NOT NULL DEFAULT 1,
            notify_payment INTEGER NOT NULL DEFAULT 1,
            quiet_hours_start INTEGER NOT NULL DEFAULT 0,
            quiet_hours_end INTEGER NOT NULL DEFAULT 0
        )
        """
    )


async def down(db) -> None:
    await db.execute("DROP TABLE IF EXISTS notification_prefs")
