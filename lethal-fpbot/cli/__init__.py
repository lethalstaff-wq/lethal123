"""CLI инструменты для админских операций.

Запуск:
    python -m cli grant-pro <telegram_id>
    python -m cli stats
    python -m cli broadcast "текст рассылки"
    python -m cli promo create LETHAL10 10 --uses 100
    python -m cli promo list
    python -m cli backup
    python -m cli plugins
"""

from .commands import main

__all__ = ["main"]
