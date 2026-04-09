"""In-memory rate limiter (token bucket).

Используется для защиты от флуда: каждый пользователь может делать
N действий в окно W секунд. Состояние храним в памяти —
для one-process бота этого достаточно.

Использование:
    rl = RateLimiter(max_per_window=10, window_sec=60)
    if not rl.allow(user_id):
        return error("rate_limit")
"""

from __future__ import annotations

import time
from collections import defaultdict


class RateLimiter:
    def __init__(self, max_per_window: int, window_sec: float) -> None:
        self.max = max_per_window
        self.window = window_sec
        self._buckets: dict[int, list[float]] = defaultdict(list)

    def allow(self, key: int) -> bool:
        now = time.monotonic()
        bucket = self._buckets[key]
        # Чистим устаревшее
        cutoff = now - self.window
        # Список обычно небольшой, эффективность ок
        i = 0
        while i < len(bucket) and bucket[i] < cutoff:
            i += 1
        if i:
            del bucket[:i]
        if len(bucket) >= self.max:
            return False
        bucket.append(now)
        return True

    def remaining(self, key: int) -> int:
        bucket = self._buckets.get(key, [])
        cutoff = time.monotonic() - self.window
        valid = sum(1 for t in bucket if t >= cutoff)
        return max(0, self.max - valid)

    def reset(self, key: int) -> None:
        self._buckets.pop(key, None)


# Глобальные инстансы для разных разрезов
_global: dict[str, RateLimiter] = {}


def get_limiter(name: str, max_per_window: int, window_sec: float) -> RateLimiter:
    if name not in _global:
        _global[name] = RateLimiter(max_per_window, window_sec)
    return _global[name]


# Дефолтные лимиты
TG_GLOBAL = get_limiter("tg_global", max_per_window=30, window_sec=60)
API_GLOBAL = get_limiter("api_global", max_per_window=120, window_sec=60)
AI_REQUESTS = get_limiter("ai_requests", max_per_window=20, window_sec=300)
