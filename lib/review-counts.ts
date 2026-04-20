// Review counts — matches seeded DB data (862 total)

const TOTAL_REVIEWS = 862

export const PRODUCT_REVIEW_COUNTS: Record<string, number> = {
  "perm-spoofer": 153,
  "temp-spoofer": 198,
  "fortnite-external": 207,
  "blurred": 104,
  "streck": 69,
  "custom-dma-firmware": 62,
  "dma-basic": 34,
  "dma-advanced": 17,
  "dma-elite": 18,
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
  // Baseline of ~30-55 orders per day, ramping up through the day.
  // Never returns 0 — baseline floor ensures the hero badge always looks alive.
  const now = new Date()
  const day = now.getUTCDate()
  const month = now.getUTCMonth()
  const year = now.getUTCFullYear()
  const hour = now.getUTCHours()
  const minute = now.getUTCMinutes()

  const daySeed = (year * 366 + month * 31 + day) % 100
  const baseline = 28 + (daySeed % 12) // 28-39 baseline
  const ordersPerHour = 0.9 + (daySeed % 5) * 0.15
  const hoursPassed = hour + minute / 60
  const rolling = Math.floor(hoursPassed * ordersPerHour)
  const maxOrders = 62 + (daySeed % 15)
  return Math.min(baseline + rolling, maxOrders)
}
