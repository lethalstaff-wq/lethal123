"""Тесты продвинутой автовыдачи."""

from __future__ import annotations

import pytest

from services.delivery_v2 import (
    detect_format,
    parse_template_placeholders,
    render_delivery_message,
    validate_item,
)

pytestmark = pytest.mark.asyncio


def test_detect_format_steam_key():
    assert detect_format("ABC12-DEF34-GHI56") == "steam_key"


def test_detect_format_email_pass():
    assert detect_format("alice@mail.com:password123") == "email_pass"


def test_detect_format_login_pass():
    assert detect_format("login1:secret") == "login_pass"


def test_detect_format_generic():
    assert detect_format("hello") == "generic"


def test_validate_item_empty():
    assert validate_item("") is False
    assert validate_item("   ") is False


def test_validate_item_steam_key():
    assert validate_item("AAAAA-BBBBB-CCCCC", "steam_key") is True
    assert validate_item("invalid", "steam_key") is False


def test_validate_item_no_format():
    assert validate_item("anything") is True


def test_parse_template_placeholders():
    tpl = "Привет {buyer}! Ваш {item} для лота {lot}"
    assert set(parse_template_placeholders(tpl)) == {"buyer", "item", "lot"}


def test_render_delivery_message_default():
    msg = render_delivery_message(
        template=None,
        items=["KEY123"],
        lot_name="Random Key",
        buyer="alice",
        order_id="ORD-1",
    )
    assert "KEY123" in msg


def test_render_delivery_message_custom():
    msg = render_delivery_message(
        template="Заказ #{order_id}: {item} — спасибо, {buyer}!",
        items=["SECRET"],
        lot_name="X",
        buyer="bob",
        order_id="42",
    )
    assert "ORD-1" not in msg
    assert "42" in msg
    assert "SECRET" in msg
    assert "bob" in msg


def test_render_multi_item():
    msg = render_delivery_message(
        template="Вот ваши товары:\n{items}",
        items=["item1", "item2", "item3"],
        lot_name="X",
        buyer="b",
        order_id="o",
    )
    assert "item1" in msg
    assert "item2" in msg
    assert "item3" in msg


async def test_return_item_to_queue(tmp_db):
    from database.models import (
        add_auto_delivery,
        get_or_create_user,
        list_auto_delivery,
        pop_auto_delivery_item,
    )
    from services.delivery_v2 import return_item_to_queue

    u = await get_or_create_user(1, "x")
    rid = await add_auto_delivery(
        u["id"], None, "Lot", ["A", "B", "C"], None
    )
    assert await pop_auto_delivery_item(rid) == "A"

    ok = await return_item_to_queue(rid, "A-returned")
    assert ok is True

    # Теперь снова "A-returned" должно быть первым
    next_item = await pop_auto_delivery_item(rid)
    assert next_item == "A-returned"


async def test_get_remaining_count(tmp_db):
    from database.models import add_auto_delivery, get_or_create_user
    from services.delivery_v2 import get_remaining_count

    u = await get_or_create_user(1, "x")
    rid = await add_auto_delivery(u["id"], None, "Lot", ["a", "b", "c"], None)
    assert await get_remaining_count(rid) == 3
