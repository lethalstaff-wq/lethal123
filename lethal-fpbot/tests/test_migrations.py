"""Тесты раннера миграций."""

from __future__ import annotations

import pytest

pytestmark = pytest.mark.asyncio


async def test_migrations_idempotent(tmp_db):
    """upgrade() можно вызывать несколько раз — повторные ничего не делают."""
    from migrations.runner import list_pending, upgrade

    await upgrade()
    n2 = await upgrade()  # второй раз — ничего нового
    assert n2 == 0
    pending = await list_pending()
    assert pending == []


async def test_migration_order(tmp_db):
    from migrations.runner import _scan

    versions = [v for v, _ in _scan()]
    assert versions == sorted(versions)
    assert versions[0] == "0001"


async def test_current_version(tmp_db):
    from migrations.runner import current_version, upgrade

    await upgrade()
    v = await current_version()
    assert v is not None
    assert v >= "0001"
