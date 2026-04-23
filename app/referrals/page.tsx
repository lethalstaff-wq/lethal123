"use client"

import { useState, useEffect } from "react"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import {
  Users,
  Coins,
  Copy,
  Check,
  Share2,
  ArrowRight,
  Loader2,
  CheckCircle2,
  Clock,
  Trophy,
  Medal,
  Crown,
  Star,
  Flame,
  Gem,
  Sparkles
} from "lucide-react"
import { cn } from "@/lib/utils"
import { createClient } from "@/lib/supabase/client"
import { SectionEyebrow } from "@/components/section-eyebrow"
import { LoyaltyTierCard } from "@/components/loyalty-tier-card"
import { ReferralsLeaderboard } from "@/components/referrals-leaderboard"
import { useRouter } from "next/navigation"

interface Referral {
  id: string
  referred_email: string
  status: string
  reward_amount: number
  created_at: string
}

export default function ReferralsPage() {
  const [loading, setLoading] = useState(true)
  const [referralCode, setReferralCode] = useState("")
  const [referrals, setReferrals] = useState<Referral[]>([])
  const [totalEarned, setTotalEarned] = useState(0)
  const [copied, setCopied] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const fetchData = async () => {
      // Supabase might not be configured locally — gracefully fall back to
      // logged-out view so the page still renders the leaderboard + program info.
      if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
        setIsLoggedIn(false); setLoading(false); return
      }
      try {
        const supabase = createClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) { setIsLoggedIn(false); setLoading(false); return }
        setIsLoggedIn(true)

        const { data: existingReferral } = await supabase
          .from("referrals")
          .select("referral_code")
          .eq("referrer_id", user.id)
          .limit(1)
          .single()
        if (existingReferral) setReferralCode(existingReferral.referral_code)
        else setReferralCode(`REF-${user.id.slice(0, 8).toUpperCase()}`)

        const { data: referralsData } = await supabase
          .from("referrals")
          .select("*")
          .eq("referrer_id", user.id)
          .order("created_at", { ascending: false })
        if (referralsData) {
          setReferrals(referralsData)
          const earned = referralsData
            .filter(r => r.status === "rewarded")
            .reduce((acc, r) => acc + (r.reward_amount || 0), 0)
          setTotalEarned(earned)
        }
      } catch {
        setIsLoggedIn(false)
      }
      setLoading(false)
    }
    fetchData()
  }, [])

  const copyCode = () => {
    navigator.clipboard.writeText(`https://lethalsolutions.com?ref=${referralCode}`)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const shareLink = `https://lethalsolutions.com?ref=${referralCode}`

  if (loading) {
    return (
      <main className="min-h-screen bg-transparent flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#f97316]" />
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-transparent">
      <Navbar />

      {/* Hero */}
      <section className="relative pt-32 pb-16 overflow-hidden">
        <div className="container mx-auto px-4 relative">
          <div className="max-w-2xl mx-auto text-center">
            <SectionEyebrow label="Referral Program" />
            <div className="relative h-px w-44 mx-auto mb-7 bg-white/[0.05] overflow-hidden">
              <div className="absolute inset-y-0 w-24 bg-gradient-to-r from-transparent via-[#f97316]/70 to-transparent" style={{ animation: "heroScan 4s ease-in-out infinite" }} />
            </div>
            <h1 className="font-display text-5xl sm:text-6xl md:text-7xl font-bold tracking-[-0.04em] leading-[0.95] mb-6">
              <span style={{ background: "linear-gradient(180deg, rgba(255,255,255,1), rgba(180,180,195,0.85))", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Earn </span>
              <span style={{ background: "linear-gradient(180deg, #ffb366 0%, #f97316 45%, #c2410c 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", filter: "drop-shadow(0 0 50px rgba(249, 115, 22, 0.43))" }}>Rewards</span>
            </h1>
            <p className="text-[17px] text-white/55 max-w-xl mx-auto leading-relaxed mb-8">
              Invite friends and earn 10% commission on every purchase they make
            </p>

            {/* Hero CTA — only shown to logged-out users, so it's the first thing they see */}
            {!isLoggedIn && (
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <button
                  onClick={() => router.push("/login")}
                  data-cursor="cta"
                  data-cursor-label="Start"
                  className="cursor-cta press-spring group relative overflow-hidden inline-flex items-center gap-2 px-7 py-3.5 rounded-xl bg-gradient-to-br from-[#f97316] to-[#ea580c] text-white font-bold text-[14px] shadow-[0_0_28px_rgba(249,115,22,0.35)] hover:shadow-[0_0_50px_rgba(249,115,22,0.6)] hover:-translate-y-0.5 transition-all"
                >
                  <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full bg-gradient-to-r from-transparent via-white/30 to-transparent transition-transform duration-1000 pointer-events-none" />
                  <span className="relative z-10">Get your referral link</span>
                  <ArrowRight className="relative z-10 h-4 w-4" />
                </button>
                <a
                  href="#tiers"
                  className="inline-flex items-center gap-1.5 px-5 py-3 rounded-xl text-white/70 hover:text-white text-[13px] font-semibold transition-colors"
                >
                  See tiers &amp; rewards
                </a>
              </div>
            )}

            {/* How it works */}
            <div className="grid md:grid-cols-3 gap-4 mt-12">
              <div className="p-6 rounded-2xl bg-white/[0.012] border border-white/[0.04]">
                <div className="w-12 h-12 rounded-xl bg-[#f97316]/10 flex items-center justify-center mx-auto mb-4">
                  <Share2 className="h-6 w-6 text-[#f97316]" />
                </div>
                <h3 className="font-bold text-white mb-2">1. Share Link</h3>
                <p className="text-sm text-white/55">Share your unique referral link with friends</p>
              </div>
              <div className="p-6 rounded-2xl bg-white/[0.012] border border-white/[0.04]">
                <div className="w-12 h-12 rounded-xl bg-[#f97316]/10 flex items-center justify-center mx-auto mb-4">
                  <Users className="h-6 w-6 text-[#f97316]" />
                </div>
                <h3 className="font-bold text-white mb-2">2. Friends Purchase</h3>
                <p className="text-sm text-white/55">When they make a purchase using your link</p>
              </div>
              <div className="p-6 rounded-2xl bg-white/[0.012] border border-white/[0.04]">
                <div className="w-12 h-12 rounded-xl bg-[#f97316]/10 flex items-center justify-center mx-auto mb-4">
                  <Coins className="h-6 w-6 text-[#f97316]" />
                </div>
                <h3 className="font-bold text-white mb-2">3. Earn 10%</h3>
                <p className="text-sm text-white/55">Get 10% of their purchase as store credit</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Tier System */}
      <section id="tiers" className="pb-16 pt-4 scroll-mt-24">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-2xl sm:text-3xl font-display font-bold tracking-[-0.03em] text-center text-white mb-2">
              Referral <span style={{ background: "linear-gradient(180deg, #ffb366 0%, #f97316 45%, #c2410c 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Tiers</span>
            </h2>
            <p className="text-center text-white/50 text-[14px] mb-10">The more friends you bring, the more you earn.</p>

            {/* Desktop: 4-col with Gold dominant in the middle. Mobile: stacked column with Gold first (flex-reorder). */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 md:gap-5 md:items-stretch">
              {[
                { name: "Bronze", icon: Medal, color: "text-amber-600", hex: "#d97706", bg: "bg-amber-600/10", border: "border-amber-600/25", refs: "1-5", commission: "10%", perks: ["10% commission", "Standard support", "Monthly payouts"], featured: false, mobileOrder: 3, rotate: "rotate-0", boost: false },
                { name: "Silver", icon: Star, color: "text-gray-300", hex: "#d1d5db", bg: "bg-gray-300/10", border: "border-gray-300/25", refs: "6-15", commission: "12%", perks: ["12% commission", "Priority support", "Weekly payouts", "Early access"], featured: false, mobileOrder: 2, rotate: "rotate-0", boost: false },
                { name: "Gold", icon: Crown, color: "text-yellow-400", hex: "#facc15", bg: "bg-yellow-400/15", border: "border-yellow-400/50", refs: "16-40", commission: "15%", perks: ["15% commission", "VIP Discord channel", "Instant payouts", "Custom referral code", "Free product testing"], featured: true, mobileOrder: 0, rotate: "rotate-0", boost: true },
                { name: "Platinum", icon: Gem, color: "text-cyan-300", hex: "#67e8f9", bg: "bg-cyan-300/10", border: "border-cyan-300/40", refs: "40+", commission: "20%", perks: ["20% commission", "Dedicated manager", "Co-marketing slots", "Lifetime perks", "First dibs on new tiers"], featured: false, mobileOrder: 1, rotate: "md:-rotate-[1deg]", boost: true },
              ].map((tier) => (
                <div
                  key={tier.name}
                  className={cn(
                    "p-6 rounded-2xl border bg-white/[0.012] relative overflow-hidden transition-all duration-500 md:!order-none",
                    // Mobile-order — Gold first, Platinum second, Silver third, Bronze last
                    tier.mobileOrder === 0 && "order-1",
                    tier.mobileOrder === 1 && "order-2",
                    tier.mobileOrder === 2 && "order-3",
                    tier.mobileOrder === 3 && "order-4",
                    tier.border,
                    tier.rotate,
                    tier.featured && "md:pt-16 md:-mt-6 md:mb-2 shadow-[0_0_40px_rgba(249,115,22,0.3)] border-[#f97316]/50 bg-gradient-to-b from-[#f97316]/[0.08] via-white/[0.015] to-white/[0.012]",
                    !tier.featured && "md:mt-4"
                  )}
                >
                  {tier.featured && (
                    <>
                      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#f97316] to-transparent" />
                      <div className="absolute -top-px left-1/2 -translate-x-1/2 px-3 py-1 rounded-b-lg bg-[#f97316] text-white text-[10px] font-black tracking-[0.18em] uppercase shadow-[0_4px_20px_rgba(249,115,22,0.6)]">
                        <span className="inline-flex items-center gap-1"><Sparkles className="h-3 w-3" /> Most popular</span>
                      </div>
                    </>
                  )}
                  {tier.name === "Platinum" && (
                    <div className="absolute top-3 right-3 px-2 py-0.5 rounded-full bg-cyan-300/15 border border-cyan-300/30 text-cyan-300 text-[9px] font-black tracking-[0.18em] uppercase">New</div>
                  )}

                  {/* Radial glow for featured tiers */}
                  {tier.boost && (
                    <div
                      className="absolute inset-0 pointer-events-none opacity-90"
                      style={{ background: `radial-gradient(ellipse 70% 50% at 50% 0%, ${tier.hex}22, transparent 65%)` }}
                    />
                  )}

                  <div className="relative">
                    <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center mb-4 border border-white/[0.04]", tier.bg)} style={tier.featured ? { boxShadow: `0 0 22px ${tier.hex}40, inset 0 1px 0 rgba(255,255,255,0.08)` } : undefined}>
                      <tier.icon className={cn("h-6 w-6", tier.color)} style={tier.featured ? { filter: `drop-shadow(0 0 10px ${tier.hex}aa)` } : undefined} />
                    </div>
                    <h3 className={cn("font-display font-bold mb-1 tracking-tight", tier.featured ? "text-xl" : "text-lg text-white")}
                        style={tier.featured ? { color: tier.hex } : undefined}>
                      {tier.name}
                    </h3>
                    <p className="text-sm text-white/50 mb-1 tabular-nums">{tier.refs} referrals</p>
                    <p className={cn("font-black mb-4 tabular-nums", tier.featured ? "text-3xl" : "text-2xl", tier.color)}>{tier.commission}</p>
                    <ul className="space-y-2">
                      {tier.perks.map((perk) => (
                        <li key={perk} className="flex items-start gap-2 text-[13px] text-white/60">
                          <CheckCircle2 className={cn("h-3.5 w-3.5 shrink-0 mt-[2px]", tier.featured ? "text-[#f97316]" : "text-white/40")} />
                          <span>{perk}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Leaderboard */}
      <section className="pb-12">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto">
            <div className="rounded-2xl border border-white/[0.04] bg-white/[0.012] overflow-hidden">
              <div className="p-5 border-b border-white/[0.04] flex items-center justify-between">
                <h2 className="font-bold text-white flex items-center gap-2">
                  <Flame className="h-5 w-5 text-[#f97316]" />
                  Top Referrers
                </h2>
                <span className="text-xs text-white/55">This month</span>
              </div>
              {(() => {
                const entries = [
                  { rank: 1, name: "dr***@gmail.com", refs: 23, value: 187.5, tier: "Gold" },
                  { rank: 2, name: "ky***@proton.me", refs: 18, value: 142.2, tier: "Gold" },
                  { rank: 3, name: "wr***@gmail.com", refs: 14, value: 98.7,  tier: "Silver" },
                  { rank: 4, name: "nx***@outlook.com", refs: 11, value: 76.3, tier: "Silver" },
                  { rank: 5, name: "bl***@yahoo.com", refs: 8, value: 52.4,   tier: "Silver" },
                ]
                const max = Math.max(...entries.map((e) => e.value))
                return (
                  <div className="divide-y divide-white/[0.03]">
                    {entries.map((entry) => {
                      const pct = Math.max(8, Math.round((entry.value / max) * 100))
                      const isTop3 = entry.rank <= 3
                      return (
                        <div key={entry.rank} className="p-4 flex items-center gap-4 hover:bg-white/[0.02] transition-colors">
                          <div className={cn(
                            "w-8 h-8 rounded-full flex items-center justify-center text-sm font-black shrink-0 tabular-nums",
                            entry.rank === 1 ? "bg-yellow-400/20 text-yellow-400" :
                            entry.rank === 2 ? "bg-gray-300/20 text-gray-300" :
                            entry.rank === 3 ? "bg-amber-600/20 text-amber-600" :
                            "bg-white/[0.04] text-white/55"
                          )}>
                            {entry.rank}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-sm truncate text-white">{entry.name}</p>
                            <p className="text-[11px] text-white/50 tabular-nums">{entry.refs} refs &middot; {entry.tier}</p>
                            <div className="mt-2 relative h-[5px] rounded-full bg-white/[0.04] overflow-hidden">
                              <div
                                className="absolute inset-y-0 left-0 rounded-full"
                                style={{
                                  width: `${pct}%`,
                                  background: isTop3
                                    ? "linear-gradient(90deg, rgba(249,115,22,0.9), rgba(234,88,12,1))"
                                    : "linear-gradient(90deg, rgba(249,115,22,0.35), rgba(249,115,22,0.55))",
                                  boxShadow: isTop3 ? "0 0 10px rgba(249,115,22,0.45)" : "none",
                                }}
                              />
                            </div>
                          </div>
                          <p className={cn("text-[15px] font-black tabular-nums shrink-0 min-w-[72px] text-right", isTop3 ? "text-[#f97316]" : "text-white/85")}>
                            {"£"}{entry.value.toFixed(2)}
                          </p>
                        </div>
                      )
                    })}
                  </div>
                )
              })()}
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="pb-24">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto">
            {!isLoggedIn ? null : (
              <div className="space-y-6">
                {/* Stats */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="spotlight-card p-5 rounded-2xl border border-white/[0.06] bg-white/[0.015] text-center hover:border-[#f97316]/30 hover:-translate-y-0.5 transition-all duration-300">
                    <Users className="h-5 w-5 text-[#f97316] mx-auto mb-2" />
                    <p className="text-2xl font-black text-white">{referrals.length}</p>
                    <p className="text-xs text-white/55">Referrals</p>
                  </div>
                  <div className="spotlight-card p-5 rounded-2xl border border-white/[0.06] bg-white/[0.015] text-center hover:border-[#f97316]/30 hover:-translate-y-0.5 transition-all duration-300">
                    <CheckCircle2 className="h-5 w-5 text-emerald-500 mx-auto mb-2" />
                    <p className="text-2xl font-black text-white">{referrals.filter(r => r.status === "completed").length}</p>
                    <p className="text-xs text-white/55">Completed</p>
                  </div>
                  <div className="spotlight-card p-5 rounded-2xl border border-white/[0.06] bg-white/[0.015] text-center hover:border-[#f97316]/30 hover:-translate-y-0.5 transition-all duration-300">
                    <Coins className="h-5 w-5 text-amber-500 mx-auto mb-2" />
                    <p className="text-2xl font-black text-white">&pound;{(totalEarned / 100).toFixed(2)}</p>
                    <p className="text-xs text-white/55">Earned</p>
                  </div>
                </div>

                {/* Referral Link */}
                <div className="spotlight-card p-6 rounded-2xl border border-[#f97316]/30 bg-gradient-to-br from-[#f97316]/10 via-white/[0.015] to-white/[0.015] shadow-[0_18px_48px_rgba(0,0,0,0.4)]">
                  <h2 className="font-bold text-white mb-4 flex items-center gap-2">
                    <Share2 className="h-5 w-5 text-[#f97316]" />
                    Your Referral Link
                  </h2>
                  <div className="flex gap-3">
                    <div className="flex-1 p-4 rounded-xl bg-white/[0.015] border border-white/[0.05]">
                      <p className="font-mono text-sm text-white break-all">{shareLink}</p>
                    </div>
                    <button
                      onClick={copyCode}
                      data-cursor="cta"
                      data-cursor-label={copied ? "Got it" : "Copy"}
                      className={cn(
                        "cursor-cta press-spring shrink-0 px-5 rounded-xl font-bold transition-all",
                        copied ? "bg-emerald-500 hover:bg-emerald-600 text-white shadow-[0_0_24px_rgba(16,185,129,0.45)]" : "bg-gradient-to-br from-[#f97316] to-[#ea580c] text-white hover:shadow-[0_0_30px_rgba(249,115,22,0.55)]"
                      )}
                    >
                      {copied ? <Check className="h-5 w-5" /> : <Copy className="h-5 w-5" />}
                    </button>
                  </div>
                </div>

                {/* Referral History */}
                <div className="rounded-2xl border border-white/[0.04] bg-white/[0.012] overflow-hidden">
                  <div className="p-5 border-b border-white/[0.04]">
                    <h2 className="font-bold text-white flex items-center gap-2">
                      <Trophy className="h-5 w-5 text-amber-500" />
                      Referral History
                    </h2>
                  </div>

                  {referrals.length === 0 ? (
                    <div className="p-12 text-center">
                      <Users className="h-12 w-12 text-white/20 mx-auto mb-4" />
                      <p className="text-white/55">No referrals yet. Share your link to get started!</p>
                    </div>
                  ) : (
                    <div className="divide-y divide-white/[0.03]">
                      {referrals.map((referral) => (
                        <div key={referral.id} className="p-5 flex items-center justify-between hover:bg-white/[0.02] transition-colors">
                          <div>
                            <p className="font-medium text-white">{referral.referred_email}</p>
                            <p className="text-xs text-white/55">
                              {new Date(referral.created_at).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="text-right">
                            <span className={cn(
                              "inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold",
                              referral.status === "rewarded" ? "bg-emerald-500/10 text-emerald-500" :
                              referral.status === "completed" ? "bg-blue-500/10 text-blue-500" :
                              "bg-amber-500/10 text-amber-500"
                            )}>
                              {referral.status === "rewarded" ? <CheckCircle2 className="h-3 w-3" /> : <Clock className="h-3 w-3" />}
                              {referral.status}
                            </span>
                            {referral.reward_amount > 0 && (
                              <p className="text-sm font-bold text-emerald-500 mt-1">+&pound;{(referral.reward_amount / 100).toFixed(2)}</p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Loyalty tier (logged-in) OR 3-step onboarding (logged-out) */}
      <section className="py-16 px-6 sm:px-10 relative z-10">
        <div className="max-w-[960px] mx-auto">
          <div className="text-center mb-10">
            <SectionEyebrow label={isLoggedIn ? "Your Progress" : "How it works"} />
            <h2 className="font-display text-3xl sm:text-4xl font-bold tracking-[-0.035em] leading-[1.1]">
              {isLoggedIn ? (
                <>
                  <span style={{ background: "linear-gradient(180deg, rgba(255,255,255,1), rgba(180,180,195,0.85))", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>The more you refer, </span>
                  <span style={{ background: "linear-gradient(180deg, #ffb366 0%, #f97316 45%, #c2410c 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>the higher you climb</span>
                </>
              ) : (
                <>
                  <span style={{ background: "linear-gradient(180deg, rgba(255,255,255,1), rgba(180,180,195,0.85))", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Get started in </span>
                  <span style={{ background: "linear-gradient(180deg, #ffb366 0%, #f97316 45%, #c2410c 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>3 steps</span>
                </>
              )}
            </h2>
          </div>

          {isLoggedIn ? (
            <LoyaltyTierCard xp={1240} />
          ) : (
            <div className="grid md:grid-cols-3 gap-4">
              {[
                { n: "01", title: "Create an account", body: "Sign up in seconds — no verification required.", icon: Users, cta: { label: "Sign up", href: "/login" } },
                { n: "02", title: "Share your link", body: "Get a unique referral link auto-generated from your account.", icon: Share2, cta: null },
                { n: "03", title: "Earn store credit", body: "10% of every purchase lands in your balance instantly.", icon: Coins, cta: null },
              ].map((step) => {
                const StepIcon = step.icon
                return (
                  <div key={step.n} className="relative p-6 rounded-2xl border border-white/[0.06] bg-white/[0.012] overflow-hidden">
                    <div className="absolute -top-4 -right-2 font-display text-[72px] font-black leading-none text-white/[0.04] tabular-nums select-none">
                      {step.n}
                    </div>
                    <div className="relative">
                      <div className="w-10 h-10 rounded-xl bg-[#f97316]/10 border border-[#f97316]/20 flex items-center justify-center mb-4">
                        <StepIcon className="h-5 w-5 text-[#f97316]" />
                      </div>
                      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#f97316] mb-1">Step {step.n}</p>
                      <h3 className="font-display font-bold text-white text-lg mb-2 tracking-tight">{step.title}</h3>
                      <p className="text-[13px] text-white/55 leading-relaxed mb-4">{step.body}</p>
                      {step.cta && (
                        <button
                          onClick={() => router.push(step.cta!.href)}
                          className="inline-flex items-center gap-1.5 text-[12px] font-bold text-[#f97316] hover:text-[#fb923c] transition-colors"
                        >
                          {step.cta.label} <ArrowRight className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </section>

      <ReferralsLeaderboard />

      <Footer />
    </main>
  )
}
