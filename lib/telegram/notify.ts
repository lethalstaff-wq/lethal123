// Forwards events (orders, contact messages, staff applications, bot purchases)
// to a private Telegram admin chat. The chat ID is taken from env
// TELEGRAM_ADMIN_CHAT_ID — use @userinfobot or @RawDataBot to find your ID,
// or create a group with the bot and use the negative group ID.
//
// This helper is a no-op when TELEGRAM_BOT_TOKEN or TELEGRAM_ADMIN_CHAT_ID are
// missing, so the rest of the site keeps working even before you configure it.

import { escapeHtml, sendMessage } from "@/lib/telegram/client"
import { parseUA } from "@/lib/telegram/ua-parser"

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
  timezone?: string
  latitude?: string
  longitude?: string
  asn?: string
  userAgent?: string
  acceptLanguage?: string
  referrer?: string
  // Client Hints (from Sec-CH-UA-* headers)
  chPlatform?: string
  chPlatformVersion?: string
  chArch?: string
  chBitness?: string
  chMobile?: string
  chModel?: string
}

function decodeMaybe(value: string | undefined): string | undefined {
  if (!value) return value
  try {
    return decodeURIComponent(value)
  } catch {
    return value
  }
}

function trimAndStripQuotes(value: string | undefined): string | undefined {
  if (!value) return value
  return value.replace(/^"|"$/g, "")
}

export async function notifyVisitor(data: VisitorNotification) {
  const ua = parseUA(data.userAgent)
  const isMobile = ua.device === "Mobile" || ua.device === "Tablet"
  const headEmoji = ua.device === "Bot" ? "🤖" : isMobile ? "📱" : "💻"

  const city = decodeMaybe(data.city)
  const region = decodeMaybe(data.region)
  const country = decodeMaybe(data.country)
  const locParts = [city, region, country].filter(Boolean) as string[]

  // Pretty preferred language ("en-US,ru;q=0.9" → "en-US, ru")
  const langs = (data.acceptLanguage || "")
    .split(",")
    .map((p) => p.split(";")[0].trim())
    .filter(Boolean)
    .slice(0, 3)
    .join(", ")

  // Build the device line: "Chrome 121 · Windows 11 · Desktop"
  const chPlatform = trimAndStripQuotes(data.chPlatform)
  const chPlatformVersion = trimAndStripQuotes(data.chPlatformVersion)
  const osWithVersion =
    chPlatform && chPlatformVersion ? `${chPlatform} ${chPlatformVersion}` : ua.os
  const deviceParts = [ua.browser, osWithVersion, ua.device].filter(Boolean) as string[]
  if (ua.engine) deviceParts.push(ua.engine)
  if (ua.vendor) deviceParts.push(ua.vendor)
  const arch = trimAndStripQuotes(data.chArch)
  const bitness = trimAndStripQuotes(data.chBitness)
  if (arch || bitness) deviceParts.push([arch, bitness && `${bitness}-bit`].filter(Boolean).join(" "))
  const model = trimAndStripQuotes(data.chModel)
  if (model) deviceParts.push(model)

  const lines = [
    `${headEmoji} <b>New visitor</b>`,
    "",
    `<b>Page:</b> <code>${escapeHtml(data.path)}</code>`,
    locParts.length
      ? `<b>Location:</b> ${flagEmoji(data.countryCode)} ${escapeHtml(locParts.join(", "))}`
      : null,
    data.timezone ? `<b>Timezone:</b> ${escapeHtml(data.timezone)}` : null,
    data.latitude && data.longitude
      ? `<b>Coords:</b> <code>${escapeHtml(data.latitude)}, ${escapeHtml(data.longitude)}</code>`
      : null,
    data.ipAddress
      ? `<b>IP:</b> <code>${escapeHtml(data.ipAddress)}</code>${data.asn ? ` <i>(AS${escapeHtml(data.asn)})</i>` : ""}`
      : null,
    `<b>Device:</b> ${escapeHtml(deviceParts.join(" · "))}`,
    langs ? `<b>Lang:</b> ${escapeHtml(langs)}` : null,
    data.referrer ? `<b>Referrer:</b> ${escapeHtml(data.referrer.slice(0, 120))}` : null,
  ].filter(Boolean) as string[]
  await safeSend(lines.join("\n"))
}

// Extra info posted by a tiny client-side beacon (window.screen, color
// scheme, hardware concurrency, etc.). Sent as a follow-up to the original
// visitor notification, keyed by visitor session id so the operator can
// see they belong to the same person.
export interface VisitorExtrasNotification {
  visitorId?: string
  path?: string
  ipAddress?: string
  // Display
  screenWidth?: number
  screenHeight?: number
  windowWidth?: number
  windowHeight?: number
  pixelRatio?: number
  colorScheme?: "light" | "dark" | "no-preference"
  // Hardware
  cpuCores?: number
  deviceMemory?: number // GB
  touchSupport?: boolean
  // Network
  connectionType?: string // "wifi" / "cellular" / "ethernet"
  effectiveType?: string // "4g" / "3g" / "slow-2g"
  downlink?: number // Mbit/s
  // Locale
  language?: string
  timezone?: string
  // GPU (from WebGL UNMASKED_RENDERER_WEBGL)
  gpu?: string
  // Battery (deprecated in many browsers, best-effort)
  batteryLevel?: number
  batteryCharging?: boolean
}

export async function notifyVisitorExtras(data: VisitorExtrasNotification) {
  const lines: string[] = ["📊 <b>Visitor device details</b>"]
  if (data.path) lines.push(`<b>Page:</b> <code>${escapeHtml(data.path)}</code>`)
  if (data.ipAddress) lines.push(`<b>IP:</b> <code>${escapeHtml(data.ipAddress)}</code>`)
  lines.push("")

  if (data.screenWidth && data.screenHeight) {
    const ratio = data.pixelRatio ? ` @${data.pixelRatio}x` : ""
    lines.push(`<b>Screen:</b> ${data.screenWidth}×${data.screenHeight}${ratio}`)
  }
  if (data.windowWidth && data.windowHeight) {
    lines.push(`<b>Window:</b> ${data.windowWidth}×${data.windowHeight}`)
  }
  if (data.colorScheme) {
    const themeEmoji = data.colorScheme === "dark" ? "🌙" : data.colorScheme === "light" ? "☀️" : "—"
    lines.push(`<b>Theme:</b> ${themeEmoji} ${escapeHtml(data.colorScheme)}`)
  }
  const hwBits: string[] = []
  if (data.cpuCores) hwBits.push(`${data.cpuCores} CPU`)
  if (data.deviceMemory) hwBits.push(`${data.deviceMemory} GB RAM`)
  if (typeof data.touchSupport === "boolean") hwBits.push(data.touchSupport ? "touch" : "no touch")
  if (hwBits.length) lines.push(`<b>Hardware:</b> ${escapeHtml(hwBits.join(" · "))}`)

  if (data.gpu) lines.push(`<b>GPU:</b> ${escapeHtml(data.gpu.slice(0, 100))}`)

  const netBits: string[] = []
  if (data.effectiveType) netBits.push(data.effectiveType)
  if (data.connectionType) netBits.push(data.connectionType)
  if (data.downlink) netBits.push(`${data.downlink} Mbit/s`)
  if (netBits.length) lines.push(`<b>Network:</b> ${escapeHtml(netBits.join(" · "))}`)

  if (data.language) lines.push(`<b>Lang:</b> ${escapeHtml(data.language)}`)
  if (data.timezone) lines.push(`<b>Timezone:</b> ${escapeHtml(data.timezone)}`)

  if (typeof data.batteryLevel === "number") {
    const charging = data.batteryCharging ? "⚡" : ""
    lines.push(`<b>Battery:</b> ${Math.round(data.batteryLevel * 100)}% ${charging}`)
  }

  await safeSend(lines.join("\n"))
}
