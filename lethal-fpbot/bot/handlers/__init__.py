"""Регистрация всех роутеров бота."""

from __future__ import annotations

from aiogram import Router

from . import accounts, proxy, start


def get_root_router() -> Router:
    """Собирает все хендлеры в один корневой роутер."""
    root = Router(name="root")
    root.include_router(start.router)
    root.include_router(accounts.router)
    root.include_router(proxy.router)
    return root
