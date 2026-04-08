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
//   STARS_PER_USD_BOT            — optional Stars rate, default 50
//   NEXT_PUBLIC_SITE_URL         — used for "Open website" button

import { NextResponse } from "next/server"

import { getProductById, getVariantById, type Product } from "@/lib/products"
import {
  answerCallbackQuery,
  answerPreCheckoutQuery,
  editMessageText,
  escapeHtml,
  sendInvoice,
  sendMessage,
} from "@/lib/telegram/client"
import {
  renderCategory,
  renderHelp,
  renderLangPicker,
  renderPaymentSuccess,
  renderProduct,
  renderWelcome,
  renderInvoiceDescription,
} from "@/lib/telegram/design"
import { currencyForLang, detectLang, t, type Lang } from "@/lib/telegram/i18n"
import {
  categoryKeyboard,
  languagePickerKeyboard,
  localizedProductName,
  localizedVariantName,
  mainMenuKeyboard,
  productKeyboard,
} from "@/lib/telegram/keyboards"
import { notifyOrder, notifyRaw } from "@/lib/telegram/notify"
import {
  formatBotPrice,
  penceToStars,
  starsPerUsd,
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

async function showMainMenu(chatId: number, lang: Lang, editMessageId?: number) {
  const text = renderWelcome(lang)
  const keyboard = mainMenuKeyboard(lang)
  if (editMessageId) {
    await editMessageText({
      chat_id: chatId,
      message_id: editMessageId,
      text,
      parse_mode: "HTML",
      reply_markup: keyboard,
    })
  } else {
    await sendMessage({
      chat_id: chatId,
      text,
      parse_mode: "HTML",
      reply_markup: keyboard,
    })
  }
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
  const text = renderCategory(cat, lang)
  const keyboard = categoryKeyboard(cat, lang)
  if (editMessageId) {
    await editMessageText({
      chat_id: chatId,
      message_id: editMessageId,
      text,
      parse_mode: "HTML",
      reply_markup: keyboard,
    })
  } else {
    await sendMessage({
      chat_id: chatId,
      text,
      parse_mode: "HTML",
      reply_markup: keyboard,
    })
  }
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

  const text = renderProduct(product, lang)
  const keyboard = productKeyboard(product, lang)
  if (editMessageId) {
    await editMessageText({
      chat_id: chatId,
      message_id: editMessageId,
      text,
      parse_mode: "HTML",
      reply_markup: keyboard,
    })
  } else {
    await sendMessage({
      chat_id: chatId,
      text,
      parse_mode: "HTML",
      reply_markup: keyboard,
    })
  }
}

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

  const stars = penceToStars(variant.priceInPence)
  const currency = currencyForLang(lang)
  const price = formatBotPrice(variant.priceInPence, currency)

  const name = localizedProductName(product, lang)
  const variantName = localizedVariantName(product, variant, lang)

  await sendInvoice({
    chat_id: chatId,
    title: `${name} — ${variantName}`.slice(0, 32),
    description: renderInvoiceDescription(product, lang),
    // Payload is the only state we get back in successful_payment, so we pack
    // enough to identify the order and preserve language.
    payload: `buy:${product.id}:${variant.id}:${lang}`,
    provider_token: "", // Empty string selects Stars (XTR).
    currency: "XTR",
    prices: [
      { label: `${variantName} (${price})`.slice(0, 32), amount: stars },
    ],
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
    paymentMethod: "Telegram Stars",
    total: variant ? variant.priceInPence / 100 : payment.total_amount / starsPerUsd(),
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
    // buy:<productId>:<variantId>:<lang>
    const parts = data.split(":")
    const product = parts[1] ? getProductById(parts[1]) : null
    if (!product) {
      await sendMessage({ chat_id: chatId, text: t("product_not_found", lang) })
      return
    }
    await sendVariantInvoice(chatId, product, parts[2] || "", lang)
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
      const msg = err instanceof Error ? err.message : String(err)
      const stack = err instanceof Error && err.stack ? err.stack.split("\n").slice(0, 3).join(" | ") : ""
      console.error("[telegram/webhook] handler error:", msg, stack, err)
      // Surface the failure to Telegram so it shows up in getWebhookInfo's
      // last_error_message. We use 500 so Telegram records the error but it
      // will still try to re-deliver, which is fine during debugging.
      return new NextResponse(`inner: ${msg} | ${stack}`.slice(0, 250), { status: 500 })
    }

    return NextResponse.json({ ok: true })
  } catch (outerErr) {
    const msg = outerErr instanceof Error ? outerErr.message : String(outerErr)
    const stack = outerErr instanceof Error && outerErr.stack ? outerErr.stack.split("\n").slice(0, 3).join(" | ") : ""
    console.error("[telegram/webhook] OUTER error:", msg, stack, outerErr)
    return new NextResponse(`outer: ${msg} | ${stack}`.slice(0, 250), { status: 500 })
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
