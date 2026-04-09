"""PluginManager — загружает и вызывает плагины.

Безопасность: плагины — Python-код, поэтому грузим только из
plugins/examples и пользовательской директории plugins/user
(если она существует). Любой плагин может уронить хук — мы
ловим исключение и логируем, не убивая остальных.
"""

from __future__ import annotations

import asyncio
import importlib.util
import logging
from collections.abc import Awaitable, Callable
from dataclasses import dataclass, field
from pathlib import Path
from typing import Any

logger = logging.getLogger(__name__)


HookFn = Callable[..., Awaitable[Any]]


@dataclass
class Plugin:
    name: str
    description: str = ""
    hooks: dict[str, HookFn] = field(default_factory=dict)

    def hook(self, name: str):
        """Декоратор — пометить функцию как хук."""

        def decorator(fn: HookFn):
            self.hooks[name] = fn
            return fn

        return decorator


class PluginManager:
    def __init__(self) -> None:
        self.plugins: list[Plugin] = []

    def register(self, plugin: Plugin) -> None:
        logger.info("Plugin loaded: %s", plugin.name)
        self.plugins.append(plugin)

    def load_dir(self, directory: Path) -> int:
        """Импортирует все *.py из директории как плагины."""
        if not directory.exists():
            return 0
        loaded = 0
        for path in sorted(directory.glob("*.py")):
            if path.stem.startswith("_"):
                continue
            try:
                spec = importlib.util.spec_from_file_location(
                    f"plugins.user.{path.stem}", path
                )
                if not spec or not spec.loader:
                    continue
                module = importlib.util.module_from_spec(spec)
                spec.loader.exec_module(module)
                plugin = getattr(module, "PLUGIN", None)
                if isinstance(plugin, Plugin):
                    self.register(plugin)
                    loaded += 1
            except Exception:  # noqa: BLE001
                logger.exception("Plugin %s failed to load", path.stem)
        return loaded

    async def emit(self, hook_name: str, *args, **kwargs) -> list[Any]:
        """Дёргает все плагины, у которых есть этот хук.

        Если плагин вернул "stop" — прерываем дальнейших.
        """
        results = []
        for plugin in self.plugins:
            fn = plugin.hooks.get(hook_name)
            if not fn:
                continue
            try:
                if asyncio.iscoroutinefunction(fn):
                    res = await fn(*args, **kwargs)
                else:
                    res = fn(*args, **kwargs)
                results.append(res)
                if res == "stop":
                    break
            except Exception:  # noqa: BLE001
                logger.exception("Plugin %s hook %s failed", plugin.name, hook_name)
        return results


_manager: PluginManager | None = None


def get_manager() -> PluginManager:
    global _manager
    if _manager is None:
        _manager = PluginManager()
    return _manager


def install_default_plugins() -> int:
    """Загружает встроенные примеры + пользовательские плагины."""
    mgr = get_manager()
    here = Path(__file__).parent
    loaded = mgr.load_dir(here / "examples")
    user_dir = here / "user"
    if user_dir.exists():
        loaded += mgr.load_dir(user_dir)
    return loaded
