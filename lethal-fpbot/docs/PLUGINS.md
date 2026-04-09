# Плагины

Плагины расширяют функциональность бота без правки ядра. Каждый плагин —
Python-модуль, который реализует один или несколько хуков.

## Структура

```
plugins/
├── examples/        # встроенные примеры (загружаются всегда)
│   ├── greeter.py
│   ├── sales_logger.py
│   ├── anti_flood.py
│   └── keyword_alert.py
└── user/            # ваши кастомные плагины
    └── my_plugin.py
```

## Минимальный плагин

```python
# plugins/user/my_plugin.py
from plugins import Plugin

PLUGIN = Plugin(
    name="my_plugin",
    description="Делает что-то полезное",
)


@PLUGIN.hook("on_new_message")
async def on_message(bot, account, chat_id, author, text):
    if "купить" in text.lower():
        # Например, дёрнуть свой webhook
        ...
    # Возвращаем None — не прерываем обработку
    return None
```

## Доступные хуки

### `on_new_message(bot, account, chat_id, author, text)`

Вызывается при появлении нового сообщения от покупателя в чате FunPay.

- `bot` — `aiogram.Bot`, можешь слать сообщения админу
- `account` — dict с полями `id`, `login`, `user_id`, `proxy`, ...
- `chat_id` — строковый ID чата FunPay
- `author` — username покупателя
- `text` — текст сообщения

**Return:** `"stop"` чтобы прервать дальнейшую обработку (не пересылать
в TG, не запускать автоответчик).

### `on_new_order(bot, account, order)`

Вызывается при появлении нового оплаченного заказа.

- `order` — `FpOrder` dataclass: `order_id`, `status`, `buyer`,
  `amount`, `currency`, `lot_name`, `date`

### `on_review(bot, account, review)`

Вызывается на новый отзыв (Phase 4+).

### `on_session_lost(bot, account)`

Вызывается когда сессия FunPay протухла и не удалось восстановить.

## Управление потоком

Плагины исполняются в порядке регистрации. Если плагин вернул `"stop"`,
последующие плагины с этим же хуком пропускаются. Исключения логируются
но не убивают остальных плагинов.

## Безопасность

Плагины — это произвольный Python-код, исполняющийся в том же процессе
что и бот. Не загружайте плагины от непроверенных авторов.

## Установка пользовательского плагина

```bash
mkdir -p plugins/user
cp my_plugin.py plugins/user/
# Перезапустить бота
python main.py
```

Бот при старте напечатает:
```
INFO Loaded N plugin(s)
```

Список загруженных:
```bash
python -m cli plugins
```
