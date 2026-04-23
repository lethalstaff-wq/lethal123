"use client"

import { useState, useEffect } from "react"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import {
  Users, Coins, Copy, Check, Share2, ArrowRight, Loader2, CheckCircle2, Clock,
  Trophy, Medal, Crown, Star, Flame, Gem, Sparkles,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { createClient } from "@/lib/supabase/client"
import { SectionEyebrow } from "@/components/section-eyebrow"
import { LoyaltyTierCard } from "@/components/loyalty-tier-card"
import { useRouter } from "next/navigation"

interface Referral {
  id: string
  referred_email: string
  status: string
  reward_amount: number
  created_at: string
}

const TIERS = [
  { name: "Bronze",   Icon: Medal, hex: "#d97706", refs: "1-5",   commission: "10%", perks: ["10% commission", "Standard support", "Monthly payouts"] },
  { name: "Silver",   Icon: Star,  hex: "#d1d5db", refs: "6-15",  commission: "12%", perks: ["12% commission", "Priority support", "Weekly payouts", "Early access"] },
  { name: "Gold",     Icon: Crown, hex: "#facc15", refs: "16-40", commission: "15%", perks: ["15% commission", "VIP Discord channel", "Instant payouts", "Custom referral code", "Free product testing"], featured: true },
  { name: "Platinum", Icon: Gem,   hex: "#67e8f9", refs: "40+",   commission: "20%", perks: ["20% commission", "Dedicated manager", "Co-marketing slots", "Lifetime perks", "First dibs on new tiers"] },
]

const STEPS = [
  { n: "01", title: "Share your link", body: "Auto-generated from your account. Drop it anywhere — Discord, Twitter, Reddit.", Icon: Share2 },
  { n: "02", title: "Friends buy",     body: "When someone purchases through your link, it gets attributed to you instantly.", Icon: Users },
  { n: "03", title: "Earn 10-20%",     body: "Commission lands in your balance the moment their order ships. No clawbacks.", Icon: Coins },
]

const LEADERBOARD = [
  { rank: 1, name: "dr***@gmail.com",   refs: 23, value: 187.5, tier: "Gold" },
  { rank: 2, name: "ky***@proton.me",   refs: 18, value: 142.2, tier: "Gold" },
  { rank: 3, name: "wr***@gmail.com",   refs: 14, value: 98.7,  tier: "Silver" },
  { rank: 4, name: "nx***@outlook.com", refs: 11, value: 76.3,  tier: "Silver" },
  { rank: 5, name: "bl***@yahoo.com",   refs: 8,  value: 52.4,  tier: "Silver" },
]

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

  const shareLink = referralCode
    ? `https://lethalsolutions.com?ref=${referralCode}`
    : ""

  const copyCode = () => {
    if (!shareLink) return
    navigator.clipboard.writeText(shareLink)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

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

      {/* ═══════════════ HERO ═══════════════ */}
      <section className="relative pt-32 pb-16 overflow-hidden">
        <div
          aria-hidden="true"
          className="absolute inset-0 pointer-events-none"
          style={{ background: "radial-gradient(ellipse 50% 45% at 50% 20%, rgba(249,115,22,0.10), transparent 65%)" }}
        />
        <div className="relative container mx-auto px-4">
          <div className="max-w-[720px] mx-auto text-center">
            <SectionEyebrow number="01" label="Referral Program" />
            <h1 className="font-display text-5xl sm:text-6xl md:text-7xl font-bold tracking-[-0.04em] leading-[0.95] mb-5 mt-2" style={{ paddingBottom: "0.1em" }}>
              <span style={{ background: "linear-gradient(180deg, rgba(255,255,255,1), rgba(180,180,195,0.85))", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Earn up to </span>
              <span style={{ background: "linear-gradient(180deg, #ffb366 0%, #f97316 45%, #c2410c 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", filter: "drop-shadow(0 0 50px rgba(249, 115, 22, 0.43))" }}>20%</span>
            </h1>
            <p className="text-[17px] text-white/55 max-w-xl mx-auto leading-relaxed mb-8">
              Invite friends, climb tiers, earn commission on every purchase they make. Paid out to store credit instantly.
            </p>

            {!isLoggedIn && (
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <button
                  onClick={() => router.push("/login")}
                  className="press-spring group relative overflow-hidden inline-flex items-center gap-2 px-7 py-3.5 rounded-xl text-white font-bold text-[14px] transition-all hover:-translate-y-0.5"
                  style={{
                    background: "linear-gradient(135deg, #f97316, #ea580c)",
                    boxShadow: "0 14px 38px rgba(249,115,22,0.5), inset 0 1px 0 rgba(255,255,255,0.18)",
                  }}
                >
                  <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full bg-gradient-to-r from-transparent via-white/30 to-transparent transition-transform duration-1000 pointer-events-none" />
                  <span className="relative z-10">Get your referral link</span>
                  <ArrowRight className="relative z-10 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </button>
                <a href="#tiers" className="inline-flex items-center gap-1.5 px-5 py-3 rounded-xl text-white/65 hover:text-white text-[13px] font-semibold transition-colors">
                  See tiers & rewards →
                </a>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ═══════════════ LOGGED-IN DASHBOARD ═══════════════ */}
      {isLoggedIn && (
        <section className="pb-16">
          <div className="container mx-auto px-4">
            <div className="max-w-[980px] mx-auto space-y-5">
              {/* Stats trio */}
              <div className="grid grid-cols-3 gap-3">
                {[
                  { Icon: Users,        value: referrals.length.toString(),                               label: "Referrals",  accent: "#f97316" },
                  { Icon: CheckCircle2, value: referrals.filter(r => r.status === "completed").length.toString(), label: "Completed",  accent: "#22c55e" },
                  { Icon: Coins,        value: `£${(totalEarned / 100).toFixed(2)}`,                     label: "Earned",     accent: "#fbbf24" },
                ].map((stat) => (
                  <div
                    key={stat.label}
                    className="spotlight-card relative rounded-2xl p-6 overflow-hidden transition-all duration-300 hover:-translate-y-0.5"
                    style={{
                      background: "rgba(255,255,255,0.012)",
                      border: "1px solid rgba(255,255,255,0.06)",
                      boxShadow: "inset 0 1px 0 rgba(255,255,255,0.03)",
                    }}
                  >
                    <span className="relative inline-flex items-center justify-center w-10 h-10 rounded-full mb-4" style={{ background: `${stat.accent}15`, boxShadow: `inset 0 0 0 1px ${stat.accent}35` }}>
                      <stat.Icon className="h-[17px] w-[17px]" style={{ color: stat.accent }} strokeWidth={1.9} />
                    </span>
                    <div className="font-display text-[28px] font-black text-white tracking-[-0.025em] tabular-nums leading-none">{stat.value}</div>
                    <div className="text-[10.5px] text-white/45 mt-2 uppercase tracking-[0.22em] font-semibold">{stat.label}</div>
                  </div>
                ))}
              </div>

              {/* Referral link card */}
              <div
                className="spotlight-card relative rounded-2xl p-7 overflow-hidden"
                style={{
                  background: "linear-gradient(135deg, rgba(249,115,22,0.08), rgba(255,255,255,0.012) 50%)",
                  border: "1px solid rgba(249,115,22,0.25)",
                  boxShadow: "0 30px 70px -25px rgba(249,115,22,0.35), inset 0 1px 0 rgba(255,255,255,0.04)",
                }}
              >
                <div className="absolute top-0 left-8 right-8 h-px bg-gradient-to-r from-transparent via-[#f97316]/70 to-transparent" />
                <div className="flex items-center gap-2 mb-4">
                  <Share2 className="h-4 w-4 text-[#f97316]" />
                  <span className="font-display text-[10.5px] font-bold uppercase tracking-[0.22em] text-[#f97316]">Your link</span>
                </div>
                <div className="flex gap-3">
                  <div className="flex-1 px-4 py-3.5 rounded-xl bg-black/40 border border-white/[0.06] overflow-hidden">
                    <p className="font-mono text-[13px] text-white truncate">{shareLink || "Generating..."}</p>
                  </div>
                  <button
                    onClick={copyCode}
                    className={cn(
                      "press-spring shrink-0 px-5 rounded-xl font-bold transition-all",
                      copied
                        ? "bg-emerald-500 text-white shadow-[0_0_30px_rgba(16,185,129,0.55)]"
                        : "bg-gradient-to-br from-[#f97316] to-[#ea580c] text-white hover:shadow-[0_0_30px_rgba(249,115,22,0.55)]"
                    )}
                  >
                    {copied ? <Check className="h-5 w-5" /> : <Copy className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              {/* Referral history */}
              <div className="rounded-2xl border border-white/[0.06] bg-white/[0.012] overflow-hidden">
                <div className="flex items-center justify-between p-5 border-b border-white/[0.05]">
                  <div className="flex items-center gap-2">
                    <Trophy className="h-4 w-4 text-amber-400" />
                    <span className="font-display text-[10.5px] font-bold uppercase tracking-[0.22em] text-white/60">History</span>
                  </div>
                  <span className="text-[11px] text-white/35 tabular-nums">{referrals.length} total</span>
                </div>

                {referrals.length === 0 ? (
                  <div className="p-14 text-center">
                    <div className="inline-flex items-center justify-center w-14 h-14 rounded-full mb-4" style={{ background: "rgba(255,255,255,0.03)", boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.06)" }}>
                      <Users className="h-6 w-6 text-white/30" />
                    </div>
                    <p className="text-white/55 text-[14px] mb-1">No referrals yet</p>
                    <p className="text-white/30 text-[12px]">Share your link above to get started.</p>
                  </div>
                ) : (
                  <div className="divide-y divide-white/[0.03]">
                    {referrals.map((r) => (
                      <div key={r.id} className="p-5 flex items-center justify-between hover:bg-white/[0.02] transition-colors">
                        <div className="min-w-0">
                          <p className="font-semibold text-white text-[14px] truncate">{r.referred_email}</p>
                          <p className="text-[11.5px] text-white/45 tabular-nums mt-0.5">{new Date(r.created_at).toLocaleDateString()}</p>
                        </div>
                        <div className="text-right shrink-0 ml-4">
                          <span className={cn(
                            "inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-[0.14em]",
                            r.status === "rewarded"  ? "bg-emerald-500/10 text-emerald-400" :
                            r.status === "completed" ? "bg-blue-500/10 text-blue-400" :
                            "bg-amber-500/10 text-amber-400"
                          )}>
                            {r.status === "rewarded" ? <CheckCircle2 className="h-3 w-3" /> : <Clock className="h-3 w-3" />}
                            {r.status}
                          </span>
                          {r.reward_amount > 0 && (
                            <p className="text-[13px] font-bold text-emerald-400 mt-1.5 tabular-nums">+£{(r.reward_amount / 100).toFixed(2)}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ═══════════════ HOW IT WORKS (3 steps) ═══════════════ */}
      {!isLoggedIn && (
        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-[1100px] mx-auto">
              <div className="text-center mb-14">
                <SectionEyebrow number="02" label="How It Works" />
                <h2 className="font-display text-4xl sm:text-5xl font-bold tracking-[-0.04em] leading-[1] mb-4 mt-2" style={{ paddingBottom: "0.08em" }}>
                  <span style={{ background: "linear-gradient(180deg, rgba(255,255,255,1), rgba(180,180,195,0.85))", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Three steps. </span>
                  <span style={{ background: "linear-gradient(180deg, #ffb366 0%, #f97316 50%, #c2410c 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", filter: "drop-shadow(0 0 40px rgba(249,115,22,0.4))" }}>No friction.</span>
                </h2>
              </div>

              <div className="grid md:grid-cols-3 gap-5 relative">
                {/* Subtle connector line on desktop */}
                <div className="hidden md:block absolute top-[58px] left-[18%] right-[18%] h-px bg-gradient-to-r from-transparent via-[#f97316]/25 to-transparent" />

                {STEPS.map((step, i) => (
                  <div
                    key={step.n}
                    className="spotlight-card group relative p-7 rounded-2xl overflow-hidden transition-all duration-400 hover:-translate-y-1"
                    style={{
                      background: "rgba(255,255,255,0.012)",
                      border: "1px solid rgba(255,255,255,0.06)",
                    }}
                  >
                    <div className="absolute top-0 left-6 right-6 h-px bg-gradient-to-r from-transparent via-[#f97316]/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    <div className="absolute -top-8 -right-8 w-40 h-40 rounded-full pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500" style={{ background: "radial-gradient(circle, rgba(249,115,22,0.14), transparent 65%)", filter: "blur(24px)" }} />

                    <div className="relative">
                      <div className="flex items-center justify-between mb-5">
                        <span className="relative inline-flex items-center justify-center w-12 h-12 rounded-full text-[#f97316]" style={{ background: "rgba(249,115,22,0.10)", boxShadow: "inset 0 0 0 1px rgba(249,115,22,0.35), 0 0 22px -6px rgba(249,115,22,0.4)" }}>
                          <step.Icon className="h-5 w-5" strokeWidth={1.9} />
                        </span>
                        <span className="font-display text-[48px] font-black tabular-nums leading-none tracking-[-0.05em]" style={{ background: "linear-gradient(180deg, rgba(255,255,255,0.18), rgba(255,255,255,0.04))", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                          {step.n}
                        </span>
                      </div>
                      <h3 className="font-display text-[20px] font-bold text-white tracking-tight mb-2">{step.title}</h3>
                      <p className="text-[13.5px] text-white/55 leading-[1.7]">{step.body}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ═══════════════ TIERS ═══════════════ */}
      <section id="tiers" className="py-20 scroll-mt-24">
        <div className="container mx-auto px-4">
          <div className="max-w-[1100px] mx-auto">
            <div className="text-center mb-14">
              <SectionEyebrow number={isLoggedIn ? "02" : "03"} label="Tiers & Rewards" />
              <h2 className="font-display text-4xl sm:text-5xl font-bold tracking-[-0.04em] leading-[1] mb-4 mt-2" style={{ paddingBottom: "0.08em" }}>
                <span style={{ background: "linear-gradient(180deg, rgba(255,255,255,1), rgba(180,180,195,0.85))", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>The more you bring, </span>
                <span style={{ background: "linear-gradient(180deg, #ffb366 0%, #f97316 50%, #c2410c 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", filter: "drop-shadow(0 0 40px rgba(249,115,22,0.4))" }}>the more you earn.</span>
              </h2>
              <p className="text-white/45 text-[15px] max-w-md mx-auto">Four tiers. Lifetime. No downgrades.</p>
            </div>

            {/* Extra top padding on the grid so the featured badge that sits outside the card never clips */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-5 items-stretch">
              {TIERS.map((tier) => (
                <div
                  key={tier.name}
                  className={cn(
                    "spotlight-card group relative rounded-2xl transition-all duration-500 hover:-translate-y-1",
                    tier.featured
                      ? "lg:-mt-4 lg:mb-0 shadow-[0_30px_70px_-20px_rgba(0,0,0,0.7),0_0_60px_-15px_rgba(249,115,22,0.4)]"
                      : "hover:border-white/[0.12]",
                  )}
                  style={{
                    background: tier.featured
                      ? "linear-gradient(180deg, rgba(249,115,22,0.08) 0%, rgba(255,255,255,0.015) 60%, rgba(255,255,255,0.003) 100%)"
                      : "rgba(255,255,255,0.012)",
                    border: tier.featured ? "1px solid rgba(249,115,22,0.4)" : "1px solid rgba(255,255,255,0.06)",
                    // NB: intentionally NO overflow-hidden here — the "Most popular" pill has to bleed above the card.
                  }}
                >
                  {tier.featured && (
                    <div
                      className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1.5 rounded-full text-[9.5px] font-black uppercase tracking-[0.2em] inline-flex items-center gap-1.5 z-[3] whitespace-nowrap"
                      style={{
                        background: "linear-gradient(135deg, #fbbf24, #f97316)",
                        color: "#fff",
                        boxShadow: "0 8px 24px -4px rgba(249,115,22,0.75), inset 0 1px 0 rgba(255,255,255,0.25)",
                      }}
                    >
                      <Sparkles className="h-3 w-3" />
                      Most popular
                    </div>
                  )}

                  {/* Inner wrapper with overflow so the ambient glow stays clipped inside but badge above still shows */}
                  <div className="relative p-6 rounded-2xl overflow-hidden h-full">
                    {tier.featured && (
                      <div className="absolute top-0 left-4 right-4 h-px bg-gradient-to-r from-transparent via-[#f97316] to-transparent" />
                    )}
                    {tier.name === "Platinum" && (
                      <span className="absolute top-4 right-4 inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-[0.22em] z-[2]" style={{ background: "rgba(103,232,249,0.15)", boxShadow: "inset 0 0 0 1px rgba(103,232,249,0.35)", color: "#67e8f9" }}>
                        New
                      </span>
                    )}

                    <div
                      aria-hidden="true"
                      className="absolute -top-16 -right-16 w-48 h-48 rounded-full pointer-events-none opacity-60"
                      style={{ background: `radial-gradient(circle, ${tier.hex}22, transparent 65%)`, filter: "blur(28px)" }}
                    />

                    <div className="relative">
                      <div className="flex items-center justify-between mb-5">
                        <span className="inline-flex items-center justify-center w-12 h-12 rounded-full" style={{ background: `${tier.hex}15`, boxShadow: `inset 0 0 0 1px ${tier.hex}35${tier.featured ? `, 0 0 22px -4px ${tier.hex}66` : ""}` }}>
                          <tier.Icon className="h-5 w-5" style={{ color: tier.hex, filter: tier.featured ? `drop-shadow(0 0 12px ${tier.hex}aa)` : undefined }} strokeWidth={1.9} />
                        </span>
                        <div className="text-right">
                          <div className="font-display text-[26px] font-black tabular-nums leading-none" style={{ color: tier.hex }}>{tier.commission}</div>
                          <div className="text-[9.5px] text-white/40 uppercase tracking-[0.22em] font-semibold mt-1">Commission</div>
                        </div>
                      </div>
                      <h3 className="font-display text-[19px] font-bold tracking-tight mb-1" style={tier.featured ? { color: tier.hex } : { color: "#fff" }}>
                        {tier.name}
                      </h3>
                      <p className="text-[12px] text-white/45 mb-5 tabular-nums">{tier.refs} referrals</p>
                      <ul className="space-y-2.5">
                        {tier.perks.map((perk) => (
                          <li key={perk} className="flex items-start gap-2 text-[12.5px] text-white/60">
                            <CheckCircle2 className="h-3 w-3 shrink-0 mt-0.5" style={{ color: tier.featured ? "#f97316" : `${tier.hex}aa` }} />
                            <span>{perk}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════ LEADERBOARD ═══════════════ */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-[720px] mx-auto">
            <div className="text-center mb-10">
              <SectionEyebrow number={isLoggedIn ? "03" : "04"} label="Top Referrers" />
              <h2 className="font-display text-4xl sm:text-5xl font-bold tracking-[-0.04em] leading-[1] mb-4 mt-2" style={{ paddingBottom: "0.08em" }}>
                <span style={{ background: "linear-gradient(180deg, rgba(255,255,255,1), rgba(180,180,195,0.85))", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Leaderboard </span>
                <span style={{ background: "linear-gradient(180deg, #ffb366 0%, #f97316 50%, #c2410c 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", filter: "drop-shadow(0 0 40px rgba(249,115,22,0.4))" }}>this month.</span>
              </h2>
            </div>

            <div className="rounded-2xl overflow-hidden border border-white/[0.06] bg-white/[0.012]">
              <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.05] bg-white/[0.01]">
                <div className="flex items-center gap-2">
                  <Flame className="h-4 w-4 text-[#f97316]" />
                  <span className="font-display text-[10.5px] font-bold uppercase tracking-[0.22em] text-white/60">Top 5 · April</span>
                </div>
                <span className="text-[10px] text-white/35 uppercase tracking-[0.2em] font-semibold">Live</span>
              </div>

              <div className="divide-y divide-white/[0.03]">
                {LEADERBOARD.map((e) => {
                  const max = Math.max(...LEADERBOARD.map((x) => x.value))
                  const pct = Math.max(8, Math.round((e.value / max) * 100))
                  const isTop3 = e.rank <= 3
                  return (
                    <div key={e.rank} className="px-5 py-4 flex items-center gap-4 hover:bg-white/[0.02] transition-colors">
                      <span className={cn(
                        "w-8 h-8 rounded-full flex items-center justify-center text-[14px] font-black shrink-0 tabular-nums",
                        e.rank === 1 ? "bg-yellow-400/15 text-yellow-400"  :
                        e.rank === 2 ? "bg-gray-300/15 text-gray-300"      :
                        e.rank === 3 ? "bg-amber-600/15 text-amber-500"    :
                        "bg-white/[0.04] text-white/55"
                      )}>{e.rank}</span>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-white text-[13.5px] truncate">{e.name}</p>
                        <p className="text-[10.5px] text-white/45 tabular-nums mb-2">{e.refs} refs · {e.tier}</p>
                        <div className="relative h-[4px] rounded-full bg-white/[0.04] overflow-hidden">
                          <div
                            className="absolute inset-y-0 left-0 rounded-full transition-all"
                            style={{
                              width: `${pct}%`,
                              background: isTop3 ? "linear-gradient(90deg, #fbbf24, #f97316)" : "linear-gradient(90deg, rgba(249,115,22,0.4), rgba(249,115,22,0.6))",
                              boxShadow: isTop3 ? "0 0 12px rgba(249,115,22,0.55)" : undefined,
                            }}
                          />
                        </div>
                      </div>
                      <p className={cn("text-[15px] font-black tabular-nums shrink-0 min-w-[70px] text-right", isTop3 ? "text-[#f97316]" : "text-white/85")}>
                        £{e.value.toFixed(2)}
                      </p>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════ YOUR PROGRESS (logged-in only) ═══════════════ */}
      {isLoggedIn && (
        <section className="py-20 px-6">
          <div className="max-w-[960px] mx-auto">
            <div className="text-center mb-10">
              <SectionEyebrow number="04" label="Your Progress" />
              <h2 className="font-display text-4xl sm:text-5xl font-bold tracking-[-0.04em] leading-[1] mb-4 mt-2" style={{ paddingBottom: "0.08em" }}>
                <span style={{ background: "linear-gradient(180deg, rgba(255,255,255,1), rgba(180,180,195,0.85))", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Keep </span>
                <span style={{ background: "linear-gradient(180deg, #ffb366 0%, #f97316 50%, #c2410c 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", filter: "drop-shadow(0 0 40px rgba(249,115,22,0.4))" }}>climbing.</span>
              </h2>
            </div>
            <LoyaltyTierCard xp={1240} />
          </div>
        </section>
      )}

      <Footer />
    </main>
  )
}
