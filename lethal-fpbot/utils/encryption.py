"""AES-шифрование секретов (паролей, golden_key и т.д.).

Используем cryptography.Fernet — это AES-128-CBC + HMAC-SHA256, безопасный
authenticated encryption. Ключ грузим из config.ENCRYPTION_KEY либо
автоматически создаём и сохраняем в .secret_key (только для dev).
"""

from __future__ import annotations

import os
from functools import lru_cache

from cryptography.fernet import Fernet, InvalidToken

from config import ENCRYPTION_KEY, SECRET_KEY_FILE


def _load_or_create_key() -> bytes:
    if ENCRYPTION_KEY:
        return ENCRYPTION_KEY.encode()

    if SECRET_KEY_FILE.exists():
        return SECRET_KEY_FILE.read_bytes().strip()

    key = Fernet.generate_key()
    SECRET_KEY_FILE.write_bytes(key)
    try:
        os.chmod(SECRET_KEY_FILE, 0o600)
    except OSError:
        pass
    return key


@lru_cache(maxsize=1)
def _fernet() -> Fernet:
    return Fernet(_load_or_create_key())


def encrypt(plaintext: str) -> str:
    """Шифрует строку и возвращает urlsafe-base64 токен."""
    if plaintext is None:
        return ""
    return _fernet().encrypt(plaintext.encode("utf-8")).decode("ascii")


def decrypt(token: str) -> str:
    """Расшифровывает токен. Возвращает пустую строку при ошибке."""
    if not token:
        return ""
    try:
        return _fernet().decrypt(token.encode("ascii")).decode("utf-8")
    except (InvalidToken, ValueError):
        return ""
