// Per-product review counts — source of truth
// These are base counts as of 2026-04-01. They grow dynamically via getProductReviewCount().

export const PRODUCT_REVIEW_COUNTS: Record<string, number> = {
  "perm-spoofer": 487,
  "temp-spoofer": 234,
  "fortnite-external": 356,
  "blurred": 412,
  "streck": 178,
  "custom-dma-firmware": 145,
  "dma-basic": 67,
  "dma-advanced": 93,
  "dma-elite": 41,
}

// Map product display names to slugs for lookup
export const PRODUCT_NAME_TO_SLUG: Record<string, string> = {
  "Perm Spoofer": "perm-spoofer",
  "Temp Spoofer": "temp-spoofer",
  "Fortnite External": "fortnite-external",
  "Blurred DMA Cheat": "blurred",
  "Blurred DMA": "blurred",
  "Streck DMA Cheat": "streck",
  "Custom DMA Firmware": "custom-dma-firmware",
  "DMA Basic Bundle": "dma-basic",
  "DMA Advanced Bundle": "dma-advanced",
  "DMA Elite Bundle": "dma-elite",
}

const BASE_DATE = new Date("2026-04-01")

/**
 * Returns the review count for a product, growing slightly each day.
 */
export function getProductReviewCount(slugOrName: string): number {
  const slug = PRODUCT_NAME_TO_SLUG[slugOrName] || slugOrName
  const base = PRODUCT_REVIEW_COUNTS[slug]
  if (!base) return 0

  const now = new Date()
  const daysSince = Math.max(0, Math.floor((now.getTime() - BASE_DATE.getTime()) / 86400000))
  const dailyGrowth = base > 300 ? 3 : base > 150 ? 2 : 1
  return base + daysSince * dailyGrowth
}

/** Total review count — uses generated reviews length + a base offset for "pre-generator" reviews */
export function getTotalReviewCount(): number {
  // Lazy import to avoid circular deps — just estimate based on days
  const now = new Date()
  const genStart = new Date("2025-04-01")
  const totalDays = Math.max(0, Math.floor((now.getTime() - genStart.getTime()) / 86400000))
  // Average ~18 reviews/day growing over time, plus today's orders
  const avgPerDay = 12 + (totalDays / 365) * 10
  return Math.round(totalDays * avgPerDay) + getOrdersToday()
}

/**
 * Simulated orders today — grows 3-5 per hour from midnight, consistent for all users.
 */
export function getOrdersToday(): number {
  const now = new Date()
  const day = now.getUTCDate()
  const month = now.getUTCMonth()
  const year = now.getUTCFullYear()
  const hour = now.getUTCHours()
  const minute = now.getUTCMinutes()

  const daySeed = (year * 366 + month * 31 + day) % 100
  const ordersPerHour = 3 + (daySeed % 3)
  const hoursPassed = hour + minute / 60
  let orders = Math.floor(hoursPassed * ordersPerHour)
  const maxOrders = 30 + (daySeed % 12)
  return Math.min(orders, maxOrders)
}
