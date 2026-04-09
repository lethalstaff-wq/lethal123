# Полный список функций Lethal FunPay Bot

Версия: `0.1.0` · более 150+ файлов, 28000+ строк, 278 автотестов.

## 🏠 Ядро

- **Подключение ФП-аккаунтов** — логин/пароль/прокси, AES-шифрование
  паролей (Fernet), golden_key через куки, авто-реставрация сессии
- **Пул сессий** — singleton `FunPaySession` на каждый аккаунт,
  lazy init, auto-relogin при протухании
- **Прокси** — HTTP/SOCKS5 с user:pass, per-account
- **Multi-account** — до 10 FP-аккаунтов (Pro), 5 (Standard), 1 (Starter)

## 📇 CRM

- **Автоматический учёт клиентов** — как только покупатель написал
  или сделал заказ, он попадает в CRM
- **7 сегментов**: 🆕 новый, 👤 постоянный, 💎 VIP, 💤 спящий,
  ⚠️ риск ухода, 🚫 проблемный, ❌ потерянный
- **Метрики на клиента**: orders_count, total_spent, avg_order_value,
  LTV, refund_count, reviews (+/−), first_seen, last_seen
- **Теги** — свободная маркировка
- **Заметки** — структурированные записи продавца
- **История взаимодействий** — timeline всех контактов
- **Поиск**: по имени, по тегу
- **In-memory TTL кэш** сводок (30с) с per-key lock против thundering herd

## 📨 Чат через Telegram (Standard+)

- **Пересылка сообщений FP → TG** каждые 7 секунд
- **Inline кнопки**: ✍️ Ответить / 📋 Заготовки / 🤖 ИИ-ответ / 🛡 Арбитраж / 🚫 ЧС
- **Анти-спам**: dedupe по message_id, не отвечать себе
- **Rich-форматирование** с эмодзи и структурой

## 🔥 Hot Leads Detector

- Scoring 0-100 по готовности купить
- 20+ паттернов на RU и EN
- Автоматический алёрт «🔥 ГОРЯЧИЙ ЛИД — ответь за 2-3 мин»
- Конверсия чата в продажу +30-50%

## 🛡 Anti-Scam

- Scoring 0-100 с 11+ сигналами
- Зелёный / жёлтый / красный levels
- Сигналы из профиля (дата регистрации, отзывы, покупки)
- Сигналы из текста (внешние контакты, urgency, aggressive price)
- In-memory кэш 5 минут

## 🚫 Content Moderation

Защищает продавца от бана FunPay:
- Блокирует упоминания Telegram/Discord/WhatsApp
- Блокирует t.me/ ссылки
- Блокирует @handles и номера телефонов
- Safe replacement с placeholders
- Risk score 0-100, block threshold 60

## 📨 Автоответчик v2

- **Regex** в триггерах
- **Варианты ответов** через `|||`
- **Переменные**: {buyer}, {lot}, {price}, {time_of_day}, {greeting}
- **Условия**: рабочие часы, только для новых покупателей, cooldown
- **Человеческая задержка** 1.5-4.5с
- **Dedupe** по message_id
- **Fallback** на базовый matcher для обратной совместимости

## 🤖 Автовыдача v2

- **Валидаторы**: steam_key, email:pass, login:pass, hex_32, uuid
- **Multi-item** выдача на один заказ
- **Randomized delay** 2-8с (имитация ручной выдачи)
- **Low-stock алёрты** (<5 товаров осталось)
- **Audit log** кому что выдано
- **Return to queue** при refund
- **Fallback сообщение** + alert при out-of-stock

## 💸 Smart Pricing v2

- **7 стратегий**: always_cheapest, top_3, average,
  ±5/10% от median
- **Квантили** (Q25/median/Q75) вместо mean
- **Rank на рынке**: «ты 5-й из 12»
- **Recommendations** с объяснением

## 🚀 Raise Scheduler

- **Приоритизация по выручке** за последние 30 дней
- **Min interval** между поднятиями
- **Random jitter ±20%** для обхода анти-бот детекта
- **Per-lot cooldown** при FunPay "too soon"
- **Correct game_id** из каталога 130+ игр

## 📊 Dashboard с графиками

- Matplotlib PNG charts → TG фото
- **5 типов графиков**:
  - 💰 Выручка по дням (bar с лучшим днём)
  - 🏆 Топ лотов (horizontal bar)
  - ⏰ Активность по часам (line с пиком)
  - 🎯 Воронка (horizontal с conversion %)
  - 📇 Сегменты CRM (donut)
- Тёмная Lethal-тема (#0F0F13 bg, red/green accents)
- "📸 Всё одним залпом" — все графики сразу
- Fallback на текст если matplotlib не установлен

## 🧭 Onboarding Wizard

- 5-step чек-лист для новичков
- ASCII progress bar
- Один клик → переход в раздел или toggle
- Auto-refresh после действия

## 📣 CRM Broadcast

- Рассылка по сегментам (VIP / Sleeping / etc.)
- Переменные {buyer}, {orders}, {total}
- Content moderation для каждого получателя
- Blacklist skip
- 3-5с delay между отправками
- Max 100 сообщений за раз
- Финальный отчёт: sent/skipped/failed

## 💡 Smart Suggestions

- Персональные «сделай это» советы
- 9 правил: включить анти-скам, автоответы, автовыдачу,
  отметить VIP тегами, разбудить спящих, celebrate рост
- Приоритет-сортировка
- Кнопки «Сделать сейчас»

## 📥 Экспорт данных

- **CSV продаж** (BOM для Excel)
- **CSV клиентов CRM** (все метрики)
- **JSON full dump** (stats + customers + interactions + settings)
- **Налоговый отчёт** по месяцам

## 📈 Forecast

- Линейная регрессия на daily revenue
- R² coefficient → confidence (high/medium/low)
- Тренд: растёт/падает/плато
- 7/14/30 day horizon
- Без тяжёлых ML библиотек

## 💳 Billing

- **Telegram Payments** (нативная оплата картой)
- **Telegram Stars** (XTR currency)
- **Manual approval** (fallback через админа)
- **Промокоды**
- **Referral bonus** 10% с оплаты
- Auto-активация тарифа, уведомления user+admins

## ✨ AI Lot Generator (Pro)

- Claude Sonnet для генерации title + description
- JSON structured output
- System prompt с FunPay best practices
- `improve_existing` для рерайта текущего лота
- Fallback templated генератор без API

## 📋 Lot Quality Scorer

- Grade A-F с конкретными советами
- Title: длина, эмодзи, цифры, caps, !!!
- Description: длина, гарантии, процесс, контакт, структура
- Price: психологический анализ

## 🎯 Voronka/Funnel v2

- Multi-step: 1ч → 24ч → 72ч
- A/B варианты на шаг
- Stop keywords detection
- Personal promo codes (FNL-XXXXX-XXXXX)

## 🏥 Lot Health Monitor

- Проверяет активные лоты на проблемы
- is_active, price > 0, title length, quality score, last_raised
- Grade A-F общего здоровья
- Топ-10 проблем с причинами

## ⚡ Quick Commands

- `/raise` — поднять все лоты
- `/online` — toggle вечный онлайн
- `/ping` — статус сессий
- `/stop` — выключить все автоматизации
- `/go` — включить базовый набор
- `/summary` — сводка за сегодня
- `/me` — быстрый профиль
- `/health` — health check

## 📚 Docs & Help

- **Help Center** с 7 категориями × 3-5 Q&A
- `/help`, `/faq`
- **Onboarding wizard**
- **Getting Started**, **Deploy**, **Features** (этот файл)

## 🔐 Безопасность

- **Fernet (AES-128)** для паролей
- **WAL journal mode** для SQLite
- **Миграции** с версионированием
- **Audit log** критичных действий
- **Rate limiter** middleware
- **Blacklist** покупателей
- **Content moderation** на исходящих

## 🔧 Инфраструктура

- **Docker** + docker-compose с персистентными volumes
- **systemd** unit
- **nginx** reverse proxy + Let's Encrypt
- **Prometheus** /metrics endpoint
- **Sentry** integration (опц.)
- **S3 backup** (опц.)
- **Plugin system** с hot-reload
- **CLI tool** для админских операций

## 📦 База данных

14+ таблиц:
- users, fp_accounts, settings
- auto_responses, auto_delivery, prepared_texts
- review_responses, blacklist, stats
- competitors, chat_state, orders_seen
- pending_payments, promo_codes, ab_tests
- audit_log, notifications, webhooks_out
- customers, customer_interactions, customer_tags, customer_notes
- lot_price_history, lot_templates
- _migrations (система миграций)

## 🌐 i18n

4 языка: ru / en / uk / kz
250+ ключей в каждой локали

## 🧪 Тесты

- 278 автотестов (pytest)
- CI через GitHub Actions (ruff + pytest)
- Покрытие: helpers, encryption, models, parser, middlewares,
  auto_responder_v2, delivery_v2, smart_pricing_v2, anti_scam_v2,
  hot_leads, content_moderation, lot_quality, funnel_v2,
  raise_scheduler, CRM, dashboard, TG payments, lot_ai_generator,
  crm_cache, smart_suggestions, stats_exporter, weekly_digest,
  order_notifier, sales_forecast, price_tracker, lot_health
