"use client"

import { useState, useEffect, useCallback } from "react"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { useCart } from "@/lib/cart-context"
import {
  ArrowLeft, ArrowRight, Clock, Copy, Check, Shield, Zap, AlertTriangle,
  CheckCircle2, Loader2, MessageCircle, X, Tag, Lock, RefreshCw, Package, ShoppingBag, Sparkles, ExternalLink,
} from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { BitcoinIcon, EthereumIcon, TetherIcon, LitecoinIcon, PayPalIcon, DiscordIcon } from "@/components/crypto-icons"
import { createOrder } from "@/app/checkout/actions"
import { cn } from "@/lib/utils"

/* -- Coupons (fallback for fortune wheel + hardcoded) -- */
const COUPONS: Record<string, number> = {
  LETHAL: 10, LETHAL5: 5, LETHAL20: 20, DOMINATE: 15, GAMING10: 10,
  // Fortune wheel coupons
  EASTER5: 5, BUNNY10: 10, EGG15: 15, SPRING7: 7, EASTER20: 20, HUNT12: 12, RABBIT8: 8, GOLDEN25: 25,
}

/* -- Crypto wallets -- */
const CRYPTO_OPTIONS = [
  { id: "btc", name: "Bitcoin", ticker: "BTC", coingeckoId: "bitcoin", address: "14tscJF3jPHxtJJe4LpKkEDKUpDnnzCg5W", icon: BitcoinIcon, color: "#F7931A", confirmations: "1 confirmation" },
  { id: "erc20", name: "Ethereum", ticker: "ETH", coingeckoId: "ethereum", address: "0xcae387fc336bec95f601359a1f16d31e77fa571d", icon: EthereumIcon, color: "#627EEA", confirmations: "12 confirmations" },
  { id: "trc20", name: "USDT TRC-20", ticker: "USDT", coingeckoId: "tether", address: "TV92xuS8vrLAmBiCN3GFiJi5rGYLZHcsDu", icon: TetherIcon, color: "#26A17B", confirmations: "20 confirmations" },
  { id: "ltc", name: "Litecoin", ticker: "LTC", coingeckoId: "litecoin", address: "ltc1q49qjqxvlr4slkvzm9pxfjshwne62a9dk8283t3", icon: LitecoinIcon, color: "#345D9D", confirmations: "3 confirmations" },
]

const PAYPAL_EMAIL = "lethalstaff@gmail.com"
const TIMER_SECONDS = 30 * 60
const RATE_KEY_MAP: Record<string, string> = { btc: "btc", erc20: "eth", trc20: "usdt", ltc: "ltc" }

type PaymentMethod = "paypal" | "crypto" | "discord" | null
type CheckoutStep = "form" | "pay" | "confirming" | "done"

function generateOrderId() {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
  let result = "LS-"
  for (let i = 0; i < 8; i++) result += chars.charAt(Math.floor(Math.random() * chars.length))
  return result
}

export default function CheckoutPage() {
  const { items, total, clearCart } = useCart()

  const [email, setEmail] = useState("")
  const [discordUser, setDiscordUser] = useState("")
  const [couponCode, setCouponCode] = useState("")
  const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; percent: number } | null>(null)
  const [couponError, setCouponError] = useState("")
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(null)
  const [selectedCrypto, setSelectedCrypto] = useState(CRYPTO_OPTIONS[0])
  const [step, setStep] = useState<CheckoutStep>("form")
  const [orderId] = useState(() => generateOrderId())
  const [timeLeft, setTimeLeft] = useState(TIMER_SECONDS)
  const [copiedField, setCopiedField] = useState<string | null>(null)
  const [agreedTos, setAgreedTos] = useState(false)
  const [cryptoRates, setCryptoRates] = useState<Record<string, number>>({})
  const [ratesLoading, setRatesLoading] = useState(false)
  const [emailTouched, setEmailTouched] = useState(false)

  const discount = appliedCoupon ? (total * appliedCoupon.percent) / 100 : 0
  const finalTotal = total - discount

  const fetchRates = useCallback(async () => {
    setRatesLoading(true)
    try {
      const res = await fetch("/api/rates")
      const data = await res.json()
      if (!data.error) setCryptoRates(data)
      else setCryptoRates({ btc: 78000, eth: 2100, usdt: 1, ltc: 75 })
    } catch { setCryptoRates({ btc: 78000, eth: 2100, usdt: 1, ltc: 75 }) }
    setRatesLoading(false)
  }, [])

  useEffect(() => { fetchRates() }, [fetchRates])

  // Load referral code from localStorage if present
  useEffect(() => {
    const refCode = localStorage.getItem("referral_code")
    if (refCode && !appliedCoupon) {
      setCouponCode(refCode)
      // Auto-apply referral code
      const applyRef = async () => {
        try {
          const res = await fetch("/api/coupons/validate", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ code: refCode }),
          })
          const data = await res.json()
          if (res.ok && data.valid) {
            setAppliedCoupon({ code: data.code, percent: data.percent })
          }
        } catch { /* ignore */ }
        localStorage.removeItem("referral_code")
      }
      applyRef()
    }
  }, [])

  useEffect(() => {
    if (step !== "pay") return
    if (timeLeft <= 0) return
    const interval = setInterval(() => {
      setTimeLeft((prev) => { if (prev <= 1) { clearInterval(interval); return 0 } return prev - 1 })
    }, 1000)
    return () => clearInterval(interval)
  }, [step, timeLeft])

  // Verification timer -- 60 minutes countdown
  const VERIFY_SECONDS = 60 * 60
  const [verifyTimeLeft, setVerifyTimeLeft] = useState(VERIFY_SECONDS)

  useEffect(() => {
    if (step !== "confirming") return
    if (verifyTimeLeft <= 0) return
    const t = setInterval(() => {
      setVerifyTimeLeft(prev => {
        if (prev <= 1) { clearInterval(t); return 0 }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(t)
  }, [step, verifyTimeLeft])

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60)
    const s = seconds % 60
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`
  }

  const copyToClipboard = useCallback((text: string, field: string) => {
    navigator.clipboard.writeText(text)
    setCopiedField(field)
    setTimeout(() => setCopiedField(null), 2000)
  }, [])

  const applyCoupon = async () => {
    setCouponError("")
    const upper = couponCode.trim().toUpperCase()
    if (!upper) return
    
    // First check hardcoded coupons as fallback
    if (COUPONS[upper] !== undefined) {
      setAppliedCoupon({ code: upper, percent: COUPONS[upper] })
      return
    }
    
    // Try API validation
    try {
      const res = await fetch("/api/coupons/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: upper }),
      })
      const data = await res.json()
      if (res.ok && data.valid) {
        setAppliedCoupon({ code: data.code, percent: data.percent })
      } else {
        setCouponError(data.error || "Invalid coupon code")
      }
    } catch {
      setCouponError("Invalid coupon code")
    }
  }

  const getCryptoAmount = (cryptoId: string, gbpAmount: number) => {
    const rateKey = RATE_KEY_MAP[cryptoId] || cryptoId
    const rate = cryptoRates[rateKey]
    if (!rate) return null
    const amount = gbpAmount / rate
    if (cryptoId === "trc20") return amount.toFixed(2)
    if (cryptoId === "btc") return amount.toFixed(6)
    return amount.toFixed(4)
  }

  const canProceed = email.trim().includes("@") && paymentMethod && agreedTos

  const handleProceed = () => {
    if (paymentMethod === "discord") {
      window.open("https://discord.gg/lethaldma", "_blank", "noopener,noreferrer")
      return
    }
    setStep("pay")
    setTimeLeft(TIMER_SECONDS)
  }

  const handleConfirmPayment = async () => {
    setStep("confirming")
    setVerifyTimeLeft(VERIFY_SECONDS)
    try {
      await createOrder({
        order_id: orderId,
        email: email,
        discord: discordUser,
        payment_method: paymentMethod === "crypto" ? selectedCrypto.id : (paymentMethod || "crypto"),
        total_in_pence: Math.round(finalTotal * 100),
        coupon: appliedCoupon?.code || undefined,
        items: items.map(item => ({
          product_variant_id: item.variant.id,
          quantity: item.quantity,
          price_in_pence: Math.round(item.variant.price * 100),
        })),
      })
      clearCart()
    } catch (e) { console.error("Order creation failed:", e) }
  }

  /* ---- EMPTY CART ---- */
  if (items.length === 0 && step !== "confirming" && step !== "done") {
    return (
      <main className="flex min-h-screen flex-col bg-background">
        <Navbar />
        <section className="flex-1 flex items-center justify-center px-4 py-32">
          <div className="text-center max-w-md">
            <div className="relative mx-auto w-24 h-24 mb-8">
              <div className="absolute inset-0 rounded-3xl bg-primary/10 blur-xl animate-pulse" />
              <div className="relative w-24 h-24 rounded-3xl bg-gradient-to-br from-card to-card/50 border border-border/50 flex items-center justify-center">
                <Package className="w-10 h-10 text-muted-foreground/40" />
              </div>
            </div>
            <h1 className="text-3xl font-bold text-foreground mb-3 tracking-tight">Your cart is empty</h1>
            <p className="text-muted-foreground mb-10">Add some products to get started.</p>
            <Link href="/products" className="inline-flex items-center gap-2.5 px-8 py-4 bg-primary hover:bg-primary/90 text-primary-foreground rounded-2xl text-sm font-bold transition-all hover:shadow-[0_0_30px_rgba(var(--primary-rgb),0.3)] hover:scale-[1.02] active:scale-[0.98]">
              Browse Products <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </section>
        <Footer />
      </main>
    )
  }

  /* ---- CONFIRMING / DONE ---- */
  if (step === "confirming" || step === "done") {
    return (
      <main className="flex min-h-screen flex-col bg-background">
        <Navbar />
        <section className="flex-1 flex items-center justify-center px-4 py-16">
          <div className="max-w-lg w-full">
            {step === "confirming" ? (
              <div className="relative">
                {/* Background glow effects */}
                <div className="absolute -inset-12 bg-gradient-to-br from-primary/10 via-amber-500/5 to-transparent rounded-[3rem] blur-3xl" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-primary/10 rounded-full blur-[100px]" />
                
                <div className="relative rounded-3xl border border-primary/20 bg-card/95 backdrop-blur-xl overflow-hidden">
                  {/* Header with gradient */}
                  <div className="relative px-8 pt-10 pb-8 text-center bg-gradient-to-b from-primary/5 to-transparent">
                    {/* Animated icon */}
                    <div className="relative mx-auto w-28 h-28 mb-6">
                      <div className="absolute inset-0 rounded-full bg-primary/20 animate-ping" style={{ animationDuration: "2s" }} />
                      <div className="absolute inset-2 rounded-full bg-primary/10 animate-pulse" style={{ animationDuration: "1.5s" }} />
                      <div className="relative w-28 h-28 rounded-full bg-gradient-to-br from-primary/30 via-primary/10 to-transparent flex items-center justify-center border-2 border-primary/30 shadow-[0_0_40px_rgba(249,115,22,0.3)]">
                        <Clock className="h-12 w-12 text-primary" />
                      </div>
                    </div>

                    <h2 className="text-3xl font-black text-foreground tracking-tight mb-2">Payment Processing</h2>
                    <p className="text-sm text-muted-foreground max-w-xs mx-auto">
                      {"Our team is verifying your transaction. This typically takes up to 1 hour."}
                    </p>
                  </div>

                  {/* Timer section */}
                  <div className="px-8 pb-6">
                    <div className="relative rounded-2xl bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border border-primary/20 p-6 overflow-hidden">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl" />
                      <div className="relative flex items-center justify-center gap-6">
                        <div className="text-center">
                          <div className="font-mono text-5xl font-black text-foreground tracking-wider tabular-nums">
                            {formatTime(verifyTimeLeft)}
                          </div>
                          <p className="text-xs text-primary font-bold uppercase tracking-widest mt-2">Estimated Time</p>
                        </div>
                      </div>
                      
                      {/* Progress bar */}
                      <div className="mt-6 h-2 rounded-full bg-background/50 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-primary via-primary/80 to-amber-500 transition-all duration-1000 ease-linear shadow-[0_0_20px_rgba(249,115,22,0.5)]"
                          style={{ width: `${Math.min(((VERIFY_SECONDS - verifyTimeLeft) / VERIFY_SECONDS) * 100, 100)}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Order ID badge */}
                  <div className="px-8 pb-6">
                    <div className="flex items-center justify-center gap-3 px-6 py-4 rounded-2xl bg-muted/10 border border-border/50">
                      <span className="text-xs text-muted-foreground uppercase tracking-widest font-medium">Order</span>
                      <span className="font-mono font-black text-lg text-foreground tracking-wider">{orderId}</span>
                    </div>
                  </div>

                  {/* Status steps */}
                  <div className="px-8 pb-8">
                    <div className="space-y-3">
                      {[
                        { done: true, label: "Order submitted", icon: CheckCircle2 },
                        { done: true, label: "Payment details recorded", icon: CheckCircle2 },
                        { done: false, active: true, label: "Verifying transaction", icon: Loader2 },
                        { done: false, active: false, label: "License delivery", icon: Package },
                      ].map((s, i) => (
                        <div key={i} className={cn(
                          "flex items-center gap-4 p-4 rounded-xl transition-all",
                          s.active ? "bg-primary/10 border border-primary/20" : "bg-muted/5"
                        )}>
                          <div className={cn(
                            "w-10 h-10 rounded-xl flex items-center justify-center shrink-0",
                            s.done ? "bg-emerald-500/20" : s.active ? "bg-primary/20" : "bg-muted/20"
                          )}>
                            {s.done ? <CheckCircle2 className="h-5 w-5 text-emerald-500" /> :
                             s.active ? <s.icon className="h-5 w-5 text-primary animate-spin" /> :
                             <s.icon className="h-5 w-5 text-muted-foreground/30" />}
                          </div>
                          <span className={cn(
                            "text-sm font-medium",
                            s.done ? "text-foreground" : s.active ? "text-primary font-bold" : "text-muted-foreground/40"
                          )}>
                            {s.label}
                            {s.active && <span className="text-primary/60 ml-1">...</span>}
                          </span>
                          {s.done && <CheckCircle2 className="h-4 w-4 text-emerald-500 ml-auto" />}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Footer info */}
                  <div className="px-8 pb-8 space-y-4">
                    <div className="rounded-2xl border border-border/30 bg-gradient-to-br from-muted/10 to-transparent p-5">
                      <p className="text-sm text-muted-foreground leading-relaxed text-center">
                        {"You can safely close this page. Delivery details will be sent to "}
                        <span className="text-primary font-bold">{email}</span>
                        {" once verified."}
                      </p>
                    </div>

                    <Link 
                      href="https://discord.gg/lethaldma" 
                      target="_blank" 
                      className="flex items-center justify-center gap-3 w-full py-4 rounded-xl bg-[#5865F2]/10 border border-[#5865F2]/20 text-[#5865F2] hover:bg-[#5865F2]/20 transition-all group"
                    >
                      <DiscordIcon className="h-5 w-5" />
                      <span className="font-bold">Need help? Contact us on Discord</span>
                      <ExternalLink className="h-4 w-4 opacity-50 group-hover:opacity-100 transition-opacity" />
                    </Link>
                  </div>
                </div>
              </div>
            ) : (
              <div className="relative">
                <div className="absolute -inset-8 bg-primary/8 rounded-[2rem] blur-3xl animate-pulse" style={{ animationDuration: "3s" }} />
                <div className="relative rounded-3xl border border-primary/30 bg-card/95 backdrop-blur-xl p-10 text-center space-y-8">
                  <div className="relative mx-auto w-24 h-24">
                    <div className="absolute inset-0 rounded-full bg-primary/10 animate-pulse" style={{ animationDuration: "2s" }} />
                    <div className="relative w-24 h-24 rounded-full bg-gradient-to-br from-primary/30 to-primary/5 flex items-center justify-center border border-primary/30">
                      <CheckCircle2 className="h-12 w-12 text-primary" />
                    </div>
                  </div>

                  <div>
                    <h2 className="text-3xl font-black text-foreground tracking-tight">Order Submitted</h2>
                    <p className="text-sm text-muted-foreground mt-3">{"We're verifying your payment. You'll receive delivery once confirmed."}</p>
                  </div>

                  <div className="inline-flex items-center gap-3 px-6 py-3.5 rounded-2xl bg-primary/10 border border-primary/20">
                    <span className="text-xs text-primary/70 font-medium">Order ID</span>
                    <span className="font-mono font-black text-lg text-primary">{orderId}</span>
                  </div>

                  <div className="space-y-2 text-sm text-muted-foreground">
                    <p>{"Delivery details sent to "}<span className="text-foreground font-semibold">{email}</span></p>
                    {discordUser && <p>{"Discord: "}<span className="text-foreground font-semibold">{discordUser}</span></p>}
                  </div>

                  <p className="text-xs text-muted-foreground/60 leading-relaxed px-4">
                    {"Save your order ID. Join our Discord for updates and support."}
                  </p>

                  <div className="flex gap-3 pt-2">
                    <Link href="https://discord.gg/lethaldma" target="_blank" className="flex-1">
                      <button className="w-full h-13 py-3.5 flex items-center justify-center gap-2.5 rounded-2xl border border-border/60 bg-card/50 text-sm font-semibold text-foreground hover:bg-muted/30 transition-all">
                        <DiscordIcon className="h-4 w-4" />
                        Discord
                      </button>
                    </Link>
                    <Link href="/" className="flex-1">
                      <button className="w-full h-13 py-3.5 flex items-center justify-center gap-2.5 rounded-2xl bg-primary hover:bg-primary/90 text-primary-foreground text-sm font-bold transition-all hover:shadow-[0_0_20px_rgba(var(--primary-rgb),0.3)]">
                        Home
                      </button>
                    </Link>
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>
        <Footer />
      </main>
    )
  }

  /* ---- MAIN CHECKOUT ---- */
  const stepIndex = step === "form" ? 0 : 1

  return (
    <main className="flex min-h-screen flex-col bg-background">
      <Navbar />

      <section className="flex-1 py-10 md:py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">

          {/* Header */}
          <div className="mb-10">
            <div className="flex items-center justify-between mb-8">
              {step === "form" ? (
                <Link href="/products" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors group">
                  <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
                  Continue Shopping
                </Link>
              ) : (
                <button onClick={() => { setStep("form"); setTimeLeft(TIMER_SECONDS) }} className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors group">
                  <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
                  Back to Details
                </button>
              )}
              <div className="flex items-center gap-2 text-xs text-muted-foreground/60">
                <Lock className="h-3 w-3" />
                <span className="hidden sm:inline">Encrypted & Secure</span>
              </div>
            </div>

            {/* Step indicator */}
            <div className="flex items-center gap-4">
              {["Details & Payment", "Send Payment"].map((label, i) => (
                <div key={label} className="flex items-center gap-4">
                  {i > 0 && (
                    <div className="w-16 h-0.5 relative rounded-full overflow-hidden">
                      <div className="absolute inset-0 bg-border/40" />
                      <div className={cn("absolute inset-0 bg-gradient-to-r from-primary to-primary/60 transition-all duration-700 origin-left", i <= stepIndex ? "scale-x-100" : "scale-x-0")} />
                    </div>
                  )}
                  <div className="flex items-center gap-2.5">
                    <div className={cn(
                      "w-8 h-8 rounded-xl flex items-center justify-center text-xs font-black transition-all duration-500",
                      i < stepIndex ? "bg-primary text-primary-foreground shadow-[0_0_20px_rgba(var(--primary-rgb),0.4)]" :
                      i === stepIndex ? "bg-primary/10 text-primary border border-primary/30" :
                      "bg-muted/20 text-muted-foreground/40 border border-border/30"
                    )}>
                      {i < stepIndex ? <Check className="w-4 h-4" /> : i + 1}
                    </div>
                    <span className={cn("text-sm font-semibold hidden sm:inline", i <= stepIndex ? "text-foreground" : "text-muted-foreground/40")}>{label}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="grid lg:grid-cols-[1fr,400px] gap-8 items-start">
            {/* ======= LEFT COLUMN ======= */}
            <div className="space-y-6">

              {/* === STEP 1: FORM === */}
              {step === "form" && (
                <div className="space-y-6 animate-in fade-in slide-in-from-left-4 duration-300">

                  {/* Contact Info */}
                  <div className="rounded-3xl border border-border/50 bg-card/60 backdrop-blur-xl overflow-hidden shadow-xl shadow-black/5">
                    <div className="px-7 py-5 border-b border-border/30 bg-gradient-to-r from-muted/10 to-transparent">
                      <h2 className="text-base font-bold text-foreground flex items-center gap-3">
                        <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center border border-primary/20">
                          <span className="text-xs font-black text-primary">1</span>
                        </div>
                        Contact Information
                      </h2>
                    </div>
                    <div className="p-7 space-y-5">
                      <div>
                        <label className="text-xs font-bold text-muted-foreground/80 mb-2.5 block uppercase tracking-wider">
                          Email Address <span className="text-primary">*</span>
                        </label>
                        <input
                          type="email" value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          onBlur={() => setEmailTouched(true)}
                          placeholder="your@email.com"
                          className={cn(
                            "w-full rounded-2xl border bg-background/60 px-5 py-4 text-sm font-medium placeholder:text-muted-foreground/25 focus:outline-none focus:ring-2 transition-all",
                            emailTouched && !email.trim().includes("@")
                              ? "border-destructive/50 focus:ring-destructive/30 focus:border-destructive/30"
                              : "border-border/50 focus:ring-primary/30 focus:border-primary/30"
                          )}
                        />
                        {emailTouched && !email.trim().includes("@") ? (
                          <p className="text-[10px] text-destructive mt-2 flex items-center gap-1.5">
                            <AlertTriangle className="w-3 h-3" /> Please enter a valid email address
                          </p>
                        ) : (
                          <p className="text-[10px] text-muted-foreground/50 mt-2 flex items-center gap-1.5">
                            <Zap className="w-3 h-3" /> License key delivered instantly to this email
                          </p>
                        )}
                      </div>
                      <div>
                        <label className="text-xs font-bold text-muted-foreground/80 mb-2.5 flex items-center gap-2 uppercase tracking-wider">
                          <DiscordIcon className="w-3.5 h-3.5" /> Discord <span className="text-muted-foreground/30 font-normal normal-case tracking-normal">(optional)</span>
                        </label>
                        <input
                          type="text" value={discordUser} onChange={(e) => setDiscordUser(e.target.value)}
                          placeholder="username"
                          className="w-full rounded-2xl border border-border/50 bg-background/60 px-5 py-4 text-sm font-medium placeholder:text-muted-foreground/25 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/30 transition-all"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Payment Method */}
                  <div className="rounded-3xl border border-border/50 bg-card/60 backdrop-blur-xl overflow-hidden shadow-xl shadow-black/5">
                    <div className="px-7 py-5 border-b border-border/30 bg-gradient-to-r from-muted/10 to-transparent">
                      <h2 className="text-base font-bold text-foreground flex items-center gap-3">
                        <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center border border-primary/20">
                          <span className="text-xs font-black text-primary">2</span>
                        </div>
                        Payment Method
                      </h2>
                    </div>
                    <div className="p-5 space-y-2.5">
                      {/* PayPal */}
                      <button
                        onClick={() => setPaymentMethod("paypal")}
                        className={cn(
                          "w-full rounded-2xl border-2 p-5 flex items-center gap-5 transition-all duration-300 group relative overflow-hidden",
                          paymentMethod === "paypal"
                            ? "border-[#003087]/50 bg-[#003087]/8 shadow-[0_0_30px_rgba(0,48,135,0.15)]"
                            : "border-border/30 hover:border-border/60 hover:bg-muted/5"
                        )}
                      >
                        {paymentMethod === "paypal" && <div className="absolute inset-0 bg-gradient-to-r from-[#003087]/8 via-[#003087]/3 to-transparent" />}
                        <div className={cn(
                          "relative w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 transition-all duration-300",
                          paymentMethod === "paypal" ? "bg-[#003087]/15 shadow-[0_0_20px_rgba(0,48,135,0.2)] scale-105" : "bg-[#003087]/8 group-hover:scale-105"
                        )}>
                          <PayPalIcon className="h-7 w-7" />
                        </div>
                        <div className="relative text-left flex-1">
                          <p className="font-bold text-foreground">PayPal</p>
                          <p className="text-xs text-muted-foreground mt-0.5">Friends & Family only</p>
                        </div>
                        {paymentMethod === "paypal" && (
                          <span className="relative text-xs font-bold text-[#003087] bg-[#003087]/10 px-3 py-1.5 rounded-xl">Preferred</span>
                        )}
                        <div className={cn(
                          "relative w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 transition-all duration-300",
                          paymentMethod === "paypal" ? "border-[#003087] bg-[#003087] scale-110" : "border-border/50"
                        )}>
                          {paymentMethod === "paypal" && <Check className="w-3.5 h-3.5 text-white" />}
                        </div>
                      </button>

                      {/* Crypto options */}
                      {CRYPTO_OPTIONS.map((crypto) => {
                        const isSelected = paymentMethod === "crypto" && selectedCrypto.id === crypto.id
                        const cryptoAmount = getCryptoAmount(crypto.id, finalTotal)
                        const Icon = crypto.icon
                        return (
                          <button
                            key={crypto.id}
                            onClick={() => { setPaymentMethod("crypto"); setSelectedCrypto(crypto) }}
                            className={cn(
                              "w-full rounded-2xl border-2 p-5 flex items-center gap-5 transition-all duration-300 group relative overflow-hidden",
                              isSelected
                                ? "border-primary/40 bg-primary/5 shadow-[0_0_25px_rgba(var(--primary-rgb),0.1)]"
                                : "border-border/30 hover:border-border/60 hover:bg-muted/5"
                            )}
                          >
                            {isSelected && <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-primary/2 to-transparent" />}
                            <div className={cn(
                              "relative w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 transition-all duration-300",
                              isSelected ? "scale-105 shadow-[0_0_15px_rgba(var(--primary-rgb),0.15)]" : "group-hover:scale-105"
                            )} style={{ backgroundColor: crypto.color + "12" }}>
                              <Icon className="h-7 w-7" />
                            </div>
                            <div className="relative text-left flex-1">
                              <p className="font-bold text-foreground">{crypto.name}</p>
                              <div className="flex items-center gap-2 mt-0.5">
                                <span className="text-xs text-muted-foreground">{crypto.ticker}</span>
                                {cryptoAmount && (
                                  <span className={cn("text-xs font-mono tabular-nums", isSelected ? "text-primary font-bold" : "text-muted-foreground/60")}>
                                    ~{cryptoAmount} {crypto.ticker}
                                  </span>
                                )}
                              </div>
                            </div>
                            <div className={cn(
                              "relative w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 transition-all duration-300",
                              isSelected ? "border-primary bg-primary scale-110" : "border-border/50"
                            )}>
                              {isSelected && <Check className="w-3.5 h-3.5 text-primary-foreground" />}
                            </div>
                          </button>
                        )
                      })}

                      {/* Discord */}
                      <button
                        onClick={() => setPaymentMethod("discord")}
                        className={cn(
                          "w-full rounded-2xl border-2 p-5 flex items-center gap-5 transition-all duration-300 group relative overflow-hidden",
                          paymentMethod === "discord"
                            ? "border-[#5865F2]/40 bg-[#5865F2]/5 shadow-[0_0_25px_rgba(88,101,242,0.1)]"
                            : "border-border/30 hover:border-border/60 hover:bg-muted/5"
                        )}
                      >
                        {paymentMethod === "discord" && <div className="absolute inset-0 bg-gradient-to-r from-[#5865F2]/5 to-transparent" />}
                        <div className={cn(
                          "relative w-14 h-14 rounded-2xl bg-[#5865F2]/10 flex items-center justify-center shrink-0 transition-all duration-300",
                          paymentMethod === "discord" ? "scale-105 shadow-[0_0_15px_rgba(88,101,242,0.15)]" : "group-hover:scale-105"
                        )}>
                          <DiscordIcon className="h-7 w-7" />
                        </div>
                        <div className="relative text-left flex-1">
                          <p className="font-bold text-foreground">Via Discord</p>
                          <p className="text-xs text-muted-foreground mt-0.5">Open a ticket in our server</p>
                        </div>
                        <div className={cn(
                          "relative w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 transition-all duration-300",
                          paymentMethod === "discord" ? "border-[#5865F2] bg-[#5865F2] scale-110" : "border-border/50"
                        )}>
                          {paymentMethod === "discord" && <Check className="w-3.5 h-3.5 text-white" />}
                        </div>
                      </button>
                    </div>
                  </div>

                  {/* PayPal Discord Requirement */}
                  {paymentMethod === "paypal" && (
                    <div className="rounded-3xl border border-[#003087]/20 bg-gradient-to-br from-[#003087]/5 to-transparent p-7 space-y-4 animate-in fade-in slide-in-from-top-3 duration-300">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-[#003087]/10 flex items-center justify-center">
                          <DiscordIcon className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-foreground">Discord Username Required</p>
                          <p className="text-[11px] text-muted-foreground">Include in PayPal payment note</p>
                        </div>
                      </div>
                      <input
                        type="text" value={discordUser} onChange={(e) => setDiscordUser(e.target.value)}
                        placeholder="Enter Discord username"
                        className="w-full rounded-2xl border border-[#003087]/15 bg-background/60 px-5 py-4 text-sm font-medium placeholder:text-muted-foreground/25 focus:outline-none focus:ring-2 focus:ring-[#003087]/20 focus:border-[#003087]/30 transition-all"
                      />
                    </div>
                  )}

                  {/* Coupon */}
                  <div className="rounded-3xl border border-border/50 bg-card/60 backdrop-blur-xl overflow-hidden shadow-xl shadow-black/5">
                    <div className="px-7 py-5 border-b border-border/30 bg-gradient-to-r from-muted/10 to-transparent">
                      <h2 className="text-base font-bold text-foreground flex items-center gap-3">
                        <Tag className="w-5 h-5 text-primary" />
                        Discount Code
                      </h2>
                    </div>
                    <div className="p-7">
                      {appliedCoupon ? (
                        <div className="flex items-center gap-4 rounded-2xl border border-primary/20 bg-primary/5 px-5 py-4">
                          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                            <Sparkles className="w-5 h-5 text-primary" />
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-black text-primary">{appliedCoupon.code}</p>
                            <p className="text-[11px] text-primary/60 font-medium">{appliedCoupon.percent}% discount applied</p>
                          </div>
                          <button onClick={() => { setAppliedCoupon(null); setCouponCode("") }} className="p-2 hover:bg-muted/30 rounded-xl transition-colors">
                            <X className="h-4 w-4 text-muted-foreground" />
                          </button>
                        </div>
                      ) : (
                        <div className="flex gap-3">
                          <input
                            type="text" value={couponCode}
                            onChange={(e) => { setCouponCode(e.target.value); setCouponError("") }}
                            onKeyDown={(e) => e.key === "Enter" && applyCoupon()}
                            placeholder="Enter code"
                            className="flex-1 rounded-2xl border border-border/50 bg-background/60 px-5 py-3.5 text-sm font-medium placeholder:text-muted-foreground/25 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/30 transition-all"
                          />
                          <button onClick={applyCoupon} className="px-7 py-3.5 rounded-2xl border border-border/50 bg-muted/10 hover:bg-muted/30 text-sm font-bold text-foreground transition-all hover:border-border/80">
                            Apply
                          </button>
                        </div>
                      )}
                      {couponError && <p className="text-xs text-destructive mt-3 font-medium">{couponError}</p>}
                    </div>
                  </div>

                  {/* TOS */}
                  <label className="flex items-start gap-4 cursor-pointer group px-2 py-2">
                    <div className={cn(
                      "mt-0.5 h-6 w-6 rounded-lg border-2 flex items-center justify-center shrink-0 transition-all duration-300",
                      agreedTos ? "bg-primary border-primary shadow-[0_0_12px_rgba(var(--primary-rgb),0.3)]" : "border-border/50 group-hover:border-border"
                    )}>
                      {agreedTos && <Check className="h-3.5 w-3.5 text-primary-foreground" />}
                    </div>
                    <input type="checkbox" checked={agreedTos} onChange={(e) => setAgreedTos(e.target.checked)} className="sr-only" />
                    <span className="text-xs text-muted-foreground group-hover:text-foreground/80 transition-colors leading-relaxed">
                      {"I agree to Lethal Solutions' Terms of Service and acknowledge that all sales are final. Products are delivered digitally."}
                    </span>
                  </label>

                  {/* Proceed CTA */}
                  <button
                    disabled={!canProceed}
                    onClick={handleProceed}
                    className={cn(
                      "w-full py-5 text-primary-foreground font-bold text-base rounded-2xl transition-all duration-300 flex items-center justify-center gap-3 relative overflow-hidden group",
                      canProceed
                        ? "bg-primary hover:bg-primary/90 hover:shadow-[0_0_40px_rgba(var(--primary-rgb),0.35)] hover:scale-[1.01] active:scale-[0.99]"
                        : "bg-primary/20 cursor-not-allowed"
                    )}
                  >
                    <span className="relative z-10 flex items-center gap-3">
                      {paymentMethod === "discord" ? (
                        <>Open Discord <ExternalLink className="h-4 w-4" /></>
                      ) : (
                        <>Proceed to Payment <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" /></>
                      )}
                    </span>
                  </button>
                </div>
              )}

              {/* === STEP 2: PAY === */}
              {step === "pay" && (
                <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">

                  {/* Timer */}
                  <div className={cn(
                    "rounded-3xl border p-6 space-y-4 transition-all",
                    timeLeft < 300 ? "border-destructive/30 bg-destructive/5 shadow-[0_0_20px_rgba(239,68,68,0.1)]" : "border-primary/20 bg-primary/5 shadow-[0_0_20px_rgba(var(--primary-rgb),0.05)]"
                  )}>
                    <div className="flex items-center gap-4">
                      <div className={cn(
                        "w-14 h-14 rounded-2xl flex items-center justify-center transition-all",
                        timeLeft < 300 ? "bg-destructive/10" : "bg-primary/10"
                      )}>
                        <Clock className={cn("h-7 w-7", timeLeft < 300 ? "text-destructive" : "text-primary")} />
                      </div>
                      <div>
                        <p className="text-lg font-black text-foreground tabular-nums">
                          <span className={cn("font-mono", timeLeft < 300 ? "text-destructive" : "text-primary")}>
                            {formatTime(timeLeft)}
                          </span>
                          <span className="text-sm font-semibold text-foreground/60 ml-2">remaining</span>
                        </p>
                        <p className="text-xs text-muted-foreground">Send the exact amount before expiry</p>
                      </div>
                    </div>
                    <div className="h-1.5 rounded-full bg-muted/15 overflow-hidden">
                      <div
                        className={cn("h-full rounded-full transition-all duration-1000", timeLeft < 300 ? "bg-destructive" : "bg-gradient-to-r from-primary to-primary/60")}
                        style={{ width: `${(timeLeft / TIMER_SECONDS) * 100}%` }}
                      />
                    </div>
                  </div>

                  {/* Amount card - Premium Design */}
                  <div className="relative rounded-3xl border border-primary/20 overflow-hidden shadow-2xl shadow-primary/10">
                    {/* Background gradient */}
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-card to-card" />
                    <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 rounded-full blur-[60px]" />
                    <div className="absolute bottom-0 left-0 w-24 h-24 bg-primary/10 rounded-full blur-[40px]" />
                    
                    <div className="relative p-8 text-center space-y-4">
                      <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20">
                        <Zap className="h-4 w-4 text-primary" />
                        <span className="text-xs font-bold text-primary uppercase tracking-wider">Total Amount</span>
                      </div>
                      
                      <div className="py-2">
                        <p className="text-6xl font-black text-foreground tracking-tight tabular-nums">
                          <span className="text-4xl text-muted-foreground mr-1">GBP</span>
                          {finalTotal.toFixed(2)}
                        </p>
                      </div>
                      
                      {paymentMethod === "crypto" && cryptoRates[RATE_KEY_MAP[selectedCrypto.id] || selectedCrypto.id] && (
                        <div className="flex items-center justify-center gap-3 py-3 px-6 rounded-2xl bg-background/50 border border-border/30 mx-auto w-fit">
                          {(() => { const Icon = selectedCrypto.icon; return <Icon className="h-5 w-5" /> })()}
                          <span className="text-lg font-mono font-black tabular-nums" style={{ color: selectedCrypto.color }}>
                            {getCryptoAmount(selectedCrypto.id, finalTotal)} {selectedCrypto.ticker}
                          </span>
                          <button onClick={fetchRates} className="p-1.5 text-muted-foreground hover:text-primary transition-colors rounded-lg hover:bg-muted/20" title="Refresh rate">
                            <RefreshCw className={cn("h-4 w-4", ratesLoading && "animate-spin")} />
                          </button>
                        </div>
                      )}
                      
                      {appliedCoupon && (
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                          <Sparkles className="h-3 w-3 text-emerald-500" />
                          <span className="text-xs font-bold text-emerald-500">{appliedCoupon.code} -{appliedCoupon.percent}%</span>
                        </div>
                      )}
                      
                      <p className="text-xs text-muted-foreground/40 font-mono font-bold">{orderId}</p>
                    </div>
                  </div>

                  {/* Crypto payment - Premium Payment Gateway */}
                  {paymentMethod === "crypto" && (
                    <div className="relative rounded-3xl border border-border/30 bg-gradient-to-b from-[#0d0d0f] via-[#0a0a0c] to-[#080809] overflow-hidden shadow-2xl shadow-black/50">
                      {/* Animated background effects */}
                      <div className="absolute inset-0 overflow-hidden pointer-events-none">
                        <div className="absolute -top-32 -right-32 w-64 h-64 rounded-full blur-[120px] opacity-20" style={{ backgroundColor: selectedCrypto.color }} />
                        <div className="absolute -bottom-32 -left-32 w-64 h-64 rounded-full blur-[120px] opacity-15" style={{ backgroundColor: selectedCrypto.color }} />
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full blur-[150px] opacity-5" style={{ backgroundColor: selectedCrypto.color }} />
                      </div>

                      {/* Gateway Header */}
                      <div className="relative border-b border-white/5">
                        <div className="px-6 py-4 flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="flex items-center gap-1.5">
                              <div className="w-2 h-2 rounded-full bg-primary" />
                              <div className="w-2 h-2 rounded-full bg-primary/60" />
                              <div className="w-2 h-2 rounded-full bg-primary/30" />
                            </div>
                            <span className="text-xs font-bold text-white/40 uppercase tracking-widest">Lethal Pay</span>
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                              <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">Connected</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Crypto Selection Bar */}
                      <div className="relative px-6 py-4 border-b border-white/5 bg-white/[0.02]">
                        <div className="flex items-center gap-4">
                          {(() => { 
                            const Icon = selectedCrypto.icon
                            return (
                              <div className="relative">
                                <div className="absolute inset-0 rounded-xl blur-xl opacity-50" style={{ backgroundColor: selectedCrypto.color }} />
                                <div className="relative w-12 h-12 rounded-xl flex items-center justify-center border border-white/10 backdrop-blur-sm" style={{ backgroundColor: selectedCrypto.color + "15" }}>
                                  <Icon className="h-6 w-6" />
                                </div>
                              </div>
                            )
                          })()}
                          <div className="flex-1">
                            <p className="font-black text-base text-white tracking-tight">{selectedCrypto.name}</p>
                            <p className="text-[11px] text-white/40 font-medium">{selectedCrypto.name.includes("TRC") ? "TRON Network (TRC-20)" : selectedCrypto.name.includes("Ethereum") ? "Ethereum Network (ERC-20)" : `${selectedCrypto.name} Mainnet`}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-xs text-white/30 font-medium">Exchange Rate</p>
                            <p className="text-sm font-bold text-white/60 font-mono">1 {selectedCrypto.ticker} = GBP {(cryptoRates[RATE_KEY_MAP[selectedCrypto.id] || selectedCrypto.id] || 0).toLocaleString()}</p>
                          </div>
                        </div>
                      </div>

                      {/* Main Payment Area */}
                      <div className="relative p-6 space-y-6">
                        {/* Amount Display - Hero */}
                        <div className="relative rounded-2xl bg-gradient-to-br from-white/[0.03] to-transparent border border-white/5 p-6 text-center overflow-hidden">
                          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.02] to-transparent" />
                          <p className="text-[10px] text-white/30 font-bold uppercase tracking-[0.2em] mb-3">Amount Due</p>
                          <div className="flex items-baseline justify-center gap-2 mb-2">
                            <span className="text-5xl font-black tabular-nums tracking-tight" style={{ color: selectedCrypto.color }}>
                              {getCryptoAmount(selectedCrypto.id, finalTotal)}
                            </span>
                            <span className="text-xl font-bold text-white/50">{selectedCrypto.ticker}</span>
                          </div>
                          <p className="text-sm text-white/30 font-mono">GBP {finalTotal.toFixed(2)}</p>
                          
                          {/* Copy amount button */}
                          <button
                            onClick={() => copyToClipboard(getCryptoAmount(selectedCrypto.id, finalTotal) || "", "amount")}
                            className={cn(
                              "mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold transition-all",
                              copiedField === "amount" 
                                ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30" 
                                : "bg-white/5 text-white/50 hover:text-white hover:bg-white/10 border border-white/10"
                            )}
                          >
                            {copiedField === "amount" ? <><Check className="h-3 w-3" /> Amount Copied</> : <><Copy className="h-3 w-3" /> Copy Amount</>}
                          </button>
                        </div>

                        {/* QR Code */}
                        <div className="flex justify-center py-2">
                          <div className="relative group">
                            <div className="absolute -inset-4 rounded-3xl opacity-30 blur-2xl transition-all group-hover:opacity-50" style={{ backgroundColor: selectedCrypto.color }} />
                            <div className="relative rounded-2xl bg-gradient-to-br from-white/10 to-white/5 p-1 border border-white/10">
                              <div className="p-3 bg-white rounded-xl">
                                <Image
                                  src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(selectedCrypto.address)}&bgcolor=FFFFFF&color=000000&format=png&margin=1`}
                                  alt={`${selectedCrypto.name} QR`} width={180} height={180}
                                  className="rounded-lg" unoptimized crossOrigin="anonymous"
                                />
                              </div>
                            </div>
                            <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 px-4 py-1.5 rounded-full bg-[#0a0a0c] border border-white/10">
                              <p className="text-[9px] font-bold text-white/50 uppercase tracking-wider">Scan QR Code</p>
                            </div>
                          </div>
                        </div>

                        {/* Wallet Address */}
                        <div className="space-y-3 pt-2">
                          <div className="flex items-center justify-between px-1">
                            <label className="text-[10px] text-white/30 font-bold uppercase tracking-wider">Destination Address</label>
                            <button
                              onClick={() => copyToClipboard(selectedCrypto.address, "wallet")}
                              className={cn(
                                "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-bold transition-all",
                                copiedField === "wallet" 
                                  ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30" 
                                  : "bg-white/5 text-white/40 hover:text-white hover:bg-white/10 border border-white/10"
                              )}
                            >
                              {copiedField === "wallet" ? <><Check className="h-3 w-3" /> Copied</> : <><Copy className="h-3 w-3" /> Copy Address</>}
                            </button>
                          </div>
                          <div 
                            onClick={() => copyToClipboard(selectedCrypto.address, "wallet")}
                            className="relative group cursor-pointer rounded-xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.04] p-4 transition-all"
                          >
                            <p className="font-mono text-[13px] break-all select-all text-white/70 leading-relaxed tracking-wide">
                              {selectedCrypto.address}
                            </p>
                          </div>
                        </div>

                        {/* Transaction Details Grid */}
                        <div className="grid grid-cols-2 gap-3">
                          <div className="rounded-xl bg-white/[0.02] border border-white/5 p-4">
                            <div className="flex items-center gap-2 mb-2">
                              <div className="w-6 h-6 rounded-lg bg-primary/10 flex items-center justify-center">
                                <Clock className="h-3 w-3 text-primary" />
                              </div>
                              <span className="text-[10px] text-white/30 font-bold uppercase">Time Left</span>
                            </div>
                            <p className="text-xl font-black text-white tabular-nums font-mono">{formatTime(timeLeft)}</p>
                          </div>
                          <div className="rounded-xl bg-white/[0.02] border border-white/5 p-4">
                            <div className="flex items-center gap-2 mb-2">
                              <div className="w-6 h-6 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                                <CheckCircle2 className="h-3 w-3 text-emerald-400" />
                              </div>
                              <span className="text-[10px] text-white/30 font-bold uppercase">Confirmations</span>
                            </div>
                            <p className="text-xl font-black text-white">{selectedCrypto.confirmations.split(" ")[0]} <span className="text-sm font-medium text-white/30">required</span></p>
                          </div>
                        </div>

                        {/* Warning */}
                        <div className="flex items-start gap-3 p-4 rounded-xl bg-amber-500/5 border border-amber-500/10">
                          <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center shrink-0">
                            <AlertTriangle className="h-4 w-4 text-amber-400" />
                          </div>
                          <div className="text-xs text-white/50 leading-relaxed">
                            <p className="font-bold text-amber-400 mb-0.5">Important Notice</p>
                            <p>Send only <strong className="text-white">{selectedCrypto.ticker}</strong> on the <strong className="text-white">{selectedCrypto.name.includes("TRC") ? "TRON" : selectedCrypto.name.includes("Ethereum") ? "Ethereum" : selectedCrypto.name}</strong> network. Other assets will be lost permanently.</p>
                          </div>
                        </div>

                        {/* Live Status */}
                        <div className="relative rounded-xl bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5 border border-primary/20 p-4 overflow-hidden">
                          <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent,rgba(249,115,22,0.1),transparent)] animate-pulse" style={{ animationDuration: "2s" }} />
                          <div className="relative flex items-center justify-center gap-3">
                            <div className="relative">
                              <div className="absolute inset-0 rounded-full bg-primary/30 animate-ping" style={{ animationDuration: "1.5s" }} />
                              <Loader2 className="h-5 w-5 text-primary animate-spin" />
                            </div>
                            <span className="text-sm text-white/70 font-medium">Monitoring blockchain for incoming transaction...</span>
                          </div>
                        </div>
                      </div>

                      {/* Gateway Footer */}
                      <div className="px-6 py-4 border-t border-white/5 bg-white/[0.01]">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <Shield className="h-4 w-4 text-white/20" />
                            <span className="text-[10px] text-white/20 font-medium">256-bit SSL Encrypted</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="text-[10px] text-white/30 font-mono">{orderId}</span>
                            <div className="w-1 h-1 rounded-full bg-white/20" />
                            <span className="text-[10px] text-white/20">Lethal Solutions</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* PayPal payment */}
                  {paymentMethod === "paypal" && (
                    <div className="rounded-3xl border border-[#003087]/20 bg-card/60 backdrop-blur-xl overflow-hidden shadow-xl shadow-black/5">
                      <div className="p-6 flex items-center gap-4 border-b border-[#003087]/10 bg-gradient-to-r from-[#003087]/5 to-transparent">
                        <div className="w-12 h-12 rounded-2xl bg-[#003087]/10 flex items-center justify-center">
                          <PayPalIcon className="h-6 w-6" />
                        </div>
                        <div>
                          <p className="font-bold text-foreground">PayPal - Friends & Family</p>
                          <p className="text-xs text-muted-foreground">Must be sent as Friends & Family</p>
                        </div>
                      </div>

                      <div className="p-6 space-y-5">
                        <div>
                          <label className="text-[10px] text-muted-foreground/60 uppercase tracking-[0.15em] font-bold block mb-2.5">PayPal Email</label>
                          <div className="flex items-center gap-2.5">
                            <div className="flex-1 rounded-2xl border border-border/50 bg-background/60 px-5 py-4 font-mono text-sm select-all text-foreground font-bold">
                              {PAYPAL_EMAIL}
                            </div>
                            <button
                              onClick={() => copyToClipboard(PAYPAL_EMAIL, "paypal")}
                              className={cn(
                                "shrink-0 h-[52px] w-[52px] rounded-2xl border flex items-center justify-center transition-all duration-300",
                                copiedField === "paypal" ? "border-[#003087]/40 bg-[#003087]/10 shadow-[0_0_15px_rgba(0,48,135,0.2)]" : "border-border/50 hover:border-border hover:bg-muted/20"
                              )}
                            >
                              {copiedField === "paypal" ? <Check className="h-5 w-5 text-[#003087]" /> : <Copy className="h-5 w-5 text-muted-foreground" />}
                            </button>
                          </div>
                        </div>

                        <div>
                          <label className="text-[10px] text-muted-foreground/60 uppercase tracking-[0.15em] font-bold block mb-2.5">Payment Note</label>
                          <div className="rounded-2xl border border-border/50 bg-background/60 px-5 py-4 text-sm text-foreground">
                            {"Discord: "}<strong className="text-primary">{discordUser || "your_username"}</strong>
                          </div>
                        </div>

                        <div className="flex items-start gap-3 p-4 rounded-2xl bg-amber-500/5 border border-amber-500/10">
                          <AlertTriangle className="h-5 w-5 text-amber-400 shrink-0 mt-0.5" />
                          <div className="text-xs text-muted-foreground leading-relaxed">
                            <p><strong className="text-foreground">Friends & Family ONLY.</strong></p>
                            <p className="mt-1">{"Include your Discord username in the note. Goods & Services payments will be refunded."}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Confirm CTA */}
                  <button
                    onClick={handleConfirmPayment}
                    disabled={timeLeft <= 0}
                    className={cn(
                      "w-full py-5 text-primary-foreground font-bold text-base rounded-2xl transition-all duration-300 flex items-center justify-center gap-3 relative overflow-hidden group",
                      timeLeft > 0
                        ? "bg-primary hover:bg-primary/90 hover:shadow-[0_0_40px_rgba(var(--primary-rgb),0.35)] hover:scale-[1.01] active:scale-[0.99]"
                        : "bg-muted/30 cursor-not-allowed text-muted-foreground"
                    )}
                  >
                    {timeLeft <= 0 ? "Session Expired" : (
                      <span className="flex items-center gap-3">
                        {"I Have Sent the Payment"}
                        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                      </span>
                    )}
                  </button>

                  <button
                    onClick={() => { setStep("form"); setTimeLeft(TIMER_SECONDS) }}
                    className="w-full text-center text-xs text-muted-foreground hover:text-foreground transition-colors py-2"
                  >
                    {"< "}Change payment method
                  </button>
                </div>
              )}
            </div>

            {/* ======= RIGHT COLUMN: ORDER SUMMARY ======= */}
            <div className="lg:sticky lg:top-8 h-fit">
              <div className="rounded-3xl border border-border/50 bg-card/60 backdrop-blur-xl overflow-hidden shadow-2xl shadow-black/10">
                <div className="px-6 py-5 border-b border-border/30 bg-gradient-to-r from-muted/10 to-transparent">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-foreground flex items-center gap-2.5">
                      <ShoppingBag className="w-5 h-5 text-primary" />
                      Order Summary
                    </h3>
                    <span className="text-[10px] text-muted-foreground font-mono font-bold">{orderId}</span>
                  </div>
                </div>

                <div className="p-6 space-y-5">
                  <div className="space-y-4">
                    {items.map((item) => (
                      <div key={item.variant.id} className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-muted/20 to-muted/5 flex items-center justify-center shrink-0 border border-border/20">
                          <Package className="w-5 h-5 text-muted-foreground/40" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold text-foreground truncate">{item.variant.product?.name || item.variant.name}</p>
                          <p className="text-xs text-muted-foreground/60 mt-0.5">{item.variant.name} x{item.quantity}</p>
                        </div>
                        <p className="text-sm font-black text-foreground shrink-0 tabular-nums">{"£"}{(item.variant.price * item.quantity).toFixed(2)}</p>
                      </div>
                    ))}
                  </div>

                  <div className="h-px bg-border/30" />

                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Subtotal</span>
                      <span className="text-foreground font-semibold tabular-nums">{"£"}{total.toFixed(2)}</span>
                    </div>
                    {appliedCoupon && (
                      <div className="flex justify-between text-sm">
                        <span className="text-primary font-medium flex items-center gap-1.5">
                          <Sparkles className="w-3 h-3" /> {appliedCoupon.code}
                        </span>
                        <span className="text-primary font-bold tabular-nums">-{"£"}{discount.toFixed(2)}</span>
                      </div>
                    )}
                    <div className="h-px bg-border/30" />
                    <div className="flex justify-between items-baseline pt-1">
                      <span className="text-sm font-bold text-foreground">Total</span>
                      <span className="text-3xl font-black text-foreground tracking-tight tabular-nums">{"£"}{finalTotal.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                {/* Trust signals */}
                <div className="px-6 py-5 bg-gradient-to-t from-muted/10 to-transparent border-t border-border/30 space-y-3.5">
                  {[
                    { icon: Shield, text: "256-bit SSL Encrypted", color: "text-emerald-500" },
                    { icon: Zap, text: "Instant Digital Delivery", color: "text-amber-500" },
                    { icon: Lock, text: "Secure Payment Processing", color: "text-blue-400" },
                  ].map(({ icon: I, text, color }) => (
                    <div key={text} className="flex items-center gap-3">
                      <div className="w-7 h-7 rounded-lg bg-muted/10 flex items-center justify-center shrink-0">
                        <I className={cn("w-3.5 h-3.5", color)} />
                      </div>
                      <span className="text-xs text-muted-foreground/70">{text}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}
