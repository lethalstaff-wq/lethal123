// Telegram bot webhook. Set the webhook URL via /api/telegram/set-webhook.
//
// Handles:
//   - /start, /help, /catalog, /lang text commands
//   - Inline-keyboard navigation with language context in callback_data
//   - Stars invoices (sendInvoice + pre_checkout_query + successful_payment)
//   - Arbitrary messages → forwarded to the admin chat
//
// Env:
//   TELEGRAM_BOT_TOKEN           — BotFather token (required)
//   TELEGRAM_WEBHOOK_SECRET      — secret header sent by Telegram (required)
//   TELEGRAM_ADMIN_CHAT_ID       — chat that receives order/contact notifications
//   RUB_PER_GBP_BOT              — optional RUB rate, default 75
//   STARS_PER_EUR_BOT            — optional Stars rate, default 50
//   NEXT_PUBLIC_SITE_URL         — used for "Open website" button

import { NextResponse } from "next/server"

import { getProductById, getVariantById, type Product } from "@/lib/products"
import {
  answerCallbackQuery,
  answerPreCheckoutQuery,
  deleteMessage,
  editMessageMedia,
  escapeHtml,
  sendInvoice,
  sendMessage,
  sendPhoto,
} from "@/lib/telegram/client"
import {
  renderCategory,
  renderHelp,
  renderLangPicker,
  renderPaymentPicker,
  renderPaymentSuccess,
  renderProduct,
  renderWelcome,
  renderInvoiceDescription,
} from "@/lib/telegram/design"
import { currencyForLang, detectLang, t, type Lang } from "@/lib/telegram/i18n"
import {
  categoryKeyboard,
  hasMultiplePaymentMethods,
  languagePickerKeyboard,
  localizedProductName,
  localizedVariantName,
  mainMenuKeyboard,
  paymentMethodKeyboard,
  productKeyboard,
} from "@/lib/telegram/keyboards"
import { notifyOrder, notifyRaw } from "@/lib/telegram/notify"
import {
  formatBotPrice,
  penceToStars,
  starsPerEur,
} from "@/lib/telegram/pricing"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

// --- Telegram update types (only the fields we touch) ---

interface TGUser {
  id: number
  is_bot?: boolean
  first_name?: string
  last_name?: string
  username?: string
  language_code?: string
}

interface TGChat {
  id: number
  type: "private" | "group" | "supergroup" | "channel"
}

interface TGMessage {
  message_id: number
  from?: TGUser
  chat: TGChat
  date: number
  text?: string
  successful_payment?: {
    currency: string
    total_amount: number
    invoice_payload: string
    telegram_payment_charge_id: string
    provider_payment_charge_id: string
  }
}

interface TGCallbackQuery {
  id: string
  from: TGUser
  message?: TGMessage
  data?: string
}

interface TGPreCheckoutQuery {
  id: string
  from: TGUser
  currency: string
  total_amount: number
  invoice_payload: string
}

interface TGUpdate {
  update_id: number
  message?: TGMessage
  callback_query?: TGCallbackQuery
  pre_checkout_query?: TGPreCheckoutQuery
}

// --- Helpers ---

function userLabel(u: TGUser | undefined): string {
  if (!u) return "unknown"
  const name = [u.first_name, u.last_name].filter(Boolean).join(" ")
  const handle = u.username ? `@${u.username}` : null
  return handle ? `${name} (${handle}, id ${u.id})` : `${name} (id ${u.id})`
}

function parseLangSuffix(data: string): Lang {
  // All callback payloads end with ":en" or ":ru".
  if (data.endsWith(":ru")) return "ru"
  return "en"
}

// Build an absolute URL for a public asset so Telegram can fetch it.
function assetUrl(path: string): string {
  const base =
    process.env.NEXT_PUBLIC_SITE_URL?.trim().replace(/^[<\s]+|[>\s]+$/g, "").replace(/\/+$/, "") ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "https://www.lethalsolutions.me")
  return `${base}${path.startsWith("/") ? path : `/${path}`}`
}

const MAIN_BANNER = "/images/banner.png"

// Core "render a photo card in place" primitive. If editMessageId is set it
// swaps the photo+caption+keyboard in-place; otherwise sends a new photo
// message. On edit failure (Telegram rejects editing a text-only message as
// media) we fall back to delete + send.
async function renderPhotoCard(
  chatId: number,
  photo: string,
  caption: string,
  keyboard: ReturnType<typeof mainMenuKeyboard>,
  editMessageId?: number,
) {
  if (editMessageId) {
    try {
      await editMessageMedia({
        chat_id: chatId,
        message_id: editMessageId,
        media: {
          type: "photo",
          media: photo,
          caption,
          parse_mode: "HTML",
        },
        reply_markup: keyboard,
      })
      return
    } catch {
      // Previous message wasn't a photo (e.g. /help text) — delete it and send fresh.
      await deleteMessage({ chat_id: chatId, message_id: editMessageId }).catch(() => {})
    }
  }
  await sendPhoto({
    chat_id: chatId,
    photo,
    caption,
    parse_mode: "HTML",
    reply_markup: keyboard,
  })
}

async function showMainMenu(chatId: number, lang: Lang, editMessageId?: number) {
  await renderPhotoCard(
    chatId,
    assetUrl(MAIN_BANNER),
    renderWelcome(lang),
    mainMenuKeyboard(lang),
    editMessageId,
  )
}

async function showCategory(
  chatId: number,
  category: string,
  lang: Lang,
  editMessageId?: number,
) {
  const valid = ["cheat", "spoofer", "firmware", "bundle"] as const
  if (!(valid as readonly string[]).includes(category)) {
    return showMainMenu(chatId, lang, editMessageId)
  }
  const cat = category as (typeof valid)[number]
  await renderPhotoCard(
    chatId,
    assetUrl(MAIN_BANNER),
    renderCategory(cat, lang),
    categoryKeyboard(cat, lang),
    editMessageId,
  )
}

async function showProduct(
  chatId: number,
  productId: string,
  lang: Lang,
  editMessageId?: number,
) {
  const product = getProductById(productId)
  if (!product) {
    await sendMessage({ chat_id: chatId, text: t("product_not_found", lang) })
    return
  }
  // Fall back to the main banner if the product image path is missing.
  const photo = product.image ? assetUrl(product.image) : assetUrl(MAIN_BANNER)
  await renderPhotoCard(
    chatId,
    photo,
    renderProduct(product, lang),
    productKeyboard(product, lang),
    editMessageId,
  )
}

// Show the per-variant payment-method picker (Stars / Card / ...). If only
// one method is configured, skip the picker and go straight to that invoice.
async function sendVariantInvoice(
  chatId: number,
  product: Product,
  variantId: string,
  lang: Lang,
) {
  const variant = getVariantById(product.id, variantId)
  if (!variant) {
    await sendMessage({ chat_id: chatId, text: t("variant_unavailable", lang) })
    return
  }

  if (!hasMultiplePaymentMethods()) {
    // Only Stars is configured — skip the picker for fewer taps.
    await sendStarsInvoice(chatId, product, variant, lang)
    return
  }

  const currency = currencyForLang(lang)
  const priceLabel = formatBotPrice(variant.priceInPence, currency)
  const variantName = localizedVariantName(product, variant, lang)
  await sendMessage({
    chat_id: chatId,
    parse_mode: "HTML",
    text: renderPaymentPicker(product, variantName, priceLabel, lang),
    reply_markup: paymentMethodKeyboard(product.id, variant.id, variant.priceInPence, lang),
  })
}

async function sendStarsInvoice(
  chatId: number,
  product: Product,
  variant: Product["variants"][number],
  lang: Lang,
) {
  const stars = penceToStars(variant.priceInPence)
  const currency = currencyForLang(lang)
  const price = formatBotPrice(variant.priceInPence, currency)
  const name = localizedProductName(product, lang)
  const variantName = localizedVariantName(product, variant, lang)

  await sendInvoice({
    chat_id: chatId,
    title: `${name} — ${variantName}`.slice(0, 32),
    description: renderInvoiceDescription(product, lang),
    payload: `buy:${product.id}:${variant.id}:${lang}`,
    provider_token: "", // Empty string selects Stars (XTR).
    currency: "XTR",
    prices: [{ label: `${variantName} (${price})`.slice(0, 32), amount: stars }],
  })
}

// Card invoice via Telegram's native payments API. Uses TELEGRAM_PROVIDER_TOKEN
// from BotFather Payments (Redsys, Stripe, YooKassa, etc). Site prices are
// stored in pence — for currencies whose minor unit is also 1/100 (EUR, USD,
// GBP) we can pass the value directly. RUB also uses 1/100 (kopecks) so the
// conversion factor is the same. Currency is configurable via env so the
// operator can swap providers without code changes.
async function sendCardInvoice(
  chatId: number,
  product: Product,
  variant: Product["variants"][number],
  lang: Lang,
) {
  const providerToken = process.env.TELEGRAM_PROVIDER_TOKEN
  if (!providerToken) {
    await sendMessage({ chat_id: chatId, text: t("variant_unavailable", lang) })
    return
  }
  const currency = (process.env.TELEGRAM_PROVIDER_CURRENCY || "EUR").toUpperCase()
  const name = localizedProductName(product, lang)
  const variantName = localizedVariantName(product, variant, lang)

  await sendInvoice({
    chat_id: chatId,
    title: `${name} — ${variantName}`.slice(0, 32),
    description: renderInvoiceDescription(product, lang),
    payload: `buy:${product.id}:${variant.id}:${lang}`,
    provider_token: providerToken,
    currency,
    prices: [{ label: `${variantName}`.slice(0, 32), amount: variant.priceInPence }],
  })
}

async function handleSuccessfulPayment(msg: TGMessage) {
  const payment = msg.successful_payment
  if (!payment) return

  // Payload format: buy:<productId>:<variantId>:<lang>
  const parts = payment.invoice_payload.split(":")
  const productId = parts[1]
  const variantId = parts[2]
  const lang: Lang = (parts[3] as Lang) === "ru" ? "ru" : "en"

  const product = productId ? getProductById(productId) : null
  const variant = product && variantId ? product.variants.find((v) => v.id === variantId) : null

  const orderId = `TG-${Date.now().toString(36).toUpperCase()}-${payment.telegram_payment_charge_id.slice(-6)}`

  // Distinguish Stars (currency XTR) from card payments (EUR/USD/RUB/etc).
  const isStars = payment.currency === "XTR"
  const paymentMethod = isStars ? "Telegram Stars" : `Card (${payment.currency})`
  // Convert paid amount to a sensible "total in major units" for the admin
  // notification: Stars don't map cleanly to GBP, so fall back to the
  // configured variant price in those cases.
  const totalForNotify = isStars
    ? variant
      ? variant.priceInPence / 100
      : payment.total_amount / starsPerEur()
    : payment.total_amount / 100

  await sendMessage({
    chat_id: msg.chat.id,
    parse_mode: "HTML",
    text: renderPaymentSuccess(
      orderId,
      productId,
      variantId,
      payment.total_amount,
      lang,
    ),
  })

  await notifyOrder({
    source: "telegram-bot",
    orderId,
    telegramUser: userLabel(msg.from),
    paymentMethod,
    total: totalForNotify,
    items: [
      {
        name: product ? localizedProductName(product, "en") : "Unknown product",
        variant: product && variant ? localizedVariantName(product, variant, "en") : "Unknown variant",
        quantity: 1,
        price: variant ? variant.priceInPence / 100 : 0,
      },
    ],
  })
}

async function handleTextMessage(msg: TGMessage) {
  const text = (msg.text || "").trim()
  if (!text) return
  const lang = detectLang(msg.from)

  if (text.startsWith("/start") || text === "/menu") {
    await showMainMenu(msg.chat.id, lang)
    return
  }

  if (text.startsWith("/catalog") || text.startsWith("/shop")) {
    await showMainMenu(msg.chat.id, lang)
    return
  }

  if (text.startsWith("/lang")) {
    await sendMessage({
      chat_id: msg.chat.id,
      parse_mode: "HTML",
      text: renderLangPicker(lang),
      reply_markup: languagePickerKeyboard(),
    })
    return
  }

  if (text.startsWith("/help")) {
    await sendMessage({
      chat_id: msg.chat.id,
      parse_mode: "HTML",
      text: renderHelp(lang),
    })
    return
  }

  // Free-form message → forward to admin chat for manual support.
  await notifyRaw(
    [
      "💬 <b>Customer message</b>",
      `<b>From:</b> ${escapeHtml(userLabel(msg.from))}`,
      `<b>Lang:</b> ${lang}`,
      "",
      escapeHtml(text),
    ].join("\n"),
  )
  await sendMessage({
    chat_id: msg.chat.id,
    text: t("customer_message_ack", lang),
  })
}

async function handleCallbackQuery(cb: TGCallbackQuery) {
  const data = cb.data || ""
  const chatId = cb.message?.chat.id
  const messageId = cb.message?.message_id
  if (!chatId || !messageId) {
    await answerCallbackQuery({ callback_query_id: cb.id })
    return
  }

  // Acknowledge immediately so the spinner on the button stops.
  await answerCallbackQuery({ callback_query_id: cb.id }).catch(() => {})

  // Language switcher (format: lang:<code>).
  if (data.startsWith("lang:")) {
    const newLang: Lang = data.slice(5) === "ru" ? "ru" : "en"
    await showMainMenu(chatId, newLang, messageId)
    return
  }

  const lang = parseLangSuffix(data)

  if (data.startsWith("home:")) {
    await showMainMenu(chatId, lang, messageId)
    return
  }

  if (data.startsWith("cat:")) {
    // cat:<category>:<lang>
    const parts = data.split(":")
    await showCategory(chatId, parts[1] || "", lang, messageId)
    return
  }

  if (data.startsWith("prod:")) {
    // prod:<productId>:<lang>
    const parts = data.split(":")
    await showProduct(chatId, parts[1] || "", lang, messageId)
    return
  }

  if (data.startsWith("buy:")) {
    // buy:<productId>:<variantId>:<lang> — open the payment-method picker
    // (or a Stars invoice directly if Stars is the only configured method).
    const parts = data.split(":")
    const product = parts[1] ? getProductById(parts[1]) : null
    if (!product) {
      await sendMessage({ chat_id: chatId, text: t("product_not_found", lang) })
      return
    }
    await sendVariantInvoice(chatId, product, parts[2] || "", lang)
    return
  }

  if (data.startsWith("pay:")) {
    // pay:<method>:<productId>:<variantId>:<lang>
    const parts = data.split(":")
    const method = parts[1]
    const product = parts[2] ? getProductById(parts[2]) : null
    const variant = product && parts[3] ? getVariantById(product.id, parts[3]) : null
    if (!product || !variant) {
      await sendMessage({ chat_id: chatId, text: t("variant_unavailable", lang) })
      return
    }
    if (method === "stars") {
      await sendStarsInvoice(chatId, product, variant, lang)
    } else if (method === "card") {
      await sendCardInvoice(chatId, product, variant, lang)
    }
    return
  }
}

// --- Route handler ---

export async function POST(request: Request) {
  try {
    // Verify the secret token header so random posters can't drive the bot.
    const expected = process.env.TELEGRAM_WEBHOOK_SECRET
    if (expected) {
      const got = request.headers.get("x-telegram-bot-api-secret-token")
      if (got !== expected) {
        return new NextResponse("forbidden", { status: 403 })
      }
    }

    if (!process.env.TELEGRAM_BOT_TOKEN) {
      return NextResponse.json({ ok: false, error: "bot not configured" }, { status: 200 })
    }

    let update: TGUpdate
    try {
      update = (await request.json()) as TGUpdate
    } catch {
      return new NextResponse("bad json", { status: 400 })
    }

    try {
      if (update.pre_checkout_query) {
        // Always approve — we have no stock or coupon logic at this stage.
        await answerPreCheckoutQuery({
          pre_checkout_query_id: update.pre_checkout_query.id,
          ok: true,
        })
        return NextResponse.json({ ok: true })
      }

      if (update.callback_query) {
        await handleCallbackQuery(update.callback_query)
        return NextResponse.json({ ok: true })
      }

      if (update.message) {
        if (update.message.successful_payment) {
          await handleSuccessfulPayment(update.message)
        } else {
          await handleTextMessage(update.message)
        }
        return NextResponse.json({ ok: true })
      }
    } catch (err) {
      console.error("[telegram/webhook] handler error:", err)
      // Always return 200 so Telegram doesn't retry the same update forever.
      return NextResponse.json({ ok: true })
    }

    return NextResponse.json({ ok: true })
  } catch (outerErr) {
    console.error("[telegram/webhook] OUTER error:", outerErr)
    return NextResponse.json({ ok: true })
  }
}

// Keep GET available for quick health checks.
export async function GET() {
  return NextResponse.json({
    ok: true,
    bot: !!process.env.TELEGRAM_BOT_TOKEN,
    adminChat: !!process.env.TELEGRAM_ADMIN_CHAT_ID,
  })
}
