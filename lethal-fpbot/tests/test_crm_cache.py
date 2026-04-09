"""Тесты TTL кэша для CRM."""

from __future__ import annotations

import asyncio

import pytest

pytestmark = pytest.mark.asyncio


async def test_cache_hit():
    from services.crm_cache import TTLCache

    cache = TTLCache(ttl_seconds=60)
    calls = 0

    async def factory():
        nonlocal calls
        calls += 1
        return {"data": 42}

    r1 = await cache.get_or_compute("k1", factory)
    r2 = await cache.get_or_compute("k1", factory)
    assert r1 == r2
    assert calls == 1  # factory вызвалась только 1 раз


async def test_cache_different_keys():
    from services.crm_cache import TTLCache

    cache = TTLCache(ttl_seconds=60)
    calls = 0

    async def factory():
        nonlocal calls
        calls += 1
        return calls

    await cache.get_or_compute("a", factory)
    await cache.get_or_compute("b", factory)
    assert calls == 2


async def test_cache_expires():
    from services.crm_cache import TTLCache

    cache = TTLCache(ttl_seconds=0.1)
    calls = 0

    async def factory():
        nonlocal calls
        calls += 1
        return "x"

    await cache.get_or_compute("k", factory)
    await asyncio.sleep(0.2)
    await cache.get_or_compute("k", factory)
    assert calls == 2  # протух, пересчитали


async def test_cache_invalidate():
    from services.crm_cache import TTLCache

    cache = TTLCache(ttl_seconds=60)
    calls = 0

    async def factory():
        nonlocal calls
        calls += 1
        return calls

    await cache.get_or_compute("k", factory)
    cache.invalidate("k")
    await cache.get_or_compute("k", factory)
    assert calls == 2


async def test_cache_stats():
    from services.crm_cache import TTLCache

    cache = TTLCache(ttl_seconds=60)

    async def factory():
        return 1

    await cache.get_or_compute("k1", factory)
    await cache.get_or_compute("k2", factory)
    stats = cache.stats()
    assert stats["total"] == 2
    assert stats["fresh"] == 2


async def test_cache_prune_stale():
    from services.crm_cache import TTLCache

    cache = TTLCache(ttl_seconds=0.1)

    async def factory():
        return 1

    await cache.get_or_compute("k1", factory)
    await cache.get_or_compute("k2", factory)
    await asyncio.sleep(0.2)
    pruned = cache.prune_stale()
    assert pruned == 2
    assert cache.stats()["total"] == 0


async def test_cache_thundering_herd():
    """Если много параллельных запросов на один ключ — factory зовётся 1 раз."""
    from services.crm_cache import TTLCache

    cache = TTLCache(ttl_seconds=60)
    calls = 0

    async def factory():
        nonlocal calls
        calls += 1
        await asyncio.sleep(0.05)
        return "value"

    results = await asyncio.gather(
        *[cache.get_or_compute("same", factory) for _ in range(10)]
    )
    assert all(r == "value" for r in results)
    assert calls == 1
