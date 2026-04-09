# ⚡ Lethal FunPay Bot

SaaS-style Telegram-бот для автоматизации продаж на FunPay. Один бот, много
клиентов, у каждого своё пространство, ФП-аккаунты, прокси, настройки.
Бренд: **Lethal Solutions**.

## Возможности

### Базовое (все тарифы)
- 📁 Управление ФП-аккаунтами с авто-реставрацией сессии
- 🔑 Личные прокси (HTTP / SOCKS5)
- 📈 Авто-поднятие предложений
- 🤖 Авто-выдача товаров (ключи, аккаунты, гайды)
- 📨 Автоответчик по триггер-словам
- 🟢 Вечный онлайн
- 🚨 Авто-жалоба через 24 часа
- ⭐️ Просьба об отзыве, ответ на отзывы по шаблонам
- 🚫 Чёрный список покупателей
- 📊 Статистика продаж (день / неделя / месяц / всё время)
- 🔗 Реферальная система с бонусом 10%

### Standard и Pro
- 💬 **Чат FunPay через Telegram** — пересылка сообщений с inline-кнопками
  «Ответить / Заготовки / ИИ-ответ / Арбитраж / Чёрный список»
- 🛡 Антискам-детектор (проверка профиля покупателя)
- 🛒 Авто-кросселл после покупки
- 🎯 Воронка продаж — догрев молчунов
- 💸 Смарт-прайсинг — мониторинг цен в категории
- 📉 Мониторинг конкурентов

### Pro
- 🤖 ИИ-ответы покупателям через Claude API (`claude-sonnet-4-6`)
- 🛡 Арбитраж-ассистент — Claude Opus анализирует переписку и пишет
  текст защиты для спора с модератором
- 💾 Авто-бэкап БД (раз в сутки, хранит последние 7)
- 🩺 `/healthz` и `/metrics` для мониторинга

## Стек

- Python 3.11+
- aiogram 3.x — Telegram Bot framework
- aiohttp + BeautifulSoup — клиент FunPay
- aiosqlite — SQLite async
- cryptography (Fernet) — AES шифрование паролей
- anthropic (опционально) — Claude API для ИИ-фич

## Структура

```
lethal-fpbot/
├── main.py                 # Точка входа
├── config.py               # Конфиг через env / .env
├── database/               # SQLite + 14 таблиц + CRUD
├── funpay/                 # API FunPay (login, парсеры, действия)
├── bot/
│   ├── handlers/           # 12 хендлеров
│   ├── keyboards/          # Все клавиатуры
│   └── middlewares/        # Подписки, ensure_user
├── services/               # 13 фоновых сервисов
├── utils/                  # Хелперы, шифрование
└── tests/                  # pytest unit + integration
```

## Запуск

### 1. Локально

```bash
cd lethal-fpbot
pip install -r requirements.txt
cp .env.example .env       # вписать BOT_TOKEN, ADMIN_IDS
python main.py
```

### 2. Docker

```bash
cd lethal-fpbot
cp .env.example .env       # вписать BOT_TOKEN, ADMIN_IDS
docker compose up -d
docker compose logs -f bot
```

База, бэкапы и `.secret_key` персистятся в `./data/` и `./.secret_key`.

### 3. Деплой на VPS

Самый простой путь — `docker compose up -d` под `systemd`:

```ini
# /etc/systemd/system/lethal-fpbot.service
[Unit]
Description=Lethal FunPay Bot
Requires=docker.service
After=docker.service

[Service]
Type=oneshot
RemainAfterExit=yes
WorkingDirectory=/opt/lethal-fpbot
ExecStart=/usr/bin/docker compose up -d
ExecStop=/usr/bin/docker compose down

[Install]
WantedBy=multi-user.target
```

## Конфигурация (`.env`)

| Переменная | Обязательна | Описание |
|---|---|---|
| `BOT_TOKEN` | ✅ | Токен от @BotFather |
| `ADMIN_IDS` | ⚠️ | Telegram ID админов через запятую |
| `DB_PATH` | ❌ | Путь к SQLite (по умолчанию `lethal_fpbot.db`) |
| `ENCRYPTION_KEY` | ❌ | Fernet-ключ. Если не задан — генерится в `.secret_key` |
| `ANTHROPIC_API_KEY` | ❌ | Ключ Claude API для ИИ-фич Pro-тарифа |
| `HEALTH_HOST` | ❌ | Хост health-эндпоинта (по умолчанию `127.0.0.1`) |
| `HEALTH_PORT` | ❌ | Порт health-эндпоинта (по умолчанию `8080`) |

## Тарифы

| | Starter | Standard | Pro |
|---|:---:|:---:|:---:|
| Цена | 500₽/мес | 1000₽/мес | 1500₽/мес |
| ФП-аккаунтов | 1 | 5 | 10 |
| Базовое (раздел выше) | ✅ | ✅ | ✅ |
| Чат через Telegram | ❌ | ✅ | ✅ |
| Антискам / кросселл / бичевка | ❌ | ✅ | ✅ |
| Мониторинг конкурентов | ❌ | ✅ | ✅ |
| ИИ-ответы (Claude) | ❌ | ❌ | ✅ |
| Арбитраж-ассистент | ❌ | ❌ | ✅ |
| Воронка / смарт-прайсинг | ❌ | ❌ | ✅ |
| Авто-бэкап | ❌ | ❌ | ✅ |

Биллинг работает через ручное одобрение админа: пользователь жмёт «Купить»,
бот шлёт админу заявку с кнопками «Подтвердить / Отклонить». При
подтверждении тариф активируется на 30 дней, а 10% от суммы капают
пригласившему рефереру.

## Безопасность

- Пароли FunPay и `golden_key` шифруются Fernet (AES-128 CBC + HMAC-SHA256)
- Сообщение с паролем удаляется из чата сразу после получения
- ENCRYPTION_KEY храним в `.secret_key` с правами `0600`, не коммитим
- Все настройки — через whitelist колонок (защита от SQL-инъекций)

## Тесты

```bash
cd lethal-fpbot
pip install -r requirements-dev.txt
pytest -q
ruff check .
```

CI на GitHub Actions запускается на любой push в `lethal-fpbot/**`
(см. `.github/workflows/lethal-fpbot.yml`).

## Health & метрики

```bash
curl http://localhost:8080/healthz
# {"status":"ok","uptime":12345}

curl http://localhost:8080/metrics
# lethal_uptime_seconds 12345
# lethal_users_total 42
# lethal_fp_accounts_total 87
# ...
```

Совместимо с Prometheus / Grafana — добавь scrape job и готово.

## FunPay endpoint'ы

FunPay не публикует API. Пути для действий (логин, отправка чата,
поднятие лотов, отзывы) собраны из публичных open-source ботов и
локализованы в `funpay/api.py`. Если FunPay изменит формат — правишь в
одном файле.

Если упрётесь в Cloudflare-челлендж — рекомендация заменить транспорт на
`curl_cffi` (поддержка JA3-фингерпринтов).

## Лицензия

Проприетарная. Lethal Solutions, 2026.
