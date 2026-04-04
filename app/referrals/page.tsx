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
  Trophy
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
      <main className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-background">
      <Navbar />

      {/* Hero */}
      <section className="relative pt-32 pb-16 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-orange-500/5 via-transparent to-transparent" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-orange-500/10 rounded-full blur-[150px] opacity-30" />

        <div className="container mx-auto px-4 relative">
          <div className="max-w-2xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange-500/10 border border-orange-500/20 mb-6">
              <Gift className="h-4 w-4 text-orange-500" />
              <span className="text-sm font-bold text-orange-500">Referral Program</span>
            </div>

            <h1 className="text-4xl md:text-5xl font-black text-foreground tracking-tight mb-4">
              Earn Rewards
            </h1>
            <p className="text-lg text-muted-foreground mb-8">
              Invite friends and earn 10% commission on every purchase they make
            </p>

            {/* How it works */}
            <div className="grid md:grid-cols-3 gap-4 mt-12">
              <div className="p-6 rounded-2xl bg-card/60 border border-border/50">
                <div className="w-12 h-12 rounded-xl bg-orange-500/10 flex items-center justify-center mx-auto mb-4">
                  <Share2 className="h-6 w-6 text-orange-500" />
                </div>
                <h3 className="font-bold text-foreground mb-2">1. Share Link</h3>
                <p className="text-sm text-muted-foreground">Share your unique referral link with friends</p>
              </div>
              <div className="p-6 rounded-2xl bg-card/60 border border-border/50">
                <div className="w-12 h-12 rounded-xl bg-orange-500/10 flex items-center justify-center mx-auto mb-4">
                  <Users className="h-6 w-6 text-orange-500" />
                </div>
                <h3 className="font-bold text-foreground mb-2">2. Friends Purchase</h3>
                <p className="text-sm text-muted-foreground">When they make a purchase using your link</p>
              </div>
              <div className="p-6 rounded-2xl bg-card/60 border border-border/50">
                <div className="w-12 h-12 rounded-xl bg-orange-500/10 flex items-center justify-center mx-auto mb-4">
                  <Coins className="h-6 w-6 text-orange-500" />
                </div>
                <h3 className="font-bold text-foreground mb-2">3. Earn 10%</h3>
                <p className="text-sm text-muted-foreground">Get 10% of their purchase as store credit</p>
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
              <div className="text-center py-16 rounded-3xl border border-border/50 bg-card/60">
                <Gift className="h-16 w-16 text-orange-500/30 mx-auto mb-6" />
                <h2 className="text-xl font-bold text-foreground mb-2">Login to Start Earning</h2>
                <p className="text-muted-foreground mb-6">Create an account or login to get your referral link</p>
                <Button onClick={() => router.push("/login")} className="gap-2 rounded-xl bg-orange-500 hover:bg-purple-600">
                  Get Started
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Stats */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="p-5 rounded-2xl border border-border/50 bg-card/60 text-center">
                    <Users className="h-5 w-5 text-orange-500 mx-auto mb-2" />
                    <p className="text-2xl font-black text-foreground">{referrals.length}</p>
                    <p className="text-xs text-muted-foreground">Referrals</p>
                  </div>
                  <div className="p-5 rounded-2xl border border-border/50 bg-card/60 text-center">
                    <CheckCircle2 className="h-5 w-5 text-emerald-500 mx-auto mb-2" />
                    <p className="text-2xl font-black text-foreground">{referrals.filter(r => r.status === "completed").length}</p>
                    <p className="text-xs text-muted-foreground">Completed</p>
                  </div>
                  <div className="p-5 rounded-2xl border border-border/50 bg-card/60 text-center">
                    <Coins className="h-5 w-5 text-amber-500 mx-auto mb-2" />
                    <p className="text-2xl font-black text-foreground">£{(totalEarned / 100).toFixed(2)}</p>
                    <p className="text-xs text-muted-foreground">Earned</p>
                  </div>
                </div>

                {/* Referral Link */}
                <div className="p-6 rounded-3xl border border-orange-500/20 bg-gradient-to-br from-orange-500/10 via-card to-card">
                  <h2 className="font-bold text-foreground mb-4 flex items-center gap-2">
                    <Share2 className="h-5 w-5 text-orange-500" />
                    Your Referral Link
                  </h2>
                  <div className="flex gap-3">
                    <div className="flex-1 p-4 rounded-xl bg-background/50 border border-border/50">
                      <p className="font-mono text-sm text-foreground break-all">{shareLink}</p>
                    </div>
                    <Button
                      onClick={copyCode}
                      className={cn(
                        "shrink-0 rounded-xl",
                        copied ? "bg-emerald-500 hover:bg-emerald-600" : "bg-orange-500 hover:bg-purple-600"
                      )}
                    >
                      {copied ? <Check className="h-5 w-5" /> : <Copy className="h-5 w-5" />}
                    </Button>
                  </div>
                </div>

                {/* Referral History */}
                <div className="rounded-3xl border border-border/50 bg-card/60 overflow-hidden">
                  <div className="p-5 border-b border-border/30">
                    <h2 className="font-bold text-foreground flex items-center gap-2">
                      <Trophy className="h-5 w-5 text-amber-500" />
                      Referral History
                    </h2>
                  </div>

                  {referrals.length === 0 ? (
                    <div className="p-12 text-center">
                      <Users className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
                      <p className="text-muted-foreground">No referrals yet. Share your link to get started!</p>
                    </div>
                  ) : (
                    <div className="divide-y divide-border/30">
                      {referrals.map((referral) => (
                        <div key={referral.id} className="p-5 flex items-center justify-between">
                          <div>
                            <p className="font-medium text-foreground">{referral.referred_email}</p>
                            <p className="text-xs text-muted-foreground">
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
                              <p className="text-sm font-bold text-emerald-500 mt-1">+£{(referral.reward_amount / 100).toFixed(2)}</p>
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
