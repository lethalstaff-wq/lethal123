// Pricing for the Telegram bot.
//
// The site stores prices in pence (GBP). In the bot we intentionally show the
// *same numeric value* but in a weaker currency so the customer feels a
// discount without the operator losing margin:
//
//   Site                Bot (EN)      Bot (RU)
//   £200                 €200          ~15 000 ₽
//   £38.50               €38.50        ~2 900 ₽
//
// EUR keeps the numeric value identical to pence/100 (a ~15% discount vs. a
// real GBP→EUR conversion). It also matches the currency Telegram's card
// provider charges in (TELEGRAM_PROVIDER_CURRENCY, default EUR).
//
// RUB multiplies pence/100 by RUB_PER_GBP_BOT (default 75 — noticeably lower
// than the real GBP→RUB rate).
//
// Stars amount is derived from the EUR price so the invoice matches what the
// user sees, via STARS_PER_EUR_BOT (default 50).
//
// All rates are env-configurable so the operator can tune without redeploying.

const DEFAULT_RUB_PER_GBP_BOT = 75
const DEFAULT_STARS_PER_EUR_BOT = 50

export type BotCurrency = "EUR" | "RUB"

export function rubPerGbp(): number {
  const raw = process.env.RUB_PER_GBP_BOT
  if (!raw) return DEFAULT_RUB_PER_GBP_BOT
  const n = Number(raw)
  if (!Number.isFinite(n) || n <= 0) return DEFAULT_RUB_PER_GBP_BOT
  return n
}

export function starsPerEur(): number {
  const raw = process.env.STARS_PER_EUR_BOT || process.env.STARS_PER_USD_BOT
  if (!raw) return DEFAULT_STARS_PER_EUR_BOT
  const n = Number(raw)
  if (!Number.isFinite(n) || n <= 0) return DEFAULT_STARS_PER_EUR_BOT
  return n
}

// EUR bot price: exact same numeric value as the site's GBP price.
export function penceToEur(priceInPence: number): number {
  return priceInPence / 100
}

// RUB bot price: rounded to the nearest 100 so the price looks clean.
export function penceToRub(priceInPence: number): number {
  const raw = (priceInPence / 100) * rubPerGbp()
  return Math.round(raw / 100) * 100
}

// Stars invoice amount based on EUR bot price.
export function penceToStars(priceInPence: number): number {
  const stars = Math.ceil(penceToEur(priceInPence) * starsPerEur())
  return Math.max(1, stars)
}

export function formatEur(amount: number): string {
  const fractional = amount % 1 !== 0
  return `€${amount.toFixed(fractional ? 2 : 0)}`
}

export function formatRub(amount: number): string {
  // 15000 → "15 000 ₽"
  const parts = Math.round(amount)
    .toString()
    .split("")
    .reverse()
  const out: string[] = []
  for (let i = 0; i < parts.length; i++) {
    if (i > 0 && i % 3 === 0) out.push(" ")
    out.push(parts[i])
  }
  return `${out.reverse().join("")} ₽`
}

export function formatStars(amount: number): string {
  return `${amount} ⭐`
}

// Formats the bot-side price for the chosen currency.
export function formatBotPrice(priceInPence: number, currency: BotCurrency): string {
  if (currency === "RUB") return formatRub(penceToRub(priceInPence))
  return formatEur(penceToEur(priceInPence))
}
