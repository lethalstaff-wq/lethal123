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
    <div className={cn("relative rounded-2xl border border-white/[0.10] overflow-hidden bg-gradient-to-br shadow-[0_24px_60px_rgba(0,0,0,0.4)]", current.gradient)}>
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent pointer-events-none" />
      <div className="relative p-7 backdrop-blur-md bg-black/55">
        <div className="flex items-start justify-between mb-5 gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2 px-2.5 py-1 rounded-full bg-white/[0.06] border border-white/[0.10] inline-flex w-fit">
              <Crown className={cn("h-3.5 w-3.5", current.accent)} />
              <span className={cn("text-[10px] font-bold uppercase tracking-[0.15em]", current.accent)}>
                {current.label} Tier
              </span>
            </div>
            <p className="font-display text-4xl font-black text-white tracking-tight">{current.discountPercent}% off</p>
            <p className="text-[12px] text-white/65 mt-1.5">
              Lifetime spend <span className="font-bold text-white tabular-nums">£{(totalSpentPence / 100).toFixed(2)}</span>
            </p>
          </div>
          <button
            onClick={copy}
            className="shrink-0 inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/[0.08] hover:bg-white/[0.14] border border-white/[0.10] hover:border-white/[0.20] text-[11px] font-bold text-white transition-all font-mono"
            aria-label="Copy tier coupon code"
          >
            {copied ? <><Check className="h-3.5 w-3.5 text-emerald-400" /> Copied</> : <><Copy className="h-3.5 w-3.5" /> {current.couponCode}</>}
          </button>
        </div>

        {next && (
          <div className="mb-5">
            <div className="flex items-center justify-between text-[11px] mb-2 font-semibold">
              <span className="text-white/65 uppercase tracking-wider">Progress to {next.label}</span>
              <span className={cn("font-bold tabular-nums", next.accent)}>
                £{(spentToNextPence / 100).toFixed(2)} to go
              </span>
            </div>
            <div className="h-2 rounded-full bg-white/[0.08] overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-white/55 to-white/85 rounded-full transition-all duration-700 shadow-[0_0_8px_rgba(255,255,255,0.4)]"
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
          className={cn("group relative rounded-xl border border-white/[0.10] p-4 bg-gradient-to-br hover:-translate-y-1 hover:shadow-[0_18px_40px_rgba(0,0,0,0.5)] transition-all duration-300 overflow-hidden", t.gradient)}
        >
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent pointer-events-none" />
          <div className="relative backdrop-blur-md bg-black/55 rounded-lg -m-4 p-4">
            <div className="flex items-center gap-1.5 mb-2.5 px-2 py-0.5 rounded-full bg-white/[0.06] border border-white/[0.10] inline-flex w-fit">
              <Crown className={cn("h-3 w-3", t.accent)} />
              <span className={cn("text-[9px] font-bold uppercase tracking-[0.15em]", t.accent)}>{t.label}</span>
            </div>
            <p className="font-display text-2xl font-black text-white mb-1 tracking-tight">{t.discountPercent}% off</p>
            <p className="text-[11px] text-white/65">
              {t.minPence === 0 ? "Instant on signup" : `From £${(t.minPence / 100).toFixed(0)} spend`}
            </p>
          </div>
        </div>
      ))}
    </div>
  )
}
