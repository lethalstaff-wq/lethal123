"""POST /api/lots/bulk — загрузка CSV/Excel с лотами."""

from __future__ import annotations

import logging

from aiohttp import web

from database.models import get_or_create_user
from services.bulk import import_lots_for_user, parse_csv, parse_excel

routes = web.RouteTableDef()
logger = logging.getLogger(__name__)


@routes.post("/api/lots/bulk")
async def bulk_upload(request: web.Request) -> web.Response:
    user = await get_or_create_user(request["tg_id"], None)
    reader = await request.multipart()
    field = await reader.next()
    if field is None or field.name != "file":
        return web.json_response({"error": "file field required"}, status=400)
    content = await field.read(decode=False)
    filename = (field.filename or "").lower()

    try:
        if filename.endswith(".xlsx"):
            rows = parse_excel(content)
        else:
            rows = parse_csv(content.decode("utf-8", errors="replace"))
    except ImportError:
        return web.json_response({"error": "excel_not_supported"}, status=400)
    except Exception as exc:  # noqa: BLE001
        logger.warning("bulk parse failed: %s", exc)
        return web.json_response({"error": "parse_failed"}, status=400)

    if not rows:
        return web.json_response({"error": "empty_file"}, status=400)

    count = await import_lots_for_user(user["id"], rows)
    return web.json_response({"imported": count})
