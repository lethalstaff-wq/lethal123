"""Минималистичный i18n-движок: словари + format-string подстановки.

Без gettext / babel — нам не нужны множественные числа с комплексными
правилами и т.д. Простые ключи + .format(**kwargs) хватает с лихвой.
"""

from __future__ import annotations

import logging
from typing import Any

from .locales import en, kz, ru, uk

logger = logging.getLogger(__name__)

SUPPORTED_LANGS = ("ru", "en", "uk", "kz")
DEFAULT_LANG = "ru"

_DICTS: dict[str, dict[str, str]] = {
    "ru": ru.MESSAGES,
    "en": en.MESSAGES,
    "uk": uk.MESSAGES,
    "kz": kz.MESSAGES,
}

_default_lang = DEFAULT_LANG


def set_default_lang(lang: str) -> None:
    global _default_lang
    if lang in SUPPORTED_LANGS:
        _default_lang = lang


def detect_lang(raw: str | None) -> str:
    """Подбирает поддерживаемый язык по сырому коду из Telegram/HTTP."""
    if not raw:
        return _default_lang
    raw = raw.lower().split("-")[0].split("_")[0]
    if raw in SUPPORTED_LANGS:
        return raw
    return _default_lang


def translate(key: str, lang: str | None = None, **kwargs: Any) -> str:
    """Возвращает перевод по ключу с подстановкой переменных.

    Если ключ не найден ни в указанном языке, ни в DEFAULT_LANG —
    возвращает сам ключ (помогает быстро найти необъявленные строки).
    """
    target = lang if lang in _DICTS else _default_lang
    text = _DICTS[target].get(key)
    if text is None:
        text = _DICTS[_default_lang].get(key)
    if text is None:
        logger.debug("Missing translation: %s", key)
        return key

    if not kwargs:
        return text
    try:
        return text.format(**kwargs)
    except (KeyError, IndexError) as exc:
        logger.warning("translate(%s) format failed: %s", key, exc)
        return text


# Короткий алиас для удобства
t = translate
