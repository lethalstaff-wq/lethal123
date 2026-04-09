"""Платёжные провайдеры — YooKassa и CryptoBot.

Каждый провайдер имеет одинаковый интерфейс:
  • async def create_invoice(amount, description, metadata) -> dict
  • async def check_status(invoice_id) -> str  ('pending'|'paid'|'failed')

Webhook'и принимаются через api/routes/payments.py.
"""

from .crypto_bot import CryptoBotProvider
from .yookassa import YooKassaProvider

__all__ = ["CryptoBotProvider", "YooKassaProvider"]
