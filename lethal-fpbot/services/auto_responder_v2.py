"""Продвинутый автоответчик.

Отличия от базового find_matching_response:
  • Regex-поддержка (префикс re: в триггере)
  • Варианты ответа через ||| — бот выберет случайный
  • Переменные: {buyer}, {lot}, {price}, {time_of_day}, {greeting}
  • Условия: рабочие часы (working_hours), только для новых покупателей
    (new_buyer_only), cooldown в одном чате (cooldown_seconds)
  • Не отвечает своим же сообщениям (проверка по username)
  • Не отвечает дважды на одно сообщение (idempotent)
  • Опциональная задержка 1-5 сек «как человек»
  • AI-fallback: если ни одно правило не сработало — дёргает ai_responder

Правило хранится в auto_responses.trigger_words как JSON:
    {
      "triggers": ["привет", "hello"],
      "regex": false,
      "new_buyer_only": false,
      "working_hours": null,       // или [9, 22] (часы UTC)
      "cooldown_seconds": 0,
      "human_delay": false,
      "priority": 0
    }
И response_text может содержать несколько вариантов через "|||".
"""

from __future__ import annotations

import asyncio
import json
import logging
import random
import re
import time
from typing import Any

from database.models import list_auto_responses

logger = logging.getLogger(__name__)


# In-memory cooldown: (user_id, chat_id, rule_id) -> last_sent_ts
_cooldowns: dict[tuple[int, str, int], float] = {}

# Дедупликация: (account_id, chat_id, message_id) — чтобы не отвечать 2 раза
_answered: set[tuple[int, str, str]] = set()


def _time_of_day_ru() -> str:
    h = time.gmtime().tm_hour
    if 5 <= h < 12:
        return "доброе утро"
    if 12 <= h < 17:
        return "добрый день"
    if 17 <= h < 23:
        return "добрый вечер"
    return "доброй ночи"


def _render_vars(text: str, context: dict[str, Any]) -> str:
    """Подставляет {key} в тексте значениями из context."""
    ctx = {
        "buyer": context.get("buyer", "друг"),
        "lot": context.get("lot", "лот"),
        "price": context.get("price", ""),
        "time_of_day": _time_of_day_ru(),
        "greeting": _time_of_day_ru().capitalize(),
    }
    # Оставим только переменные которые есть (не падаем на неизвестных)
    try:
        return text.format(**ctx)
    except (KeyError, IndexError):
        return text


def _pick_variant(response_text: str) -> str:
    """Выбирает случайный вариант из 'A|||B|||C'."""
    if "|||" in response_text:
        variants = [v.strip() for v in response_text.split("|||") if v.strip()]
        if variants:
            return random.choice(variants)
    return response_text


def _parse_rule_meta(trigger_words_json: str) -> dict[str, Any]:
    """Из trigger_words (JSON-поле в БД) извлекает расширенные настройки."""
    try:
        data = json.loads(trigger_words_json)
    except (ValueError, TypeError):
        return {"triggers": [], "regex": False}

    if isinstance(data, list):
        # Старый формат — просто список слов
        return {
            "triggers": data,
            "regex": False,
            "new_buyer_only": False,
            "working_hours": None,
            "cooldown_seconds": 0,
            "human_delay": False,
            "priority": 0,
        }
    if isinstance(data, dict):
        return {
            "triggers": data.get("triggers", []),
            "regex": bool(data.get("regex", False)),
            "new_buyer_only": bool(data.get("new_buyer_only", False)),
            "working_hours": data.get("working_hours"),
            "cooldown_seconds": int(data.get("cooldown_seconds", 0)),
            "human_delay": bool(data.get("human_delay", False)),
            "priority": int(data.get("priority", 0)),
        }
    return {"triggers": [], "regex": False}


def _in_working_hours(range_: list | None) -> bool:
    if not range_ or len(range_) != 2:
        return True
    start, end = int(range_[0]), int(range_[1])
    now_h = time.gmtime().tm_hour
    if start <= end:
        return start <= now_h < end
    return now_h >= start or now_h < end


def _match_trigger(trigger: str, text: str, is_regex: bool) -> bool:
    if not trigger:
        return False
    if is_regex:
        try:
            return bool(re.search(trigger, text, re.IGNORECASE))
        except re.error:
            return False
    return trigger.lower() in text.lower()


async def find_response(
    user_id: int,
    text: str,
    *,
    account_id: int,
    chat_id: str,
    message_id: str,
    buyer_username: str | None = None,
    lot_name: str | None = None,
    lot_price: str | None = None,
    is_new_buyer: bool = False,
    self_username: str | None = None,
) -> str | None:
    """Полноценный поиск ответа со всеми расширенными правилами.

    Возвращает готовый к отправке текст (с подставленными переменными)
    или None если ни одно правило не матчится.
    """
    if not text:
        return None
    # Не отвечаем самим себе
    if self_username and buyer_username and buyer_username == self_username:
        return None
    # Дедупликация
    dedupe_key = (account_id, chat_id, message_id)
    if dedupe_key in _answered:
        return None

    rules = await list_auto_responses(user_id)

    # Сортируем по priority (desc)
    def _priority(r: dict) -> int:
        meta = _parse_rule_meta(json.dumps(r.get("trigger_words") or []))
        return meta.get("priority", 0)

    rules.sort(key=_priority, reverse=True)

    now = time.time()
    for rule in rules:
        if not rule.get("is_active"):
            continue
        # rule['trigger_words'] уже десериализован в list в list_auto_responses —
        # но у нас расширенный формат может быть dict. Заверним обратно.
        meta_raw = (
            json.dumps(rule["trigger_words"])
            if isinstance(rule["trigger_words"], (list, dict))
            else rule["trigger_words"]
        )
        meta = _parse_rule_meta(meta_raw)

        # Условия
        if meta.get("new_buyer_only") and not is_new_buyer:
            continue
        if not _in_working_hours(meta.get("working_hours")):
            continue

        cooldown = meta.get("cooldown_seconds", 0)
        if cooldown > 0:
            key = (user_id, chat_id, rule["id"])
            last = _cooldowns.get(key, 0)
            if now - last < cooldown:
                continue

        # Матчинг
        matched = False
        for trig in meta.get("triggers", []):
            if _match_trigger(trig, text, meta.get("regex", False)):
                matched = True
                break
        if not matched:
            continue

        # Выбор варианта ответа + переменные
        variant = _pick_variant(rule["response_text"])
        final = _render_vars(
            variant,
            {
                "buyer": buyer_username or "друг",
                "lot": lot_name or "лот",
                "price": lot_price or "",
            },
        )

        # Human-like задержка
        if meta.get("human_delay"):
            await asyncio.sleep(random.uniform(1.5, 4.5))

        # Cooldown update
        if cooldown > 0:
            _cooldowns[(user_id, chat_id, rule["id"])] = now

        _answered.add(dedupe_key)
        # Ограничиваем размер set (не хотим течь в памяти)
        if len(_answered) > 10000:
            # Удаляем треть самых старых — грубо
            for _ in range(3000):
                _answered.pop()
        return final

    return None


def reset_state() -> None:
    """Сброс in-memory стейта (для тестов)."""
    _cooldowns.clear()
    _answered.clear()
