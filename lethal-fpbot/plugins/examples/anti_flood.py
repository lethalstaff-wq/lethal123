"""Пример плагина: анти-флуд. Если покупатель шлёт >5 сообщений за минуту,
плагин блокирует дальнейшие пересылки в Telegram (возвращает "stop").
"""

from __future__ import annotations

import time

from plugins import Plugin

PLUGIN = Plugin(
    name="anti_flood",
    description="Не пересылает в ТГ сообщения, если покупатель флудит",
)

# (account_id, chat_id) -> [timestamps]
_buf: dict[tuple[int, str], list[float]] = {}
WINDOW = 60.0
MAX_PER_WINDOW = 5


@PLUGIN.hook("on_new_message")
async def on_message(bot, account, chat_id, author, text):
    key = (account["id"], chat_id)
    now = time.time()
    history = _buf.setdefault(key, [])
    history.append(now)
    # Чистим устаревшее
    cutoff = now - WINDOW
    _buf[key] = [t for t in history if t > cutoff]
    if len(_buf[key]) > MAX_PER_WINDOW:
        return "stop"
    return None
