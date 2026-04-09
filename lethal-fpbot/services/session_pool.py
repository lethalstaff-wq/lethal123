"""Пул FunPay-сессий — singleton по account_id.

Чтобы фоновые сервисы не пересоздавали HTTP-сессию на каждый чих,
держим живой FunPaySession для каждого активного ФП-аккаунта.
При поломке сессии — лениво пересоздаём.
"""

from __future__ import annotations

import asyncio
import logging
from typing import Any

from database.models import get_fp_account, list_active_fp_accounts, update_fp_session
from funpay.session import FunPayAuthError, FunPayNetworkError, FunPaySession
from utils.encryption import decrypt, encrypt

logger = logging.getLogger(__name__)

_pool: dict[int, FunPaySession] = {}
_locks: dict[int, asyncio.Lock] = {}


def _lock_for(account_id: int) -> asyncio.Lock:
    lock = _locks.get(account_id)
    if not lock:
        lock = asyncio.Lock()
        _locks[account_id] = lock
    return lock


async def _build_session(acc: dict[str, Any]) -> FunPaySession | None:
    sess = FunPaySession(
        login=acc["login"],
        password=decrypt(acc.get("password") or ""),
        proxy=acc.get("proxy"),
        golden_key=decrypt(acc.get("golden_key") or "") or None,
        user_agent=acc.get("user_agent"),
    )
    try:
        info = await sess.restore()
        if not info:
            info = await sess.login_with_password()
        await update_fp_session(
            account_id=acc["id"],
            golden_key_enc=encrypt(info.golden_key),
            is_online=True,
        )
        logger.info("FP сессия %s готова (user=%s)", acc["login"], info.username)
        return sess
    except (FunPayAuthError, FunPayNetworkError) as exc:
        logger.warning("FP сессия %s не поднялась: %s", acc["login"], exc)
        await sess.close()
        return None


async def get(account_id: int) -> FunPaySession | None:
    """Возвращает живую сессию для account_id или None."""
    async with _lock_for(account_id):
        sess = _pool.get(account_id)
        if sess and not (sess._session and sess._session.closed):  # noqa: SLF001
            return sess
        # нужен fp_account из БД — но user_id у нас неизвестен,
        # поэтому грузим без фильтра по user
        from database.db import connect

        async with connect() as db:
            cur = await db.execute(
                "SELECT * FROM fp_accounts WHERE id = ?", (account_id,)
            )
            row = await cur.fetchone()
        if not row:
            return None
        sess = await _build_session(dict(row))
        if sess:
            _pool[account_id] = sess
        return sess


async def reload(account_id: int) -> FunPaySession | None:
    """Принудительно пересоздаёт сессию (например, после смены прокси)."""
    async with _lock_for(account_id):
        old = _pool.pop(account_id, None)
        if old:
            await old.close()
    return await get(account_id)


async def close_all() -> None:
    for s in _pool.values():
        await s.close()
    _pool.clear()


async def iter_active() -> list[tuple[int, FunPaySession, dict]]:
    """Выдаёт пары (account_id, session, raw_acc) для всех активных аккаунтов."""
    out: list[tuple[int, FunPaySession, dict]] = []
    accounts = await list_active_fp_accounts()
    for acc in accounts:
        sess = await get(acc["id"])
        if sess:
            out.append((acc["id"], sess, acc))
    return out
