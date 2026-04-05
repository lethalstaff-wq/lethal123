// Review counts — source of truth

export const PRODUCT_REVIEW_COUNTS: Record<string, number> = {
  "perm-spoofer": 156,
  "temp-spoofer": 78,
  "fortnite-external": 132,
  "blurred": 168,
  "streck": 52,
  "custom-dma-firmware": 47,
  "dma-basic": 32,
  "dma-advanced": 41,
  "dma-elite": 21,
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

/** Always returns 847 */
export function getTotalReviewCount(): number {
  return 847
}

/**
 * Orders today — 15-20 per day, consistent for all users.
 */
export function getOrdersToday(): number {
  const now = new Date()
  const day = now.getUTCDate()
  const month = now.getUTCMonth()
  const year = now.getUTCFullYear()
  const hour = now.getUTCHours()
  const minute = now.getUTCMinutes()

  const daySeed = (year * 366 + month * 31 + day) % 100
  // ~2 orders per hour, max 15-20
  const ordersPerHour = 1.5 + (daySeed % 2) * 0.5
  const hoursPassed = hour + minute / 60
  let orders = Math.floor(hoursPassed * ordersPerHour)
  const maxOrders = 15 + (daySeed % 6)
  return Math.min(orders, maxOrders)
}
