"""Lethal FunPay Bot — конфигурация.

Все секреты грузим из переменных окружения / .env, чтобы не светить токены
в репозитории. ENCRYPTION_KEY должен быть 32-байтным base64 ключом для
Fernet (AES-128 в CBC + HMAC). При первом запуске сгенерируется автоматически
и предупредим пользователя.
"""

from __future__ import annotations

import os
from pathlib import Path

try:
    from dotenv import load_dotenv

    load_dotenv()
except Exception:  # pragma: no cover - dotenv опционален
    pass


BASE_DIR = Path(__file__).resolve().parent

# --- Telegram ---------------------------------------------------------------
BOT_TOKEN: str = os.getenv("BOT_TOKEN", "").strip()

# Список Telegram ID администраторов через запятую: "111,222"
_admin_raw = os.getenv("ADMIN_IDS", "").strip()
ADMIN_IDS: list[int] = [
    int(x) for x in _admin_raw.replace(" ", "").split(",") if x.isdigit()
]

# --- База данных ------------------------------------------------------------
DB_PATH: str = os.getenv("DB_PATH", str(BASE_DIR / "lethal_fpbot.db"))

# --- Шифрование -------------------------------------------------------------
# Fernet-ключ. Если не задан — сгенерируется и сохранится в .secret_key
ENCRYPTION_KEY: str = os.getenv("ENCRYPTION_KEY", "").strip()
SECRET_KEY_FILE: Path = BASE_DIR / ".secret_key"

# --- FunPay -----------------------------------------------------------------
FP_BASE_URL: str = "https://funpay.com"
FP_DEFAULT_UA: str = (
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
    "AppleWebKit/537.36 (KHTML, like Gecko) "
    "Chrome/124.0.0.0 Safari/537.36"
)
FP_REQUEST_TIMEOUT: int = 30

# --- Тарифы -----------------------------------------------------------------
TIER_STARTER = "starter"
TIER_STANDARD = "standard"
TIER_PRO = "pro"

TIER_PRICES: dict[str, int] = {
    TIER_STARTER: 500,
    TIER_STANDARD: 1000,
    TIER_PRO: 1500,
}

# Лимит ФП-аккаунтов на тариф
TIER_FP_ACCOUNTS_LIMIT: dict[str, int] = {
    TIER_STARTER: 1,
    TIER_STANDARD: 5,
    TIER_PRO: 10,
}

TIER_NAMES: dict[str, str] = {
    TIER_STARTER: "🥉 Starter",
    TIER_STANDARD: "🥈 Standard",
    TIER_PRO: "🥇 Pro",
}

# --- Брендинг ---------------------------------------------------------------
BRAND_NAME = "Lethal FunPay Bot"
BRAND_SHORT = "⚡ Lethal Bot"


def validate() -> None:
    """Жёстко падаем если нет токена бота."""
    if not BOT_TOKEN:
        raise RuntimeError(
            "BOT_TOKEN не задан. Установи переменную окружения BOT_TOKEN "
            "или создай .env в корне lethal-fpbot/"
        )
