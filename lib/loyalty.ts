export interface LoyaltyTier {
  id: "bronze" | "silver" | "gold" | "platinum"
  label: string
  minPence: number
  discountPercent: number
  perks: string[]
  gradient: string
  accent: string
  couponCode: string
}

export const LOYALTY_TIERS: LoyaltyTier[] = [
  {
    id: "bronze",
    label: "Bronze",
    minPence: 0,
    discountPercent: 5,
    perks: ["5% off all orders", "Priority Discord channel"],
    gradient: "from-amber-700/40 to-amber-900/20",
    accent: "text-amber-400",
    couponCode: "BRONZE5",
  },
  {
    id: "silver",
    label: "Silver",
    minPence: 10000,
    discountPercent: 7,
    perks: ["7% off all orders", "Priority Discord channel", "Early access to patches"],
    gradient: "from-slate-400/40 to-slate-600/20",
    accent: "text-slate-200",
    couponCode: "SILVER7",
  },
  {
    id: "gold",
    label: "Gold",
    minPence: 50000,
    discountPercent: 10,
    perks: ["10% off all orders", "VIP Discord role", "Early access to patches", "Free lifetime upgrade once"],
    gradient: "from-yellow-500/40 to-amber-700/20",
    accent: "text-yellow-300",
    couponCode: "GOLD10",
  },
  {
    id: "platinum",
    label: "Platinum",
    minPence: 150000,
    discountPercent: 15,
    perks: ["15% off all orders", "Dedicated account manager", "Priority patch access", "Free hardware replacements", "Invite-only beta features"],
    gradient: "from-violet-400/40 to-violet-700/20",
    accent: "text-violet-300",
    couponCode: "PLATINUM15",
  },
]

export interface LoyaltyStatus {
  current: LoyaltyTier
  next: LoyaltyTier | null
  totalSpentPence: number
  progressPct: number
  spentToNextPence: number
}

export function getLoyaltyStatus(totalSpentPence: number): LoyaltyStatus {
  const spent = Math.max(0, Math.floor(totalSpentPence))
  let current = LOYALTY_TIERS[0]
  for (const tier of LOYALTY_TIERS) {
    if (spent >= tier.minPence) current = tier
  }
  const currentIdx = LOYALTY_TIERS.findIndex((t) => t.id === current.id)
  const next = currentIdx < LOYALTY_TIERS.length - 1 ? LOYALTY_TIERS[currentIdx + 1] : null

  let progressPct = 100
  let spentToNextPence = 0
  if (next) {
    const range = next.minPence - current.minPence
    const into = spent - current.minPence
    progressPct = Math.min(100, Math.max(0, Math.round((into / range) * 100)))
    spentToNextPence = Math.max(0, next.minPence - spent)
  }
  return { current, next, totalSpentPence: spent, progressPct, spentToNextPence }
}
