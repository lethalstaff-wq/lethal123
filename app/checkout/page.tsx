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

  /* ---- Order Summary Component (reused) ---- */
  const OrderSummaryContent = () => (
    <>
      {/* Products list */}
      <div className="space-y-4 mb-6">
        {items.map((item) => (
          <div key={item.variant.id} className="flex items-center gap-3">
            <div className="w-14 h-14 rounded-xl bg-white/[0.03] border border-border/30 flex items-center justify-center overflow-hidden flex-shrink-0">
              {item.variant.product?.image ? (
                <Image src={item.variant.product.image} alt="" width={48} height={48} className="object-contain" />
              ) : (
                <Package className="w-5 h-5 text-muted-foreground/30" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold truncate">{item.variant.product?.name || item.variant.name}</p>
              <p className="text-xs text-muted-foreground">{item.variant.name} &times; {item.quantity}</p>
            </div>
            <p className="text-sm font-bold tabular-nums">{"£"}{(item.variant.price * item.quantity).toFixed(2)}</p>
          </div>
        ))}
      </div>

      {/* Totals */}
      <div className="border-t border-border/30 pt-4 space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Subtotal</span>
          <span className="tabular-nums">{"£"}{total.toFixed(2)}</span>
        </div>
        {appliedCoupon && (
          <div className="flex justify-between text-sm">
            <span className="text-emerald-400">Discount ({appliedCoupon.percent}%)</span>
            <span className="text-emerald-400 tabular-nums">-{"£"}{discount.toFixed(2)}</span>
          </div>
        )}
        <div className="border-t border-border/30 pt-3 mt-3">
          <div className="flex justify-between">
            <span className="font-bold">Total</span>
            <span className="text-xl font-black tabular-nums">{"£"}{finalTotal.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Trust badges */}
      <div className="mt-6 pt-4 border-t border-border/30 space-y-2">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Lock className="h-3 w-3 text-primary/60" />
          <span>Secure &amp; encrypted checkout</span>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Zap className="h-3 w-3 text-primary/60" />
          <span>Instant digital delivery</span>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Shield className="h-3 w-3 text-primary/60" />
          <span>Buyer protection guaranteed</span>
        </div>
      </div>
    </>
  )

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
  const cryptoAmount = getCryptoAmount(selectedCrypto.id, finalTotal)

  return (
    <main className="flex min-h-screen flex-col bg-background">
      <Navbar />

      <section className="flex-1 pt-28 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto max-w-6xl">

          {/* Header row */}
          <div className="flex items-center justify-between mb-8">
            {step === "form" ? (
              <Link href="/products" className="inline-flex items-center gap-2.5 text-sm text-muted-foreground hover:text-foreground transition-colors group">
                <div className="w-8 h-8 rounded-lg bg-card border border-border/50 flex items-center justify-center group-hover:border-border transition-colors">
                  <ArrowLeft className="h-3.5 w-3.5 transition-transform group-hover:-translate-x-0.5" />
                </div>
                <span className="hidden sm:inline font-medium">Back to Cart</span>
              </Link>
            ) : (
              <button onClick={() => { setStep("form"); setTimeLeft(TIMER_SECONDS) }} className="inline-flex items-center gap-2.5 text-sm text-muted-foreground hover:text-foreground transition-colors group">
                <div className="w-8 h-8 rounded-lg bg-card border border-border/50 flex items-center justify-center group-hover:border-border transition-colors">
                  <ArrowLeft className="h-3.5 w-3.5 transition-transform group-hover:-translate-x-0.5" />
                </div>
                <span className="hidden sm:inline font-medium">Back to Details</span>
              </button>
            )}
            <div className="flex items-center gap-2 text-xs text-muted-foreground/50 bg-card/50 border border-border/30 px-3 py-1.5 rounded-full">
              <Lock className="h-3 w-3" />
              <span className="hidden sm:inline">Encrypted &amp; Secure</span>
            </div>
          </div>

          {/* Progress Steps */}
          <div className="flex items-center gap-4 mb-8">
            <div className={`flex items-center gap-2 ${step === "form" ? "text-primary" : "text-emerald-500"}`}>
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                step === "form" ? "bg-primary text-white" : "bg-emerald-500 text-white"
              }`}>
                {step !== "form" ? <Check className="h-4 w-4" /> : "1"}
              </div>
              <span className="text-sm font-semibold">Details &amp; Payment</span>
            </div>
            <div className="flex-1 h-px bg-border/50 relative">
              <div className={`absolute inset-y-0 left-0 bg-primary transition-all duration-500 ${step !== "form" ? "w-full" : "w-0"}`} />
            </div>
            <div className={`flex items-center gap-2 ${step !== "form" ? "text-primary" : "text-muted-foreground"}`}>
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                step !== "form" ? "bg-primary text-white" : "bg-muted/50 text-muted-foreground"
              }`}>2</div>
              <span className="text-sm font-semibold">Send Payment</span>
            </div>
          </div>

          {/* Mobile Collapsible Order Summary */}
          <details className="lg:hidden rounded-2xl border border-border/40 bg-card/50 mb-6">
            <summary className="flex items-center justify-between p-4 cursor-pointer">
              <span className="font-bold text-sm">Order Summary ({items.length} {items.length === 1 ? "item" : "items"})</span>
              <span className="font-bold tabular-nums">{"£"}{finalTotal.toFixed(2)}</span>
            </summary>
            <div className="p-4 pt-0">
              <OrderSummaryContent />
            </div>
          </details>

          {/* Two Column Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">

            {/* ======= LEFT COLUMN (60%) ======= */}
            <div className="lg:col-span-3 order-1">

              {/* === STEP 1: FORM === */}
              {step === "form" && (
                <div className="space-y-6">

                  {/* Contact Information */}
                  <div className="rounded-2xl border border-border/40 bg-card/50 p-6">
                    <div className="flex items-center gap-3 mb-5">
                      <div className="w-7 h-7 rounded-lg bg-primary/15 flex items-center justify-center text-xs font-bold text-primary">1</div>
                      <h2 className="text-base font-bold">Contact Information</h2>
                    </div>
                    <div className="space-y-5">
                      <div>
                        <label className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground mb-2 block">
                          Email <span className="text-primary">*</span>
                        </label>
                        <input
                          type="email" value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          onBlur={() => setEmailTouched(true)}
                          placeholder="your@email.com"
                          className={cn(
                            "w-full h-12 px-4 rounded-xl bg-white/[0.03] border text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-primary/20 transition-all",
                            emailTouched && !email.trim().includes("@")
                              ? "border-destructive/40 focus:border-destructive"
                              : "border-border/40 focus:border-primary"
                          )}
                        />
                        {emailTouched && !email.trim().includes("@") ? (
                          <p className="text-[11px] text-destructive mt-2 flex items-center gap-1"><AlertTriangle className="w-3 h-3" /> Please enter a valid email</p>
                        ) : (
                          <p className="text-[11px] text-muted-foreground mt-2 flex items-center gap-1"><Zap className="h-3 w-3 text-primary/60" /> License key delivered instantly</p>
                        )}
                      </div>
                      <div>
                        <label className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground mb-2 flex items-center gap-1.5">
                          <DiscordIcon className="w-3.5 h-3.5" /> Discord <span className="text-muted-foreground/40 font-normal normal-case tracking-normal">(optional)</span>
                        </label>
                        <input
                          type="text" value={discordUser} onChange={(e) => setDiscordUser(e.target.value)}
                          placeholder="username"
                          className="w-full h-12 px-4 rounded-xl bg-white/[0.03] border border-border/40 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Payment Method */}
                  <div className="rounded-2xl border border-border/40 bg-card/50 p-6">
                    <div className="flex items-center gap-3 mb-5">
                      <div className="w-7 h-7 rounded-lg bg-primary/15 flex items-center justify-center text-xs font-bold text-primary">2</div>
                      <h2 className="text-base font-bold">Payment Method</h2>
                    </div>
                    <div className="space-y-2.5">
                      {CRYPTO_OPTIONS.map((option) => {
                        const isSelected = paymentMethod === "crypto" && selectedCrypto.id === option.id
                        const amt = getCryptoAmount(option.id, finalTotal)
                        const Icon = option.icon
                        return (
                          <button key={option.id} onClick={() => { setPaymentMethod("crypto"); setSelectedCrypto(option) }}
                            className={`w-full flex items-center gap-4 p-4 rounded-xl border transition-all ${
                              isSelected
                                ? "border-primary bg-primary/[0.06]"
                                : "border-border/30 hover:border-primary/30 hover:bg-white/[0.02]"
                            }`}>
                            <Icon className="h-10 w-10" style={{ color: option.color }} />
                            <div className="text-left flex-1">
                              <p className="font-semibold text-sm">{option.name}</p>
                              <p className="text-xs text-muted-foreground font-mono">
                                {option.ticker} {amt ? `~${amt} ${option.ticker}` : ""}
                              </p>
                            </div>
                            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                              isSelected ? "border-primary" : "border-border/40"
                            }`}>
                              {isSelected && <div className="w-2.5 h-2.5 rounded-full bg-primary" />}
                            </div>
                          </button>
                        )
                      })}

                      {/* PayPal */}
                      <button onClick={() => setPaymentMethod("paypal")}
                        className={`w-full flex items-center gap-4 p-4 rounded-xl border transition-all ${
                          paymentMethod === "paypal"
                            ? "border-primary bg-primary/[0.06]"
                            : "border-border/30 hover:border-primary/30 hover:bg-white/[0.02]"
                        }`}>
                        <PayPalIcon className="h-10 w-10" />
                        <div className="text-left flex-1">
                          <p className="font-semibold text-sm">PayPal</p>
                          <p className="text-xs text-muted-foreground">Friends &amp; Family only</p>
                        </div>
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                          paymentMethod === "paypal" ? "border-primary" : "border-border/40"
                        }`}>
                          {paymentMethod === "paypal" && <div className="w-2.5 h-2.5 rounded-full bg-primary" />}
                        </div>
                      </button>

                      {/* Discord */}
                      <button onClick={() => setPaymentMethod("discord")}
                        className={`w-full flex items-center gap-4 p-4 rounded-xl border transition-all ${
                          paymentMethod === "discord"
                            ? "border-primary bg-primary/[0.06]"
                            : "border-border/30 hover:border-primary/30 hover:bg-white/[0.02]"
                        }`}>
                        <DiscordIcon className="h-10 w-10" />
                        <div className="text-left flex-1">
                          <p className="font-semibold text-sm">Via Discord</p>
                          <p className="text-xs text-muted-foreground">Open a ticket</p>
                        </div>
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                          paymentMethod === "discord" ? "border-primary" : "border-border/40"
                        }`}>
                          {paymentMethod === "discord" && <div className="w-2.5 h-2.5 rounded-full bg-primary" />}
                        </div>
                      </button>
                    </div>
                  </div>

                  {paymentMethod === "paypal" && (
                    <div className="rounded-2xl border border-[#003087]/20 bg-[#003087]/5 p-5">
                      <p className="text-sm font-bold mb-3 flex items-center gap-2"><DiscordIcon className="w-4 h-4" /> Discord Username Required</p>
                      <input type="text" value={discordUser} onChange={(e) => setDiscordUser(e.target.value)} placeholder="Enter Discord username"
                        className="w-full h-12 px-4 rounded-xl bg-white/[0.03] border border-[#003087]/15 text-sm placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-[#003087]/20 transition-all" />
                    </div>
                  )}

                  {/* Discount Code */}
                  <div className="rounded-2xl border border-border/40 bg-card/50 p-6">
                    <div className="flex items-center gap-2 mb-4">
                      <Tag className="h-4 w-4 text-primary" />
                      <h3 className="text-sm font-bold">Discount Code</h3>
                    </div>
                    {appliedCoupon ? (
                      <div className="flex items-center gap-3 rounded-xl border border-primary/20 bg-primary/5 px-4 py-3.5">
                        <Sparkles className="w-4 h-4 text-primary" />
                        <div className="flex-1">
                          <p className="text-sm font-black text-primary">{appliedCoupon.code}</p>
                          <p className="text-[11px] text-primary/60">{appliedCoupon.percent}% discount applied</p>
                        </div>
                        <button onClick={() => { setAppliedCoupon(null); setCouponCode("") }} className="p-1.5 hover:bg-muted/30 rounded-lg transition-colors"><X className="h-4 w-4 text-muted-foreground" /></button>
                      </div>
                    ) : (
                      <div className="flex gap-2">
                        <input type="text" value={couponCode}
                          onChange={(e) => { setCouponCode(e.target.value); setCouponError("") }}
                          onKeyDown={(e) => e.key === "Enter" && applyCoupon()}
                          placeholder="Enter code"
                          className="flex-1 h-11 px-4 rounded-xl bg-white/[0.03] border border-border/40 text-sm font-mono placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary transition-all" />
                        <button onClick={applyCoupon}
                          className="px-5 h-11 rounded-xl bg-white/[0.06] border border-border/40 text-sm font-semibold hover:bg-white/[0.1] transition-all">
                          Apply
                        </button>
                      </div>
                    )}
                    {appliedCoupon && (
                      <p className="text-xs text-emerald-400 mt-2 flex items-center gap-1">
                        <Check className="h-3 w-3" /> {appliedCoupon.code}: {appliedCoupon.percent}% off applied
                      </p>
                    )}
                    {couponError && <p className="text-xs text-red-400 mt-2">{couponError}</p>}
                  </div>

                  {/* TOS */}
                  <label className="flex items-start gap-3 cursor-pointer group px-1 py-1">
                    <div className={cn(
                      "mt-0.5 h-5 w-5 rounded-md border-2 flex items-center justify-center shrink-0 transition-all duration-200",
                      agreedTos ? "bg-primary border-primary shadow-[0_0_10px_rgba(var(--primary-rgb),0.3)]" : "border-border/40 group-hover:border-border/60"
                    )}>
                      {agreedTos && <Check className="h-3 w-3 text-primary-foreground" />}
                    </div>
                    <input type="checkbox" checked={agreedTos} onChange={(e) => setAgreedTos(e.target.checked)} className="sr-only" />
                    <span className="text-xs text-muted-foreground/60 leading-relaxed">
                      {"I agree to the Terms of Service. All sales are final. Products are delivered digitally."}
                    </span>
                  </label>

                  {/* Continue Button */}
                  <button disabled={!canProceed} onClick={handleProceed}
                    className="w-full h-14 rounded-xl bg-primary hover:bg-primary/90 text-white font-bold text-base flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 mt-6">
                    {paymentMethod === "discord" ? (
                      <>Open Discord <ExternalLink className="h-4 w-4" /></>
                    ) : (
                      <><Lock className="h-4 w-4" /> Continue to Payment <ArrowRight className="h-4 w-4" /></>
                    )}
                  </button>
                </div>
              )}

              {/* === STEP 2: PAY === */}
              {step === "pay" && (
                <div className="space-y-6">

                  {/* Timer bar */}
                  <div className="rounded-2xl border border-border/40 bg-card/50 p-5">
                    <div className="flex items-center gap-3 mb-3">
                      <Clock className={cn("h-4 w-4", timeLeft < 300 ? "text-destructive" : "text-primary")} />
                      <span className={cn("text-xl font-mono font-bold", timeLeft < 300 ? "text-destructive" : "text-primary")}>{formatTime(timeLeft)}</span>
                      <span className="text-sm text-muted-foreground">remaining</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-white/[0.06] overflow-hidden">
                      <div
                        className={cn("h-full rounded-full transition-all duration-1000", timeLeft < 300 ? "bg-destructive" : "bg-gradient-to-r from-primary to-accent")}
                        style={{ width: `${(timeLeft / TIMER_SECONDS) * 100}%` }}
                      />
                    </div>
                  </div>

                  {/* Crypto payment details */}
                  {paymentMethod === "crypto" && (
                    <div className="rounded-2xl border border-border/40 bg-card/50 p-6">
                      {/* Crypto name */}
                      <div className="flex items-center gap-3 mb-6">
                        {(() => { const Icon = selectedCrypto.icon; return <Icon className="h-8 w-8" style={{ color: selectedCrypto.color }} /> })()}
                        <div>
                          <p className="font-bold">{selectedCrypto.name}</p>
                          <p className="text-xs text-muted-foreground">{selectedCrypto.name.includes("TRC") ? "TRON Network" : selectedCrypto.name.includes("Ethereum") ? "Ethereum Network" : `${selectedCrypto.name} Mainnet`}</p>
                        </div>
                      </div>

                      {/* Amount */}
                      <div className="rounded-xl bg-white/[0.03] border border-border/30 p-5 text-center mb-6">
                        <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1">Amount Due</p>
                        <p className="text-3xl font-black text-foreground">
                          {cryptoAmount} <span className="text-lg text-muted-foreground">{selectedCrypto.ticker}</span>
                        </p>
                        <button onClick={() => copyToClipboard(cryptoAmount || "", "amount")}
                          className={cn("mt-3 inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all",
                            copiedField === "amount" ? "bg-emerald-500/15 text-emerald-400" : "bg-muted/10 text-muted-foreground/60 hover:text-foreground hover:bg-muted/20"
                          )}>{copiedField === "amount" ? <><Check className="h-3 w-3" /> Copied</> : <><Copy className="h-3 w-3" /> Copy Amount</>}</button>
                      </div>

                      {/* QR Code */}
                      <div className="flex justify-center mb-6">
                        <div className="p-4 bg-white rounded-2xl">
                          <Image src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(selectedCrypto.address)}&bgcolor=FFFFFF&color=000000&format=png&margin=1`} alt="QR" width={200} height={200} className="rounded-lg" unoptimized crossOrigin="anonymous" />
                        </div>
                      </div>

                      {/* Wallet Address */}
                      <div className="mb-6">
                        <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-2">Wallet Address</p>
                        <div className="flex items-center gap-2 p-3 rounded-xl bg-white/[0.03] border border-border/30">
                          <code className="text-xs text-muted-foreground flex-1 truncate">{selectedCrypto.address}</code>
                          <button onClick={() => copyToClipboard(selectedCrypto.address, "wallet")}
                            className={cn("shrink-0 inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all",
                              copiedField === "wallet" ? "bg-emerald-500/15 text-emerald-400" : "bg-muted/10 text-muted-foreground/60 hover:text-foreground"
                            )}>{copiedField === "wallet" ? <><Check className="h-3 w-3" /> Copied</> : <><Copy className="h-3 w-3" /> Copy</>}</button>
                        </div>
                      </div>

                      {/* Warning */}
                      <div className="flex items-start gap-2 p-3 rounded-xl bg-yellow-500/5 border border-yellow-500/10 mb-6">
                        <AlertTriangle className="h-4 w-4 text-yellow-500 mt-0.5 shrink-0" />
                        <p className="text-xs text-muted-foreground">
                          Send only <span className="text-yellow-500 font-bold">{selectedCrypto.ticker}</span> on the correct network. Other assets will be lost.
                        </p>
                      </div>

                      {/* Confirm button */}
                      <button onClick={handleConfirmPayment} disabled={timeLeft <= 0}
                        className="w-full h-14 rounded-xl bg-primary hover:bg-primary/90 text-white font-bold text-base flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30">
                        {timeLeft <= 0 ? "Session Expired" : <><CheckCircle2 className="h-4 w-4" /> Confirm Payment Sent</>}
                      </button>

                      <button onClick={() => { setStep("form"); setTimeLeft(TIMER_SECONDS) }}
                        className="w-full text-center mt-3 text-sm text-muted-foreground hover:text-primary transition-colors">
                        Change payment method
                      </button>
                    </div>
                  )}

                  {/* PayPal payment details */}
                  {paymentMethod === "paypal" && (
                    <div className="rounded-2xl border border-border/40 bg-card/50 p-6">
                      <div className="flex items-center gap-3 mb-6">
                        <PayPalIcon className="h-8 w-8" />
                        <div>
                          <p className="font-bold">PayPal</p>
                          <p className="text-xs text-muted-foreground">Friends &amp; Family only</p>
                        </div>
                      </div>

                      <div className="rounded-xl bg-white/[0.03] border border-border/30 p-5 text-center mb-6">
                        <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1">Send To</p>
                        <p className="text-lg font-bold">{PAYPAL_EMAIL}</p>
                        <button onClick={() => copyToClipboard(PAYPAL_EMAIL, "paypal")}
                          className={cn("mt-2 inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all",
                            copiedField === "paypal" ? "bg-emerald-500/15 text-emerald-400" : "bg-muted/10 text-muted-foreground/60 hover:text-foreground hover:bg-muted/20"
                          )}>{copiedField === "paypal" ? <><Check className="h-3 w-3" /> Copied</> : <><Copy className="h-3 w-3" /> Copy</>}</button>
                      </div>

                      <div className="rounded-xl bg-white/[0.03] border border-border/30 p-5 text-center mb-6">
                        <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1">Amount</p>
                        <p className="text-3xl font-black">{"£"}{finalTotal.toFixed(2)}</p>
                      </div>

                      <div className="flex items-start gap-2 p-3 rounded-xl bg-yellow-500/5 border border-yellow-500/10 mb-6">
                        <AlertTriangle className="h-4 w-4 text-yellow-500 mt-0.5 shrink-0" />
                        <p className="text-xs text-muted-foreground">
                          Send as <span className="text-yellow-500 font-bold">Friends &amp; Family</span>. Include order ID <span className="font-mono font-bold text-foreground">{orderId}</span> in the note.
                        </p>
                      </div>

                      <button onClick={handleConfirmPayment} disabled={timeLeft <= 0}
                        className="w-full h-14 rounded-xl bg-primary hover:bg-primary/90 text-white font-bold text-base flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30">
                        {timeLeft <= 0 ? "Session Expired" : <><CheckCircle2 className="h-4 w-4" /> Confirm Payment Sent</>}
                      </button>

                      <button onClick={() => { setStep("form"); setTimeLeft(TIMER_SECONDS) }}
                        className="w-full text-center mt-3 text-sm text-muted-foreground hover:text-primary transition-colors">
                        Change payment method
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* ======= RIGHT COLUMN (40%) — Order Summary (sticky, hidden on mobile) ======= */}
            <div className="lg:col-span-2 order-2 hidden lg:block">
              <div className="lg:sticky lg:top-24">
                <div className="rounded-2xl border border-border/40 bg-card/50 p-6">
                  <div className="flex items-center gap-2 mb-5">
                    <Package className="h-4 w-4 text-muted-foreground" />
                    <h3 className="text-base font-bold">Order Summary</h3>
                    <span className="ml-auto text-xs text-muted-foreground font-mono">{orderId}</span>
                  </div>
                  <OrderSummaryContent />
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
