"""Функции поиска игры по тексту лота / алиасу.

Используется auto_raise (узнать game_id) и lot_categorizer (отнести
лот к категории).
"""

from __future__ import annotations

import re
from typing import Any

from .catalog import GAMES, GAMES_BY_ID, GAMES_BY_NAME


def find_game_by_alias(text: str) -> dict[str, Any] | None:
    """Возвращает игру, у которой один из алиасов содержится в text.

    Сравниваем case-insensitive, по подстроке. Перебираем все
    подходящие игры и выбираем по максимальной длине алиаса —
    чтобы 'dota 2' побеждало 'boost' (5 символов > 5).
    Категория service имеет penalty чтобы конкретные игры выигрывали.
    """
    if not text:
        return None
    text_low = text.lower()

    candidates: list[tuple[int, dict[str, Any]]] = []
    for game in GAMES:
        best_alias = 0
        for alias in game.get("aliases", []):
            if not alias:
                continue
            if alias.lower() in text_low:
                best_alias = max(best_alias, len(alias))
        if best_alias:
            # service-категория получает штраф -100 чтобы dota2 побеждал boost
            score = best_alias - (100 if game.get("category") == "service" else 0)
            candidates.append((score, game))
    if not candidates:
        return None
    candidates.sort(key=lambda x: -x[0])
    return candidates[0][1]


def find_game_by_name(name: str) -> dict[str, Any] | None:
    if not name:
        return None
    return GAMES_BY_NAME.get(name.lower())


def detect_game_from_lot(lot_title: str) -> dict[str, Any] | None:
    """Усиленный матчинг: сначала пробуем точное имя, потом алиасы."""
    direct = find_game_by_name(lot_title)
    if direct:
        return direct
    return find_game_by_alias(lot_title)


def list_categories() -> list[str]:
    """Все уникальные категории."""
    return sorted({g["category"] for g in GAMES})


def list_games_by_category(category: str) -> list[dict[str, Any]]:
    return [g for g in GAMES if g["category"] == category]


def get_game(game_id: str) -> dict[str, Any] | None:
    return GAMES_BY_ID.get(game_id)


# Регулярка для извлечения «X голд», «1000 рп» и т.п. из лота.
# Длинные суффиксы (кк/kk) ставим первыми чтобы regex не схватил «к» в «кк».
_AMOUNT_RE = re.compile(
    r"(\d+(?:[.,]\d+)?)\s*(кк|kk|mln|m|к|k)?", re.IGNORECASE
)


def extract_amount_from_lot(text: str) -> int | None:
    """Пытается выдрать число из названия лота — для smart-pricing."""
    if not text:
        return None
    m = _AMOUNT_RE.search(text)
    if not m:
        return None
    try:
        num = float(m.group(1).replace(",", "."))
    except ValueError:
        return None
    suffix = (m.group(2) or "").lower()
    if suffix in {"кк", "kk", "mln", "m"}:
        num *= 1_000_000
    elif suffix in {"к", "k"}:
        num *= 1000
    return int(num)


# Простые heuristic'и для категоризации лотов по типу
TYPE_KEYWORDS: dict[str, list[str]] = {
    "currency": ["голд", "gold", "монет", "coins", "rp", "адена", "adena", "rouble", "руб", "silver"],
    "account": ["аккаунт", "account", "акк ", "акки"],
    "key": ["ключ", "key", "cd-key", "cd key"],
    "boost": ["буст", "boost", "прокачка", "leveling"],
    "items": ["айтем", "item", "вещь", "лут"],
    "topup": ["пополнение", "topup", "пополн"],
}


def detect_lot_type(title: str) -> str:
    """Возвращает примерный тип лота."""
    if not title:
        return "unknown"
    text = title.lower()
    for type_name, kws in TYPE_KEYWORDS.items():
        for kw in kws:
            if kw in text:
                return type_name
    return "unknown"
