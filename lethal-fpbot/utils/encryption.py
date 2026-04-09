"""AES-шифрование секретов (паролей, golden_key и т.д.).

Используем cryptography.Fernet — это AES-128-CBC + HMAC-SHA256, безопасный
authenticated encryption. Ключ грузим из config.ENCRYPTION_KEY либо
автоматически создаём и сохраняем в .secret_key (только для dev).
"""

from __future__ import annotations

import os
from functools import lru_cache

from cryptography.fernet import Fernet, InvalidToken

import config


def _load_or_create_key() -> bytes:
    # Читаем динамически из модуля config — чтобы тесты могли подменить
    # ENCRYPTION_KEY через monkeypatch и получить новый Fernet после
    # очистки lru_cache.
    if config.ENCRYPTION_KEY:
        return config.ENCRYPTION_KEY.encode()

    if config.SECRET_KEY_FILE.exists():
        return config.SECRET_KEY_FILE.read_bytes().strip()

    key = Fernet.generate_key()
    config.SECRET_KEY_FILE.write_bytes(key)
    try:
        os.chmod(config.SECRET_KEY_FILE, 0o600)
    except OSError:
        pass
    return key


@lru_cache(maxsize=1)
def _fernet() -> Fernet:
    return Fernet(_load_or_create_key())


def encrypt(plaintext: str) -> str:
    """Шифрует строку и возвращает urlsafe-base64 токен.

    Пустые/None значения короткозамыкаем в "" — для нашего use case
    (пароли FunPay) пустая строка означает «не задано».
    """
    if not plaintext:
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
