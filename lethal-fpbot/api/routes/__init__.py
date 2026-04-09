"""Все маршруты API. Каждый модуль экспортирует RouteTableDef."""

from .accounts import routes as accounts_routes
from .ai import routes as ai_routes
from .auth import routes as auth_routes
from .auto_delivery import routes as auto_delivery_routes
from .auto_response import routes as auto_response_routes
from .billing import routes as billing_routes
from .bulk import routes as bulk_routes
from .chats import routes as chats_routes
from .forecast import routes as forecast_routes
from .games import routes as games_routes
from .lots import routes as lots_routes
from .notifications import routes as notifications_routes
from .payments import routes as payments_routes
from .profile import routes as profile_routes
from .settings import routes as settings_routes
from .stats import routes as stats_routes
from .texts import routes as texts_routes

__all__ = [
    "accounts_routes",
    "ai_routes",
    "auth_routes",
    "auto_delivery_routes",
    "auto_response_routes",
    "billing_routes",
    "bulk_routes",
    "chats_routes",
    "forecast_routes",
    "games_routes",
    "lots_routes",
    "notifications_routes",
    "payments_routes",
    "profile_routes",
    "settings_routes",
    "stats_routes",
    "texts_routes",
]
