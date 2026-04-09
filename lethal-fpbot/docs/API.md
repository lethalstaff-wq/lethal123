# Web API

REST endpoints для Telegram Mini App.

## Аутентификация

### POST /api/auth/login

Обменивает Telegram WebApp `initData` на JWT.

**Request:**
```json
{ "init_data": "<window.Telegram.WebApp.initData>" }
```

**Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiJ9...",
  "user": {
    "id": 1,
    "telegram_id": 12345,
    "username": "alice",
    "tier": "pro",
    "expires": 1735689600,
    "balance": 0
  }
}
```

JWT действует 24 часа. Передаётся в `Authorization: Bearer <token>`
во всех остальных запросах.

## Аккаунты

| Метод | Путь | Описание |
|---|---|---|
| GET | `/api/accounts` | Список всех ФП-аккаунтов пользователя |
| GET | `/api/accounts/{id}` | Один аккаунт |
| POST | `/api/accounts` | Добавить (логин/пароль/прокси) |
| DELETE | `/api/accounts/{id}` | Удалить |
| PATCH | `/api/accounts/{id}/proxy` | Сменить прокси |
| POST | `/api/accounts/{id}/reconnect` | Принудительный перелогин |

## Лоты

| Метод | Путь | Описание |
|---|---|---|
| GET | `/api/lots` | Все лоты со всех аккаунтов (с распознанной игрой) |
| POST | `/api/lots/raise` | Поднять все лоты |
| POST | `/api/lots/bulk` | Multipart upload CSV/Excel |

## Чаты

| Метод | Путь | Описание |
|---|---|---|
| GET | `/api/chats` | Список чатов |
| GET | `/api/chats/{acc_id}/{chat_id}/messages` | Лента сообщений |
| POST | `/api/chats/{acc_id}/send` | Отправить сообщение |

## Статистика и прогноз

| Метод | Путь | Описание |
|---|---|---|
| GET | `/api/stats?period=day\|week\|month\|all` | Сводка + график |
| GET | `/api/stats/export.csv` | CSV экспорт всех продаж |
| GET | `/api/forecast?days=7` | Прогноз выручки |
| GET | `/api/forecast/ltv` | LTV/AOV/repeat rate |

## Настройки

| Метод | Путь | Описание |
|---|---|---|
| GET | `/api/settings` | Все настройки автоматизаций |
| PATCH | `/api/settings` | Обновить (передавать только изменения) |
| GET | `/api/notifications` | Настройки уведомлений |
| PATCH | `/api/notifications` | Обновить уведомления |

## Автоответы / выдача / тексты

| Метод | Путь |
|---|---|
| GET/POST/DELETE | `/api/auto_response[/<id>]` |
| GET/POST/DELETE | `/api/auto_delivery[/<id>]` |
| GET/POST/DELETE/GET-one | `/api/texts[/<id>]` |

## Биллинг и платежи

| Метод | Путь | Описание |
|---|---|---|
| GET | `/api/billing/tiers` | Список тарифов с ценами |
| POST | `/api/billing/buy` | Создать ручную заявку (админ одобрит) |
| POST | `/api/payments/create` | Создать invoice ЮKassa или CryptoBot |
| POST | `/api/payments/yookassa/webhook` | Webhook от ЮKassa |
| POST | `/api/payments/cryptobot/webhook` | Webhook от @CryptoBot |

## Профиль и игры

| Метод | Путь |
|---|---|
| GET | `/api/profile` |
| GET | `/api/games[?category=...]` |
| GET | `/api/games/categories` |

## ИИ

| Метод | Путь | Описание |
|---|---|---|
| POST | `/api/ai/reply` | Сгенерировать ответ покупателю |
| POST | `/api/ai/arbitrage` | Защита для арбитража |

## Health & metrics

| Метод | Путь | Описание |
|---|---|---|
| GET | `/healthz` | `{status, uptime}` или 503 |
| GET | `/metrics` | Prometheus-compatible counters |
| GET | `/api/public/version` | Версия бота |
