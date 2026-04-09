"""Аутентификация Web API через Telegram WebApp initData.

Алгоритм Telegram WebApp:
  1. Mini App получает initData от Telegram (доступно через
     window.Telegram.WebApp.initData)
  2. Шлёт его в /api/auth/login
  3. Сервер проверяет HMAC-подпись через BOT_TOKEN
  4. Если ок — выдаёт JWT (HS256, 24h TTL)
  5. Все остальные /api/* эндпоинты требуют этот JWT в Authorization

Документация: https://core.telegram.org/bots/webapps#validating-data-received-via-the-mini-app
"""

from __future__ import annotations

import base64
import hashlib
import hmac
import json
import logging
import time
from typing import Any
from urllib.parse import parse_qsl

from aiohttp import web

from config import BOT_TOKEN

logger = logging.getLogger(__name__)


JWT_TTL = 24 * 3600
JWT_ALG = "HS256"


def _b64url_encode(data: bytes) -> str:
    return base64.urlsafe_b64encode(data).rstrip(b"=").decode("ascii")


def _b64url_decode(s: str) -> bytes:
    pad = "=" * (-len(s) % 4)
    return base64.urlsafe_b64decode(s + pad)


def _hmac_sha256(key: bytes, msg: bytes) -> bytes:
    return hmac.new(key, msg, hashlib.sha256).digest()


def jwt_encode(payload: dict[str, Any]) -> str:
    """Минималистичный JWT HS256 без сторонних либ."""
    header = {"alg": JWT_ALG, "typ": "JWT"}
    h = _b64url_encode(json.dumps(header, separators=(",", ":")).encode())
    p = _b64url_encode(json.dumps(payload, separators=(",", ":")).encode())
    signing_input = f"{h}.{p}".encode()
    sig = _hmac_sha256(BOT_TOKEN.encode(), signing_input)
    s = _b64url_encode(sig)
    return f"{h}.{p}.{s}"


def jwt_decode(token: str) -> dict[str, Any] | None:
    try:
        h, p, s = token.split(".")
    except ValueError:
        return None
    expected = _hmac_sha256(BOT_TOKEN.encode(), f"{h}.{p}".encode())
    actual = _b64url_decode(s)
    if not hmac.compare_digest(expected, actual):
        return None
    try:
        payload = json.loads(_b64url_decode(p))
    except (ValueError, json.JSONDecodeError):
        return None
    if payload.get("exp", 0) < int(time.time()):
        return None
    return payload


def verify_telegram_init_data(init_data: str) -> dict[str, Any] | None:
    """Проверяет подпись initData от Telegram WebApp.

    Возвращает распарсенный user dict если подпись валидна, иначе None.
    """
    if not init_data:
        return None

    parsed = dict(parse_qsl(init_data, strict_parsing=False))
    received_hash = parsed.pop("hash", None)
    if not received_hash:
        return None

    # Собираем data_check_string в алфавитном порядке
    data_check_string = "\n".join(
        f"{k}={v}" for k, v in sorted(parsed.items())
    )

    # Согласно документации Telegram:
    #   secret_key = HMAC_SHA256("WebAppData", bot_token)
    #   hash       = HMAC_SHA256(secret_key, data_check_string).hex()
    secret_key = _hmac_sha256(b"WebAppData", BOT_TOKEN.encode())
    expected_hash = _hmac_sha256(secret_key, data_check_string.encode()).hex()

    if not hmac.compare_digest(expected_hash, received_hash):
        return None

    # Распарсим вложенный JSON user
    user_raw = parsed.get("user")
    if not user_raw:
        return None
    try:
        user = json.loads(user_raw)
    except json.JSONDecodeError:
        return None
    return user


def issue_token_for_user(telegram_id: int) -> str:
    """Выдаёт JWT для известного telegram_id."""
    return jwt_encode(
        {
            "tg": telegram_id,
            "iat": int(time.time()),
            "exp": int(time.time()) + JWT_TTL,
        }
    )


def extract_token(request: web.Request) -> str | None:
    auth = request.headers.get("Authorization", "")
    if auth.startswith("Bearer "):
        return auth[7:]
    # Cookie fallback
    return request.cookies.get("lethal_token")


@web.middleware
async def auth_middleware(request: web.Request, handler):
    """Гард: все /api/* кроме /api/auth/* требуют JWT."""
    path = request.path
    if not path.startswith("/api/"):
        return await handler(request)
    if path.startswith("/api/auth/") or path.startswith("/api/public/"):
        return await handler(request)

    token = extract_token(request)
    if not token:
        return web.json_response(
            {"error": "auth.unauthorized"}, status=401
        )
    payload = jwt_decode(token)
    if not payload:
        return web.json_response(
            {"error": "auth.session.expired"}, status=401
        )
    request["tg_id"] = payload["tg"]
    return await handler(request)
