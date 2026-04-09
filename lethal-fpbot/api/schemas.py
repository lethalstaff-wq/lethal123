"""Простые pydantic-style схемы для входных данных API.

Не используем pydantic чтобы не тащить ещё одну зависимость —
вместо этого функции validate_* возвращают (data, error).
"""

from __future__ import annotations

from typing import Any


def _str(v: Any, *, min_len: int = 1, max_len: int = 500) -> str | None:
    if not isinstance(v, str):
        return None
    s = v.strip()
    if len(s) < min_len or len(s) > max_len:
        return None
    return s


def _int(v: Any, *, min_v: int | None = None, max_v: int | None = None) -> int | None:
    try:
        n = int(v)
    except (TypeError, ValueError):
        return None
    if min_v is not None and n < min_v:
        return None
    if max_v is not None and n > max_v:
        return None
    return n


def _bool(v: Any) -> bool | None:
    if isinstance(v, bool):
        return v
    if isinstance(v, int):
        return bool(v)
    if isinstance(v, str) and v.lower() in {"true", "false", "1", "0"}:
        return v.lower() in {"true", "1"}
    return None


def validate_login_init_data(body: dict) -> tuple[dict | None, str | None]:
    init_data = _str(body.get("init_data"), max_len=10000)
    if not init_data:
        return None, "init_data required"
    return {"init_data": init_data}, None


def validate_add_account(body: dict) -> tuple[dict | None, str | None]:
    login = _str(body.get("login"), min_len=3, max_len=100)
    if not login:
        return None, "login required (3-100 chars)"
    password = _str(body.get("password"), min_len=1, max_len=200)
    if not password:
        return None, "password required"
    proxy = body.get("proxy")
    if proxy is not None:
        proxy = _str(proxy, max_len=500)
    return {"login": login, "password": password, "proxy": proxy}, None


def validate_set_proxy(body: dict) -> tuple[dict | None, str | None]:
    proxy = body.get("proxy")
    if proxy is not None:
        proxy = _str(proxy, max_len=500)
    return {"proxy": proxy}, None


def validate_send_message(body: dict) -> tuple[dict | None, str | None]:
    chat_id = _str(body.get("chat_id"), max_len=100)
    text = _str(body.get("text"), min_len=1, max_len=4000)
    if not chat_id or not text:
        return None, "chat_id and text required"
    return {"chat_id": chat_id, "text": text}, None


def validate_settings_patch(body: dict) -> tuple[dict | None, str | None]:
    """Принимает любые ключи из whitelist'а — возвращает только их."""
    allowed_bool = {
        "auto_raise", "auto_delivery", "auto_response", "always_online",
        "ask_review", "ask_confirm", "auto_complaint", "review_reply",
        "cross_sell", "funnel_enabled", "anti_scam", "smart_pricing",
        "auto_price_adjust",
    }
    allowed_int = {"raise_interval", "confirm_minutes", "complaint_hours", "funnel_delay_minutes"}
    allowed_str = {"complaint_text", "cross_sell_text", "funnel_text"}

    out: dict[str, Any] = {}
    for k, v in body.items():
        if k in allowed_bool:
            b = _bool(v)
            if b is not None:
                out[k] = 1 if b else 0
        elif k in allowed_int:
            n = _int(v, min_v=1, max_v=10000)
            if n is not None:
                out[k] = n
        elif k in allowed_str:
            s = _str(v, max_len=2000)
            if s is not None:
                out[k] = s
    if not out:
        return None, "no valid fields"
    return out, None


def validate_add_auto_response(body: dict) -> tuple[dict | None, str | None]:
    triggers = body.get("triggers")
    if not isinstance(triggers, list) or not triggers:
        return None, "triggers must be non-empty list"
    triggers = [t for t in triggers if isinstance(t, str) and t.strip()]
    if not triggers:
        return None, "triggers must contain non-empty strings"
    response = _str(body.get("response"), min_len=1, max_len=2000)
    if not response:
        return None, "response required"
    return {"triggers": triggers, "response": response}, None


def validate_add_auto_delivery(body: dict) -> tuple[dict | None, str | None]:
    lot_name = _str(body.get("lot_name"), min_len=1, max_len=200)
    if not lot_name:
        return None, "lot_name required"
    items = body.get("items")
    if not isinstance(items, list) or not items:
        return None, "items must be non-empty list"
    items = [str(i).strip() for i in items if str(i).strip()]
    if not items:
        return None, "items must contain non-empty strings"
    template = body.get("template")
    if template is not None:
        template = _str(template, max_len=2000)
    return {"lot_name": lot_name, "items": items, "template": template}, None


def validate_add_text(body: dict) -> tuple[dict | None, str | None]:
    name = _str(body.get("name"), max_len=64)
    text = _str(body.get("text"), min_len=1, max_len=4000)
    if not name or not text:
        return None, "name and text required"
    return {"name": name, "text": text}, None


def validate_buy_tier(body: dict) -> tuple[dict | None, str | None]:
    tier = _str(body.get("tier"), max_len=20)
    if tier not in {"starter", "standard", "pro"}:
        return None, "invalid tier"
    promo = body.get("promo")
    if promo is not None:
        promo = _str(promo, max_len=64)
    return {"tier": tier, "promo": promo}, None
