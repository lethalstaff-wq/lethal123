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
 * Growth rate is proportional to the product's popularity.
 */
export function getProductReviewCount(slugOrName: string): number {
  const slug = PRODUCT_NAME_TO_SLUG[slugOrName] || slugOrName
  const base = PRODUCT_REVIEW_COUNTS[slug]
  if (!base) return 0

  const now = new Date()
  const daysSince = Math.max(0, Math.floor((now.getTime() - BASE_DATE.getTime()) / 86400000))

  // Popular products grow faster (1-3 reviews/day based on base count)
  const dailyGrowth = base > 300 ? 3 : base > 150 ? 2 : 1
  return base + daysSince * dailyGrowth
}

/** Total review count across all products */
export function getTotalReviewCount(): number {
  const base = Object.keys(PRODUCT_REVIEW_COUNTS).reduce(
    (sum, slug) => sum + getProductReviewCount(slug),
    0
  )
  // Add today's orders as pending reviews (each order = 1 review after delivery)
  return base + getOrdersToday()
}

/**
 * Simulated orders today — grows 2-3 per hour from midnight, consistent for all users.
 * Used both in hero/orders counter and to grow review count in real-time.
 */
export function getOrdersToday(): number {
  const now = new Date()
  const day = now.getUTCDate()
  const month = now.getUTCMonth()
  const year = now.getUTCFullYear()
  const hour = now.getUTCHours()
  const minute = now.getUTCMinutes()

  const daySeed = (year * 366 + month * 31 + day) % 100
  const ordersPerHour = 2 + (daySeed % 2)
  const hoursPassed = hour + minute / 60
  let orders = Math.floor(hoursPassed * ordersPerHour)
  const maxOrders = 12 + (daySeed % 6)
  return Math.min(orders, maxOrders)
}
