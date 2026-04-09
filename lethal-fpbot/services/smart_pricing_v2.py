"""Продвинутый смарт-прайсинг.

Стратегии ценообразования:
  • "always_cheapest" — быть всегда на 1 рубль ниже самого дешёвого
  • "top_3"          — держать цену в топ-3 по сортировке FunPay
  • "average"        — держать цену на уровне медианы рынка
  • "above_average_percent" — на X% выше средней (премиум)
  • "below_average_percent" — на X% ниже средней (демпинг)

Для каждой стратегии вычисляем target_price и возвращаем рекомендацию.
Если включен auto_price_adjust — применяем автоматически (через
funpay.api.update_lot_price, если он есть; иначе — только рекомендация).

Статистика собирается через quantiles, не через mean, чтобы выбросы
(аномально дорогие/дешёвые лоты) не искажали картину.
"""

from __future__ import annotations

import logging
import statistics
from collections.abc import Iterable
from dataclasses import dataclass

logger = logging.getLogger(__name__)


@dataclass
class MarketSnapshot:
    """Срез цен по конкретной категории FunPay."""

    total_lots: int
    min_price: float
    max_price: float
    q25: float  # 1-й квартиль (25-й перцентиль)
    median: float
    q75: float  # 3-й квартиль (75-й перцентиль)
    top3_avg: float
    samples: list[float]

    def rank_of(self, price: float) -> int:
        """Порядковый номер нашей цены снизу (1 = самая дешёвая)."""
        sorted_prices = sorted(self.samples)
        for i, p in enumerate(sorted_prices):
            if price <= p:
                return i + 1
        return len(sorted_prices) + 1


def build_snapshot(prices: Iterable[float]) -> MarketSnapshot | None:
    samples = [p for p in prices if p and p > 0]
    if len(samples) < 2:
        return None
    samples.sort()
    return MarketSnapshot(
        total_lots=len(samples),
        min_price=samples[0],
        max_price=samples[-1],
        q25=_percentile(samples, 25),
        median=statistics.median(samples),
        q75=_percentile(samples, 75),
        top3_avg=sum(samples[: min(3, len(samples))]) / min(3, len(samples)),
        samples=samples,
    )


def _percentile(sorted_samples: list[float], percent: float) -> float:
    if not sorted_samples:
        return 0.0
    k = (len(sorted_samples) - 1) * percent / 100
    f = int(k)
    c = min(f + 1, len(sorted_samples) - 1)
    if f == c:
        return sorted_samples[f]
    return sorted_samples[f] * (c - k) + sorted_samples[c] * (k - f)


STRATEGIES = {
    "always_cheapest",
    "top_3",
    "average",
    "above_average_5",
    "above_average_10",
    "below_average_5",
    "below_average_10",
}


def compute_target_price(
    current_price: float,
    snapshot: MarketSnapshot,
    strategy: str,
) -> tuple[float, str]:
    """Возвращает (рекомендуемая_цена, причина)."""
    if strategy == "always_cheapest":
        target = max(1.0, snapshot.min_price - 1)
        return target, f"1₽ ниже минимума ({snapshot.min_price})"

    if strategy == "top_3":
        target = max(1.0, snapshot.top3_avg - 1)
        return target, f"попадание в топ-3 (среднее топ-3: {snapshot.top3_avg:.0f})"

    if strategy == "average":
        return snapshot.median, f"медиана рынка ({snapshot.median:.0f})"

    if strategy == "above_average_5":
        target = snapshot.median * 1.05
        return target, "+5% от медианы"

    if strategy == "above_average_10":
        target = snapshot.median * 1.10
        return target, "+10% от медианы"

    if strategy == "below_average_5":
        target = snapshot.median * 0.95
        return target, "-5% от медианы"

    if strategy == "below_average_10":
        target = snapshot.median * 0.90
        return target, "-10% от медианы"

    return current_price, "unknown_strategy"


@dataclass
class PricingRecommendation:
    current: float
    target: float
    delta: float
    delta_percent: float
    reason: str
    strategy: str
    snapshot: MarketSnapshot
    rank_before: int
    rank_after: int


def recommend(
    current_price: float, prices: Iterable[float], strategy: str
) -> PricingRecommendation | None:
    snapshot = build_snapshot(prices)
    if not snapshot:
        return None
    target, reason = compute_target_price(current_price, snapshot, strategy)
    target = round(target, 2)
    delta = target - current_price
    delta_percent = (delta / current_price * 100) if current_price else 0
    rank_before = snapshot.rank_of(current_price)
    rank_after = snapshot.rank_of(target)
    return PricingRecommendation(
        current=current_price,
        target=target,
        delta=delta,
        delta_percent=round(delta_percent, 1),
        reason=reason,
        strategy=strategy,
        snapshot=snapshot,
        rank_before=rank_before,
        rank_after=rank_after,
    )


def format_recommendation(rec: PricingRecommendation) -> str:
    arrow = "📉" if rec.delta < 0 else ("📈" if rec.delta > 0 else "➡️")
    return (
        f"{arrow} <b>Смарт-прайсинг</b>\n\n"
        f"Текущая цена: <b>{rec.current}</b>\n"
        f"Рекомендуемая: <b>{rec.target}</b> ({rec.delta:+.0f}, "
        f"{rec.delta_percent:+.1f}%)\n"
        f"Стратегия: <i>{rec.strategy}</i>\n"
        f"Причина: {rec.reason}\n\n"
        f"📊 <b>Рынок:</b>\n"
        f"• Минимум: {rec.snapshot.min_price}\n"
        f"• Медиана: {rec.snapshot.median:.0f}\n"
        f"• Максимум: {rec.snapshot.max_price}\n"
        f"• Q25–Q75: {rec.snapshot.q25:.0f}–{rec.snapshot.q75:.0f}\n"
        f"• Топ-3 средняя: {rec.snapshot.top3_avg:.0f}\n"
        f"• Всего лотов: {rec.snapshot.total_lots}\n\n"
        f"📍 Твоя позиция: {rec.rank_before} → <b>{rec.rank_after}</b>"
    )
