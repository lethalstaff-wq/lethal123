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
  // Fortune wheel coupons (v3)
  SPIN10: 10, LUCKY15: 15, WIN7: 7, MEGA20: 20, SAVE12: 12, DEAL8: 8, JACKPOT: 25,
  // Legacy wheel coupons
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
                      <div className="relative w-28 h-28 rounded-full bg-gradient-to-br from-primary/30 via-primary/10 to-transparent flex items-center justify-center border-2 border-primary/30 shadow-[0_0_40px_rgba(239,111,41,0.3)]">
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
                          className="h-full rounded-full bg-gradient-to-r from-primary via-primary/80 to-amber-500 transition-all duration-1000 ease-linear shadow-[0_0_20px_rgba(239,111,41,0.5)]"
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
  return (
    <main className="flex min-h-screen flex-col bg-[#0a0a0a]">
      <Navbar />

      <section className="flex-1">
        <div className="grid lg:grid-cols-2 gap-0 min-h-[calc(100vh-64px)]">

          {/* ======= LEFT PANEL — Order Summary (dark) ======= */}
          <div className="bg-[#0a0a0a] border-r border-[rgba(255,255,255,0.06)] p-6 lg:p-10 flex flex-col">

            {/* Back + title */}
            <div className="flex items-center gap-3 mb-8">
              {step === "form" ? (
                <Link href="/products" className="w-8 h-8 rounded-lg border border-[rgba(255,255,255,0.06)] flex items-center justify-center text-white/40 hover:text-white/80 hover:border-[rgba(255,255,255,0.12)] transition-all">
                  <ArrowLeft className="h-4 w-4" />
                </Link>
              ) : (
                <button onClick={() => { setStep("form"); setTimeLeft(TIMER_SECONDS) }} className="w-8 h-8 rounded-lg border border-[rgba(255,255,255,0.06)] flex items-center justify-center text-white/40 hover:text-white/80 hover:border-[rgba(255,255,255,0.12)] transition-all">
                  <ArrowLeft className="h-4 w-4" />
                </button>
              )}
              <h1 className="text-lg font-bold text-white">Checkout</h1>
              <span className="ml-auto text-[10px] text-white/20 font-mono">{orderId}</span>
            </div>

            {/* Product items */}
            <div className="space-y-3 mb-6">
              {items.map((item) => (
                <div key={item.variant.id} className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-white/[0.04] border border-[rgba(255,255,255,0.06)] flex items-center justify-center shrink-0">
                    <Package className="w-4 h-4 text-white/20" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-white truncate">{item.variant.product?.name || item.variant.name}</p>
                    <p className="text-xs text-white/30">{item.variant.name} x{item.quantity}</p>
                  </div>
                  <p className="text-sm font-bold text-white tabular-nums shrink-0">{"£"}{(item.variant.price * item.quantity).toFixed(2)}</p>
                </div>
              ))}
            </div>

            <div className="h-px bg-[rgba(255,255,255,0.06)] mb-5" />

            {/* Coupon inline */}
            <div className="mb-5">
              {appliedCoupon ? (
                <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg border border-[#EF6F29]/20 bg-[#EF6F29]/5">
                  <Tag className="w-3.5 h-3.5 text-[#EF6F29]" />
                  <span className="text-xs font-bold text-[#EF6F29] flex-1">{appliedCoupon.code} (-{appliedCoupon.percent}%)</span>
                  <button onClick={() => { setAppliedCoupon(null); setCouponCode("") }} className="text-white/30 hover:text-white/60 transition-colors">
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <input
                    type="text" value={couponCode}
                    onChange={(e) => { setCouponCode(e.target.value); setCouponError("") }}
                    onKeyDown={(e) => e.key === "Enter" && applyCoupon()}
                    placeholder="Coupon code"
                    className="flex-1 rounded-lg border border-[rgba(255,255,255,0.06)] bg-white/[0.03] px-3 py-2 text-xs text-white placeholder:text-white/20 focus:outline-none focus:border-[rgba(255,255,255,0.12)] transition-all"
                  />
                  <button onClick={applyCoupon} className="px-4 py-2 rounded-lg border border-[rgba(255,255,255,0.06)] bg-white/[0.03] hover:bg-white/[0.06] text-xs font-semibold text-white/60 hover:text-white/80 transition-all">
                    Apply
                  </button>
                </div>
              )}
              {couponError && <p className="text-[10px] text-red-400 mt-1.5">{couponError}</p>}
            </div>

            {/* Totals */}
            <div className="space-y-2.5 mb-6">
              <div className="flex justify-between text-sm">
                <span className="text-white/40">Subtotal</span>
                <span className="text-white/70 font-medium tabular-nums">{"£"}{total.toFixed(2)}</span>
              </div>
              {appliedCoupon && (
                <div className="flex justify-between text-sm">
                  <span className="text-[#EF6F29]/80">Discount</span>
                  <span className="text-[#EF6F29] font-semibold tabular-nums">-{"£"}{discount.toFixed(2)}</span>
                </div>
              )}
              <div className="h-px bg-[rgba(255,255,255,0.06)]" />
              <div className="flex justify-between items-baseline pt-1">
                <span className="text-sm font-semibold text-white/60">Total</span>
                <span className="text-2xl font-black text-white tracking-tight tabular-nums">{"£"}{finalTotal.toFixed(2)}</span>
              </div>
            </div>

            {/* Trust row — pushed to bottom */}
            <div className="mt-auto pt-6">
              <div className="flex items-center gap-5">
                {[
                  { icon: Shield, label: "SSL" },
                  { icon: Zap, label: "Instant" },
                  { icon: Lock, label: "Secure" },
                ].map(({ icon: I, label }) => (
                  <div key={label} className="flex items-center gap-1.5">
                    <I className="w-3 h-3 text-white/15" />
                    <span className="text-[10px] text-white/20">{label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ======= RIGHT PANEL — Form / Pay ======= */}
          <div className="bg-[#111113] p-6 lg:p-10 flex flex-col">

            {/* === STEP 1: FORM === */}
            {step === "form" && (
              <div className="flex-1 flex flex-col max-w-md mx-auto w-full">

                {/* Email */}
                <div className="mb-5">
                  <label className="text-xs font-medium text-white/40 mb-2 block">
                    Email <span className="text-[#EF6F29]">*</span>
                  </label>
                  <input
                    type="email" value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onBlur={() => setEmailTouched(true)}
                    placeholder="your@email.com"
                    className={cn(
                      "w-full rounded-xl border bg-white/[0.03] px-4 py-3 text-sm text-white placeholder:text-white/15 focus:outline-none focus:ring-1 transition-all",
                      emailTouched && !email.trim().includes("@")
                        ? "border-red-500/40 focus:ring-red-500/30"
                        : "border-[rgba(255,255,255,0.06)] focus:ring-[#EF6F29]/30 focus:border-[#EF6F29]/30"
                    )}
                  />
                  {emailTouched && !email.trim().includes("@") && (
                    <p className="text-[10px] text-red-400 mt-1.5 flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3" /> Valid email required
                    </p>
                  )}
                </div>

                {/* Discord */}
                <div className="mb-6">
                  <label className="text-xs font-medium text-white/40 mb-2 flex items-center gap-1.5">
                    <DiscordIcon className="w-3 h-3" /> Discord <span className="text-white/15">(optional)</span>
                  </label>
                  <input
                    type="text" value={discordUser} onChange={(e) => setDiscordUser(e.target.value)}
                    placeholder="username"
                    className="w-full rounded-xl border border-[rgba(255,255,255,0.06)] bg-white/[0.03] px-4 py-3 text-sm text-white placeholder:text-white/15 focus:outline-none focus:ring-1 focus:ring-[#EF6F29]/30 focus:border-[#EF6F29]/30 transition-all"
                  />
                </div>

                {/* Payment method — tile grid */}
                <div className="mb-5">
                  <label className="text-xs font-medium text-white/40 mb-3 block">Payment method</label>
                  <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                    {/* BTC */}
                    {CRYPTO_OPTIONS.map((crypto) => {
                      const isSelected = paymentMethod === "crypto" && selectedCrypto.id === crypto.id
                      const Icon = crypto.icon
                      return (
                        <button
                          key={crypto.id}
                          onClick={() => { setPaymentMethod("crypto"); setSelectedCrypto(crypto) }}
                          className={cn(
                            "h-12 rounded-xl border flex flex-col items-center justify-center gap-0.5 transition-all",
                            isSelected
                              ? "border-[#EF6F29]/50 bg-[#EF6F29]/8"
                              : "border-[rgba(255,255,255,0.06)] bg-white/[0.02] hover:bg-white/[0.05] hover:border-[rgba(255,255,255,0.1)]"
                          )}
                        >
                          <Icon className="h-4 w-4" />
                          <span className="text-[9px] font-bold text-white/40">{crypto.ticker}</span>
                        </button>
                      )
                    })}
                    {/* PayPal */}
                    <button
                      onClick={() => setPaymentMethod("paypal")}
                      className={cn(
                        "h-12 rounded-xl border flex flex-col items-center justify-center gap-0.5 transition-all",
                        paymentMethod === "paypal"
                          ? "border-[#0070BA]/50 bg-[#0070BA]/8"
                          : "border-[rgba(255,255,255,0.06)] bg-white/[0.02] hover:bg-white/[0.05] hover:border-[rgba(255,255,255,0.1)]"
                      )}
                    >
                      <PayPalIcon className="h-4 w-4" />
                      <span className="text-[9px] font-bold text-white/40">PayPal</span>
                    </button>
                    {/* Discord */}
                    <button
                      onClick={() => setPaymentMethod("discord")}
                      className={cn(
                        "h-12 rounded-xl border flex flex-col items-center justify-center gap-0.5 transition-all",
                        paymentMethod === "discord"
                          ? "border-[#5865F2]/50 bg-[#5865F2]/8"
                          : "border-[rgba(255,255,255,0.06)] bg-white/[0.02] hover:bg-white/[0.05] hover:border-[rgba(255,255,255,0.1)]"
                      )}
                    >
                      <DiscordIcon className="h-4 w-4" />
                      <span className="text-[9px] font-bold text-white/40">Discord</span>
                    </button>
                  </div>
                </div>

                {/* Crypto amount preview */}
                {paymentMethod === "crypto" && getCryptoAmount(selectedCrypto.id, finalTotal) && (
                  <div className="mb-5 flex items-center gap-2 px-3 py-2 rounded-lg bg-white/[0.02] border border-[rgba(255,255,255,0.06)]">
                    {(() => { const Icon = selectedCrypto.icon; return <Icon className="h-4 w-4" /> })()}
                    <span className="text-xs font-mono text-white/50 tabular-nums">
                      ~{getCryptoAmount(selectedCrypto.id, finalTotal)} {selectedCrypto.ticker}
                    </span>
                    <button onClick={fetchRates} className="ml-auto p-1 text-white/20 hover:text-white/50 transition-colors" title="Refresh rate">
                      <RefreshCw className={cn("h-3 w-3", ratesLoading && "animate-spin")} />
                    </button>
                  </div>
                )}

                {/* PayPal Discord requirement */}
                {paymentMethod === "paypal" && (
                  <div className="mb-5 p-3 rounded-xl border border-[#003087]/15 bg-[#003087]/5">
                    <p className="text-[11px] text-white/50 mb-2">Include your Discord username in the PayPal payment note</p>
                    <input
                      type="text" value={discordUser} onChange={(e) => setDiscordUser(e.target.value)}
                      placeholder="Discord username"
                      className="w-full rounded-lg border border-[#003087]/15 bg-white/[0.03] px-3 py-2 text-xs text-white placeholder:text-white/15 focus:outline-none focus:ring-1 focus:ring-[#003087]/30 transition-all"
                    />
                  </div>
                )}

                {/* TOS */}
                <label className="flex items-start gap-3 cursor-pointer group mb-6">
                  <div className={cn(
                    "mt-0.5 h-5 w-5 rounded-md border flex items-center justify-center shrink-0 transition-all",
                    agreedTos ? "bg-[#EF6F29] border-[#EF6F29]" : "border-[rgba(255,255,255,0.12)] group-hover:border-[rgba(255,255,255,0.2)]"
                  )}>
                    {agreedTos && <Check className="h-3 w-3 text-white" />}
                  </div>
                  <input type="checkbox" checked={agreedTos} onChange={(e) => setAgreedTos(e.target.checked)} className="sr-only" />
                  <span className="text-[11px] text-white/30 leading-relaxed group-hover:text-white/40 transition-colors">
                    {"I agree to the Terms of Service. All sales are final. Products are delivered digitally."}
                  </span>
                </label>

                {/* Continue */}
                <button
                  disabled={!canProceed}
                  onClick={handleProceed}
                  className={cn(
                    "w-full py-3.5 font-bold text-sm rounded-xl transition-all flex items-center justify-center gap-2.5 mt-auto",
                    canProceed
                      ? "bg-[#EF6F29] hover:bg-[#EF6F29]/90 text-white active:scale-[0.98]"
                      : "bg-white/[0.04] text-white/20 cursor-not-allowed"
                  )}
                >
                  {paymentMethod === "discord" ? (
                    <>Open Discord <ExternalLink className="h-3.5 w-3.5" /></>
                  ) : (
                    <>Continue <ArrowRight className="h-3.5 w-3.5" /></>
                  )}
                </button>
              </div>
            )}

            {/* === STEP 2: PAY === */}
            {step === "pay" && (
              <div className="flex-1 flex flex-col max-w-md mx-auto w-full">

                {/* Timer bar */}
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Clock className={cn("h-3.5 w-3.5", timeLeft < 300 ? "text-red-400" : "text-[#EF6F29]")} />
                      <span className={cn("text-sm font-mono font-bold tabular-nums", timeLeft < 300 ? "text-red-400" : "text-white/70")}>
                        {formatTime(timeLeft)}
                      </span>
                    </div>
                    <span className="text-[10px] text-white/20">Send before expiry</span>
                  </div>
                  <div className="h-1 rounded-full bg-white/[0.04] overflow-hidden">
                    <div
                      className={cn("h-full rounded-full transition-all duration-1000", timeLeft < 300 ? "bg-red-500" : "bg-[#EF6F29]")}
                      style={{ width: `${(timeLeft / TIMER_SECONDS) * 100}%` }}
                    />
                  </div>
                </div>

                {/* Crypto pay */}
                {paymentMethod === "crypto" && (
                  <div className="flex-1 flex flex-col">

                    {/* QR code centered */}
                    <div className="flex justify-center mb-6">
                      <div className="p-2 bg-white rounded-xl">
                        <Image
                          src={`https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(selectedCrypto.address)}&bgcolor=FFFFFF&color=000000&format=png&margin=1`}
                          alt={`${selectedCrypto.name} QR`} width={160} height={160}
                          className="rounded-lg" unoptimized crossOrigin="anonymous"
                        />
                      </div>
                    </div>

                    {/* Amount */}
                    <div className="mb-4">
                      <label className="text-[10px] text-white/25 font-medium uppercase tracking-wider mb-1.5 block">Amount</label>
                      <div
                        onClick={() => copyToClipboard(getCryptoAmount(selectedCrypto.id, finalTotal) || "", "amount")}
                        className="flex items-center justify-between rounded-xl border border-[rgba(255,255,255,0.06)] bg-white/[0.02] px-4 py-3 cursor-pointer hover:bg-white/[0.04] transition-all group"
                      >
                        <div className="flex items-center gap-2">
                          {(() => { const Icon = selectedCrypto.icon; return <Icon className="h-4 w-4" /> })()}
                          <span className="text-sm font-mono font-bold tabular-nums" style={{ color: selectedCrypto.color }}>
                            {getCryptoAmount(selectedCrypto.id, finalTotal)} {selectedCrypto.ticker}
                          </span>
                        </div>
                        <button className="text-white/20 group-hover:text-white/50 transition-colors">
                          {copiedField === "amount" ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>

                    {/* Wallet address */}
                    <div className="mb-5">
                      <label className="text-[10px] text-white/25 font-medium uppercase tracking-wider mb-1.5 block">Wallet address</label>
                      <div
                        onClick={() => copyToClipboard(selectedCrypto.address, "wallet")}
                        className="flex items-center gap-3 rounded-xl border border-[rgba(255,255,255,0.06)] bg-white/[0.02] px-4 py-3 cursor-pointer hover:bg-white/[0.04] transition-all group"
                      >
                        <p className="font-mono text-[11px] break-all text-white/50 flex-1 leading-relaxed select-all">
                          {selectedCrypto.address}
                        </p>
                        <button className="text-white/20 group-hover:text-white/50 transition-colors shrink-0">
                          {copiedField === "wallet" ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>

                    {/* Warning */}
                    <div className="flex items-start gap-2.5 p-3 rounded-xl bg-amber-500/[0.04] border border-amber-500/10 mb-6">
                      <AlertTriangle className="h-3.5 w-3.5 text-amber-400 shrink-0 mt-0.5" />
                      <p className="text-[11px] text-white/40 leading-relaxed">
                        Send only <strong className="text-white/70">{selectedCrypto.ticker}</strong> on the <strong className="text-white/70">{selectedCrypto.name.includes("TRC") ? "TRON" : selectedCrypto.name.includes("Ethereum") ? "Ethereum" : selectedCrypto.name}</strong> network.
                      </p>
                    </div>
                  </div>
                )}

                {/* PayPal pay */}
                {paymentMethod === "paypal" && (
                  <div className="flex-1 flex flex-col">
                    <div className="mb-4">
                      <label className="text-[10px] text-white/25 font-medium uppercase tracking-wider mb-1.5 block">PayPal Email (Friends & Family)</label>
                      <div
                        onClick={() => copyToClipboard(PAYPAL_EMAIL, "paypal")}
                        className="flex items-center justify-between rounded-xl border border-[rgba(255,255,255,0.06)] bg-white/[0.02] px-4 py-3 cursor-pointer hover:bg-white/[0.04] transition-all group"
                      >
                        <span className="font-mono text-sm text-white/70 select-all">{PAYPAL_EMAIL}</span>
                        <button className="text-white/20 group-hover:text-white/50 transition-colors">
                          {copiedField === "paypal" ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>

                    <div className="mb-4">
                      <label className="text-[10px] text-white/25 font-medium uppercase tracking-wider mb-1.5 block">Payment Note</label>
                      <div className="rounded-xl border border-[rgba(255,255,255,0.06)] bg-white/[0.02] px-4 py-3 text-sm text-white/50">
                        {"Discord: "}<strong className="text-[#EF6F29]">{discordUser || "your_username"}</strong>
                      </div>
                    </div>

                    <div className="flex items-start gap-2.5 p-3 rounded-xl bg-amber-500/[0.04] border border-amber-500/10 mb-6">
                      <AlertTriangle className="h-3.5 w-3.5 text-amber-400 shrink-0 mt-0.5" />
                      <p className="text-[11px] text-white/40 leading-relaxed">
                        <strong className="text-white/60">Friends & Family ONLY.</strong>{" Include your Discord username in the note."}
                      </p>
                    </div>
                  </div>
                )}

                {/* Confirm button */}
                <button
                  onClick={handleConfirmPayment}
                  disabled={timeLeft <= 0}
                  className={cn(
                    "w-full py-3.5 font-bold text-sm rounded-xl transition-all flex items-center justify-center gap-2.5 mt-auto",
                    timeLeft > 0
                      ? "bg-[#EF6F29] hover:bg-[#EF6F29]/90 text-white active:scale-[0.98]"
                      : "bg-white/[0.04] text-white/20 cursor-not-allowed"
                  )}
                >
                  {timeLeft <= 0 ? "Session Expired" : (
                    <>
                      <CheckCircle2 className="h-4 w-4" />
                      {"I've sent the payment"}
                    </>
                  )}
                </button>

                <button
                  onClick={() => { setStep("form"); setTimeLeft(TIMER_SECONDS) }}
                  className="w-full text-center text-[11px] text-white/20 hover:text-white/40 transition-colors py-3 mt-2"
                >
                  Change payment method
                </button>
              </div>
            )}
          </div>

        </div>
      </section>

      <Footer />
    </main>
  )
}
