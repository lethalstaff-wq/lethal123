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

// --- Site-wide event notifications -------------------------------------------

export interface SignupNotification {
  email: string
  discord?: string
  ipAddress?: string
  country?: string
  countryCode?: string
  userAgent?: string
}

export async function notifySignup(data: SignupNotification) {
  const lines = [
    "🆕 <b>New signup</b>",
    "",
    `<b>Email:</b> <code>${escapeHtml(data.email)}</code>`,
    data.discord ? `<b>Discord:</b> ${escapeHtml(data.discord)}` : null,
    data.country
      ? `<b>From:</b> ${flagEmoji(data.countryCode)} ${escapeHtml(data.country)}`
      : null,
    data.ipAddress ? `<b>IP:</b> <code>${escapeHtml(data.ipAddress)}</code>` : null,
  ].filter(Boolean) as string[]
  await safeSend(lines.join("\n"))
}

export interface LoginNotification {
  email: string
  ipAddress?: string
  country?: string
  countryCode?: string
  city?: string
  userAgent?: string
  isAdmin?: boolean
}

export async function notifyLogin(data: LoginNotification) {
  const title = data.isAdmin ? "🛡 <b>Admin login</b>" : "🔑 <b>User login</b>"
  const lines = [
    title,
    "",
    `<b>Email:</b> <code>${escapeHtml(data.email)}</code>`,
    data.country
      ? `<b>From:</b> ${flagEmoji(data.countryCode)} ${escapeHtml(
          [data.city, data.country].filter(Boolean).join(", "),
        )}`
      : null,
    data.ipAddress ? `<b>IP:</b> <code>${escapeHtml(data.ipAddress)}</code>` : null,
  ].filter(Boolean) as string[]
  await safeSend(lines.join("\n"))
}

export interface OrderStatusNotification {
  orderId: string
  email?: string
  newStatus: string
  total?: number
  productName?: string
}

export async function notifyOrderStatus(data: OrderStatusNotification) {
  const emoji =
    data.newStatus === "confirmed" || data.newStatus === "completed"
      ? "✅"
      : data.newStatus === "cancelled" || data.newStatus === "refunded"
        ? "❌"
        : "🔄"
  const lines = [
    `${emoji} <b>Order ${escapeHtml(data.newStatus)}</b>`,
    "",
    `<b>Order:</b> <code>${escapeHtml(data.orderId)}</code>`,
    data.email ? `<b>Email:</b> <code>${escapeHtml(data.email)}</code>` : null,
    data.productName ? `<b>Product:</b> ${escapeHtml(data.productName)}` : null,
    typeof data.total === "number" ? `<b>Total:</b> £${data.total.toFixed(2)}` : null,
  ].filter(Boolean) as string[]
  await safeSend(lines.join("\n"))
}

export interface ReviewNotification {
  rating: number
  content: string
  productName?: string
  authorName: string
}

export async function notifyReview(data: ReviewNotification) {
  const stars = "⭐".repeat(Math.max(1, Math.min(5, Math.round(data.rating))))
  const lines = [
    `📝 <b>New review</b> ${stars}`,
    "",
    data.productName ? `<b>Product:</b> ${escapeHtml(data.productName)}` : null,
    `<b>By:</b> ${escapeHtml(data.authorName)}`,
    "",
    escapeHtml(data.content.slice(0, 600)),
  ].filter(Boolean) as string[]
  await safeSend(lines.join("\n"))
}

export interface CouponNotification {
  code: string
  valid: boolean
  reason?: string
  ipAddress?: string
}

export async function notifyCoupon(data: CouponNotification) {
  const emoji = data.valid ? "🎟️" : "⚠️"
  const status = data.valid ? "valid" : "rejected"
  const lines = [
    `${emoji} <b>Coupon ${status}</b>`,
    "",
    `<b>Code:</b> <code>${escapeHtml(data.code)}</code>`,
    data.reason ? `<b>Reason:</b> ${escapeHtml(data.reason)}` : null,
    data.ipAddress ? `<b>IP:</b> <code>${escapeHtml(data.ipAddress)}</code>` : null,
  ].filter(Boolean) as string[]
  await safeSend(lines.join("\n"))
}

export interface DownloadNotification {
  orderId?: string
  email?: string
  productName?: string
  ipAddress?: string
}

export async function notifyDownload(data: DownloadNotification) {
  const lines = [
    "📥 <b>License downloaded</b>",
    "",
    data.orderId ? `<b>Order:</b> <code>${escapeHtml(data.orderId)}</code>` : null,
    data.email ? `<b>Email:</b> <code>${escapeHtml(data.email)}</code>` : null,
    data.productName ? `<b>Product:</b> ${escapeHtml(data.productName)}` : null,
    data.ipAddress ? `<b>IP:</b> <code>${escapeHtml(data.ipAddress)}</code>` : null,
  ].filter(Boolean) as string[]
  await safeSend(lines.join("\n"))
}

export interface VisitorNotification {
  path: string
  ipAddress?: string
  country?: string
  countryCode?: string
  city?: string
  region?: string
  userAgent?: string
  referrer?: string
}

export async function notifyVisitor(data: VisitorNotification) {
  // Compress user-agent to "Browser on OS · device" so it fits one line.
  const ua = (data.userAgent || "").slice(0, 200)
  const browser = /Chrome\/[\d.]+/.exec(ua)?.[0] || /Firefox\/[\d.]+/.exec(ua)?.[0] || /Safari\/[\d.]+/.exec(ua)?.[0] || ""
  const platform = /Windows NT [\d.]+/.exec(ua)?.[0] || /Mac OS X [\d_]+/.exec(ua)?.[0] || /Android [\d.]+/.exec(ua)?.[0] || /iPhone OS [\d_]+/.exec(ua)?.[0] || /Linux/.exec(ua)?.[0] || ""
  const isMobile = /Mobile|iPhone|Android/i.test(ua) ? "📱" : "💻"

  const locParts = [data.city, data.region, data.country].filter(Boolean) as string[]
  const lines = [
    `${isMobile} <b>New visitor</b>`,
    "",
    `<b>Page:</b> <code>${escapeHtml(data.path)}</code>`,
    locParts.length
      ? `<b>From:</b> ${flagEmoji(data.countryCode)} ${escapeHtml(locParts.join(", "))}`
      : null,
    data.ipAddress ? `<b>IP:</b> <code>${escapeHtml(data.ipAddress)}</code>` : null,
    browser || platform
      ? `<b>UA:</b> ${escapeHtml([browser, platform].filter(Boolean).join(" · "))}`
      : null,
    data.referrer ? `<b>From:</b> ${escapeHtml(data.referrer.slice(0, 100))}` : null,
  ].filter(Boolean) as string[]
  await safeSend(lines.join("\n"))
}
