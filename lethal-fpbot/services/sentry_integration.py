"""Опциональная интеграция с Sentry для алертов о падениях.

Если SENTRY_DSN задан в окружении и установлен sentry-sdk —
все необработанные исключения будут улетать в Sentry. Иначе — no-op.

Не делаем sentry обязательной зависимостью, чтобы не нагружать
бота лишним кодом тем кто не использует.
"""

from __future__ import annotations

import logging
import os

logger = logging.getLogger(__name__)


def init() -> bool:
    dsn = os.getenv("SENTRY_DSN")
    if not dsn:
        return False
    try:
        import sentry_sdk  # type: ignore
        from sentry_sdk.integrations.aiohttp import AioHttpIntegration  # type: ignore
        from sentry_sdk.integrations.logging import LoggingIntegration  # type: ignore
    except ImportError:
        logger.info("sentry-sdk not installed; SENTRY_DSN ignored")
        return False

    env = os.getenv("SENTRY_ENV", "production")
    sample_rate = float(os.getenv("SENTRY_TRACES_SAMPLE_RATE", "0.05"))

    sentry_sdk.init(
        dsn=dsn,
        environment=env,
        traces_sample_rate=sample_rate,
        integrations=[
            AioHttpIntegration(),
            LoggingIntegration(level=logging.INFO, event_level=logging.ERROR),
        ],
        send_default_pii=False,
    )
    logger.info("Sentry initialized (env=%s, sample=%s)", env, sample_rate)
    return True


def capture_exception(exc: BaseException) -> None:
    try:
        import sentry_sdk  # type: ignore

        sentry_sdk.capture_exception(exc)
    except ImportError:
        pass


def capture_message(message: str, level: str = "info") -> None:
    try:
        import sentry_sdk  # type: ignore

        sentry_sdk.capture_message(message, level=level)
    except ImportError:
        pass
