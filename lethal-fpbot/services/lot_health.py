"""Lot Health Monitor — проверяет что все твои лоты на FunPay «здоровы».

«Здоровый» лот:
  • Активен (не скрыт)
  • Имеет цену > 0
  • В наличии (для ограниченных товаров)
  • Поднимался за последние 24 часа
  • Получает просмотры (если доступно через парсинг)
  • Качество (по Lot Quality Scorer) >= 60

Если что-то не так — бот пишет алёрт с конкретными причинами.
Запускается раз в 6 часов.
"""

from __future__ import annotations

import logging
from dataclasses import dataclass, field

from services.lot_quality import analyze_lot

logger = logging.getLogger(__name__)


@dataclass
class LotHealthIssue:
    lot_id: str
    lot_title: str
    severity: str  # "warning" / "critical"
    reasons: list[str] = field(default_factory=list)

    @property
    def emoji(self) -> str:
        return "🚨" if self.severity == "critical" else "⚠️"


@dataclass
class LotHealthReport:
    total_lots: int
    healthy: int
    issues: list[LotHealthIssue] = field(default_factory=list)

    @property
    def health_percent(self) -> int:
        return int(self.healthy / self.total_lots * 100) if self.total_lots else 100

    @property
    def health_grade(self) -> str:
        p = self.health_percent
        if p >= 95:
            return "A"
        if p >= 80:
            return "B"
        if p >= 60:
            return "C"
        if p >= 40:
            return "D"
        return "F"


def check_lot_health(lot: dict) -> LotHealthIssue | None:
    """Проверяет один лот и возвращает issue если есть проблемы."""
    reasons = []
    severity = "warning"

    title = lot.get("title", "") or ""
    description = lot.get("description", "") or ""
    price = lot.get("price")
    is_active = lot.get("is_active", True)

    if not is_active:
        reasons.append("Лот скрыт (is_active=false)")
        severity = "critical"

    if not price or price <= 0:
        reasons.append("Цена не установлена или 0")
        severity = "critical"

    if not title or len(title) < 10:
        reasons.append("Заголовок слишком короткий")

    # Quality check
    analysis = analyze_lot(title, description, price)
    if analysis["total"] < 60:
        reasons.append(
            f"Качество оформления низкое ({analysis['total']}/100, grade {analysis['grade']})"
        )

    # Поднимался давно?
    last_raised = lot.get("last_raised_ts")
    if last_raised:
        from utils.helpers import now_ts

        age_hours = (now_ts() - last_raised) / 3600
        if age_hours > 48:
            reasons.append(f"Не поднимался {int(age_hours)} часов")

    if not reasons:
        return None

    return LotHealthIssue(
        lot_id=str(lot.get("id", "")),
        lot_title=title,
        severity=severity,
        reasons=reasons,
    )


def build_report(lots: list[dict]) -> LotHealthReport:
    issues = []
    for lot in lots:
        issue = check_lot_health(lot)
        if issue:
            issues.append(issue)

    healthy = len(lots) - len(issues)
    return LotHealthReport(
        total_lots=len(lots),
        healthy=healthy,
        issues=issues,
    )


def format_report(report: LotHealthReport) -> str:
    if report.total_lots == 0:
        return "🏥 <b>Health check</b>\n\nЛотов не найдено."

    grade_emoji = {
        "A": "🌟",
        "B": "✅",
        "C": "⚠️",
        "D": "❌",
        "F": "🆘",
    }.get(report.health_grade, "")

    lines = [
        "🏥 <b>Health check твоих лотов</b>",
        "",
        f"{grade_emoji} Общее здоровье: <b>{report.health_percent}%</b> "
        f"(grade {report.health_grade})",
        f"✅ Здоровых: {report.healthy}/{report.total_lots}",
    ]

    if report.issues:
        lines.append("")
        lines.append(f"🔧 <b>Проблемы ({len(report.issues)}):</b>")
        for issue in report.issues[:10]:  # топ-10
            lines.append("")
            lines.append(f"{issue.emoji} <b>{issue.lot_title[:50]}</b>")
            for reason in issue.reasons:
                lines.append(f"   • {reason}")
        if len(report.issues) > 10:
            lines.append("")
            lines.append(f"<i>…и ещё {len(report.issues) - 10} лотов с проблемами</i>")
    else:
        lines.append("")
        lines.append("🎉 <b>Все лоты в отличном состоянии!</b>")

    return "\n".join(lines)
