"""Тесты JWT и Telegram WebApp signature verification."""

from __future__ import annotations

import hashlib
import hmac
import time
from urllib.parse import urlencode

from api.auth import (
    issue_token_for_user,
    jwt_decode,
    jwt_encode,
    verify_telegram_init_data,
)


def test_jwt_roundtrip():
    token = jwt_encode({"tg": 123, "exp": int(time.time()) + 3600})
    payload = jwt_decode(token)
    assert payload is not None
    assert payload["tg"] == 123


def test_jwt_expired():
    token = jwt_encode({"tg": 123, "exp": int(time.time()) - 100})
    assert jwt_decode(token) is None


def test_jwt_tampered():
    token = jwt_encode({"tg": 123, "exp": int(time.time()) + 3600})
    tampered = token[:-2] + "AA"
    assert jwt_decode(tampered) is None


def test_issue_token_for_user():
    token = issue_token_for_user(456)
    payload = jwt_decode(token)
    assert payload["tg"] == 456


def test_verify_telegram_init_data_invalid():
    # Без подписи
    assert verify_telegram_init_data("foo=bar") is None
    assert verify_telegram_init_data("") is None


def test_verify_telegram_init_data_valid(monkeypatch):
    """Сгенерим валидный initData по алгоритму TG и проверим."""
    import config

    bot_token = config.BOT_TOKEN or "dummy"

    user_json = '{"id":12345,"username":"alice"}'
    parts = {
        "user": user_json,
        "auth_date": str(int(time.time())),
    }
    data_check_string = "\n".join(
        f"{k}={v}" for k, v in sorted(parts.items())
    )
    secret_key = hmac.new(
        b"WebAppData", bot_token.encode(), hashlib.sha256
    ).digest()
    h = hmac.new(secret_key, data_check_string.encode(), hashlib.sha256).hexdigest()
    parts["hash"] = h
    init_data = urlencode(parts)

    user = verify_telegram_init_data(init_data)
    assert user is not None
    assert user["id"] == 12345
    assert user["username"] == "alice"
