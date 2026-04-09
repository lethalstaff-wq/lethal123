"""Умное расписание автоподнятия лотов.

Проблемы базового auto_raise:
  • Все лоты пытается поднять одновременно — FunPay даёт rate-limit
  • Нет приоритизации: самые прибыльные лоты поднимаются не чаще прочих
  • Нет джиттера — выглядит как бот (легче задетектить)
  • Game_id жёстко 1 (fallback), надо из каталога

Этот модуль решает всё:
  • Разносит поднятия во времени (max 1 подъём раз в N секунд)
  • Приоритизирует лоты по total_revenue за последние 30 дней
  • Добавляет random jitter ±20% к интервалу
  • Использует games.matchers.detect_game_from_lot для правильного game_id
  • Помнит cooldown per-lot (FunPay часто отвечает "too soon")
"""

from __future__ import annotations

import logging
import random
import time
from collections import defaultdict
from dataclasses import dataclass

from games.matchers import detect_game_from_lot

logger = logging.getLogger(__name__)


@dataclass
class LotPriority:
    lot_id: str
    title: str
    game_id: int
    priority_score: float
    cooldown_until: float = 0.0
    last_raised: float = 0.0
    raise_count: int = 0
    failed_count: int = 0


class RaiseSchedule:
    """Планировщик для одного ФП-аккаунта."""

    def __init__(
        self,
        min_interval_sec: float = 10.0,
        global_cooldown_sec: float = 4 * 3600,  # 4 часа базовый
        jitter_percent: float = 20.0,
    ) -> None:
        self.min_interval = min_interval_sec
        self.global_cooldown = global_cooldown_sec
        self.jitter = jitter_percent / 100.0
        self._lots: dict[str, LotPriority] = {}
        self._last_any: float = 0.0

    def rebuild(
        self, lots: list, revenue_by_game: dict[str, float] | None = None
    ) -> None:
        """Обновляет список лотов и пересчитывает приоритеты.

        revenue_by_game — словарь {game_id: total_revenue} за последние N дней.
        Чем больше выручка — тем выше приоритет.
        """
        revenue_by_game = revenue_by_game or {}
        seen: set[str] = set()

        for lot in lots:
            lot_id = str(getattr(lot, "id", "") or "")
            if not lot_id:
                continue
            seen.add(lot_id)
            title = getattr(lot, "title", "") or ""
            game = detect_game_from_lot(title)
            game_id = int(game["fp_game_id"]) if game else 1
            priority = (
                revenue_by_game.get(game["id"] if game else "unknown", 0.0) + 1.0
            )

            existing = self._lots.get(lot_id)
            if existing:
                existing.title = title
                existing.game_id = game_id
                existing.priority_score = priority
            else:
                self._lots[lot_id] = LotPriority(
                    lot_id=lot_id,
                    title=title,
                    game_id=game_id,
                    priority_score=priority,
                )

        # Убираем пропавшие лоты
        for gone in list(self._lots.keys() - seen):
            self._lots.pop(gone, None)

    def next_lot_to_raise(self) -> LotPriority | None:
        """Выдаёт следующий лот для поднятия или None если пора ждать."""
        now = time.time()
        if now - self._last_any < self.min_interval:
            return None

        candidates = [
            lot
            for lot in self._lots.values()
            if lot.cooldown_until <= now
            and now - lot.last_raised >= self._apply_jitter(self.global_cooldown)
        ]
        if not candidates:
            return None

        # Сортировка: priority desc, last_raised asc
        candidates.sort(
            key=lambda x: (-x.priority_score, x.last_raised)
        )
        return candidates[0]

    def mark_raised(self, lot_id: str, success: bool) -> None:
        now = time.time()
        lot = self._lots.get(lot_id)
        if not lot:
            return
        lot.last_raised = now
        self._last_any = now
        if success:
            lot.raise_count += 1
            # Сбрасываем cooldown — FunPay разрешил
            lot.cooldown_until = 0
        else:
            lot.failed_count += 1
            # Возможно, FunPay вернул "too soon" — ставим cooldown на 1 час
            lot.cooldown_until = now + 3600

    def _apply_jitter(self, base: float) -> float:
        if self.jitter <= 0:
            return base
        delta = base * self.jitter
        return base + random.uniform(-delta, delta)

    def stats(self) -> dict:
        return {
            "total_lots": len(self._lots),
            "total_raises": sum(lot.raise_count for lot in self._lots.values()),
            "total_failures": sum(lot.failed_count for lot in self._lots.values()),
            "in_cooldown": sum(
                1 for lot in self._lots.values() if lot.cooldown_until > time.time()
            ),
        }


# Один планировщик на ФП-аккаунт
_schedules: dict[int, RaiseSchedule] = {}


def get_schedule(account_id: int) -> RaiseSchedule:
    if account_id not in _schedules:
        _schedules[account_id] = RaiseSchedule()
    return _schedules[account_id]


async def build_revenue_map(user_id: int, days: int = 30) -> dict[str, float]:
    """Считает выручку за N дней по game_id (для приоритизации)."""
    from database.db import connect
    from games.matchers import detect_game_from_lot
    from utils.helpers import now_ts

    async with connect() as db:
        cur = await db.execute(
            """
            SELECT lot_name, SUM(amount) AS total
              FROM stats
             WHERE user_id = ? AND timestamp >= ?
             GROUP BY lot_name
            """,
            (user_id, now_ts() - days * 86400),
        )
        rows = await cur.fetchall()

    revenue: dict[str, float] = defaultdict(float)
    for row in rows:
        game = detect_game_from_lot(row["lot_name"] or "")
        key = game["id"] if game else "unknown"
        revenue[key] += float(row["total"] or 0)
    return dict(revenue)
