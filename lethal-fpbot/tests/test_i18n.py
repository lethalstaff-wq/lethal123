"""Тесты i18n: все локали покрывают одинаковые ключи + format."""

from __future__ import annotations

from i18n.locales import en, kz, ru, uk
from i18n.translator import detect_lang, t


def test_all_locales_cover_ru_keys():
    """Каждая локаль должна иметь все ключи которые есть в ru."""
    base = set(ru.MESSAGES.keys())
    for locale_module, name in [(en, "en"), (uk, "uk"), (kz, "kz")]:
        keys = set(locale_module.MESSAGES.keys())
        missing = base - keys
        assert not missing, f"{name} missing keys: {missing}"


def test_translate_basic():
    assert t("common.yes", lang="ru") == "Да"
    assert t("common.yes", lang="en") == "Yes"
    assert t("common.yes", lang="uk") == "Так"
    assert t("common.yes", lang="kz") == "Иә"


def test_translate_format():
    assert "Алиса" in t("accounts.add.success", lang="ru", login="Алиса")
    assert "Bob" in t("accounts.add.success", lang="en", login="Bob")


def test_translate_fallback_to_ru():
    # неизвестный язык → fallback на ru
    assert t("common.yes", lang="xx") == "Да"


def test_translate_returns_key_if_missing():
    assert t("nonexistent.key", lang="en") == "nonexistent.key"


def test_detect_lang():
    assert detect_lang("ru") == "ru"
    assert detect_lang("en-US") == "en"
    assert detect_lang("uk_UA") == "uk"
    assert detect_lang("kz") == "kz"
    assert detect_lang("xx") == "ru"  # fallback
    assert detect_lang(None) == "ru"
    assert detect_lang("") == "ru"
