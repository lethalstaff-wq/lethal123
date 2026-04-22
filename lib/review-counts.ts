// Review counts — matches seeded DB data (legacy + currently-visible native).
// Refresh with `node --env-file=.env.local -e "..."` when seed changes.

const TOTAL_REVIEWS = 3447

export const PRODUCT_REVIEW_COUNTS: Record<string, number> = {
  "fortnite-external": 1282,
  "temp-spoofer": 641,
  "perm-spoofer": 420,
  "streck": 325,
  "blurred": 326,
  "custom-dma-firmware": 230,
  "dma-basic": 106,
  "dma-advanced": 50,
  "dma-elite": 67,
}

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

export function getProductReviewCount(slugOrName: string): number {
  const slug = PRODUCT_NAME_TO_SLUG[slugOrName] || slugOrName
  return PRODUCT_REVIEW_COUNTS[slug] || 0
}

export function getTotalReviewCount(): number {
  return TOTAL_REVIEWS
}

export function getOrdersToday(): number {
  // Baseline 6-10 orders, ramps to 15-25 by end of day. Max caps at ~25.
  // Never returns 0 — always shows some activity in the hero badge.
  const now = new Date()
  const day = now.getUTCDate()
  const month = now.getUTCMonth()
  const year = now.getUTCFullYear()
  const hour = now.getUTCHours()
  const minute = now.getUTCMinutes()

  const daySeed = (year * 366 + month * 31 + day) % 100
  const baseline = 6 + (daySeed % 5) // 6-10 at start of day
  const ordersPerHour = 0.5 + (daySeed % 4) * 0.12 // 0.5-0.86/h
  const hoursPassed = hour + minute / 60
  const rolling = Math.floor(hoursPassed * ordersPerHour)
  const maxOrders = 20 + (daySeed % 6) // 20-25 cap
  return Math.min(baseline + rolling, maxOrders)
}
