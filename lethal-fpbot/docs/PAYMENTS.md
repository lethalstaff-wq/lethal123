# Платежи

Поддерживаются три способа приёма оплаты:

1. **ЮKassa** — российские карты, СБП, ЮMoney
2. **CryptoBot** — USDT, TON, BTC, ETH через @CryptoBot
3. **Ручное** — fallback, админ одобряет заявку из ТГ

## ЮKassa

### Настройка

```env
YOOKASSA_SHOP_ID=12345
YOOKASSA_SECRET_KEY=test_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
YOOKASSA_RETURN_URL=https://t.me/your_bot
```

В личном кабинете ЮKassa добавьте webhook URL:
```
https://your-domain.com/api/payments/yookassa/webhook
```

Без HTTPS не работает (требование платёжных систем).

### Поток

1. Mini App → `POST /api/payments/create` с `{tier, provider:"yookassa"}`
2. Бот создаёт `pending_payment` в БД и invoice в ЮKassa
3. Возвращает `confirmation_url` — Mini App открывает в новом окне
4. Пользователь оплачивает
5. ЮKassa шлёт webhook → бот активирует тариф
6. Если был реферер — начисляет ему 10% бонус

## CryptoBot

### Настройка

1. Зайти в [@CryptoBot](https://t.me/CryptoBot) → Crypto Pay → Create App
2. Получить токен
3. Настроить webhook URL в @CryptoBot

```env
CRYPTOBOT_TOKEN=12345:AAxxxxxxxxxxxxxxxxxxxxxxxxxx
CRYPTOBOT_NETWORK=mainnet
```

### Поток

Аналогично ЮKassa, но в `provider:"crypto_bot"`. Сумма
конвертируется ₽ → USDT по фикс-курсу 95 (правится в коде, можно
прицепить актуальный курс).

## Ручное (fallback)

Если ни один провайдер не настроен — бот всё равно создаёт
`pending_payment` и шлёт админу в ТГ алерт с кнопками
«Подтвердить / Отклонить». Админ принимает оплату любым удобным
способом (банковский перевод, СБП, крипта вне CryptoBot) и жмёт
«Подтвердить» — бот активирует тариф.

## Промокоды

При создании платежа можно передать промокод:

```json
POST /api/payments/create
{ "tier": "pro", "provider": "yookassa", "promo": "LETHAL10" }
```

Бот:
1. Проверит существование, не истёк ли, не превышен ли лимит,
   не использовал ли этот юзер уже его
2. Применит скидку
3. Запишет в `promo_redemptions`

CLI создание:
```bash
python -m cli promo create LETHAL10 10 --uses 100 --days 30
```

## Реферальная программа

Если пользователь зарегистрировался по `/start REFCODE`:

1. У него в `users.referred_by` записан id пригласившего
2. При успешной оплате (любым провайдером) пригласившему капает
   10% от суммы на `users.balance`
3. Пригласивший получает уведомление в ТГ

Процент задаётся константой `REFERRAL_PERCENT` в `bot/handlers/admin.py`.

## События платежа

| Событие | Что происходит |
|---|---|
| Создание | `pending_payments` row, статус `pending` |
| Оплата | `pending_payments.status = approved`, `users.subscription_tier/expires` обновляются на 30 дней |
| Реферал | Если есть `referred_by` — `+10%` на `balance` пригласившего |
| Уведомление | Покупателю — «Тариф активирован», рефереру — «Реферальный бонус» |
