"""0006 — CRM tables: customers, interactions, tags, notes."""

VERSION = "0006"


async def up(db) -> None:
    # Основная таблица клиентов — один покупатель = одна запись на юзера бота
    await db.execute(
        """
        CREATE TABLE IF NOT EXISTS customers (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            fp_username TEXT NOT NULL,
            fp_user_id INTEGER,
            first_seen INTEGER NOT NULL,
            last_seen INTEGER NOT NULL,
            last_order_ts INTEGER,
            orders_count INTEGER NOT NULL DEFAULT 0,
            messages_count INTEGER NOT NULL DEFAULT 0,
            total_spent INTEGER NOT NULL DEFAULT 0,
            avg_order_value REAL NOT NULL DEFAULT 0,
            refund_count INTEGER NOT NULL DEFAULT 0,
            reviews_given INTEGER NOT NULL DEFAULT 0,
            reviews_positive INTEGER NOT NULL DEFAULT 0,
            reviews_negative INTEGER NOT NULL DEFAULT 0,
            ltv REAL NOT NULL DEFAULT 0,
            segment TEXT NOT NULL DEFAULT 'new',
            notes TEXT,
            created_at INTEGER NOT NULL,
            UNIQUE(user_id, fp_username),
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        )
        """
    )

    # Журнал взаимодействий: каждое сообщение/заказ/отзыв
    await db.execute(
        """
        CREATE TABLE IF NOT EXISTS customer_interactions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            customer_id INTEGER NOT NULL,
            kind TEXT NOT NULL,
            details TEXT,
            amount INTEGER,
            timestamp INTEGER NOT NULL,
            FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE
        )
        """
    )

    # Теги клиентов — свободная маркировка
    await db.execute(
        """
        CREATE TABLE IF NOT EXISTS customer_tags (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            customer_id INTEGER NOT NULL,
            tag TEXT NOT NULL,
            created_at INTEGER NOT NULL,
            UNIQUE(customer_id, tag),
            FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE
        )
        """
    )

    # Заметки продавца о клиенте — можно писать из ТГ
    await db.execute(
        """
        CREATE TABLE IF NOT EXISTS customer_notes (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            customer_id INTEGER NOT NULL,
            text TEXT NOT NULL,
            created_at INTEGER NOT NULL,
            FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE
        )
        """
    )

    # Индексы
    await db.execute(
        "CREATE INDEX IF NOT EXISTS idx_customers_user ON customers(user_id)"
    )
    await db.execute(
        "CREATE INDEX IF NOT EXISTS idx_customers_segment ON customers(segment)"
    )
    await db.execute(
        "CREATE INDEX IF NOT EXISTS idx_interactions_customer ON customer_interactions(customer_id)"
    )
    await db.execute(
        "CREATE INDEX IF NOT EXISTS idx_tags_customer ON customer_tags(customer_id)"
    )


async def down(db) -> None:
    await db.execute("DROP TABLE IF EXISTS customer_notes")
    await db.execute("DROP TABLE IF EXISTS customer_tags")
    await db.execute("DROP TABLE IF EXISTS customer_interactions")
    await db.execute("DROP TABLE IF EXISTS customers")
