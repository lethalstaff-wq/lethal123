"use client"

import { useState, useEffect } from "react"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import {
  Gift,
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
  Flame
} from "lucide-react"
import { cn } from "@/lib/utils"
import { createClient } from "@/lib/supabase/client"
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
  const supabase = createClient()
  const router = useRouter()

  useEffect(() => {
    const fetchData = async () => {
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        setIsLoggedIn(false)
        setLoading(false)
        return
      }

      setIsLoggedIn(true)

      // Generate or get referral code
      const { data: existingReferral } = await supabase
        .from("referrals")
        .select("referral_code")
        .eq("referrer_id", user.id)
        .limit(1)
        .single()

      if (existingReferral) {
        setReferralCode(existingReferral.referral_code)
      } else {
        // Generate new code
        const code = `REF-${user.id.slice(0, 8).toUpperCase()}`
        setReferralCode(code)
      }

      // Get all referrals
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
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/[0.08] bg-white/[0.03] backdrop-blur-md mb-6">
              <Gift className="h-3.5 w-3.5 text-[#f97316]" />
              <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/55">Referral Program</span>
            </div>
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
      <section className="pb-12">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-2xl font-bold text-center text-white mb-8">
              Referral <span className="text-[#f97316]">Tiers</span>
            </h2>
            <div className="grid md:grid-cols-3 gap-4">
              {[
                { name: "Bronze", icon: Medal, color: "text-amber-600", bg: "bg-amber-600/10", border: "border-amber-600/20", refs: "1-5", commission: "10%", perks: ["10% commission", "Standard support", "Monthly payouts"] },
                { name: "Silver", icon: Star, color: "text-gray-300", bg: "bg-gray-300/10", border: "border-gray-300/20", refs: "6-15", commission: "12%", perks: ["12% commission", "Priority support", "Weekly payouts", "Early access to new products"] },
                { name: "Gold", icon: Crown, color: "text-yellow-400", bg: "bg-yellow-400/10", border: "border-yellow-400/20", refs: "16+", commission: "15%", perks: ["15% commission", "VIP Discord channel", "Instant payouts", "Custom referral code", "Free product testing"] },
              ].map((tier) => (
                <div key={tier.name} className={cn("p-6 rounded-2xl border bg-white/[0.012] relative overflow-hidden", tier.border)}>
                  {tier.name === "Gold" && (
                    <div className="absolute top-0 right-0 px-3 py-1 rounded-bl-xl bg-yellow-400/20 text-yellow-400 text-[10px] font-bold">BEST</div>
                  )}
                  <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center mb-4", tier.bg)}>
                    <tier.icon className={cn("h-6 w-6", tier.color)} />
                  </div>
                  <h3 className="font-bold text-lg text-white mb-1">{tier.name}</h3>
                  <p className="text-sm text-white/55 mb-1">{tier.refs} referrals</p>
                  <p className={cn("text-2xl font-black mb-4", tier.color)}>{tier.commission}</p>
                  <ul className="space-y-2">
                    {tier.perks.map((perk) => (
                      <li key={perk} className="flex items-center gap-2 text-sm text-white/55">
                        <CheckCircle2 className="h-3.5 w-3.5 text-[#f97316] shrink-0" />
                        {perk}
                      </li>
                    ))}
                  </ul>
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
              <div className="divide-y divide-white/[0.03]">
                {[
                  { rank: 1, name: "dr***@gmail.com", refs: 23, earned: "\u00a3187.50", tier: "Gold" },
                  { rank: 2, name: "ky***@proton.me", refs: 18, earned: "\u00a3142.20", tier: "Gold" },
                  { rank: 3, name: "wr***@gmail.com", refs: 14, earned: "\u00a398.70", tier: "Silver" },
                  { rank: 4, name: "nx***@outlook.com", refs: 11, earned: "\u00a376.30", tier: "Silver" },
                  { rank: 5, name: "bl***@yahoo.com", refs: 8, earned: "\u00a352.40", tier: "Silver" },
                ].map((entry) => (
                  <div key={entry.rank} className="p-4 flex items-center gap-4 hover:bg-white/[0.02] transition-colors">
                    <div className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center text-sm font-black shrink-0",
                      entry.rank === 1 ? "bg-yellow-400/20 text-yellow-400" :
                      entry.rank === 2 ? "bg-gray-300/20 text-gray-300" :
                      entry.rank === 3 ? "bg-amber-600/20 text-amber-600" :
                      "bg-white/[0.04] text-white/55"
                    )}>
                      {entry.rank}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate text-white">{entry.name}</p>
                      <p className="text-xs text-white/55">{entry.refs} referrals &middot; {entry.tier}</p>
                    </div>
                    <p className="text-sm font-bold text-emerald-400">{entry.earned}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="pb-24">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto">
            {!isLoggedIn ? (
              <div className="text-center py-16 rounded-2xl border border-white/[0.04] bg-white/[0.012]">
                <Gift className="h-16 w-16 text-[#f97316]/30 mx-auto mb-6" />
                <h2 className="text-xl font-bold text-white mb-2">Login to Start Earning</h2>
                <p className="text-white/55 mb-6">Create an account or login to get your referral link</p>
                <button onClick={() => router.push("/login")} className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#f97316] to-[#ea580c] text-white font-medium hover:opacity-90 transition-opacity">
                  Get Started
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Stats */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="p-5 rounded-2xl border border-white/[0.04] bg-white/[0.012] text-center">
                    <Users className="h-5 w-5 text-[#f97316] mx-auto mb-2" />
                    <p className="text-2xl font-black text-white">{referrals.length}</p>
                    <p className="text-xs text-white/55">Referrals</p>
                  </div>
                  <div className="p-5 rounded-2xl border border-white/[0.04] bg-white/[0.012] text-center">
                    <CheckCircle2 className="h-5 w-5 text-emerald-500 mx-auto mb-2" />
                    <p className="text-2xl font-black text-white">{referrals.filter(r => r.status === "completed").length}</p>
                    <p className="text-xs text-white/55">Completed</p>
                  </div>
                  <div className="p-5 rounded-2xl border border-white/[0.04] bg-white/[0.012] text-center">
                    <Coins className="h-5 w-5 text-amber-500 mx-auto mb-2" />
                    <p className="text-2xl font-black text-white">&pound;{(totalEarned / 100).toFixed(2)}</p>
                    <p className="text-xs text-white/55">Earned</p>
                  </div>
                </div>

                {/* Referral Link */}
                <div className="p-6 rounded-2xl border border-[#f97316]/25 bg-gradient-to-br from-[#f97316]/10 via-white/[0.015] to-white/[0.015] shadow-[0_18px_48px_rgba(0,0,0,0.4)]">
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
                      className={cn(
                        "shrink-0 px-4 rounded-xl font-medium transition-all",
                        copied ? "bg-emerald-500 hover:bg-emerald-600 text-white" : "bg-gradient-to-r from-[#f97316] to-[#ea580c] text-white hover:opacity-90"
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

      <Footer />
    </main>
  )
}
