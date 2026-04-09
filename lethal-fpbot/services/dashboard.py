"""Генератор красивых графиков для Telegram-дэшборда.

Использует matplotlib + Pillow. Все графики рендерятся в PNG-байты
и отправляются в ТГ как фото. Стиль тёмный, минималистичный, с
брендовыми цветами Lethal.

Если matplotlib не установлен — возвращаем None и бот показывает
текстовую сводку.
"""

from __future__ import annotations

import io
import logging
from datetime import UTC, datetime

logger = logging.getLogger(__name__)

# Lethal brand palette
BRAND_BG = "#0F0F13"
BRAND_FG = "#EEEEF0"
BRAND_ACCENT = "#FF3355"
BRAND_ACCENT_2 = "#22C55E"
BRAND_ACCENT_3 = "#3B82F6"
BRAND_MUTED = "#666670"
BRAND_GRID = "#1E1E26"


def _try_matplotlib():
    try:
        import matplotlib
        matplotlib.use("Agg")
        import matplotlib.pyplot as plt
        return plt
    except ImportError:
        return None


def _style(fig, ax, title: str) -> None:
    """Применяет брендовый стиль к фигуре."""
    fig.patch.set_facecolor(BRAND_BG)
    ax.set_facecolor(BRAND_BG)
    for spine in ax.spines.values():
        spine.set_color(BRAND_MUTED)
    ax.tick_params(colors=BRAND_FG, labelsize=9)
    ax.grid(True, color=BRAND_GRID, linewidth=0.5, linestyle="-", alpha=0.8)
    ax.set_title(
        title,
        color=BRAND_FG,
        fontsize=13,
        fontweight="bold",
        pad=15,
    )
    ax.set_axisbelow(True)


def _to_png_bytes(fig) -> bytes:
    buf = io.BytesIO()
    fig.savefig(
        buf,
        format="png",
        dpi=140,
        bbox_inches="tight",
        facecolor=fig.get_facecolor(),
    )
    buf.seek(0)
    return buf.getvalue()


# ----------------------------- revenue chart -------------------------------


def revenue_by_day(data: list[tuple[str, int]], days: int = 7) -> bytes | None:
    """Столбчатая диаграмма выручки по дням.

    data: [(YYYY-MM-DD, revenue), ...] — уже упорядочено от старого к новому
    """
    plt = _try_matplotlib()
    if not plt:
        return None
    if not data:
        return None

    labels = [d[0][-5:] for d in data]  # только MM-DD
    values = [d[1] for d in data]

    fig, ax = plt.subplots(figsize=(8, 4))
    bars = ax.bar(labels, values, color=BRAND_ACCENT, width=0.6)

    # Выделяем лучший день
    if values:
        max_idx = values.index(max(values))
        bars[max_idx].set_color(BRAND_ACCENT_2)

    # Подписи над столбцами
    for bar, val in zip(bars, values, strict=False):
        if val > 0:
            ax.text(
                bar.get_x() + bar.get_width() / 2,
                bar.get_height(),
                f"{val:,}".replace(",", " "),
                ha="center",
                va="bottom",
                color=BRAND_FG,
                fontsize=8,
            )

    _style(fig, ax, f"Выручка за {days} дней")
    ax.set_ylabel("₽", color=BRAND_FG, fontsize=10)
    ax.set_xlabel("", color=BRAND_FG)

    png = _to_png_bytes(fig)
    plt.close(fig)
    return png


# ----------------------------- top lots chart ------------------------------


def top_lots_chart(data: list[tuple[str, int]], limit: int = 5) -> bytes | None:
    """Горизонтальная диаграмма топ-лотов по выручке."""
    plt = _try_matplotlib()
    if not plt:
        return None
    if not data:
        return None

    data = data[:limit]
    labels = [d[0][:30] + ("…" if len(d[0]) > 30 else "") for d in data]
    values = [d[1] for d in data]

    fig, ax = plt.subplots(figsize=(8, max(3, len(data) * 0.7)))
    bars = ax.barh(labels, values, color=BRAND_ACCENT_2, height=0.6)

    # Подписи справа
    for bar, val in zip(bars, values, strict=False):
        ax.text(
            bar.get_width(),
            bar.get_y() + bar.get_height() / 2,
            f"  {val:,}".replace(",", " ") + "₽",
            va="center",
            ha="left",
            color=BRAND_FG,
            fontsize=9,
            fontweight="bold",
        )

    _style(fig, ax, "Топ лотов по выручке")
    ax.invert_yaxis()
    ax.set_xlabel("", color=BRAND_FG)

    # Убираем правые вертикальные grid чтобы подписи влезли
    ax.margins(x=0.2)

    png = _to_png_bytes(fig)
    plt.close(fig)
    return png


# ----------------------------- activity heatmap ----------------------------


def hours_activity_chart(hours_map: dict[int, int]) -> bytes | None:
    """График активности покупателей по часам (0-23)."""
    plt = _try_matplotlib()
    if not plt:
        return None

    hours = list(range(24))
    values = [hours_map.get(h, 0) for h in hours]
    if sum(values) == 0:
        return None

    fig, ax = plt.subplots(figsize=(9, 3.5))
    ax.plot(hours, values, color=BRAND_ACCENT, linewidth=2.5, marker="o", markersize=5)
    ax.fill_between(hours, values, color=BRAND_ACCENT, alpha=0.15)

    _style(fig, ax, "Активность покупателей по часам (UTC)")
    ax.set_xlabel("Час", color=BRAND_FG, fontsize=10)
    ax.set_ylabel("Сообщений", color=BRAND_FG, fontsize=10)
    ax.set_xticks(list(range(0, 24, 3)))
    ax.set_xlim(-0.5, 23.5)

    # Выделяем пик
    if values:
        peak_h = values.index(max(values))
        ax.axvline(peak_h, color=BRAND_ACCENT_2, linestyle="--", linewidth=1, alpha=0.7)
        ax.text(
            peak_h,
            max(values),
            f" пик · {peak_h}:00",
            color=BRAND_ACCENT_2,
            fontsize=9,
            fontweight="bold",
            va="bottom",
        )

    png = _to_png_bytes(fig)
    plt.close(fig)
    return png


# ----------------------------- funnel chart --------------------------------


def funnel_chart(stages: list[tuple[str, int]]) -> bytes | None:
    """Воронка: сообщения → заказы → отзывы."""
    plt = _try_matplotlib()
    if not plt:
        return None
    if not stages:
        return None

    labels = [s[0] for s in stages]
    values = [s[1] for s in stages]

    fig, ax = plt.subplots(figsize=(7, 4))
    colors = [BRAND_ACCENT_3, BRAND_ACCENT, BRAND_ACCENT_2]
    bars = ax.barh(labels, values, color=colors[: len(values)], height=0.6)

    for i, (bar, val) in enumerate(zip(bars, values, strict=False)):
        if i == 0:
            label = f"  {val}"
        else:
            prev = values[i - 1]
            conversion = (val / prev * 100) if prev else 0
            label = f"  {val}  ({conversion:.1f}%)"
        ax.text(
            bar.get_width(),
            bar.get_y() + bar.get_height() / 2,
            label,
            va="center",
            ha="left",
            color=BRAND_FG,
            fontsize=10,
            fontweight="bold",
        )

    _style(fig, ax, "Воронка продаж")
    ax.invert_yaxis()
    ax.margins(x=0.25)
    ax.set_xlabel("", color=BRAND_FG)

    png = _to_png_bytes(fig)
    plt.close(fig)
    return png


# ----------------------------- segments donut ------------------------------


def segments_donut(segments: dict[str, int]) -> bytes | None:
    """Пончиковая диаграмма сегментов CRM."""
    plt = _try_matplotlib()
    if not plt:
        return None
    if not segments or sum(segments.values()) == 0:
        return None

    # Переводим ключи в русские названия
    try:
        from database.models_crm import SEGMENT_EMOJI, SEGMENT_NAMES
    except ImportError:
        SEGMENT_NAMES = {}
        SEGMENT_EMOJI = {}

    labels = [
        f"{SEGMENT_EMOJI.get(k, '')} {SEGMENT_NAMES.get(k, k)} ({v})"
        for k, v in segments.items()
    ]
    values = list(segments.values())

    colors = [
        BRAND_ACCENT,
        BRAND_ACCENT_2,
        BRAND_ACCENT_3,
        "#F59E0B",
        "#8B5CF6",
        "#EF4444",
        BRAND_MUTED,
    ]

    fig, ax = plt.subplots(figsize=(8, 5))
    wedges, texts = ax.pie(
        values,
        colors=colors[: len(values)],
        wedgeprops={"width": 0.35, "edgecolor": BRAND_BG, "linewidth": 2},
        startangle=90,
    )

    # Легенда
    ax.legend(
        wedges,
        labels,
        loc="center left",
        bbox_to_anchor=(1, 0, 0.5, 1),
        labelcolor=BRAND_FG,
        facecolor=BRAND_BG,
        edgecolor=BRAND_MUTED,
        fontsize=9,
    )

    fig.patch.set_facecolor(BRAND_BG)
    ax.set_title(
        "Сегменты клиентов",
        color=BRAND_FG,
        fontsize=13,
        fontweight="bold",
        pad=15,
    )

    # Центр — общее число
    total = sum(values)
    ax.text(
        0, 0,
        f"{total}\nклиент{'а' if 2 <= total % 10 <= 4 else 'ов' if total % 10 != 1 else ''}",
        ha="center",
        va="center",
        color=BRAND_FG,
        fontsize=14,
        fontweight="bold",
    )

    png = _to_png_bytes(fig)
    plt.close(fig)
    return png


# ----------------------------- data helpers --------------------------------


async def collect_revenue_by_day(user_id: int, days: int = 7) -> list[tuple[str, int]]:
    """Собирает ['YYYY-MM-DD', total] для графика выручки."""
    from database.db import connect
    from utils.helpers import now_ts

    end = now_ts()
    start = end - days * 86400

    async with connect() as db:
        cur = await db.execute(
            """
            SELECT strftime('%Y-%m-%d', timestamp, 'unixepoch') AS day,
                   COALESCE(SUM(amount), 0) AS total
              FROM stats
             WHERE user_id = ? AND timestamp >= ?
             GROUP BY day
             ORDER BY day
            """,
            (user_id, start),
        )
        rows = await cur.fetchall()

    by_day = {row["day"]: int(row["total"]) for row in rows}

    # Заполняем пустые дни нулями
    result = []
    for i in range(days - 1, -1, -1):
        d = datetime.fromtimestamp(end - i * 86400, tz=UTC)
        key = d.strftime("%Y-%m-%d")
        result.append((key, by_day.get(key, 0)))
    return result


async def collect_top_lots(
    user_id: int, days: int = 30, limit: int = 5
) -> list[tuple[str, int]]:
    from database.db import connect
    from utils.helpers import now_ts

    async with connect() as db:
        cur = await db.execute(
            """
            SELECT lot_name, SUM(amount) AS total
              FROM stats
             WHERE user_id = ? AND timestamp >= ?
             GROUP BY lot_name
             ORDER BY total DESC
             LIMIT ?
            """,
            (user_id, now_ts() - days * 86400, limit),
        )
        rows = await cur.fetchall()
    return [(row["lot_name"] or "—", int(row["total"] or 0)) for row in rows]


async def collect_hours_activity(user_id: int, days: int = 30) -> dict[int, int]:
    """Активность по часам на основе stats.timestamp."""
    from database.db import connect
    from utils.helpers import now_ts

    async with connect() as db:
        cur = await db.execute(
            """
            SELECT strftime('%H', timestamp, 'unixepoch') AS hour,
                   COUNT(*) AS cnt
              FROM stats
             WHERE user_id = ? AND timestamp >= ?
             GROUP BY hour
            """,
            (user_id, now_ts() - days * 86400),
        )
        rows = await cur.fetchall()
    return {int(row["hour"]): int(row["cnt"]) for row in rows}


async def collect_funnel(user_id: int, days: int = 30) -> list[tuple[str, int]]:
    """Воронка: сообщения → заказы → отзывы."""
    from database.db import connect
    from utils.helpers import now_ts

    since = now_ts() - days * 86400

    async with connect() as db:
        # Сообщения — из customer_interactions
        cur = await db.execute(
            """
            SELECT COUNT(*) AS c FROM customer_interactions
             INNER JOIN customers ON customers.id = customer_interactions.customer_id
             WHERE customers.user_id = ?
               AND customer_interactions.kind IN ('message_in', 'message_out')
               AND customer_interactions.timestamp >= ?
            """,
            (user_id, since),
        )
        msgs_row = await cur.fetchone()
        msgs = int(msgs_row["c"]) if msgs_row else 0

        cur = await db.execute(
            "SELECT COUNT(*) AS c FROM stats WHERE user_id = ? AND timestamp >= ?",
            (user_id, since),
        )
        orders_row = await cur.fetchone()
        orders = int(orders_row["c"]) if orders_row else 0

        cur = await db.execute(
            """
            SELECT COALESCE(SUM(reviews_positive + reviews_negative), 0) AS c
              FROM customers
             WHERE user_id = ?
            """,
            (user_id,),
        )
        reviews_row = await cur.fetchone()
        reviews = int(reviews_row["c"]) if reviews_row else 0

    return [
        ("Сообщений", msgs),
        ("Заказов", orders),
        ("Отзывов", reviews),
    ]
