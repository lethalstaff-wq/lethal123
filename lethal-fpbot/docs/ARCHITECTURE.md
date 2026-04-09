# Архитектура Lethal FunPay Bot

## Уровни системы

```
┌──────────────────────────────────────────────────────────────────┐
│                    Telegram (aiogram bot)                         │
│         ┌───────────────────────────────────────┐                │
│         │   handlers/  +  middlewares/          │                │
│         └───────────────────┬───────────────────┘                │
└─────────────────────────────┼───────────────────────────────────┘
                              │
┌─────────────────────────────┼───────────────────────────────────┐
│                       services/ (фоновые задачи)                 │
│  session_pool ─────┬─ session_restore                           │
│                    ├─ chat_watcher  ──┬─ plugins.emit            │
│                    │                   └─ ai_responder           │
│                    ├─ order_watcher ──┬─ auto_deliver            │
│                    │                   ├─ cross_sell             │
│                    │                   └─ plugins.emit           │
│                    ├─ review_watcher                             │
│                    ├─ auto_raise                                 │
│                    ├─ always_online                              │
│                    ├─ funnel  + ab_testing                       │
│                    ├─ smart_pricing                              │
│                    ├─ competitor_watcher                         │
│                    ├─ backup ──> filesystem + S3                 │
│                    └─ web ────> aiohttp Server                   │
│                                  ├─ /api/* (REST)                │
│                                  ├─ /healthz, /metrics           │
│                                  └─ /app/ (Mini App)             │
└─────────────────────────────┬───────────────────────────────────┘
                              │
┌─────────────────────────────┼───────────────────────────────────┐
│                          funpay/                                 │
│           api ──┬── session ── HTTP ───> funpay.com              │
│                 └── parser  (BS4)                                │
└─────────────────────────────┬───────────────────────────────────┘
                              │
┌─────────────────────────────┼───────────────────────────────────┐
│                          database/                               │
│              SQLite (WAL) — 18 таблиц + миграции                │
└──────────────────────────────────────────────────────────────────┘
```

## Поток данных: «новая продажа»

1. `order_watcher` каждые 30 сек парсит `/orders/trade`
2. Находит новый `paid` заказ → `upsert_order` помечает `is_new=True`
3. Эмитит `on_new_order` плагинам (sales_logger пишет в JSONL)
4. Шлёт алёрт в Telegram пользователю
5. Записывает строку в `stats`
6. Если `auto_delivery=on`:
   - `auto_deliver.deliver()` ищет правило по lot_name через `find_delivery_for_lot`
   - `pop_auto_delivery_item` атомарно достаёт следующий товар
   - `funpay.api.send_chat_message` шлёт его покупателю
7. Если `cross_sell=on`: `cross_sell.send()` шлёт текст вдогонку
8. Если `ask_confirm=on`: `asyncio.create_task(_delayed_ask_confirm)`
9. Если истёк `complaint_hours`: `funpay.api.file_complaint`

## Поток данных: «сообщение покупателя»

1. `chat_watcher` каждые 7 сек парсит `/chat/` для всех ФП-аккаунтов
2. Для каждого нового сообщения от не-нас:
   - Чёрный список → пропускаем
   - Эмитит `on_new_message` плагинам
     - `anti_flood` может вернуть "stop" → не пересылаем
     - `keyword_alert` алертит админа при подозрительных словах
   - Пересылка в Telegram через `_forward_to_tg` с inline-кнопками
   - Если `auto_response=on` → `find_matching_response` → ответ через FP

## Web API + Mini App

```
   Telegram Mini App (React + Vite)
              │
              ▼
     window.Telegram.WebApp.initData
              │
              ▼
     POST /api/auth/login (HMAC verify) ──> JWT
              │
              ▼
     Authorization: Bearer <JWT>
              │
              ▼
   /api/accounts, /api/lots, /api/chats,
   /api/stats, /api/forecast, /api/settings,
   /api/billing, /api/payments/*, /api/ai/*
```

JWT подписан `BOT_TOKEN` (HS256), TTL 24 часа. Telegram WebApp initData
проверяется HMAC-SHA256 по схеме из официальной документации:
`secret_key = HMAC("WebAppData", BOT_TOKEN)`,
`hash = HMAC(secret_key, data_check_string)`.

## Плагины

`plugins/manager.py` сканирует `plugins/examples/` и `plugins/user/`,
импортирует каждый `.py`, ищет переменную `PLUGIN: Plugin`. Каждый
плагин может зарегистрировать обработчики хуков:

- `on_new_message(bot, account, chat_id, author, text)`
- `on_new_order(bot, account, order)`
- `on_review(bot, account, review)`
- `on_session_lost(bot, account)`

Хуки исполняются по очереди, исключения логируются и не убивают
остальных. Плагин может вернуть `"stop"` чтобы прервать дальнейшую
обработку.

## Миграции

Простой alembic-аналог в `migrations/`:

- Файлы вида `NNNN_<name>.py` с функциями `up(db)` и `down(db)`
- `_migrations` таблица хранит применённые версии
- `python -m migrations.runner upgrade|downgrade|status`
- Автоматически вызывается в `main.py` при старте бота

## Безопасность

| Слой | Защита |
|---|---|
| Пароли FunPay | Fernet (AES-128 CBC + HMAC-SHA256) |
| `golden_key` | Fernet |
| Web API auth | JWT HS256 + Telegram initData HMAC verify |
| SQL | Все запросы параметризованы; имена колонок в whitelist |
| Прокси | Сессии изолированы по `account_id`, не делят cookie jar |
| Бэкап | Локальный + опциональный S3 (AWS Sig V4 руками, без boto3) |
