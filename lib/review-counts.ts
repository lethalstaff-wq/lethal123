// Review counts — single source of truth
// After seed script: DB will have ~847 reviews matching these numbers

const TOTAL_REVIEWS = 847

export const PRODUCT_REVIEW_COUNTS: Record<string, number> = {
  "perm-spoofer": 152,
  "temp-spoofer": 186,
  "fortnite-external": 212,
  "blurred": 102,
  "streck": 68,
  "custom-dma-firmware": 59,
  "dma-basic": 34,
  "dma-advanced": 21,
  "dma-elite": 13,
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
  const now = new Date()
  const day = now.getUTCDate()
  const month = now.getUTCMonth()
  const year = now.getUTCFullYear()
  const hour = now.getUTCHours()
  const minute = now.getUTCMinutes()

  const daySeed = (year * 366 + month * 31 + day) % 100
  const ordersPerHour = 1.5 + (daySeed % 2) * 0.5
  const hoursPassed = hour + minute / 60
  let orders = Math.floor(hoursPassed * ordersPerHour)
  const maxOrders = 15 + (daySeed % 6)
  return Math.min(orders, maxOrders)
}
