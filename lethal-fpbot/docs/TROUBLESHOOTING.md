# Troubleshooting — частые проблемы и решения

## Бот не стартует

### `BOT_TOKEN не задан`
Создай `.env` файл в корне `lethal-fpbot/` и впиши:
```env
BOT_TOKEN=123456:AA-token-from-botfather
```
Или укажи через переменную окружения:
```bash
BOT_TOKEN=xxx python main.py
```

### `ModuleNotFoundError: No module named 'aiogram'`
Установи зависимости:
```bash
pip install -r requirements.txt
```

### `cryptography InvalidToken`
Fernet ключ поменялся — старые зашифрованные пароли больше не
расшифровываются. Либо восстанови `.secret_key` из бэкапа, либо
переподключи все ФП-аккаунты.

## FunPay не работает

### `Не удалось войти: Неверный логин/пароль`
- Проверь логин и пароль руками на funpay.com
- Если есть 2FA — отключи (FunPay не поддерживает TOTP через API)
- Попробуй другой прокси

### `FunPay вернул 403 / Cloudflare`
Cloudflare блокирует aiohttp из-за TLS fingerprint. Решения:
1. Смени прокси — обычно достаточно
2. Используй residential прокси вместо datacenter
3. В крайнем случае — перейди на `curl_cffi`:
   ```bash
   pip install curl-cffi
   ```
   И в `funpay/session.py` замени транспорт на `AsyncSession`
   от `curl_cffi.requests` с `impersonate="chrome124"`

### `Сессия протухла`
Нормально — `session_restore` сервис перелогинится автоматически
через 10 минут используя сохранённый пароль. Проверь:
- Пароль в БД не стал пустым
- Аккаунт не заблокирован FunPay
- Прокси жив

### Лоты не поднимаются
- Проверь что в настройках 🟢 Автоподнятие
- Проверь интервал (по умолчанию 240 минут)
- FunPay может вернуть «too soon» — это нормально, следующая попытка
  через час

## Автоматизации

### Автоответчик не отвечает
1. Включён ли 📨 Автоответчик в настройках?
2. Добавлено хотя бы одно правило в /auto_responses?
3. Триггер-слово точно есть в сообщении покупателя (без учёта регистра)?
4. Не дедуплицируется ли сообщение? (проверяется по message_id)
5. Cooldown не стоит? (проверь поле `cooldown_seconds` в правиле)

### Автовыдача не срабатывает
1. Название лота в правиле совпадает с названием на FunPay?
   (матчинг через substring, case-insensitive)
2. Остались ли товары? (проверь в /auto_delivery)
3. Включён ли тумблер в ⚙️ Настройках?

### Чат через Telegram молчит
1. Тариф Standard или Pro?
2. Сессия FP жива? Проверь /ping
3. Chat watcher запущен? Проверь логи на `chat_watcher tick`
4. Может content moderation блокирует ответы — проверь логи

## CRM

### Клиенты не появляются
CRM наполняется при:
- Новом сообщении в чате → `touch_customer(kind='message_in')`
- Новом заказе → `touch_customer(kind='order')`
- Отзыве → `touch_customer(kind='review_positive/negative')`

Если клиентов нет — не происходит ни одного из этих событий.
Проверь что сервисы запущены и аккаунт 🟢.

### Неправильная сегментация
Пересчёт сегмента происходит автоматически при каждом touch.
Если видишь кривой сегмент — проверь `last_order_ts`, `orders_count`,
`reviews_negative`. Для принудительного пересчёта:
```python
from database.models_crm import _recompute_metrics
await _recompute_metrics(customer_id)
```

## Платежи

### Telegram Payments не работает
1. Получен ли `PROVIDER_TOKEN` от @BotFather → Bot Settings → Payments?
2. Задан ли `TG_PAYMENT_PROVIDER_TOKEN` в env?
3. Для Stars: `TG_STARS_ENABLED=1` + ключ не нужен

### Тариф не активируется после оплаты
1. Проверь что `successful_payment` хендлер получил событие
   (должно быть в логах)
2. payload формат `sub:USER_ID:TIER`
3. Вызывается ли `update_user_subscription`

## Дэшборд и графики

### `matplotlib not installed`
```bash
pip install matplotlib Pillow
```

### Пустой график
- Нужны данные в `stats` таблице (минимум 1 строка за период)
- Если период 7 дней и нет продаж — график не рисуется

## Миграции

### `no such table: customers`
Миграции не применились. Запусти вручную:
```bash
python -m migrations upgrade
```
Или перезапусти бота — `main.py` применяет миграции при старте.

### Миграция упала посередине
Исправь причину (обычно синтаксическая ошибка в `*.py` миграции),
затем откати до предыдущей версии:
```bash
python -m migrations downgrade 0005
python -m migrations upgrade
```

## Тесты падают

### `config is not importable`
Запускай тесты из папки `lethal-fpbot/`:
```bash
cd lethal-fpbot
BOT_TOKEN=dummy pytest
```

### `cryptography Panic`
В некоторых окружениях `cryptography` конфликтует с старым `cffi`:
```bash
pip install --upgrade cryptography cffi
```

## Docker

### `healthcheck failed`
Контейнер не поднял health endpoint. Проверь:
- Порт 8080 не занят
- `HEALTH_HOST=0.0.0.0` (а не 127.0.0.1 внутри контейнера)

### Данные теряются при рестарте
Проверь `docker-compose.yml`:
```yaml
volumes:
  - ./data:/app/data
  - ./.secret_key:/app/.secret_key
```

## Производительность

### Бот тормозит
Профилирование:
```bash
python -c "import cProfile; cProfile.run('import main; main.main()', 'profile.out')"
python -m pstats profile.out
```
Обычно узкое место:
- Слишком частый polling `chat_watcher` (7s) при 10+ аккаунтах
- Отсутствующий индекс в SQLite
- CRM без TTL кэша

Решения:
- Увеличь `INTERVAL` в watcher сервисах
- Добавь `PRAGMA cache_size = -20000`
- Проверь `services/crm_cache.py` — используется ли

### OOM на VPS
Большая часть памяти — matplotlib. Если не нужны графики:
```bash
pip uninstall matplotlib
```
Бот fallback'нется на текстовые сводки.

## Где смотреть логи

**Docker:**
```bash
docker compose logs -f bot
```

**systemd:**
```bash
journalctl -u lethal-fpbot -f
```

**Локально:**
Логи летят в stdout. Перенаправь:
```bash
python main.py 2>&1 | tee lethal.log
```

## Уровень логов

В `config.py` или через env:
```bash
LOG_LEVEL=DEBUG python main.py
```

## Если ничего не помогло

1. Проверь статус на /ping
2. Проверь /healthz → должен быть `{"status":"ok"}`
3. Проверь /metrics на наличие счётчиков
4. Посмотри последние 100 строк логов
5. Напиши в админ-чат Lethal Solutions с deskripcией + логами

## Самодиагностика

Запусти встроенный self-check:
```bash
python -m cli doctor
```

Проверит:
- ✅ Доступность BOT_TOKEN
- ✅ База данных доступна и миграции применены
- ✅ Fernet ключ валиден
- ✅ Зависимости установлены
- ✅ ФП-аккаунты могут логиниться
- ✅ Web API работает
