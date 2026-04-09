# Security model

## Threat model

Бот хранит критические данные продавцов:
- Логины и пароли FunPay
- Golden keys (сессионные куки)
- История заказов и клиентов
- Переписки с покупателями
- Платёжные данные

Основные угрозы:
1. **Утечка `.env` или `.secret_key`** → компрометация всех паролей
2. **SQL injection** через пользовательский ввод
3. **Session hijacking** golden_key для захвата FP-аккаунтов
4. **XSS / HTML injection** в сообщениях Telegram
5. **Credential stuffing** через публичный endpoint бота
6. **Подкинутый вредоносный плагин**
7. **Mass scraping** через публичный Web API

## Меры защиты

### Шифрование данных at-rest

Все пароли FP и golden_key хранятся через `cryptography.Fernet`:
- Алгоритм: AES-128 CBC + HMAC-SHA256
- Ключ: 32-байтный urlsafe-base64
- Хранение: `.env` (ENCRYPTION_KEY) или `.secret_key` файл (0600)
- Ротация: при смене ключа — перелогин всех аккаунтов

```python
# utils/encryption.py
from cryptography.fernet import Fernet
encrypted = Fernet(key).encrypt(plaintext.encode())
```

### Защита от SQL injection

Все SQL запросы используют параметризацию:
```python
await db.execute("SELECT * FROM users WHERE id = ?", (user_id,))  # OK
# await db.execute(f"SELECT * FROM users WHERE id = {user_id}")   # BAD
```

Даже в `update_setting` где имя колонки приходит от пользователя —
whitelist:
```python
allowed = {"auto_raise", "raise_interval", ...}
if key not in allowed:
    raise ValueError(...)
```

### HTML escape в сообщениях

Все пользовательские данные проходят через `escape_html()`:
```python
from utils.helpers import escape_html
text = f"<b>{escape_html(buyer_name)}</b>"
```

Предотвращает HTML injection в Telegram markdown.

### Удаление паролей из чата

После ввода пароля FunPay бот сразу удаляет сообщение:
```python
@router.message(StateFilter(AddAccount.waiting_password))
async def step_password(message: Message, state: FSMContext):
    password = message.text
    try:
        await message.delete()  # ← удаляем сразу
    except Exception:
        pass
    # ... сохраняем зашифрованным
```

### Session binding

Golden key не покидает пул `session_pool` — хендлеры получают только
`FunPaySession` объект, ключ внутри. При завершении работы —
`close_all()` вызывается в finally блоке main.py.

### Rate limiting

Middleware `RateLimiter` в `bot/middlewares/rate_limit.py` блокирует
флуд:
- 10 сообщений в 10 секунд на user → warning
- 30 в 60 секунд → временный бан
- 100 в 5 минут → постоянный бан (с уведомлением админа)

### Admin gate

Админ-команды (`/admin`, broadcast, grant tier) проверяют:
```python
def _is_admin(user_id: int) -> bool:
    return user_id in ADMIN_IDS
```

`ADMIN_IDS` задаётся через env — не хранится в БД, нельзя подделать.

### Content moderation

Исходящие сообщения в чат FunPay проходят через `content_moderation`:
- Блокирует упоминания внешних мессенджеров (TG, Discord, WA)
- Блокирует t.me/ ссылки
- Блокирует номера телефонов и @handles
- Вручную проверяемый risk score 0-100

Это защищает продавца от бана FunPay за нарушение правил.

### JWT auth для Web API

Mini App авторизуется через Telegram initData:
1. Фронтенд шлёт initData (подписан Bot API)
2. Бэкэнд валидирует подпись по BOT_TOKEN
3. Выдаёт JWT со сроком 24 часа
4. JWT передаётся в заголовке `Authorization: Bearer <token>`

### HMAC для webhooks

Исходящие webhooks подписываются HMAC-SHA256:
```
X-Lethal-Signature: sha256=<hmac(secret, body)>
```

Получатель проверяет подпись — гарантия что пришло от нашего бота.

### Plugins sandboxing

Плагины загружаются через `importlib` — полный доступ к Python.
**Не загружай плагины от непроверенных источников!** В Docker
контейнере радиус поражения ограничен — но плагин может:
- Читать `.env` и `.secret_key`
- Делать произвольные HTTP запросы
- Менять БД

Принимаемые меры:
- Плагины только в `plugins/` директории (не из БД)
- Реестр всех установленных плагинов в логе старта
- Рекомендация: запускай только плагины которые сам написал

### Изоляция контейнера

В Docker:
- Запуск под uid 1000 (не root)
- Read-only файловая система кроме `/app/data`
- `seccomp` профиль по умолчанию
- Порт 8080 только для локального nginx

### Бэкапы

Ежедневные бэкапы БД:
- Локально: `backups/lethal_fpbot-YYYY-MM-DD.db`
- Опционально S3 (с pre-signed URL подписью AWS Sig V4)
- Хранятся 7 штук (auto-rotate)
- Шифрование на стороне S3 (SSE)

### Audit log

Все критичные действия пишутся в `audit_log` таблицу:
- Add/remove FP account
- Change settings
- Broadcast to customers
- Grant tier (admin)
- Refund processed
- Delete data

Экспорт через `/export → Полный дамп JSON`.

## Best practices для пользователя

1. **Не коммить** `.env` и `.secret_key` в публичные репозитории
2. **Используй** разные пароли для FunPay и других сервисов
3. **Включи 2FA** на своём Telegram аккаунте
4. **Не запускай** бота на публичном IP без nginx + firewall
5. **Проверяй** логи на подозрительные действия
6. **Регулярно** делай бэкапы на внешнее хранилище
7. **Обновляй** зависимости (`pip list --outdated`)
8. **Не делись** тарифом с коллегами без понимания рисков
9. **Ротируй** ENCRYPTION_KEY раз в год (с перелогином аккаунтов)
10. **Мониторь** /healthz и /metrics

## Зависимости и CVE

Бот использует только хорошо поддерживаемые библиотеки:
- `aiogram` — актив
- `aiohttp` — актив
- `cryptography` — актив, быстро патчит CVE
- `aiosqlite` — актив
- `beautifulsoup4` — актив
- `anthropic` — актив

Рекомендация: раз в месяц `pip list --outdated` и обновление.

## Нашёл уязвимость?

Не пиши публично в GitHub Issues. Напиши админу Lethal Solutions
напрямую в Telegram. Мы ответим в течение 24 часов и выпустим
патч как можно быстрее.

Поощрение ответственного disclosure:
- Бесплатный Pro тариф на 3 месяца
- Упоминание в Hall of Fame (если хочешь)
- Оплата по договорённости для critical уязвимостей

## Проверенные аспекты

- ✅ SQL injection — все запросы параметризованы
- ✅ HTML injection — escape_html везде
- ✅ Password at-rest encryption — Fernet
- ✅ Session security — пул, close_all в finally
- ✅ Rate limiting — middleware
- ✅ Admin gate — ADMIN_IDS из env
- ✅ Content moderation — исходящие проверяются
- ✅ Audit log — все критичные действия

## Непроверенные аспекты (TODO)

- ⚠️ CSRF для Web API — пока полагаемся на JWT + origin check
- ⚠️ DoS от одного пользователя (только soft rate limit)
- ⚠️ Плагины без sandboxing
- ⚠️ Нет signed releases
