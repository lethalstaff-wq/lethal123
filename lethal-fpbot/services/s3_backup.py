"""Бэкап БД в S3-совместимое хранилище.

Поддерживает любой S3-совместимый сервис (AWS S3, Backblaze B2, Yandex
Object Storage, MinIO). Использует aiohttp + AWS Signature V4 руками,
чтобы не тащить boto3.

Конфигурация:
  S3_ENDPOINT       — например https://s3.amazonaws.com или https://s3.eu-central.wasabi.com
  S3_REGION         — us-east-1 (или ru-central1 для Yandex)
  S3_BUCKET         — имя бакета
  S3_ACCESS_KEY
  S3_SECRET_KEY
  S3_PREFIX         — префикс ключей (default: lethal-fpbot/)

Если эти переменные не заданы — сервис никуда не пишет (no-op).
"""

from __future__ import annotations

import datetime as dt
import hashlib
import hmac
import logging
import os
from pathlib import Path

import aiohttp

from config import DB_PATH

logger = logging.getLogger(__name__)


def _enabled() -> bool:
    return all(
        os.getenv(v)
        for v in ("S3_BUCKET", "S3_ACCESS_KEY", "S3_SECRET_KEY")
    )


def _sign_v4(
    method: str,
    url: str,
    region: str,
    access_key: str,
    secret_key: str,
    payload_hash: str,
    headers: dict,
) -> dict:
    """Подписывает запрос S3 алгоритмом AWS Sig V4 (упрощённый, для PUT object)."""
    from urllib.parse import urlparse

    parsed = urlparse(url)
    host = parsed.netloc
    canonical_uri = parsed.path or "/"
    canonical_querystring = parsed.query

    now = dt.datetime.now(dt.UTC)
    amz_date = now.strftime("%Y%m%dT%H%M%SZ")
    date_stamp = now.strftime("%Y%m%d")

    headers = dict(headers)
    headers["host"] = host
    headers["x-amz-date"] = amz_date
    headers["x-amz-content-sha256"] = payload_hash

    sorted_keys = sorted(headers.keys())
    canonical_headers = "".join(f"{k}:{headers[k]}\n" for k in sorted_keys)
    signed_headers = ";".join(sorted_keys)

    canonical_request = (
        f"{method}\n{canonical_uri}\n{canonical_querystring}\n"
        f"{canonical_headers}\n{signed_headers}\n{payload_hash}"
    )

    algo = "AWS4-HMAC-SHA256"
    credential_scope = f"{date_stamp}/{region}/s3/aws4_request"
    string_to_sign = (
        f"{algo}\n{amz_date}\n{credential_scope}\n"
        f"{hashlib.sha256(canonical_request.encode()).hexdigest()}"
    )

    def _hmac(key: bytes, msg: str) -> bytes:
        return hmac.new(key, msg.encode(), hashlib.sha256).digest()

    k_date = _hmac(("AWS4" + secret_key).encode(), date_stamp)
    k_region = _hmac(k_date, region)
    k_service = _hmac(k_region, "s3")
    k_signing = _hmac(k_service, "aws4_request")
    signature = hmac.new(k_signing, string_to_sign.encode(), hashlib.sha256).hexdigest()

    auth_header = (
        f"{algo} Credential={access_key}/{credential_scope}, "
        f"SignedHeaders={signed_headers}, Signature={signature}"
    )
    headers["Authorization"] = auth_header
    return headers


async def upload_db_to_s3() -> str | None:
    if not _enabled():
        return None
    endpoint = os.getenv("S3_ENDPOINT", "https://s3.amazonaws.com")
    region = os.getenv("S3_REGION", "us-east-1")
    bucket = os.getenv("S3_BUCKET", "")
    access_key = os.getenv("S3_ACCESS_KEY", "")
    secret_key = os.getenv("S3_SECRET_KEY", "")
    prefix = os.getenv("S3_PREFIX", "lethal-fpbot/")

    db_path = Path(DB_PATH)
    if not db_path.exists():
        logger.warning("DB file not found for S3 upload: %s", db_path)
        return None

    timestamp = dt.datetime.now(dt.UTC).strftime("%Y%m%d-%H%M%S")
    key = f"{prefix}{timestamp}.db"

    with db_path.open("rb") as f:
        content = f.read()
    payload_hash = hashlib.sha256(content).hexdigest()

    url = f"{endpoint.rstrip('/')}/{bucket}/{key}"
    headers = _sign_v4(
        method="PUT",
        url=url,
        region=region,
        access_key=access_key,
        secret_key=secret_key,
        payload_hash=payload_hash,
        headers={"content-type": "application/octet-stream"},
    )

    async with aiohttp.ClientSession() as sess:
        async with sess.put(url, data=content, headers=headers) as resp:
            if resp.status not in (200, 201):
                body = await resp.text()
                logger.warning("S3 upload failed (%d): %s", resp.status, body[:200])
                return None
    logger.info("Uploaded DB to S3: %s", key)
    return key
