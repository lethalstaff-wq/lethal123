// Forwards events (orders, contact messages, staff applications, bot purchases)
// to a private Telegram admin chat. The chat ID is taken from env
// TELEGRAM_ADMIN_CHAT_ID — use @userinfobot or @RawDataBot to find your ID,
// or create a group with the bot and use the negative group ID.
//
// This helper is a no-op when TELEGRAM_BOT_TOKEN or TELEGRAM_ADMIN_CHAT_ID are
// missing, so the rest of the site keeps working even before you configure it.

import { escapeHtml, sendMessage } from "@/lib/telegram/client"

function adminChatId(): string | null {
  return process.env.TELEGRAM_ADMIN_CHAT_ID || null
}

function configured(): boolean {
  return !!process.env.TELEGRAM_BOT_TOKEN && !!adminChatId()
}

async function safeSend(text: string) {
  if (!configured()) return
  try {
    await sendMessage({
      chat_id: adminChatId()!,
      text,
      parse_mode: "HTML",
      disable_web_page_preview: true,
    })
  } catch (err) {
    console.error("[telegram/notify] failed:", err)
  }
}

export interface OrderItemSummary {
  name: string
  variant: string
  quantity: number
  price: number // in GBP (not pence)
}

export interface OrderNotificationPayload {
  source: "site" | "telegram-bot"
  orderId: string
  email?: string
  discord?: string
  telegramUser?: string // @handle or "Name (id)"
  paymentMethod: string
  total: number // GBP
  items: OrderItemSummary[]
  coupon?: string
  discount?: number
  ipAddress?: string
  country?: string
  countryCode?: string
  city?: string
  region?: string
}

function flagEmoji(code?: string): string {
  if (!code || code.length !== 2) return ""
  const points = code
    .toUpperCase()
    .split("")
    .map((c) => 127397 + c.charCodeAt(0))
  return String.fromCodePoint(...points)
}

export async function notifyOrder(data: OrderNotificationPayload) {
  const badge = data.source === "telegram-bot" ? "🤖 TG BOT" : "🌐 SITE"
  const lines: string[] = []
  lines.push(`🛒 <b>New Order</b> <i>${badge}</i>`)
  lines.push("")
  lines.push(`<b>Order:</b> <code>${escapeHtml(data.orderId)}</code>`)
  lines.push(`<b>Total:</b> £${data.total.toFixed(2)} <i>(${escapeHtml(data.paymentMethod)})</i>`)

  if (data.email) lines.push(`<b>Email:</b> <code>${escapeHtml(data.email)}</code>`)
  if (data.discord) lines.push(`<b>Discord:</b> ${escapeHtml(data.discord)}`)
  if (data.telegramUser) lines.push(`<b>Telegram:</b> ${escapeHtml(data.telegramUser)}`)
  if (data.coupon) lines.push(`<b>Coupon:</b> <code>${escapeHtml(data.coupon)}</code>`)

  const locParts = [data.city, data.region, data.country].filter(Boolean) as string[]
  if (locParts.length) {
    lines.push(
      `<b>Location:</b> ${flagEmoji(data.countryCode)} ${escapeHtml(locParts.join(", "))}`,
    )
  }
  if (data.ipAddress) lines.push(`<b>IP:</b> <code>${escapeHtml(data.ipAddress)}</code>`)

  lines.push("")
  lines.push("<b>Items:</b>")
  for (const it of data.items) {
    lines.push(
      `  • ${it.quantity}× ${escapeHtml(it.name)} — ${escapeHtml(it.variant)} — £${it.price.toFixed(2)}`,
    )
  }

  await safeSend(lines.join("\n"))
}

export interface ContactNotificationPayload {
  name: string
  email: string
  discord?: string
  message: string
}

export async function notifyContact(data: ContactNotificationPayload) {
  const lines = [
    "📨 <b>New Contact Form</b>",
    "",
    `<b>Name:</b> ${escapeHtml(data.name)}`,
    `<b>Email:</b> <code>${escapeHtml(data.email)}</code>`,
    data.discord ? `<b>Discord:</b> ${escapeHtml(data.discord)}` : null,
    "",
    `<b>Message:</b>\n${escapeHtml(data.message)}`,
  ].filter(Boolean) as string[]
  await safeSend(lines.join("\n"))
}

export interface StaffApplyNotificationPayload {
  position: string
  discord: string
  age: number | string
  timezone?: string
  hoursPerWeek?: string
  experience?: string
  whyLethal?: string
  portfolio?: string
}

export async function notifyStaffApply(data: StaffApplyNotificationPayload) {
  const lines = [
    `📋 <b>New Staff Application: ${escapeHtml(data.position)}</b>`,
    "",
    `<b>Discord:</b> ${escapeHtml(data.discord)}`,
    `<b>Age:</b> ${escapeHtml(String(data.age))}`,
    data.timezone ? `<b>Timezone:</b> ${escapeHtml(data.timezone)}` : null,
    data.hoursPerWeek ? `<b>Hours/week:</b> ${escapeHtml(data.hoursPerWeek)}` : null,
    "",
    data.experience ? `<b>Experience:</b>\n${escapeHtml(data.experience.slice(0, 800))}` : null,
    data.whyLethal ? `\n<b>Why Lethal:</b>\n${escapeHtml(data.whyLethal.slice(0, 800))}` : null,
    data.portfolio ? `\n<b>Portfolio:</b> ${escapeHtml(data.portfolio)}` : null,
  ].filter(Boolean) as string[]
  await safeSend(lines.join("\n"))
}

// Generic free-form forward — used by the bot to relay arbitrary chat messages
// from customers to the admin chat.
export async function notifyRaw(text: string) {
  await safeSend(text)
}
