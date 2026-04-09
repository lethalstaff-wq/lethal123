"""Простая система миграций SQLite.

Аналог alembic, но без зависимостей. Каждая миграция — модуль с
функциями `up(db)` и `down(db)`. Раннер хранит применённые версии
в таблице `_migrations`.

Как добавить новую миграцию:
  1. Создать файл migrations/NNNN_description.py
  2. Реализовать async def up(db) и async def down(db)
  3. Прописать VERSION в начале файла

Запуск:
  python -m migrations.runner upgrade
  python -m migrations.runner downgrade
  python -m migrations.runner status
"""

from .runner import (
    current_version,
    downgrade,
    list_applied,
    list_pending,
    upgrade,
)

__all__ = [
    "current_version",
    "downgrade",
    "list_applied",
    "list_pending",
    "upgrade",
]
