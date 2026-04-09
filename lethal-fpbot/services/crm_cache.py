"""In-memory TTL cache для горячих CRM-запросов.

Зачем: user_crm_summary() и count_by_segment() вызываются каждый раз
при открытии главного экрана CRM. Для юзера с 1000+ клиентами это
медленно. Кэшируем на 30 секунд — нормальный trade-off между
актуальностью и скоростью.

Инвалидация: при touch_customer() сбрасываем кэш конкретного user_id.
"""

from __future__ import annotations

import asyncio
import time
from collections.abc import Callable, Coroutine
from typing import Any


class TTLCache:
    """Простой async TTL cache с per-key lock, чтобы не было thundering herd."""

    def __init__(self, ttl_seconds: float = 30.0) -> None:
        self.ttl = ttl_seconds
        self._data: dict[Any, tuple[float, Any]] = {}
        self._locks: dict[Any, asyncio.Lock] = {}

    def _lock_for(self, key: Any) -> asyncio.Lock:
        if key not in self._locks:
            self._locks[key] = asyncio.Lock()
        return self._locks[key]

    async def get_or_compute(
        self,
        key: Any,
        factory: Callable[[], Coroutine[Any, Any, Any]],
    ) -> Any:
        now = time.time()
        cached = self._data.get(key)
        if cached and cached[0] > now:
            return cached[1]

        async with self._lock_for(key):
            # Double-check после блокировки
            cached = self._data.get(key)
            if cached and cached[0] > now:
                return cached[1]
            value = await factory()
            self._data[key] = (now + self.ttl, value)
            return value

    def invalidate(self, key: Any) -> None:
        self._data.pop(key, None)

    def invalidate_all(self) -> None:
        self._data.clear()

    def stats(self) -> dict[str, int]:
        now = time.time()
        fresh = sum(1 for expires, _ in self._data.values() if expires > now)
        return {
            "total": len(self._data),
            "fresh": fresh,
            "stale": len(self._data) - fresh,
        }

    def prune_stale(self) -> int:
        """Удаляет протухшие записи. Возвращает сколько удалили."""
        now = time.time()
        stale_keys = [
            k for k, (expires, _) in self._data.items() if expires <= now
        ]
        for k in stale_keys:
            self._data.pop(k, None)
        return len(stale_keys)


# Глобальные инстансы для разных типов данных
summary_cache = TTLCache(ttl_seconds=30)
segments_cache = TTLCache(ttl_seconds=30)
customer_cache = TTLCache(ttl_seconds=60)


async def cached_user_crm_summary(user_id: int) -> dict[str, Any]:
    """Закэшированная версия user_crm_summary."""
    from database.models_crm import user_crm_summary

    return await summary_cache.get_or_compute(
        ("summary", user_id),
        lambda: user_crm_summary(user_id),
    )


async def cached_count_by_segment(user_id: int) -> dict[str, int]:
    from database.models_crm import count_by_segment

    return await segments_cache.get_or_compute(
        ("segments", user_id),
        lambda: count_by_segment(user_id),
    )


def invalidate_user(user_id: int) -> None:
    """Вызывается из touch_customer при изменении данных клиента."""
    summary_cache.invalidate(("summary", user_id))
    segments_cache.invalidate(("segments", user_id))
