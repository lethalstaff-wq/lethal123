"""Outgoing webhook dispatcher.

Когда происходит событие (new_order, new_message и т.д.) — этот
сервис рассылает POST на все зарегистрированные у пользователя
webhook'и, у которых это событие в подписке.

Использует HMAC-SHA256 для подписи payload (secret опционально).
"""

from __future__ import annotations

import hashlib
import hmac
import json
import logging
from typing import Any

import aiohttp

from database.db import connect

logger = logging.getLogger(__name__)


def _sign(secret: str, payload: str) -> str:
    return hmac.new(
        secret.encode(), payload.encode(), hashlib.sha256
    ).hexdigest()


async def dispatch(user_id: int, event: str, data: dict[str, Any]) -> int:
    """Шлёт payload всем активным webhook'ам пользователя.

    Возвращает количество успешно отправленных запросов.
    """
    async with connect() as db:
        cur = await db.execute(
            """
            SELECT id, url, events, secret FROM webhooks
             WHERE user_id = ? AND is_active = 1
            """,
            (user_id,),
        )
        rows = await cur.fetchall()

    payload = {"event": event, "data": data}
    payload_json = json.dumps(payload, ensure_ascii=False)

    sent = 0
    timeout = aiohttp.ClientTimeout(total=5)
    async with aiohttp.ClientSession(timeout=timeout) as sess:
        for row in rows:
            try:
                events = json.loads(row["events"])
            except (ValueError, TypeError):
                events = []
            if event not in events:
                continue
            headers = {
                "Content-Type": "application/json",
                "X-Lethal-Event": event,
            }
            if row["secret"]:
                headers["X-Lethal-Signature"] = _sign(row["secret"], payload_json)
            try:
                async with sess.post(
                    row["url"], data=payload_json, headers=headers
                ) as resp:
                    if 200 <= resp.status < 300:
                        sent += 1
                    else:
                        logger.warning(
                            "webhook %s returned %d", row["url"], resp.status
                        )
            except Exception as exc:  # noqa: BLE001
                logger.warning("webhook %s failed: %s", row["url"], exc)
    return sent
