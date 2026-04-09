"""In-memory TTL кэш для горячих данных.

Используется когда:
  • Запрос дорогой (поход в FunPay)
  • Результат не меняется чаще раза в N секунд
  • Multi-process нам не нужен (один бот = один процесс)

Для distributed-сетапа можно подменить на Redis-обёртку с тем же API.
"""

from __future__ import annotations

import asyncio
import time
from collections.abc import Awaitable, Callable
from typing import Any, TypeVar

T = TypeVar("T")


class TTLCache:
    def __init__(self, default_ttl: float = 60.0) -> None:
        self.default_ttl = default_ttl
        self._store: dict[str, tuple[Any, float]] = {}
        self._lock = asyncio.Lock()

    def get(self, key: str) -> Any | None:
        item = self._store.get(key)
        if not item:
            return None
        value, expires = item
        if expires < time.monotonic():
            self._store.pop(key, None)
            return None
        return value

    def set(self, key: str, value: Any, ttl: float | None = None) -> None:
        expires = time.monotonic() + (ttl if ttl is not None else self.default_ttl)
        self._store[key] = (value, expires)

    def delete(self, key: str) -> None:
        self._store.pop(key, None)

    def clear(self) -> None:
        self._store.clear()

    def stats(self) -> dict[str, int]:
        now = time.monotonic()
        live = sum(1 for _, exp in self._store.values() if exp >= now)
        return {"total": len(self._store), "live": live}

    async def get_or_compute(
        self,
        key: str,
        compute: Callable[[], Awaitable[T]],
        ttl: float | None = None,
    ) -> T:
        cached = self.get(key)
        if cached is not None:
            return cached
        async with self._lock:
            # double-check после захвата лока
            cached = self.get(key)
            if cached is not None:
                return cached
            value = await compute()
            self.set(key, value, ttl)
            return value


# Глобальные инстансы для разных доменов
fp_cache = TTLCache(default_ttl=30.0)  # FunPay данные — 30 сек
games_cache = TTLCache(default_ttl=3600.0)  # каталог игр — 1 час
