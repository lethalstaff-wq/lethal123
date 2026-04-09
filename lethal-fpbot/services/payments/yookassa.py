"""Интеграция с ЮKassa (https://yookassa.ru/developers/api).

Поддерживает создание платежа, опрос статуса, обработку webhook'а.

Конфигурация через env:
  YOOKASSA_SHOP_ID
  YOOKASSA_SECRET_KEY
  YOOKASSA_RETURN_URL  — куда редиректнуть пользователя после оплаты
"""

from __future__ import annotations

import base64
import logging
import os
import uuid
from typing import Any

import aiohttp

logger = logging.getLogger(__name__)

API_BASE = "https://api.yookassa.ru/v3"


class YooKassaProvider:
    name = "yookassa"

    def __init__(self) -> None:
        self.shop_id = os.getenv("YOOKASSA_SHOP_ID", "")
        self.secret = os.getenv("YOOKASSA_SECRET_KEY", "")
        self.return_url = os.getenv("YOOKASSA_RETURN_URL", "https://t.me/")

    @property
    def enabled(self) -> bool:
        return bool(self.shop_id and self.secret)

    def _auth_header(self) -> str:
        token = base64.b64encode(
            f"{self.shop_id}:{self.secret}".encode()
        ).decode()
        return f"Basic {token}"

    async def create_invoice(
        self,
        amount: int,
        description: str,
        metadata: dict[str, Any] | None = None,
    ) -> dict:
        if not self.enabled:
            return {"error": "yookassa_disabled"}
        idempotence_key = str(uuid.uuid4())
        payload = {
            "amount": {"value": f"{amount}.00", "currency": "RUB"},
            "confirmation": {
                "type": "redirect",
                "return_url": self.return_url,
            },
            "capture": True,
            "description": description,
            "metadata": metadata or {},
        }
        async with aiohttp.ClientSession() as sess:
            async with sess.post(
                f"{API_BASE}/payments",
                json=payload,
                headers={
                    "Authorization": self._auth_header(),
                    "Idempotence-Key": idempotence_key,
                    "Content-Type": "application/json",
                },
                timeout=aiohttp.ClientTimeout(total=15),
            ) as resp:
                data = await resp.json()
                if resp.status >= 400:
                    logger.warning("YooKassa create_invoice failed: %s", data)
                    return {"error": "yookassa_api", "details": data}
        return {
            "id": data["id"],
            "status": data["status"],
            "url": data["confirmation"]["confirmation_url"],
            "amount": amount,
        }

    async def check_status(self, invoice_id: str) -> str:
        if not self.enabled:
            return "failed"
        async with aiohttp.ClientSession() as sess:
            async with sess.get(
                f"{API_BASE}/payments/{invoice_id}",
                headers={"Authorization": self._auth_header()},
                timeout=aiohttp.ClientTimeout(total=10),
            ) as resp:
                data = await resp.json()
        status = data.get("status", "")
        if status == "succeeded":
            return "paid"
        if status in ("canceled", "waiting_for_capture"):
            return "failed" if status == "canceled" else "pending"
        return "pending"

    async def parse_webhook(self, body: dict) -> dict | None:
        """Парсит webhook от ЮKassa.

        Webhook доставляется на /api/payments/yookassa/webhook
        и содержит {event, object: {id, status, metadata, ...}}.
        """
        if body.get("event") not in (
            "payment.succeeded",
            "payment.canceled",
            "payment.waiting_for_capture",
        ):
            return None
        obj = body.get("object", {})
        return {
            "provider": self.name,
            "id": obj.get("id"),
            "status": "paid" if obj.get("status") == "succeeded" else "failed",
            "amount": float(obj.get("amount", {}).get("value", 0)),
            "metadata": obj.get("metadata", {}),
        }
