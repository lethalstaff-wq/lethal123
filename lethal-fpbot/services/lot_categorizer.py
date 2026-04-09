"""Категоризация лотов FunPay по играм + типам.

Используется auto_raise/smart_pricing/analytics. Анализирует список
лотов и группирует их по (game_id, type), считает общую стоимость
и количество.
"""

from __future__ import annotations

from collections import defaultdict
from typing import Any

from games.matchers import detect_game_from_lot, detect_lot_type


def categorize(lots: list[Any]) -> dict[str, dict[str, Any]]:
    """Группирует лоты по 'game_id::type'.

    Возвращает {key: {game, type, count, total_value, lots: [...]}}.
    """
    groups: dict[str, dict[str, Any]] = defaultdict(
        lambda: {"game": None, "type": None, "count": 0, "total_value": 0.0, "lots": []}
    )
    for lot in lots:
        title = getattr(lot, "title", None) or lot.get("title", "")  # type: ignore[union-attr]
        price = getattr(lot, "price", None) or lot.get("price", 0)  # type: ignore[union-attr]
        game = detect_game_from_lot(title)
        ltype = detect_lot_type(title)
        key = f"{game['id'] if game else 'unknown'}::{ltype}"
        g = groups[key]
        g["game"] = game["id"] if game else None
        g["type"] = ltype
        g["count"] += 1
        g["total_value"] += float(price or 0)
        g["lots"].append(lot)
    return dict(groups)


def summary(lots: list[Any]) -> dict[str, Any]:
    """Сводка: распределение по играм/типам, средняя цена."""
    by_game: dict[str, int] = defaultdict(int)
    by_type: dict[str, int] = defaultdict(int)
    total_value = 0.0
    for lot in lots:
        title = getattr(lot, "title", None) or lot.get("title", "")  # type: ignore[union-attr]
        price = getattr(lot, "price", None) or lot.get("price", 0)  # type: ignore[union-attr]
        game = detect_game_from_lot(title)
        ltype = detect_lot_type(title)
        by_game[game["id"] if game else "unknown"] += 1
        by_type[ltype] += 1
        total_value += float(price or 0)
    return {
        "total_lots": len(lots),
        "total_value": total_value,
        "avg_price": total_value / len(lots) if lots else 0,
        "by_game": dict(by_game),
        "by_type": dict(by_type),
    }
