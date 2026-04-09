"""Регистрация всех роутеров бота."""

from __future__ import annotations

from aiogram import Router

from bot.middlewares.subscription import EnsureUserMiddleware

from . import (
    accounts,
    admin,
    auto_delivery,
    auto_response,
    billing,
    chat,
    crm,
    crm_broadcast,
    dashboard,
    help_center,
    lot_gen,
    onboarding,
    profile,
    proxy,
    settings,
    start,
    stats,
    texts,
)


def get_root_router() -> Router:
    """Собирает все хендлеры в один корневой роутер."""
    root = Router(name="root")

    # Глобальный middleware: гарантирует что user в БД есть
    mw = EnsureUserMiddleware()
    root.message.middleware(mw)
    root.callback_query.middleware(mw)

    root.include_router(start.router)
    root.include_router(accounts.router)
    root.include_router(proxy.router)
    root.include_router(auto_response.router)
    root.include_router(auto_delivery.router)
    root.include_router(stats.router)
    root.include_router(settings.router)
    root.include_router(chat.router)
    root.include_router(texts.router)
    root.include_router(billing.router)
    root.include_router(profile.router)
    root.include_router(crm.router)
    root.include_router(crm_broadcast.router)
    root.include_router(dashboard.router)
    root.include_router(lot_gen.router)
    root.include_router(onboarding.router)
    root.include_router(help_center.router)
    root.include_router(admin.router)
    return root
