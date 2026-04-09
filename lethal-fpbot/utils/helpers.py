"""Мелкие утилиты общего назначения."""

from __future__ import annotations

import re
import secrets
import string
from datetime import datetime, timezone
from urllib.parse import urlparse


def now_utc() -> datetime:
    return datetime.now(timezone.utc)


def now_ts() -> int:
    return int(now_utc().timestamp())


def gen_referral_code(length: int = 8) -> str:
    alphabet = string.ascii_uppercase + string.digits
    return "".join(secrets.choice(alphabet) for _ in range(length))


_PROXY_RE = re.compile(
    r"^(?P<scheme>https?|socks5h?|socks4)://"
    r"(?:(?P<user>[^:@]+):(?P<password>[^@]+)@)?"
    r"(?P<host>[A-Za-z0-9\.\-]+):(?P<port>\d{1,5})/?$"
)


def parse_proxy(raw: str) -> dict | None:
    """Парсит прокси-строку.

    Поддерживаемые форматы:
      - scheme://host:port
      - scheme://user:pass@host:port
      - host:port
      - host:port:user:pass
      - user:pass@host:port
    Возвращает dict с ключами scheme/host/port/user/password или None.
    """
    if not raw:
        return None
    raw = raw.strip()

    # Колоночный формат host:port:user:pass (без схемы)
    if "://" not in raw and raw.count(":") == 3 and "@" not in raw:
        host, port, user, pwd = raw.split(":", 3)
        if not port.isdigit():
            return None
        return {
            "scheme": "http",
            "host": host,
            "port": int(port),
            "user": user,
            "password": pwd,
        }

    # Простое host:port
    if "://" not in raw and raw.count(":") == 1 and "@" not in raw:
        host, port = raw.split(":", 1)
        if not port.isdigit():
            return None
        return {
            "scheme": "http",
            "host": host,
            "port": int(port),
            "user": None,
            "password": None,
        }

    # Подставим схему если её нет, чтобы urlparse сработал
    candidate = raw if "://" in raw else f"http://{raw}"
    m = _PROXY_RE.match(candidate)
    if m:
        return {
            "scheme": m.group("scheme"),
            "host": m.group("host"),
            "port": int(m.group("port")),
            "user": m.group("user"),
            "password": m.group("password"),
        }

    # Запасной парсинг через urlparse
    try:
        u = urlparse(candidate)
        if u.hostname and u.port:
            return {
                "scheme": u.scheme or "http",
                "host": u.hostname,
                "port": u.port,
                "user": u.username,
                "password": u.password,
            }
    except ValueError:
        return None
    return None


def proxy_to_url(proxy: dict | None) -> str | None:
    """Собирает прокси-словарь обратно в URL."""
    if not proxy:
        return None
    auth = ""
    if proxy.get("user"):
        auth = f"{proxy['user']}:{proxy.get('password', '')}@"
    return f"{proxy['scheme']}://{auth}{proxy['host']}:{proxy['port']}"


def mask_password(s: str) -> str:
    if not s:
        return ""
    if len(s) <= 2:
        return "*" * len(s)
    return s[0] + "*" * (len(s) - 2) + s[-1]


def escape_html(text: str) -> str:
    return (
        text.replace("&", "&amp;")
        .replace("<", "&lt;")
        .replace(">", "&gt;")
    )
