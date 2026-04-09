"""Структурированное JSON-логирование.

В проде удобнее парсить JSON чем текст: каждое событие имеет
поля timestamp, level, logger, message, и опциональные kwargs.

Включается через STRUCTURED_LOG=1 в окружении. Иначе работает
стандартный logging.
"""

from __future__ import annotations

import json
import logging
import os
import sys
from datetime import UTC, datetime
from typing import Any


class JsonFormatter(logging.Formatter):
    def format(self, record: logging.LogRecord) -> str:
        payload: dict[str, Any] = {
            "ts": datetime.fromtimestamp(record.created, tz=UTC).isoformat(),
            "level": record.levelname,
            "logger": record.name,
            "msg": record.getMessage(),
        }
        if record.exc_info:
            payload["exc"] = self.formatException(record.exc_info)
        # Кастомные поля через extra=...
        for key, value in record.__dict__.items():
            if key in {
                "msg", "args", "levelname", "name", "exc_info", "exc_text",
                "stack_info", "lineno", "funcName", "created", "msecs",
                "relativeCreated", "thread", "threadName", "processName",
                "process", "pathname", "filename", "module", "levelno",
                "message", "asctime",
            }:
                continue
            try:
                json.dumps(value)
                payload[key] = value
            except (TypeError, ValueError):
                payload[key] = repr(value)
        return json.dumps(payload, ensure_ascii=False)


def setup() -> None:
    if os.getenv("STRUCTURED_LOG") != "1":
        return
    handler = logging.StreamHandler(sys.stdout)
    handler.setFormatter(JsonFormatter())
    root = logging.getLogger()
    root.handlers = [handler]
    root.setLevel(os.getenv("LOG_LEVEL", "INFO").upper())
