# Deployment

Варианты деплоя от простого к сложному.

## 1. Docker Compose (рекомендуется)

Самый простой путь. Файл `docker-compose.yml` уже лежит в репо.

```bash
cd lethal-fpbot
cp .env.example .env
# вписать BOT_TOKEN, ADMIN_IDS
docker compose up -d
docker compose logs -f bot
```

Данные персистятся в `./data/` и `./.secret_key`:
- `./data/lethal_fpbot.db` — SQLite БД
- `./data/backups/` — авто-бэкапы
- `./.secret_key` — Fernet ключ шифрования

### Обновление

```bash
git pull
docker compose build bot
docker compose up -d bot
```

Миграции применятся автоматически при старте.

## 2. systemd + docker

Надёжнее для прода. Контейнер авто-рестартится и стартует при boot.

```ini
# /etc/systemd/system/lethal-fpbot.service
[Unit]
Description=Lethal FunPay Bot
Requires=docker.service
After=docker.service network-online.target

[Service]
Type=oneshot
RemainAfterExit=yes
WorkingDirectory=/opt/lethal-fpbot
ExecStart=/usr/bin/docker compose up -d
ExecStop=/usr/bin/docker compose down
TimeoutStartSec=300

[Install]
WantedBy=multi-user.target
```

```bash
sudo systemctl daemon-reload
sudo systemctl enable --now lethal-fpbot
sudo systemctl status lethal-fpbot
```

## 3. systemd напрямую (без Docker)

Если предпочитаешь venv.

```ini
# /etc/systemd/system/lethal-fpbot.service
[Unit]
Description=Lethal FunPay Bot
After=network.target

[Service]
Type=simple
User=fpbot
Group=fpbot
WorkingDirectory=/opt/lethal-fpbot
EnvironmentFile=/opt/lethal-fpbot/.env
ExecStart=/opt/lethal-fpbot/.venv/bin/python main.py
Restart=always
RestartSec=10
StandardOutput=journal
StandardError=journal

[Install]
WantedBy=multi-user.target
```

```bash
sudo useradd -m -s /bin/bash fpbot
sudo -u fpbot -i
cd /opt/lethal-fpbot
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
exit

sudo systemctl daemon-reload
sudo systemctl enable --now lethal-fpbot
sudo journalctl -u lethal-fpbot -f
```

## 4. nginx reverse proxy (для Mini App + HTTPS)

Нужен чтобы Telegram Mini App открывался (требует HTTPS).

```nginx
# /etc/nginx/sites-available/lethal-fpbot.conf
server {
    listen 80;
    server_name fpbot.example.com;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl http2;
    server_name fpbot.example.com;

    ssl_certificate /etc/letsencrypt/live/fpbot.example.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/fpbot.example.com/privkey.pem;

    # Mini App статика
    location /app/ {
        proxy_pass http://127.0.0.1:8080/app/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    # API
    location /api/ {
        proxy_pass http://127.0.0.1:8080/api/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Healthcheck для мониторинга
    location = /healthz {
        proxy_pass http://127.0.0.1:8080/healthz;
    }

    # Prometheus метрики (ограничь по IP!)
    location = /metrics {
        allow 10.0.0.0/8;
        deny all;
        proxy_pass http://127.0.0.1:8080/metrics;
    }

    # Webhooks от ЮKassa / CryptoBot — публично
    location /api/payments/ {
        proxy_pass http://127.0.0.1:8080/api/payments/;
        proxy_set_header Host $host;
    }
}
```

Затем:
```bash
sudo certbot --nginx -d fpbot.example.com
sudo nginx -t && sudo systemctl reload nginx
```

## 5. Мониторинг

### Prometheus

```yaml
# prometheus.yml
scrape_configs:
  - job_name: lethal-fpbot
    static_configs:
      - targets: ['127.0.0.1:8080']
    metrics_path: /metrics
```

Метрики:
- `lethal_uptime_seconds` — uptime процесса
- `lethal_users_total` — всего пользователей в БД
- `lethal_fp_accounts_total` — подключённых ФП-аккаунтов
- `lethal_stats_total` — продаж всего
- `lethal_orders_seen_total` — отслеживаемых заказов

### Uptime Kuma / Better Stack

Пинг на `https://fpbot.example.com/healthz` раз в минуту.

### Sentry

```env
SENTRY_DSN=https://xxx@o123.ingest.sentry.io/456
SENTRY_ENV=production
SENTRY_TRACES_SAMPLE_RATE=0.05
```

И `pip install sentry-sdk`. Все необработанные ошибки полетят туда.

## 6. Бэкапы

Автоматические бэкапы раз в сутки (сервис `services/backup.py`):
- Локальные: `backups/lethal_fpbot-YYYYMMDD-HHMMSS.db` (хранится 7 штук)
- S3 опционально — см. [S3 конфигурация](#s3-бэкапы)

### Ручной бэкап

```bash
python -m cli backup
# Backup created: backups/lethal_fpbot-20241231-235959.db
```

### S3 бэкапы

```env
S3_ENDPOINT=https://s3.amazonaws.com   # или Backblaze, Wasabi, Yandex
S3_REGION=us-east-1
S3_BUCKET=my-lethal-backups
S3_ACCESS_KEY=AKIAXXX
S3_SECRET_KEY=xxxxx
S3_PREFIX=lethal-fpbot/
```

После каждого локального бэкапа сервис пушит копию в S3 (AWS Sig V4
подписывается вручную, без boto3).

### Восстановление

```bash
docker compose down bot
cp backups/lethal_fpbot-20241231-235959.db data/lethal_fpbot.db
docker compose up -d bot
```

## 7. Ресурсы

Типичное потребление одного юзера:
- RAM: ~150-300 MB на процесс бота
- CPU: 1-5% в idle, 10-20% под пиковой нагрузкой
- Disk: ~50 MB БД на 1000 пользователей
- Network: ~500 KB/min на один активный FP-аккаунт

Для SaaS с 50-100 активными клиентами хватает VPS 2 vCPU / 2 GB RAM /
20 GB SSD. От ~500 ₽/мес.

## 8. Безопасность

- Не светить `.env` и `.secret_key` в репо
- Не запускать бот под root
- Firewall: открыть только 443 (nginx) + 22 (SSH)
- 8080 (API) слушать только на 127.0.0.1
- Включить `fail2ban` на SSH
- Backups хранить offsite (S3)
- Монитор ошибок через Sentry
