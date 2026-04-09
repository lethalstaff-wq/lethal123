"""Каталог игр FunPay для smart-фич.

Используется auto_raise / smart_pricing / lot_categorizer чтобы знать
game_id и node_id для каждой популярной игры. Без этого нельзя точно
поднимать лоты — поэтому без каталога фичи работают «эвристически».

Обновляется вручную: если FunPay добавит новую игру и пользователи
начнут на неё жаловаться, добавляем сюда.
"""

from .catalog import GAMES, GAMES_BY_ID, GAMES_BY_NAME
from .matchers import (
    detect_game_from_lot,
    find_game_by_alias,
    find_game_by_name,
    list_categories,
)

__all__ = [
    "GAMES",
    "GAMES_BY_ID",
    "GAMES_BY_NAME",
    "detect_game_from_lot",
    "find_game_by_alias",
    "find_game_by_name",
    "list_categories",
]
