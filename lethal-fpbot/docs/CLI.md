# CLI tool

Командная строка для админских операций. Запускается через `python -m cli`.

## Команды

### `init-db`
Инициализирует все таблицы в БД (без миграций).

```bash
python -m cli init-db
```

### `stats`
Глобальная статистика (для админа).

```bash
python -m cli stats
# Users: 142
# FP accounts: 287
# Sales: 9821
# Revenue: 1483205₽
# Tiers:
#   pro: 32
#   standard: 56
#   starter: 28
```

### `grant <telegram_id>`
Выдать тариф пользователю руками (например после оплаты вне системы).

```bash
python -m cli grant 12345 --tier pro --days 30
```

### `pending`
Список ожидающих подтверждения платежей.

```bash
python -m cli pending
```

### `broadcast "<text>"`
Рассылка всем пользователям бота.

```bash
python -m cli broadcast "🎉 Выкатили новую фичу!"
```

### `promo create CODE PERCENT [--uses N] [--days D]`
Создать промокод.

```bash
python -m cli promo create LETHAL10 10 --uses 100 --days 30
python -m cli promo create FRIDAY50 50 --uses 5 --days 1
python -m cli promo list
```

### `backup`
Сделать бэкап БД немедленно (помимо ежедневного автоматического).

```bash
python -m cli backup
```

### `plugins`
Показать список установленных плагинов и их хуки.

```bash
python -m cli plugins
# Loaded 4 plugin(s)
#   - greeter: Шлёт приветствие новым покупателям
#       · hook: on_new_message
#   - sales_logger: Пишет каждую продажу в JSONL для бухгалтерии
#       · hook: on_new_order
#   ...
```

### `export [--output FILE]`
Дамп всей БД в JSON. Удобно для миграции / бэкапа / аудита.

```bash
python -m cli export --output backup.json
```

### Миграции

Раннер миграций — отдельный модуль:

```bash
python -m migrations.runner upgrade
python -m migrations.runner status
python -m migrations.runner downgrade 0002
```
