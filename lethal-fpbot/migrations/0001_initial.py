"""Initial schema marker.

Реальная схема создаётся через database.db.init_db() при первом старте,
а эта миграция нужна как «начальная точка», от которой будут плясать
будущие изменения.
"""

VERSION = "0001"


async def up(db) -> None:
    # Все таблицы уже создаются init_db; здесь только маркер.
    pass


async def down(db) -> None:
    pass
