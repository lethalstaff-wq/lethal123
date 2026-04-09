"""Тесты HTML-парсеров FunPay.

Используем минимальные синтетические HTML-фрагменты — мы не пытаемся
проверить реальный FunPay (это интеграционный тест), а только что
наши селекторы корректно достают данные.
"""

from __future__ import annotations

import pytest

from funpay.parser import (
    find_form_field,
    parse_buyer_profile,
    parse_chat_messages,
    parse_chats,
    parse_csrf_token,
    parse_lots,
    parse_orders,
    parse_self_profile,
)


def test_find_form_field():
    html = (
        '<form><input type="hidden" name="_csrf_token" value="abc123"></form>'
    )
    assert find_form_field(html, "_csrf_token") == "abc123"
    assert find_form_field(html, "missing") is None


def test_parse_csrf_from_app_data():
    html = (
        '<body data-app-data=\'{"csrf-token":"deadbeef","userId":42}\'></body>'
    )
    assert parse_csrf_token(html) == "deadbeef"


def test_parse_self_profile_authed():
    html = (
        '<body data-app-data=\'{"csrf-token":"x","userId":777}\'>'
        '<div class="user-link-name">MyName</div>'
        '</body>'
    )
    p = parse_self_profile(html)
    assert p.user_id == 777
    assert p.username == "MyName"
    assert p.is_online is True


def test_parse_self_profile_anon():
    html = "<body><div class='login'>Войти</div></body>"
    p = parse_self_profile(html)
    assert p.user_id is None
    assert p.is_online is False


def test_parse_lots():
    html = """
    <div>
      <a class="tc-item" data-offer="L1" href="/lots/L1/">
        <div class="tc-desc-text">Steam Account 100 games</div>
        <div class="tc-price" data-s="450">450 <span class="unit">₽</span></div>
      </a>
      <a class="tc-item" data-offer="L2" href="/lots/L2/">
        <div class="tc-desc-text">Random Key</div>
        <div class="tc-price" data-s="50">50 <span class="unit">₽</span></div>
      </a>
    </div>
    """
    lots = parse_lots(html)
    assert len(lots) == 2
    assert lots[0].id == "L1"
    assert lots[0].title == "Steam Account 100 games"
    assert lots[0].price == 450.0
    assert lots[0].currency == "₽"
    assert lots[1].id == "L2"


def test_parse_chats():
    html = """
    <div>
      <a class="contact-item unread" data-id="C1">
        <div class="media-user-name">buyer42</div>
        <div class="contact-item-message">привет, есть в наличии?</div>
      </a>
      <a class="contact-item" data-id="C2">
        <div class="media-user-name">other</div>
        <div class="contact-item-message">спасибо</div>
      </a>
    </div>
    """
    chats = parse_chats(html)
    assert len(chats) == 2
    assert chats[0].chat_id == "C1"
    assert chats[0].interlocutor == "buyer42"
    assert chats[0].unread is True
    assert chats[1].unread is False


def test_parse_chat_messages():
    html = """
    <div>
      <div class="chat-msg-item" data-id="100">
        <div class="chat-msg-author-link">alice</div>
        <div class="chat-msg-text">hi</div>
      </div>
      <div class="chat-msg-item" data-id="101">
        <div class="chat-msg-author-link">bob</div>
        <div class="chat-msg-text">hello back</div>
      </div>
    </div>
    """
    msgs = parse_chat_messages(html)
    assert len(msgs) == 2
    assert msgs[0]["author"] == "alice"
    assert msgs[0]["text"] == "hi"
    assert msgs[0]["id"] == "100"


def test_parse_orders():
    html = """
    <div>
      <a class="tc-item" href="/orders/AABBCC/">
        <div class="tc-status status-paid">Оплачено</div>
        <div class="media-user-name">buyer1</div>
        <div class="tc-price" data-s="500">500 <span class="unit">₽</span></div>
        <div class="order-desc">Red Dead Redemption 2</div>
        <div class="tc-date-time">2024-01-01</div>
      </a>
    </div>
    """
    orders = parse_orders(html)
    assert len(orders) == 1
    assert orders[0].order_id == "AABBCC"
    assert orders[0].status == "paid"
    assert orders[0].amount == 500.0
    assert orders[0].buyer == "buyer1"
    assert "Red Dead" in orders[0].lot_name


def test_parse_buyer_profile_suspicious():
    html = """
    <body data-app-data='{"userId":1234}'>
      <div class="profile-header-name">noobnewbie</div>
      <div class="profile-header-stats"><span class="label">сегодня</span></div>
    </body>
    """
    p = parse_buyer_profile(html)
    assert p.username == "noobnewbie"
    assert p.user_id == 1234
    assert p.reviews_count == 0
    assert p.is_suspicious is True


def test_parse_buyer_profile_trusted():
    html = """
    <body data-app-data='{"userId":99}'>
      <div class="profile-header-name">veteran</div>
      <div class="rating-full">
        <span class="rating-mini-count">142</span>
      </div>
    </body>
    """
    p = parse_buyer_profile(html)
    assert p.reviews_count == 142
    assert p.is_suspicious is False
