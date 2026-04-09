"""CLI команды Lethal FunPay Bot."""

from __future__ import annotations

import argparse
import asyncio
import json
import logging
import sys
from typing import Any

from config import TIER_NAMES
from database.db import connect, init_db
from database.models import (
    create_promo_code,
    get_user_by_tg,
    list_pending_payments,
    list_promos,
    update_user_subscription,
)
from utils.helpers import now_ts

logger = logging.getLogger(__name__)


def _print_table(rows: list[dict], cols: list[str]) -> None:
    if not rows:
        print("(no rows)")
        return
    widths = {c: max(len(c), max(len(str(r.get(c, ""))) for r in rows)) for c in cols}
    line = " | ".join(c.ljust(widths[c]) for c in cols)
    print(line)
    print("-+-".join("-" * widths[c] for c in cols))
    for r in rows:
        print(" | ".join(str(r.get(c, "")).ljust(widths[c]) for c in cols))


# ----------------------------- commands -----------------------------------


async def cmd_grant(args: Any) -> int:
    user = await get_user_by_tg(args.telegram_id)
    if not user:
        print(f"User {args.telegram_id} not found")
        return 1
    expires = now_ts() + args.days * 86400
    await update_user_subscription(user["id"], args.tier, expires)
    print(
        f"Granted {TIER_NAMES.get(args.tier, args.tier)} to "
        f"@{user.get('username') or args.telegram_id} until ts={expires}"
    )
    return 0


async def cmd_stats(args: Any) -> int:
    async with connect() as db:
        cur = await db.execute("SELECT COUNT(*) AS c FROM users")
        users = (await cur.fetchone())["c"]
        cur = await db.execute("SELECT COUNT(*) AS c FROM fp_accounts")
        fp = (await cur.fetchone())["c"]
        cur = await db.execute("SELECT COUNT(*) AS c FROM stats")
        sales = (await cur.fetchone())["c"]
        cur = await db.execute("SELECT COALESCE(SUM(amount),0) AS s FROM stats")
        total = (await cur.fetchone())["s"]
        cur = await db.execute(
            "SELECT subscription_tier, COUNT(*) AS c FROM users "
            "WHERE subscription_tier IS NOT NULL GROUP BY subscription_tier"
        )
        tiers = [dict(r) for r in await cur.fetchall()]
    print(f"Users: {users}")
    print(f"FP accounts: {fp}")
    print(f"Sales: {sales}")
    print(f"Revenue: {int(total)}₽")
    print("Tiers:")
    for t in tiers:
        print(f"  {t['subscription_tier']}: {t['c']}")
    return 0


async def cmd_broadcast(args: Any) -> int:
    """Шлёт сообщение всем пользователям через временный Bot."""
    from aiogram import Bot

    import config

    if not config.BOT_TOKEN:
        print("BOT_TOKEN not set")
        return 1
    bot = Bot(config.BOT_TOKEN)
    async with connect() as db:
        cur = await db.execute("SELECT telegram_id FROM users")
        ids = [r[0] for r in await cur.fetchall()]
    sent = 0
    failed = 0
    for tg in ids:
        try:
            await bot.send_message(tg, args.text)
            sent += 1
        except Exception:  # noqa: BLE001
            failed += 1
    await bot.session.close()
    print(f"Sent: {sent}, failed: {failed}")
    return 0


async def cmd_pending(args: Any) -> int:
    pending = await list_pending_payments()
    if not pending:
        print("No pending payments")
        return 0
    _print_table(
        [
            {
                "id": p["id"],
                "user_id": p["user_id"],
                "tier": p["tier"],
                "amount": p["amount"],
                "created": p["created_at"],
            }
            for p in pending
        ],
        ["id", "user_id", "tier", "amount", "created"],
    )
    return 0


async def cmd_promo_create(args: Any) -> int:
    valid_until = now_ts() + args.days * 86400 if args.days else None
    pid = await create_promo_code(
        code=args.code,
        discount_percent=args.percent,
        max_uses=args.uses or 0,
        valid_until=valid_until,
    )
    print(f"Created promo {args.code} (id={pid}, -{args.percent}%)")
    return 0


async def cmd_promo_list(args: Any) -> int:
    promos = await list_promos()
    if not promos:
        print("(no promos)")
        return 0
    _print_table(
        [
            {
                "id": p["id"],
                "code": p["code"],
                "percent": p["discount_percent"],
                "used": f"{p['used_count']}/{p['max_uses'] or '∞'}",
                "until": p.get("valid_until") or "—",
            }
            for p in promos
        ],
        ["id", "code", "percent", "used", "until"],
    )
    return 0


async def cmd_backup(args: Any) -> int:
    from services.backup import _make_backup

    path = await _make_backup()
    print(f"Backup created: {path}")
    return 0


async def cmd_plugins(args: Any) -> int:
    from plugins import get_manager, install_default_plugins

    n = install_default_plugins()
    mgr = get_manager()
    print(f"Loaded {n} plugin(s)")
    for p in mgr.plugins:
        print(f"  - {p.name}: {p.description}")
        for hook in p.hooks:
            print(f"      · hook: {hook}")
    return 0


async def cmd_export(args: Any) -> int:
    """Экспорт всей БД в JSON для бэкапа/миграции."""
    out: dict[str, list[dict]] = {}
    async with connect() as db:
        for tbl in [
            "users", "fp_accounts", "auto_responses", "auto_delivery",
            "prepared_texts", "review_responses", "blacklist", "stats",
            "competitors", "settings", "chat_state", "orders_seen",
            "pending_payments", "promo_codes", "promo_redemptions",
            "notification_prefs", "audit_log", "ab_tests",
        ]:
            try:
                cur = await db.execute(f"SELECT * FROM {tbl}")
                out[tbl] = [dict(r) for r in await cur.fetchall()]
            except Exception:  # noqa: BLE001
                out[tbl] = []
    text = json.dumps(out, ensure_ascii=False, indent=2)
    if args.output:
        with open(args.output, "w", encoding="utf-8") as f:
            f.write(text)
        print(f"Exported to {args.output}")
    else:
        print(text)
    return 0


# ----------------------------- main ---------------------------------------


def main() -> None:
    logging.basicConfig(level=logging.INFO)

    parser = argparse.ArgumentParser(
        prog="lethal-cli",
        description="Lethal FunPay Bot — CLI",
    )
    sub = parser.add_subparsers(dest="cmd")

    g = sub.add_parser("grant", help="Grant subscription tier")
    g.add_argument("telegram_id", type=int)
    g.add_argument("--tier", default="pro", choices=["starter", "standard", "pro"])
    g.add_argument("--days", type=int, default=30)
    g.set_defaults(fn=cmd_grant)

    s = sub.add_parser("stats", help="Show global stats")
    s.set_defaults(fn=cmd_stats)

    b = sub.add_parser("broadcast", help="Send message to all users")
    b.add_argument("text")
    b.set_defaults(fn=cmd_broadcast)

    p = sub.add_parser("pending", help="List pending payments")
    p.set_defaults(fn=cmd_pending)

    promo = sub.add_parser("promo", help="Promo code management")
    promo_sub = promo.add_subparsers(dest="promo_cmd")
    pc = promo_sub.add_parser("create")
    pc.add_argument("code")
    pc.add_argument("percent", type=int)
    pc.add_argument("--uses", type=int, default=0)
    pc.add_argument("--days", type=int, default=0)
    pc.set_defaults(fn=cmd_promo_create)
    pl = promo_sub.add_parser("list")
    pl.set_defaults(fn=cmd_promo_list)

    bk = sub.add_parser("backup", help="Make a database backup now")
    bk.set_defaults(fn=cmd_backup)

    pl2 = sub.add_parser("plugins", help="List installed plugins")
    pl2.set_defaults(fn=cmd_plugins)

    ex = sub.add_parser("export", help="Export DB to JSON")
    ex.add_argument("--output", help="Output file (default: stdout)")
    ex.set_defaults(fn=cmd_export)

    init = sub.add_parser("init-db", help="Initialize database tables")
    init.set_defaults(fn=lambda args: init_db())

    args = parser.parse_args()
    if not getattr(args, "fn", None):
        parser.print_help()
        sys.exit(1)
    rc = asyncio.run(args.fn(args))
    sys.exit(rc or 0)
