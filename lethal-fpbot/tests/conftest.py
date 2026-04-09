"""Pytest fixtures.

Делаем три вещи:
  • Подкладываем lethal-fpbot/ в sys.path, чтобы импорты работали
    (проект — не пакет, а коллекция модулей)
  • Грузим временный SQLite-файл для каждого теста
  • Подменяем ENCRYPTION_KEY на свежий fresh ключ
"""

from __future__ import annotations

import os
import sys
from pathlib import Path

import pytest

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))


@pytest.fixture
def fresh_key(monkeypatch, tmp_path):
    """Изолированный Fernet-ключ для теста, чтобы не трогать .secret_key."""
    from cryptography.fernet import Fernet

    key = Fernet.generate_key().decode()
    monkeypatch.setenv("ENCRYPTION_KEY", key)
    monkeypatch.setattr("config.ENCRYPTION_KEY", key)

    # Сбрасываем lru_cache внутри utils.encryption
    import utils.encryption as enc

    enc._fernet.cache_clear()  # type: ignore[attr-defined]
    yield key
    enc._fernet.cache_clear()  # type: ignore[attr-defined]


@pytest.fixture
async def tmp_db(monkeypatch, tmp_path):
    """Изолированный SQLite-файл + инициализированная схема."""
    db_path = tmp_path / "test.db"
    monkeypatch.setattr("config.DB_PATH", str(db_path))
    monkeypatch.setattr("database.db.DB_PATH", str(db_path))

    from database.db import init_db

    await init_db()
    yield db_path
