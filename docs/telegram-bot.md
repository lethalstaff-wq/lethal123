# Telegram Sales Bot

A sales bot that lives inside the main Next.js app as webhook routes. It
mirrors the site's product catalog, accepts Telegram Stars payments, and
forwards every new order — plus contact form submissions and staff
applications coming from the site — into your personal Telegram chat.

## What it does

- `/start`, `/catalog`, `/menu` — browse products with inline-keyboard
  navigation (Cheats / Spoofers / Firmware / Bundles).
- `/lang` — switch between English and Russian. Auto-detected from each
  user's Telegram language on first contact.
- Variant buttons → issue a **Telegram Stars (XTR)** invoice. Customers pay
  in-app with no external checkout.
- Successful payment → sends a confirmation to the buyer and a full order
  summary to the admin chat.
- Arbitrary text from a customer → forwarded to the admin chat so you can
  reply directly.
- Orders placed on the **website** are also mirrored to the admin chat, so
  every sales signal lives in one Telegram thread.

## Pricing model

The site stores prices in GBP pence. The bot shows a "discounted" price by
swapping the currency label:

| Site       | Bot (EN)       | Bot (RU)           | Stars invoice |
| ---------- | -------------- | ------------------ | ------------- |
| £200       | $200           | ~15 000 ₽          | 10 000 ⭐     |
| £38.50     | $38.50         | ~2 900 ₽           | 1 925 ⭐      |

- USD is the same numeric value as the pence / 100 — a natural ~20% discount.
- RUB is `price × RUB_PER_GBP_BOT`, rounded to the nearest 100. Default rate
  is 75, which yields round prices like "15 000 ₽" for £200.
- Stars amount is `USD × STARS_PER_USD_BOT`. Default is 50.

All three rates are env-configurable — tune them without a redeploy.

## Environment variables

Add these to your Vercel (or other host) project:

```
# Required
TELEGRAM_BOT_TOKEN=123456:AA...        # from @BotFather
TELEGRAM_WEBHOOK_SECRET=long-random-string
TELEGRAM_ADMIN_CHAT_ID=123456789       # your personal chat id

# Optional — pricing tuning
RUB_PER_GBP_BOT=75
STARS_PER_USD_BOT=50

# Optional — UI links
TELEGRAM_SUPPORT_URL=https://t.me/lethalsolutions
NEXT_PUBLIC_SITE_URL=https://lethalsolutions.me
```

### How to find `TELEGRAM_ADMIN_CHAT_ID`

1. Start your bot in a private chat with it.
2. Open `https://api.telegram.org/bot<YOUR_TOKEN>/getUpdates` in a browser.
3. Find the `"chat":{"id":...}` of your own message. That integer is your
   admin chat id.

If you'd rather send notifications to a group: add the bot to the group,
send a message, and use the negative group id that appears in `getUpdates`.

## Setup — first deploy

1. Create the bot with [@BotFather](https://t.me/BotFather) and copy the
   token.
2. Enable payments for your bot in BotFather:
   `/mybots → <bot> → Payments → Enable`. Telegram Stars work out of the
   box — you do **not** need to connect Stripe or any other provider.
3. Push this branch to your host (Vercel) and set the env vars above.
4. Register the webhook **once** after deploy:
   ```
   curl "https://your-site.com/api/telegram/set-webhook?secret=<ADMIN_SECRET>"
   ```
   You should get back `{ ok: true, bot: {...}, webhook: "..." }`.
5. Send `/start` to the bot. You'll see the main menu.

To unregister the webhook (useful while debugging with long-polling):

```
curl -X DELETE "https://your-site.com/api/telegram/set-webhook?secret=<ADMIN_SECRET>"
```

## File layout

```
app/api/telegram/
  webhook/route.ts         — bot updates handler
  set-webhook/route.ts     — one-shot webhook registration helper
lib/telegram/
  client.ts                — minimal Bot API client (fetch-based)
  design.ts                — site-themed message templates
  i18n.ts                  — EN/RU strings + language detection
  keyboards.ts             — inline keyboards + localized product names
  notify.ts                — order/contact/apply → admin chat forwarder
  pricing.ts               — GBP→USD/RUB/Stars conversions
  product-translations.ts  — Russian product cards
```

## How site orders reach Telegram

`app/api/discord-webhook/route.ts`, `app/api/contact/route.ts` and
`app/api/apply/route.ts` all call `notifyOrder` / `notifyContact` /
`notifyStaffApply` from `lib/telegram/notify.ts`. These helpers no-op when
`TELEGRAM_BOT_TOKEN` or `TELEGRAM_ADMIN_CHAT_ID` is missing, so the site
keeps working even before you finish configuring the bot.

## Adding translations for new products

Add a new entry to `lib/telegram/product-translations.ts` keyed by the
product id. Any missing field falls back to the English source in
`lib/products.ts`, so partial translations are fine:

```ts
RU_PRODUCTS["new-product"] = {
  name: "Новый продукт",
  description: "Короткое описание",
  features: ["Фича 1", "Фича 2"],
  variantNames: { "new-monthly": "Месяц" },
}
```
