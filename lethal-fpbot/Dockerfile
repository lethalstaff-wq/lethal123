# syntax=docker/dockerfile:1.6
FROM python:3.12-slim AS base

ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    PIP_NO_CACHE_DIR=1

# Системные зависимости для lxml + cryptography
RUN apt-get update && apt-get install -y --no-install-recommends \
        gcc libxml2-dev libxslt1-dev libffi-dev \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Сначала зависимости — слой кэшируется при изменении кода
COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

# Затем код
COPY . .

# Создаём непривилегированного юзера
RUN useradd --create-home --uid 1000 fpbot \
    && chown -R fpbot:fpbot /app
USER fpbot

# Healthcheck дёргает health endpoint (см. services/health.py)
HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
    CMD python -c "import urllib.request; urllib.request.urlopen('http://127.0.0.1:8080/healthz', timeout=3)" || exit 1

CMD ["python", "main.py"]
