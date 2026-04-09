"""Web API для Mini App.

Поднимается как часть services/web.py — единый aiohttp-сервер
обслуживает /api/* маршруты, /healthz и /metrics, и (опционально)
раздаёт статику Mini App из miniapp/dist.

Аутентификация — через Telegram WebApp initData (HMAC-SHA256
подписан BOT_TOKEN). После проверки выдаём JWT для последующих
запросов.
"""

from .server import create_app, run_server

__all__ = ["create_app", "run_server"]
