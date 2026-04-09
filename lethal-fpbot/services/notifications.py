"""Учёт пользовательских настроек уведомлений.

Сервисы (chat_watcher, order_watcher и т.д.) перед отправкой алёрта
вызывают `should_notify(user_id, kind)`, чтобы уважать «не беспокоить»
часы и кастомные тоглы.
"""

from __future__ import annotations

import logging
import time

from database.models import get_notification_prefs

logger = logging.getLogger(__name__)


KIND_TO_FIELD = {
    "new_order": "notify_new_order",
    "new_message": "notify_new_message",
    "new_review": "notify_new_review",
    "session_lost": "notify_session_lost",
    "payment": "notify_payment",
}


def _in_quiet_hours(start: int, end: int) -> bool:
    """Проверяет UTC-час сейчас попадает в [start; end) (с переходом через полночь)."""
    if start == 0 and end == 0:
        return False
    now_h = time.gmtime().tm_hour
    if start <= end:
        return start <= now_h < end
    # Через полночь (например 23..7)
    return now_h >= start or now_h < end


async def should_notify(user_id: int, kind: str) -> bool:
    field = KIND_TO_FIELD.get(kind)
    if not field:
        return True
    try:
        prefs = await get_notification_prefs(user_id)
    except Exception:  # noqa: BLE001
        return True
    if not prefs.get(field, 1):
        return False
    if _in_quiet_hours(
        int(prefs.get("quiet_hours_start") or 0),
        int(prefs.get("quiet_hours_end") or 0),
    ):
        # Тихие часы — всё кроме session_lost (это критичная ошибка)
        return kind == "session_lost"
    return True
