"""i18n для Web API / Mini App.

Telegram-бот остаётся на русском (так договорились с заказчиком),
а Mini App и Web API уважают язык пользователя — для b2b-клиентов
из СНГ и Европы.

Использование:
    from i18n import t

    t("login.success", lang="en")
    t("billing.thanks", name="Alice", lang="ru")

Если ключ не найден — fallback на ru, потом на сам ключ.
"""

from __future__ import annotations

from .translator import (
    DEFAULT_LANG,
    SUPPORTED_LANGS,
    detect_lang,
    set_default_lang,
    t,
    translate,
)

__all__ = [
    "DEFAULT_LANG",
    "SUPPORTED_LANGS",
    "detect_lang",
    "set_default_lang",
    "t",
    "translate",
]
