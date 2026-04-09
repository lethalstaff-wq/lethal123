"""Проверка профиля покупателя на подозрительность.

Используется chat_watcher'ом. Здесь — лёгкая обёртка с кэшем,
чтобы не дёргать профиль на каждое сообщение в одном диалоге.
"""

from __future__ import annotations

import time
from typing import Any

from funpay.api import get_buyer_profile

# username -> (is_suspicious, expires_at)
_cache: dict[str, tuple[bool, float]] = {}
_TTL = 600


async def is_suspicious(sess, username: str) -> bool:
    now = time.time()
    cached = _cache.get(username)
    if cached and cached[1] > now:
        return cached[0]
    profile = await get_buyer_profile(sess, username)
    suspicious = bool(profile and profile.is_suspicious)
    _cache[username] = (suspicious, now + _TTL)
    return suspicious
