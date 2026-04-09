"""Тесты продвинутого автоответчика."""

from __future__ import annotations

import json

import pytest

pytestmark = pytest.mark.asyncio


async def test_variable_substitution(tmp_db):
    from database.models import add_auto_response, get_or_create_user
    from services.auto_responder_v2 import find_response, reset_state

    reset_state()
    user = await get_or_create_user(1, "seller")
    await add_auto_response(user["id"], ["привет"], "Привет, {buyer}! По лоту {lot}")

    reply = await find_response(
        user_id=user["id"],
        text="привет, как дела?",
        account_id=1,
        chat_id="c1",
        message_id="m1",
        buyer_username="alice",
        lot_name="Steam Random Key",
    )
    assert reply is not None
    assert "alice" in reply
    assert "Steam Random Key" in reply


async def test_cooldown_prevents_repeat(tmp_db):
    from database.db import connect
    from database.models import get_or_create_user
    from services.auto_responder_v2 import find_response, reset_state

    reset_state()
    user = await get_or_create_user(1, "seller")

    # Создаём правило с cooldown через JSON-формат
    meta = {
        "triggers": ["hi"],
        "cooldown_seconds": 60,
    }
    async with connect() as db:
        await db.execute(
            """
            INSERT INTO auto_responses (user_id, trigger_words, response_text, is_active)
            VALUES (?, ?, ?, 1)
            """,
            (user["id"], json.dumps(meta), "Hello!"),
        )
        await db.commit()

    r1 = await find_response(
        user_id=user["id"],
        text="hi there",
        account_id=1,
        chat_id="c1",
        message_id="m1",
    )
    r2 = await find_response(
        user_id=user["id"],
        text="hi again",
        account_id=1,
        chat_id="c1",
        message_id="m2",
    )
    assert r1 == "Hello!"
    assert r2 is None  # cooldown сработал


async def test_dedupe_same_message(tmp_db):
    from database.models import add_auto_response, get_or_create_user
    from services.auto_responder_v2 import find_response, reset_state

    reset_state()
    user = await get_or_create_user(1, "seller")
    await add_auto_response(user["id"], ["test"], "Reply")

    r1 = await find_response(
        user_id=user["id"],
        text="test 123",
        account_id=1,
        chat_id="c1",
        message_id="same_msg",
    )
    r2 = await find_response(
        user_id=user["id"],
        text="test 123",
        account_id=1,
        chat_id="c1",
        message_id="same_msg",
    )
    assert r1 == "Reply"
    assert r2 is None  # дедуп


async def test_variant_selection(tmp_db):
    from database.models import add_auto_response, get_or_create_user
    from services.auto_responder_v2 import find_response, reset_state

    reset_state()
    user = await get_or_create_user(1, "seller")
    await add_auto_response(
        user["id"], ["hey"], "Вариант А|||Вариант Б|||Вариант В"
    )

    reply = await find_response(
        user_id=user["id"],
        text="hey!",
        account_id=1,
        chat_id="c1",
        message_id="m_new",
    )
    assert reply in {"Вариант А", "Вариант Б", "Вариант В"}


async def test_regex_trigger(tmp_db):
    from database.db import connect
    from database.models import get_or_create_user
    from services.auto_responder_v2 import find_response, reset_state

    reset_state()
    user = await get_or_create_user(1, "seller")
    meta = {"triggers": [r"\d{3,}"], "regex": True}
    async with connect() as db:
        await db.execute(
            """
            INSERT INTO auto_responses (user_id, trigger_words, response_text, is_active)
            VALUES (?, ?, ?, 1)
            """,
            (user["id"], json.dumps(meta), "Hi with digits"),
        )
        await db.commit()

    r = await find_response(
        user_id=user["id"],
        text="заказ 12345 актуален?",
        account_id=1,
        chat_id="c_regex",
        message_id="mr1",
    )
    assert r == "Hi with digits"


async def test_self_username_skipped(tmp_db):
    from database.models import add_auto_response, get_or_create_user
    from services.auto_responder_v2 import find_response, reset_state

    reset_state()
    user = await get_or_create_user(1, "seller")
    await add_auto_response(user["id"], ["hi"], "Reply")

    r = await find_response(
        user_id=user["id"],
        text="hi",
        account_id=1,
        chat_id="c1",
        message_id="mself",
        buyer_username="me",
        self_username="me",
    )
    assert r is None
