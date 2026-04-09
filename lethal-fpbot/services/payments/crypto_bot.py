"""Интеграция с @CryptoBot (https://help.crypt.bot/crypto-pay-api).

Конфигурация:
  CRYPTOBOT_TOKEN  — токен из @CryptoBot
  CRYPTOBOT_NETWORK — mainnet (по умолчанию) или testnet
"""

from __future__ import annotations

import logging
import os
from typing import Any

import aiohttp

logger = logging.getLogger(__name__)


def _api_base() -> str:
    if os.getenv("CRYPTOBOT_NETWORK", "mainnet") == "testnet":
        return "https://testnet-pay.crypt.bot/api"
    return "https://pay.crypt.bot/api"


class CryptoBotProvider:
    name = "crypto_bot"

    def __init__(self) -> None:
        self.token = os.getenv("CRYPTOBOT_TOKEN", "")

    @property
    def enabled(self) -> bool:
        return bool(self.token)

    def _headers(self) -> dict[str, str]:
        return {"Crypto-Pay-API-Token": self.token}

    async def create_invoice(
        self,
        amount: int,
        description: str,
        metadata: dict[str, Any] | None = None,
        asset: str = "USDT",
    ) -> dict:
        if not self.enabled:
            return {"error": "crypto_bot_disabled"}
        # Конвертация ₽ → USDT по курсу ~95 (упрощённо).
        # В проде лучше дёргать актуальный курс.
        usdt_amount = round(amount / 95.0, 2)
        payload = {
            "amount": str(usdt_amount),
            "currency_type": "crypto",
            "asset": asset,
            "description": description,
            "payload": (metadata or {}).get("payload", ""),
            "allow_anonymous": False,
        }
        async with aiohttp.ClientSession() as sess:
            async with sess.post(
                f"{_api_base()}/createInvoice",
                json=payload,
                headers=self._headers(),
                timeout=aiohttp.ClientTimeout(total=15),
            ) as resp:
                data = await resp.json()
        if not data.get("ok"):
            logger.warning("CryptoBot create_invoice failed: %s", data)
            return {"error": "crypto_bot_api", "details": data}
        result = data.get("result", {})
        return {
            "id": str(result.get("invoice_id")),
            "status": "pending",
            "url": result.get("pay_url"),
            "amount": usdt_amount,
            "asset": asset,
        }

    async def check_status(self, invoice_id: str) -> str:
        if not self.enabled:
            return "failed"
        async with aiohttp.ClientSession() as sess:
            async with sess.get(
                f"{_api_base()}/getInvoices",
                params={"invoice_ids": invoice_id},
                headers=self._headers(),
                timeout=aiohttp.ClientTimeout(total=10),
            ) as resp:
                data = await resp.json()
        if not data.get("ok"):
            return "failed"
        items = data.get("result", {}).get("items", [])
        if not items:
            return "failed"
        st = items[0].get("status", "active")
        if st == "paid":
            return "paid"
        if st == "expired":
            return "failed"
        return "pending"

    async def parse_webhook(self, body: dict) -> dict | None:
        if body.get("update_type") != "invoice_paid":
            return None
        payload = body.get("payload", {})
        return {
            "provider": self.name,
            "id": str(payload.get("invoice_id")),
            "status": "paid",
            "amount": float(payload.get("amount", 0)),
            "metadata": {"payload": payload.get("payload")},
        }
