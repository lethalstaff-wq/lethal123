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


@dataclass
class FpOrder:
    order_id: str
    status: str  # 'paid' / 'closed' / 'refunded'
    buyer: str
    amount: float | None
    currency: str | None
    lot_name: str
    date: str | None


def parse_orders(html: str) -> list[FpOrder]:
    """Парсит /orders/trade → список ордеров продавца."""
    soup = BeautifulSoup(html, "lxml")
    out: list[FpOrder] = []
    for row in soup.select("a.tc-item"):
        order_id = row.get("href", "").rsplit("/", 1)[-1].rstrip("/")
        if not order_id:
            order_id = row.get("data-id", "") or ""
        status_node = row.select_one(".tc-status")
        status_class = " ".join(status_node.get("class", [])) if status_node else ""
        if "paid" in status_class:
            status = "paid"
        elif "complete" in status_class or "closed" in status_class:
            status = "closed"
        elif "refund" in status_class:
            status = "refunded"
        else:
            status = _text(status_node).lower() or "unknown"
        buyer = _text(row.select_one(".media-user-name"))
        amount = None
        currency = None
        price_node = row.select_one(".tc-price")
        if price_node:
            data_s = price_node.get("data-s")
            if data_s:
                try:
                    amount = float(data_s)
                except ValueError:
                    pass
            unit = price_node.select_one(".unit")
            if unit:
                currency = _text(unit)
        lot_name = _text(row.select_one(".order-desc"))
        date = _text(row.select_one(".tc-date-time"))
        out.append(
            FpOrder(
                order_id=str(order_id),
                status=status,
                buyer=buyer,
                amount=amount,
                currency=currency,
                lot_name=lot_name,
                date=date or None,
            )
        )
    return out


@dataclass
class FpReview:
    order_id: str
    rating: int
    text: str
    buyer: str
    has_reply: bool


def parse_reviews(html: str) -> list[FpReview]:
    """Парсит блок отзывов на странице продавца /users/{id}/."""
    soup = BeautifulSoup(html, "lxml")
    out: list[FpReview] = []
    for node in soup.select(".review-container"):
        rating = 0
        stars = node.select(".rating-full .rating-stars")
        if stars:
            cls = " ".join(stars[0].get("class", []))
            for i in range(1, 6):
                if f"rating{i}" in cls or f"stars{i}" in cls:
                    rating = i
                    break
        text = _text(node.select_one(".review-item-text"))
        buyer = _text(node.select_one(".review-item-user"))
        order_id = node.get("data-order") or ""
        has_reply = bool(node.select_one(".review-reply"))
        out.append(
            FpReview(
                order_id=str(order_id),
                rating=rating,
                text=text,
                buyer=buyer,
                has_reply=has_reply,
            )
        )
    return out


@dataclass
class FpBuyerProfile:
    username: str | None
    user_id: int | None
    registered_text: str | None
    reviews_count: int
    is_suspicious: bool


def parse_buyer_profile(html: str) -> FpBuyerProfile:
    """Парсит профиль покупателя для антискам-проверки."""
    soup = BeautifulSoup(html, "lxml")
    username = _text(soup.select_one(".profile-header-name"))
    registered = _text(soup.select_one(".profile-header-stats .label"))
    reviews_count = 0
    badge = soup.select_one(".rating-full .rating-mini-count")
    if badge:
        try:
            reviews_count = int(re.sub(r"[^\d]", "", _text(badge)) or 0)
        except ValueError:
            pass
    user_id = None
    body = soup.find("body")
    if body and body.get("data-app-data"):
        m = re.search(r'"userId"\s*:\s*(\d+)', body["data-app-data"])
        if m:
            user_id = int(m.group(1))
    suspicious = reviews_count == 0
    return FpBuyerProfile(
        username=username or None,
        user_id=user_id,
        registered_text=registered or None,
        reviews_count=reviews_count,
        is_suspicious=suspicious,
    )
