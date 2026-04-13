"use client"

import { Crown, Check, Copy, Sparkles } from "lucide-react"
import { useState } from "react"
import { cn } from "@/lib/utils"
import { getLoyaltyStatus, LOYALTY_TIERS } from "@/lib/loyalty"

export function LoyaltyCard({ totalSpentPence }: { totalSpentPence: number }) {
  const { current, next, progressPct, spentToNextPence } = getLoyaltyStatus(totalSpentPence)
  const [copied, setCopied] = useState(false)

  const copy = () => {
    navigator.clipboard.writeText(current.couponCode)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <div className={cn("rounded-2xl border border-white/[0.06] overflow-hidden bg-gradient-to-br", current.gradient)}>
      <div className="p-6 backdrop-blur-sm bg-black/30">
        <div className="flex items-start justify-between mb-5 gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <Crown className={cn("h-4 w-4", current.accent)} />
              <span className={cn("text-[11px] font-bold uppercase tracking-wider", current.accent)}>
                {current.label} Tier
              </span>
            </div>
            <p className="text-3xl font-black text-white">{current.discountPercent}% off</p>
            <p className="text-xs text-white/60 mt-1">
              Lifetime spend £{(totalSpentPence / 100).toFixed(2)}
            </p>
          </div>
          <button
            onClick={copy}
            className="shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/[0.06] hover:bg-white/[0.10] text-[11px] font-bold text-white/80 transition-colors font-mono"
            aria-label="Copy tier coupon code"
          >
            {copied ? <><Check className="h-3 w-3 text-emerald-400" /> Copied</> : <><Copy className="h-3 w-3" /> {current.couponCode}</>}
          </button>
        </div>

        {next && (
          <div className="mb-5">
            <div className="flex items-center justify-between text-[11px] mb-1.5">
              <span className="text-white/60">Progress to {next.label}</span>
              <span className={cn("font-semibold", next.accent)}>
                £{(spentToNextPence / 100).toFixed(2)} to go
              </span>
            </div>
            <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-white/40 to-white/70 rounded-full transition-all duration-700"
                style={{ width: `${progressPct}%` }}
              />
            </div>
          </div>
        )}

        <ul className="space-y-1.5">
          {current.perks.map((p, i) => (
            <li key={i} className="flex items-start gap-2 text-[12.5px] text-white/75">
              <Sparkles className={cn("h-3 w-3 mt-0.5 shrink-0", current.accent)} />
              <span>{p}</span>
            </li>
          ))}
        </ul>

        {next && (
          <div className="mt-5 pt-4 border-t border-white/[0.08]">
            <p className="text-[11px] text-white/50 mb-2">Unlock at {next.label}:</p>
            <div className="flex flex-wrap gap-2">
              {next.perks.filter(p => !current.perks.includes(p)).map((p, i) => (
                <span key={i} className="text-[10.5px] px-2 py-0.5 rounded-full bg-white/[0.06] text-white/60">
                  {p}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export function LoyaltyTiersPreview() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {LOYALTY_TIERS.map((t) => (
        <div
          key={t.id}
          className={cn("rounded-xl border border-white/[0.06] p-4 bg-gradient-to-br", t.gradient)}
        >
          <div className="backdrop-blur-sm bg-black/30 rounded-lg -m-4 p-4">
            <div className="flex items-center gap-1.5 mb-2">
              <Crown className={cn("h-3.5 w-3.5", t.accent)} />
              <span className={cn("text-[10px] font-bold uppercase tracking-wider", t.accent)}>{t.label}</span>
            </div>
            <p className="text-xl font-black text-white mb-1">{t.discountPercent}% off</p>
            <p className="text-[11px] text-white/50">
              {t.minPence === 0 ? "Instant on signup" : `From £${(t.minPence / 100).toFixed(0)} spend`}
            </p>
          </div>
        </div>
      ))}
    </div>
  )
}
