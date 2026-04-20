// Fallback statistics — used if live data fails or while computing
// These are the canonical "display values" for marketing/hero sections

export const FALLBACK_STATS = {
  // Home
  ordersToday: 47,
  reviewsCount: 862,
  undetectedRate: 99.8,
  patchTimeHours: 2,
  uniqueBuilds: 2400,
  monitoringHours: 24,
  monitoringDays: 7,
  responseMinutes: 5,
  countriesCount: 73,
  discordOnline: 3147,
  discordMembers: 9248,
  // Apply
  teamMembers: 18,
  happyClients: 9248,
  satisfactionPercent: 99,
  supportHoursPerDay: 24,
  supportDaysPerWeek: 7,
  openPositions: 10,
} as const

// Bundle prices (canonical — match /products and /lib/db-products.ts)
export const FALLBACK_BUNDLES = {
  basic: 425,
  advanced: 675,
  elite: 1500,
} as const
