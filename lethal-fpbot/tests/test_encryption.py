"""Тесты AES-шифрования."""

from __future__ import annotations

import pytest


def test_roundtrip(fresh_key):
    from utils.encryption import decrypt, encrypt

    plain = "super-secret-password-123"
    token = encrypt(plain)
    assert token != plain
    assert decrypt(token) == plain


def test_empty(fresh_key):
    from utils.encryption import decrypt, encrypt

    assert encrypt("") == ""
    assert decrypt("") == ""


def test_invalid_token(fresh_key):
    from utils.encryption import decrypt

    assert decrypt("not-a-fernet-token") == ""


def test_unicode(fresh_key):
    from utils.encryption import decrypt, encrypt

    plain = "пароль с эмодзи 🔐"
    assert decrypt(encrypt(plain)) == plain


def test_two_keys_dont_match(monkeypatch, tmp_path):
    """Зашифрованное одним ключом не расшифровывается другим."""
    from cryptography.fernet import Fernet

    import utils.encryption as enc

    key1 = Fernet.generate_key().decode()
    monkeypatch.setattr("config.ENCRYPTION_KEY", key1)
    enc._fernet.cache_clear()  # type: ignore[attr-defined]
    token = enc.encrypt("hello")

    key2 = Fernet.generate_key().decode()
    monkeypatch.setattr("config.ENCRYPTION_KEY", key2)
    enc._fernet.cache_clear()  # type: ignore[attr-defined]
    assert enc.decrypt(token) == ""
