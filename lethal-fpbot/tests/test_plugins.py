"""Тесты PluginManager."""

from __future__ import annotations

import pytest

from plugins import Plugin, PluginManager

pytestmark = pytest.mark.asyncio


async def test_register_and_emit():
    mgr = PluginManager()
    p = Plugin(name="test")
    received = []

    @p.hook("on_test")
    async def handler(arg):
        received.append(arg)

    mgr.register(p)
    await mgr.emit("on_test", "hello")
    assert received == ["hello"]


async def test_stop_propagation():
    mgr = PluginManager()
    p1 = Plugin(name="first")
    p2 = Plugin(name="second")
    second_called = []

    @p1.hook("on_event")
    async def first():
        return "stop"

    @p2.hook("on_event")
    async def second():
        second_called.append(True)

    mgr.register(p1)
    mgr.register(p2)
    await mgr.emit("on_event")
    assert second_called == []  # второй плагин не должен был выполниться


async def test_plugin_exception_doesnt_break_others():
    mgr = PluginManager()
    p1 = Plugin(name="bad")
    p2 = Plugin(name="good")
    good_called = []

    @p1.hook("on_event")
    async def bad():
        raise RuntimeError("oops")

    @p2.hook("on_event")
    async def good():
        good_called.append(True)

    mgr.register(p1)
    mgr.register(p2)
    await mgr.emit("on_event")
    assert good_called == [True]


async def test_load_default_plugins():
    from pathlib import Path

    from plugins.manager import PluginManager

    mgr = PluginManager()
    here = Path(__file__).parent.parent / "plugins" / "examples"
    n = mgr.load_dir(here)
    assert n >= 3  # greeter, sales_logger, anti_flood, keyword_alert
    names = {p.name for p in mgr.plugins}
    assert "greeter" in names
    assert "anti_flood" in names
