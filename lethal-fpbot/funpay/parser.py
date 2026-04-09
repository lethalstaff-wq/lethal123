"""HTML-парсеры FunPay-страниц.

FunPay не отдаёт публичный JSON API для большинства данных, поэтому
парсим HTML через BeautifulSoup. Селекторы аккуратно выбираем с запасом —
если разметка чуть поменяется, будем падать в логи, но не вылетать.
"""

from __future__ import annotations

import re
from dataclasses import dataclass
from typing import Iterable

from bs4 import BeautifulSoup


@dataclass
class FpProfile:
    user_id: int | None
    username: str | None
    is_online: bool
    raw_html_len: int


@dataclass
class FpLot:
    id: str
    title: str
    price: float | None
    currency: str | None
    category: str | None


@dataclass
class FpChatPreview:
    chat_id: str
    interlocutor: str
    last_message: str
    unread: bool


def _text(node) -> str:
    return node.get_text(strip=True) if node else ""


def parse_csrf_token(html: str) -> str | None:
    """Достаёт data-app-data csrf токен / app data из <body>."""
    soup = BeautifulSoup(html, "lxml")
    body = soup.find("body")
    if not body:
        return None
    app_data = body.get("data-app-data")
    if not app_data:
        return None
    m = re.search(r'"csrf-token"\s*:\s*"([a-f0-9]+)"', app_data)
    return m.group(1) if m else None


def parse_self_profile(html: str) -> FpProfile:
    """Парсит страницу авторизованного пользователя.

    Если ответ /account/ редиректит на логин — username будет None,
    is_online=False. По этому хендлеры понимают, что сессия протухла.
    """
    soup = BeautifulSoup(html, "lxml")

    # На авторизованных страницах есть data-app-data в <body> с user-id
    user_id: int | None = None
    body = soup.find("body")
    if body and body.get("data-app-data"):
        m = re.search(r'"userId"\s*:\s*(\d+)', body["data-app-data"])
        if m:
            user_id = int(m.group(1))

    # Имя в шапке
    username = None
    user_link = soup.select_one(".user-link-name")
    if user_link:
        username = _text(user_link)

    is_online = bool(user_id)
    return FpProfile(
        user_id=user_id,
        username=username,
        is_online=is_online,
        raw_html_len=len(html),
    )


def parse_lots(html: str) -> list[FpLot]:
    """Парсит страницу со списком лотов пользователя."""
    soup = BeautifulSoup(html, "lxml")
    lots: list[FpLot] = []

    for node in soup.select("a.tc-item"):
        lot_id = node.get("data-offer") or node.get("href", "").split("id=")[-1]
        title = _text(node.select_one(".tc-desc-text") or node.select_one(".tc-desc"))
        price_node = node.select_one(".tc-price")
        price: float | None = None
        currency: str | None = None
        if price_node:
            data_s = price_node.get("data-s")
            if data_s:
                try:
                    price = float(data_s)
                except ValueError:
                    pass
            unit = price_node.select_one(".unit")
            if unit:
                currency = _text(unit)
        lots.append(
            FpLot(
                id=str(lot_id or ""),
                title=title,
                price=price,
                currency=currency,
                category=None,
            )
        )
    return lots


def parse_chats(html: str) -> list[FpChatPreview]:
    """Парсит превью чатов из /chat/."""
    soup = BeautifulSoup(html, "lxml")
    out: list[FpChatPreview] = []
    for node in soup.select(".contact-item"):
        chat_id = node.get("data-id", "") or ""
        name = _text(node.select_one(".media-user-name"))
        last_msg = _text(node.select_one(".contact-item-message"))
        unread = "unread" in (node.get("class") or [])
        out.append(
            FpChatPreview(
                chat_id=str(chat_id),
                interlocutor=name,
                last_message=last_msg,
                unread=unread,
            )
        )
    return out


def parse_chat_messages(html: str) -> list[dict]:
    """Парсит ленту сообщений в открытом чате."""
    soup = BeautifulSoup(html, "lxml")
    msgs: list[dict] = []
    for node in soup.select(".chat-msg-item"):
        author = _text(node.select_one(".chat-msg-author-link"))
        text = _text(node.select_one(".chat-msg-text"))
        ts = node.get("data-id") or ""
        msgs.append({"author": author, "text": text, "id": ts})
    return msgs


def find_form_field(html: str, field_name: str) -> str | None:
    """Достаёт значение скрытого input по имени (для CSRF в формах логина)."""
    soup = BeautifulSoup(html, "lxml")
    inp = soup.find("input", attrs={"name": field_name})
    if inp and inp.get("value"):
        return inp["value"]
    return None


def iter_error_messages(html: str) -> Iterable[str]:
    soup = BeautifulSoup(html, "lxml")
    for node in soup.select(".alert.alert-danger, .form-error"):
        msg = _text(node)
        if msg:
            yield msg
