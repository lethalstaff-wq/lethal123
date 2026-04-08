// Minimal Telegram Bot API client.
// Uses fetch — works in Next.js Edge/Node runtimes without extra deps.

const TELEGRAM_API = "https://api.telegram.org"

export interface InlineKeyboardButton {
  text: string
  callback_data?: string
  url?: string
  pay?: boolean
}

export interface InlineKeyboardMarkup {
  inline_keyboard: InlineKeyboardButton[][]
}

export interface LabeledPrice {
  label: string
  amount: number // in the smallest unit (stars for XTR)
}

interface SendMessageOptions {
  chat_id: number | string
  text: string
  parse_mode?: "HTML" | "Markdown" | "MarkdownV2"
  reply_markup?: InlineKeyboardMarkup
  disable_web_page_preview?: boolean
  message_thread_id?: number
}

interface EditMessageOptions {
  chat_id: number | string
  message_id: number
  text: string
  parse_mode?: "HTML" | "Markdown" | "MarkdownV2"
  reply_markup?: InlineKeyboardMarkup
  disable_web_page_preview?: boolean
}

interface SendInvoiceOptions {
  chat_id: number | string
  title: string
  description: string
  payload: string
  provider_token: string // Empty string "" for Telegram Stars (XTR)
  currency: string // "XTR" for Stars
  prices: LabeledPrice[]
  photo_url?: string
  start_parameter?: string
}

interface SendPhotoOptions {
  chat_id: number | string
  photo: string // public URL, file_id, or InputFile
  caption?: string
  parse_mode?: "HTML" | "Markdown" | "MarkdownV2"
  reply_markup?: InlineKeyboardMarkup
}

interface EditMessageMediaOptions {
  chat_id: number | string
  message_id: number
  media: {
    type: "photo"
    media: string
    caption?: string
    parse_mode?: "HTML" | "Markdown" | "MarkdownV2"
  }
  reply_markup?: InlineKeyboardMarkup
}

interface DeleteMessageOptions {
  chat_id: number | string
  message_id: number
}

interface AnswerCallbackQueryOptions {
  callback_query_id: string
  text?: string
  show_alert?: boolean
  url?: string
}

interface AnswerPreCheckoutQueryOptions {
  pre_checkout_query_id: string
  ok: boolean
  error_message?: string
}

function getToken(): string {
  const token = process.env.TELEGRAM_BOT_TOKEN
  if (!token) {
    throw new Error("TELEGRAM_BOT_TOKEN is not set")
  }
  return token
}

async function callTelegram<T = unknown>(method: string, payload: unknown): Promise<T> {
  const token = getToken()
  const res = await fetch(`${TELEGRAM_API}/bot${token}/${method}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  })

  const data = await res.json().catch(() => ({}))
  if (!res.ok || !(data as { ok?: boolean }).ok) {
    // Log but do not throw — Telegram errors shouldn't crash the webhook.
    console.error("[telegram]", method, "failed:", data)
    throw new Error(
      (data as { description?: string }).description ||
        `Telegram API ${method} failed with status ${res.status}`,
    )
  }

  return (data as { result: T }).result
}

export function sendMessage(options: SendMessageOptions) {
  return callTelegram("sendMessage", {
    disable_web_page_preview: true,
    ...options,
  })
}

export function editMessageText(options: EditMessageOptions) {
  return callTelegram("editMessageText", {
    disable_web_page_preview: true,
    ...options,
  })
}

export function sendInvoice(options: SendInvoiceOptions) {
  return callTelegram("sendInvoice", options)
}

export function sendPhoto(options: SendPhotoOptions) {
  return callTelegram("sendPhoto", options)
}

export function editMessageMedia(options: EditMessageMediaOptions) {
  return callTelegram("editMessageMedia", options)
}

export function deleteMessage(options: DeleteMessageOptions) {
  return callTelegram("deleteMessage", options)
}

export function answerCallbackQuery(options: AnswerCallbackQueryOptions) {
  return callTelegram("answerCallbackQuery", options)
}

export function answerPreCheckoutQuery(options: AnswerPreCheckoutQueryOptions) {
  return callTelegram("answerPreCheckoutQuery", options)
}

export function setWebhook(url: string, secretToken?: string) {
  return callTelegram("setWebhook", {
    url,
    secret_token: secretToken,
    allowed_updates: [
      "message",
      "callback_query",
      "pre_checkout_query",
    ],
  })
}

export function deleteWebhook() {
  return callTelegram("deleteWebhook", {})
}

export function getMe() {
  return callTelegram("getMe", {})
}

// Escape user-supplied text for HTML parse mode.
export function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
}
