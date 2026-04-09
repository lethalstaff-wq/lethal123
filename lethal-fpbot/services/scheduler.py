"""Планировщик задач по cron-подобному расписанию.

Поддерживает простое расписание: «каждый день в HH:MM» или
«каждые N минут». Без cron-подобного синтаксиса — этого не нужно
для нашего use case (поднятие лотов по расписанию).
"""

from __future__ import annotations

import asyncio
import logging
import time
from collections.abc import Awaitable, Callable
from dataclasses import dataclass, field

logger = logging.getLogger(__name__)


@dataclass
class ScheduledTask:
    name: str
    callback: Callable[[], Awaitable[None]]
    interval_sec: float | None = None
    daily_at_hour: int | None = None  # UTC hour
    daily_at_minute: int = 0
    last_run: float = 0
    enabled: bool = True
    runs: int = field(default=0)
    failures: int = field(default=0)


class Scheduler:
    def __init__(self) -> None:
        self.tasks: list[ScheduledTask] = []
        self._task: asyncio.Task | None = None

    def every(
        self, name: str, interval_sec: float
    ) -> Callable[[Callable[[], Awaitable[None]]], Callable[[], Awaitable[None]]]:
        def decorator(fn):
            self.tasks.append(
                ScheduledTask(name=name, callback=fn, interval_sec=interval_sec)
            )
            return fn

        return decorator

    def daily_at(
        self, name: str, hour: int, minute: int = 0
    ) -> Callable[[Callable[[], Awaitable[None]]], Callable[[], Awaitable[None]]]:
        def decorator(fn):
            self.tasks.append(
                ScheduledTask(
                    name=name,
                    callback=fn,
                    daily_at_hour=hour,
                    daily_at_minute=minute,
                )
            )
            return fn

        return decorator

    async def start(self) -> None:
        self._task = asyncio.create_task(self._loop())

    async def stop(self) -> None:
        if self._task:
            self._task.cancel()
            try:
                await self._task
            except asyncio.CancelledError:
                pass

    async def _loop(self) -> None:
        while True:
            now = time.time()
            for task in self.tasks:
                if not task.enabled:
                    continue
                if not self._should_run(task, now):
                    continue
                task.last_run = now
                task.runs += 1
                try:
                    await task.callback()
                except Exception:  # noqa: BLE001
                    task.failures += 1
                    logger.exception("scheduled task %s failed", task.name)
            await asyncio.sleep(15)  # тик планировщика — 15 сек

    @staticmethod
    def _should_run(task: ScheduledTask, now: float) -> bool:
        if task.interval_sec:
            return (now - task.last_run) >= task.interval_sec
        if task.daily_at_hour is not None:
            tm = time.gmtime(now)
            target = tm.tm_hour == task.daily_at_hour and tm.tm_min == task.daily_at_minute
            already_today = (
                task.last_run > 0 and (now - task.last_run) < 60
            )
            return target and not already_today
        return False


# Глобальный инстанс
default_scheduler = Scheduler()
