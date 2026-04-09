"""Тесты пользовательских настроек уведомлений."""

from __future__ import annotations

import pytest

from services.notifications import _in_quiet_hours

pytestmark = pytest.mark.asyncio


def test_quiet_hours_disabled():
    assert _in_quiet_hours(0, 0) is False


def test_quiet_hours_simple_window():
    # Можем только проверить логику, а не реальное время
    assert _in_quiet_hours(0, 24) is True  # охватывает всё
    # 23..7 — через полночь — реализована через OR


async def test_should_notify_default(tmp_db):
    from database.models import get_or_create_user
    from services.notifications import should_notify

    user = await get_or_create_user(1, "x")
    # дефолт — все включены
    assert await should_notify(user["id"], "new_order") is True


async def test_should_not_notify_when_disabled(tmp_db):
    from database.models import get_or_create_user, update_notification_pref
    from services.notifications import should_notify

    user = await get_or_create_user(1, "x")
    await update_notification_pref(user["id"], "notify_new_order", 0)
    assert await should_notify(user["id"], "new_order") is False
    # Другие — всё ещё да
    assert await should_notify(user["id"], "new_message") is True
