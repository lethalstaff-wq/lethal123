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
import { PRODUCTS } from "@/lib/products"
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
  const { items, total, clearCart, addItem } = useCart()

  const [email, setEmail] = useState("")
  const [discordUser, setDiscordUser] = useState("")
  const [orderNotes, setOrderNotes] = useState("")
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
  const [autoRenew, setAutoRenew] = useState(false)
  const [shipping, setShipping] = useState({
    fullName: "",
    line1: "",
    line2: "",
    city: "",
    postalCode: "",
    country: "",
    phone: "",
  })
  const [cryptoRates, setCryptoRates] = useState<Record<string, number>>({})
  const [ratesLoading, setRatesLoading] = useState(false)
  const [ratesUpdatedAt, setRatesUpdatedAt] = useState<number | null>(null)
  const [ratesNextRefresh, setRatesNextRefresh] = useState(60)
  const [emailTouched, setEmailTouched] = useState(false)

  const discount = appliedCoupon ? (total * appliedCoupon.percent) / 100 : 0
  const finalTotal = total - discount
  // Only show renewal reminder for time-limited subscriptions (daily/weekly/monthly/quarterly/yearly).
  // One-time / lifetime / bundle / firmware variants don't expire, no renewal needed.
  const SUBSCRIPTION_RE = /(day|week|month|quarter|annual|year)s?\b/i
  const hasRenewableItems = items.some((i) => {
    const name = i.variant.name || ""
    if (i.variant.is_lifetime) return false
    if (name.toLowerCase().includes("lifetime")) return false
    if (name.toLowerCase().includes("one-time")) return false
    return SUBSCRIPTION_RE.test(name)
  })
  // Physical bundles ship real hardware — require shipping address at checkout.
  const hasPhysicalItems = items.some((i) => i.variant.product?.category === "bundle")
  const shippingComplete =
    shipping.fullName.trim().length > 1 &&
    shipping.line1.trim().length > 3 &&
    shipping.city.trim().length > 1 &&
    shipping.postalCode.trim().length > 2 &&
    shipping.country.trim().length > 1

  const fetchRates = useCallback(async () => {
    setRatesLoading(true)
    try {
      const res = await fetch("/api/rates")
      const data = await res.json()
      if (!data.error) setCryptoRates(data)
      else setCryptoRates({ btc: 78000, eth: 2100, usdt: 1, ltc: 75 })
    } catch { setCryptoRates({ btc: 78000, eth: 2100, usdt: 1, ltc: 75 }) }
    setRatesLoading(false)
    setRatesUpdatedAt(Date.now())
    setRatesNextRefresh(60)
  }, [])

  useEffect(() => { fetchRates() }, [fetchRates])

  // Auto-refresh crypto rates every 60s while on the pay step, with visible countdown
  useEffect(() => {
    if (step !== "pay" || paymentMethod !== "crypto") return
    const tick = setInterval(() => {
      setRatesNextRefresh((s) => {
        if (s <= 1) { fetchRates(); return 60 }
        return s - 1
      })
    }, 1000)
    return () => clearInterval(tick)
  }, [step, paymentMethod, fetchRates])

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

  const canProceed = email.trim().includes("@") && paymentMethod && agreedTos && (!hasPhysicalItems || shippingComplete)

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
        auto_renew: autoRenew && hasRenewableItems,
        shipping_address: hasPhysicalItems ? shipping : undefined,
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
            <div className="w-14 h-14 rounded-xl bg-white/[0.03] border border-white/[0.04] flex items-center justify-center overflow-hidden flex-shrink-0">
              {item.variant.product?.image ? (
                <Image src={item.variant.product.image} alt="" width={48} height={48} className="object-contain" />
              ) : (
                <Package className="w-5 h-5 text-white/20" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold truncate text-white/90">{item.variant.product?.name || item.variant.name}</p>
              <p className="text-xs text-white/40">{item.variant.name} &times; {item.quantity}</p>
            </div>
            <p className="text-sm font-bold tabular-nums text-white/90">{"£"}{(item.variant.price * item.quantity).toFixed(2)}</p>
          </div>
        ))}
      </div>

      {/* Totals */}
      <div className="border-t border-white/[0.06] pt-4 space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-white/40">Subtotal</span>
          <span className="tabular-nums text-white/90">{"£"}{total.toFixed(2)}</span>
        </div>
        {appliedCoupon && (
          <div className="flex justify-between text-sm">
            <span className="text-emerald-400">Discount ({appliedCoupon.percent}%)</span>
            <span className="text-emerald-400 tabular-nums">-{"£"}{discount.toFixed(2)}</span>
          </div>
        )}
        <div className="border-t border-white/[0.06] pt-3 mt-3">
          <div className="flex justify-between">
            <span className="font-bold text-white/90">Total</span>
            <span className="text-xl font-black tabular-nums text-white">{"£"}{finalTotal.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Trust badges */}
      <div className="mt-6 pt-4 border-t border-white/[0.06] space-y-2">
        <div className="flex items-center gap-2 text-xs text-white/30">
          <Lock className="h-3 w-3 text-[#f97316]/60" />
          <span>Secure &amp; encrypted checkout</span>
        </div>
        <div className="flex items-center gap-2 text-xs text-white/30">
          <Zap className="h-3 w-3 text-[#f97316]/60" />
          <span>Instant digital delivery</span>
        </div>
        <div className="flex items-center gap-2 text-xs text-white/30">
          <Shield className="h-3 w-3 text-[#f97316]/60" />
          <span>Buyer protection guaranteed</span>
        </div>
      </div>
    </>
  )

  /* ---- EMPTY CART ---- */
  if (items.length === 0 && step !== "confirming" && step !== "done") {
    return (
      <main className="flex min-h-screen flex-col bg-black">
        <Navbar />
        <section className="flex-1 flex items-center justify-center px-4 py-32">
          <div className="text-center max-w-md">
            <div className="relative mx-auto w-24 h-24 mb-8">
              <div className="absolute inset-0 rounded-3xl bg-[#f97316]/10 blur-xl animate-pulse" />
              <div className="relative w-24 h-24 rounded-3xl bg-white/[0.012] border border-white/[0.04] flex items-center justify-center">
                <Package className="w-10 h-10 text-white/20" />
              </div>
            </div>
            <h1 className="text-3xl font-bold text-white/90 mb-3 tracking-tight">Your cart is <span className="text-[#f97316]">empty</span></h1>
            <p className="text-white/40 mb-10">Add some products to get started.</p>
            <Link href="/products" className="inline-flex items-center gap-2.5 px-8 py-4 text-white rounded-xl text-sm font-bold transition-all hover:shadow-[0_0_30px_rgba(249,115,22,0.3)] hover:scale-[1.02] active:scale-[0.98]" style={{ background: "linear-gradient(135deg, #f97316, #ea580c)" }}>
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
      <main className="flex min-h-screen flex-col bg-black">
        <Navbar />
        <section className="flex-1 flex items-center justify-center px-4 py-16">
          <div className="max-w-lg w-full">
            {step === "confirming" ? (
              <div className="relative">
                {/* Background glow effects */}
                <div className="absolute -inset-12 bg-gradient-to-br from-[#f97316]/10 via-amber-500/5 to-transparent rounded-[3rem] blur-3xl" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-[#f97316]/10 rounded-full blur-[100px]" />

                <div className="relative rounded-3xl border border-[#f97316]/20 bg-white/[0.012] backdrop-blur-xl overflow-hidden">
                  {/* Header with gradient */}
                  <div className="relative px-8 pt-10 pb-8 text-center bg-gradient-to-b from-[#f97316]/5 to-transparent">
                    {/* Animated icon */}
                    <div className="relative mx-auto w-28 h-28 mb-6">
                      <div className="absolute inset-0 rounded-full bg-[#f97316]/20 animate-ping" style={{ animationDuration: "2s" }} />
                      <div className="absolute inset-2 rounded-full bg-[#f97316]/10 animate-pulse" style={{ animationDuration: "1.5s" }} />
                      <div className="relative w-28 h-28 rounded-full flex items-center justify-center border-2 border-[#f97316]/30 shadow-[0_0_40px_rgba(249,115,22,0.3)]" style={{ background: "linear-gradient(to bottom right, rgba(249,115,22,0.3), rgba(249,115,22,0.1), transparent)" }}>
                        <Clock className="h-12 w-12 text-[#f97316]" />
                      </div>
                    </div>

                    <h2 className="text-3xl font-black text-white/90 tracking-tight mb-2">Payment <span className="text-[#f97316]">Processing</span></h2>
                    <p className="text-sm text-white/40 max-w-xs mx-auto">
                      {"Our team is verifying your transaction. This typically takes up to 1 hour."}
                    </p>
                  </div>

                  {/* Timer section */}
                  <div className="px-8 pb-6">
                    <div className="relative rounded-2xl border border-[#f97316]/20 p-6 overflow-hidden" style={{ background: "linear-gradient(to bottom right, rgba(249,115,22,0.1), rgba(249,115,22,0.05), transparent)" }}>
                      <div className="absolute top-0 right-0 w-32 h-32 bg-[#f97316]/10 rounded-full blur-3xl" />
                      <div className="relative flex items-center justify-center gap-6">
                        <div className="text-center">
                          <div className="font-mono text-5xl font-black text-white tracking-wider tabular-nums">
                            {formatTime(verifyTimeLeft)}
                          </div>
                          <p className="text-xs text-[#f97316] font-bold uppercase tracking-widest mt-2">Estimated Time</p>
                        </div>
                      </div>

                      {/* Progress bar */}
                      <div className="mt-6 h-2 rounded-full bg-white/[0.04] overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-1000 ease-linear shadow-[0_0_20px_rgba(249,115,22,0.5)]"
                          style={{ width: `${Math.min(((VERIFY_SECONDS - verifyTimeLeft) / VERIFY_SECONDS) * 100, 100)}%`, background: "linear-gradient(to right, #f97316, rgba(249,115,22,0.8), #f59e0b)" }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Order ID badge */}
                  <div className="px-8 pb-6">
                    <div className="flex items-center justify-center gap-3 px-6 py-4 rounded-2xl bg-white/[0.02] border border-white/[0.06]">
                      <span className="text-xs text-white/30 uppercase tracking-widest font-medium">Order</span>
                      <span className="font-mono font-black text-lg text-white tracking-wider">{orderId}</span>
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
                          s.active ? "bg-[#f97316]/10 border border-[#f97316]/20" : "bg-white/[0.01]"
                        )}>
                          <div className={cn(
                            "w-10 h-10 rounded-xl flex items-center justify-center shrink-0",
                            s.done ? "bg-emerald-500/20" : s.active ? "bg-[#f97316]/20" : "bg-white/[0.03]"
                          )}>
                            {s.done ? <CheckCircle2 className="h-5 w-5 text-emerald-500" /> :
                             s.active ? <s.icon className="h-5 w-5 text-[#f97316] animate-spin" /> :
                             <s.icon className="h-5 w-5 text-white/20" />}
                          </div>
                          <span className={cn(
                            "text-sm font-medium",
                            s.done ? "text-white/90" : s.active ? "text-[#f97316] font-bold" : "text-white/20"
                          )}>
                            {s.label}
                            {s.active && <span className="text-[#f97316]/60 ml-1">...</span>}
                          </span>
                          {s.done && <CheckCircle2 className="h-4 w-4 text-emerald-500 ml-auto" />}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Footer info */}
                  <div className="px-8 pb-8 space-y-4">
                    <div className="rounded-2xl border border-white/[0.04] bg-white/[0.012] p-5">
                      <p className="text-sm text-white/40 leading-relaxed text-center">
                        {"You can safely close this page. Delivery details will be sent to "}
                        <span className="text-[#f97316] font-bold">{email}</span>
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
                <div className="absolute -inset-8 bg-[#f97316]/[0.08] rounded-[2rem] blur-3xl animate-pulse" style={{ animationDuration: "3s" }} />
                <div className="relative rounded-3xl border border-[#f97316]/30 bg-white/[0.012] backdrop-blur-xl p-10 text-center space-y-8">
                  <div className="relative mx-auto w-24 h-24">
                    <div className="absolute inset-0 rounded-full bg-[#f97316]/10 animate-pulse" style={{ animationDuration: "2s" }} />
                    <div className="relative w-24 h-24 rounded-full flex items-center justify-center border border-[#f97316]/30" style={{ background: "linear-gradient(to bottom right, rgba(249,115,22,0.3), rgba(249,115,22,0.05))" }}>
                      <CheckCircle2 className="h-12 w-12 text-[#f97316]" />
                    </div>
                  </div>

                  <div>
                    <h2 className="text-3xl font-black text-white/90 tracking-tight">Order <span className="text-[#f97316]">Submitted</span></h2>
                    <p className="text-sm text-white/40 mt-3">{"We're verifying your payment. You'll receive delivery once confirmed."}</p>
                  </div>

                  <div className="inline-flex items-center gap-3 px-6 py-3.5 rounded-2xl bg-[#f97316]/10 border border-[#f97316]/20">
                    <span className="text-xs text-[#f97316]/70 font-medium">Order ID</span>
                    <span className="font-mono font-black text-lg text-[#f97316]">{orderId}</span>
                  </div>

                  <div className="space-y-2 text-sm text-white/40">
                    <p>{"Delivery details sent to "}<span className="text-white/90 font-semibold">{email}</span></p>
                    {discordUser && <p>{"Discord: "}<span className="text-white/90 font-semibold">{discordUser}</span></p>}
                  </div>

                  <p className="text-xs text-white/20 leading-relaxed px-4">
                    {"Save your order ID. Join our Discord for updates and support."}
                  </p>

                  <div className="flex gap-3 pt-2">
                    <Link href="https://discord.gg/lethaldma" target="_blank" className="flex-1">
                      <button className="w-full h-13 py-3.5 flex items-center justify-center gap-2.5 rounded-xl border border-white/[0.06] bg-white/[0.02] text-sm font-semibold text-white/40 hover:bg-white/[0.04] transition-all">
                        <DiscordIcon className="h-4 w-4" />
                        Discord
                      </button>
                    </Link>
                    <Link href="/" className="flex-1">
                      <button className="w-full h-13 py-3.5 flex items-center justify-center gap-2.5 rounded-xl text-white text-sm font-bold transition-all hover:shadow-[0_0_20px_rgba(249,115,22,0.3)]" style={{ background: "linear-gradient(135deg, #f97316, #ea580c)" }}>
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
    <main className="flex min-h-screen flex-col bg-black">
      <Navbar />

      <section className="flex-1 pt-28 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto max-w-6xl">

          {/* Header row */}
          <div className="flex items-center justify-between mb-8">
            {step === "form" ? (
              <Link href="/products" className="inline-flex items-center gap-2.5 text-sm text-white/40 hover:text-white/90 transition-colors group">
                <div className="w-8 h-8 rounded-lg bg-white/[0.012] border border-white/[0.06] flex items-center justify-center group-hover:border-white/[0.1] transition-colors">
                  <ArrowLeft className="h-3.5 w-3.5 text-white/60 transition-transform group-hover:-translate-x-0.5" />
                </div>
                <span className="hidden sm:inline font-medium">Back to Cart</span>
              </Link>
            ) : (
              <button onClick={() => { setStep("form"); setTimeLeft(TIMER_SECONDS) }} className="inline-flex items-center gap-2.5 text-sm text-white/40 hover:text-white/90 transition-colors group">
                <div className="w-8 h-8 rounded-lg bg-white/[0.012] border border-white/[0.06] flex items-center justify-center group-hover:border-white/[0.1] transition-colors">
                  <ArrowLeft className="h-3.5 w-3.5 text-white/60 transition-transform group-hover:-translate-x-0.5" />
                </div>
                <span className="hidden sm:inline font-medium">Back to Details</span>
              </button>
            )}
            <div className="flex items-center gap-2 text-xs text-white/20 bg-white/[0.02] border border-white/[0.04] px-3 py-1.5 rounded-full">
              <Lock className="h-3 w-3" />
              <span className="hidden sm:inline">Encrypted &amp; Secure</span>
            </div>
          </div>

          {/* Progress Steps */}
          <div className="flex items-center gap-4 mb-8">
            <div className={`flex items-center gap-2 ${step === "form" ? "text-[#f97316]" : "text-emerald-500"}`}>
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                step === "form" ? "bg-[#f97316] text-white" : "bg-emerald-500 text-white"
              }`}>
                {step !== "form" ? <Check className="h-4 w-4" /> : "1"}
              </div>
              <span className="text-sm font-semibold">Details &amp; Payment</span>
            </div>
            <div className="flex-1 h-px bg-white/[0.06] relative">
              <div className={`absolute inset-y-0 left-0 bg-[#f97316] transition-all duration-500 ${step !== "form" ? "w-full" : "w-0"}`} />
            </div>
            <div className={`flex items-center gap-2 ${step !== "form" ? "text-[#f97316]" : "text-white/30"}`}>
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                step !== "form" ? "bg-[#f97316] text-white" : "bg-white/[0.04] text-white/30"
              }`}>2</div>
              <span className="text-sm font-semibold">Send Payment</span>
            </div>
          </div>

          {/* Mobile Collapsible Order Summary */}
          <details className="lg:hidden rounded-2xl border border-white/[0.04] bg-white/[0.012] mb-6">
            <summary className="flex items-center justify-between p-4 cursor-pointer text-white/90">
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
                  <div className="rounded-2xl border border-white/[0.04] bg-white/[0.012] p-6">
                    <div className="flex items-center gap-3 mb-5">
                      <div className="w-7 h-7 rounded-lg bg-[#f97316]/15 flex items-center justify-center text-xs font-bold text-[#f97316]">1</div>
                      <h2 className="text-base font-bold text-white/90">Contact Information</h2>
                    </div>
                    <div className="space-y-5">
                      <div>
                        <label className="text-[11px] font-semibold uppercase tracking-widest text-white/40 mb-2 block">
                          Email <span className="text-[#f97316]">*</span>
                        </label>
                        <input
                          type="email" value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          onBlur={() => setEmailTouched(true)}
                          placeholder="your@email.com"
                          className={cn(
                            "w-full h-12 px-4 rounded-xl bg-white/[0.015] border text-sm text-white placeholder:text-white/20 focus:outline-none focus:ring-1 focus:ring-[#f97316]/20 transition-all",
                            emailTouched && !email.trim().includes("@")
                              ? "border-red-500/40 focus:border-red-500"
                              : "border-white/[0.05] focus:border-[#f97316]"
                          )}
                        />
                        {emailTouched && !email.trim().includes("@") ? (
                          <p className="text-[11px] text-red-400 mt-2 flex items-center gap-1"><AlertTriangle className="w-3 h-3" /> Please enter a valid email</p>
                        ) : (
                          <p className="text-[11px] text-white/30 mt-2 flex items-center gap-1"><Zap className="h-3 w-3 text-[#f97316]/60" /> License key delivered instantly</p>
                        )}
                      </div>
                      <div>
                        <label className="text-[11px] font-semibold uppercase tracking-widest text-white/40 mb-2 flex items-center gap-1.5">
                          <DiscordIcon className="w-3.5 h-3.5" /> Discord <span className="text-white/20 font-normal normal-case tracking-normal">(optional)</span>
                        </label>
                        <input
                          type="text" value={discordUser} onChange={(e) => setDiscordUser(e.target.value)}
                          placeholder="username"
                          className="w-full h-12 px-4 rounded-xl bg-white/[0.015] border border-white/[0.05] text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-[#f97316] focus:ring-1 focus:ring-[#f97316]/20 transition-all"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] font-semibold uppercase tracking-widest text-white/40 mb-2 block">
                          Order Notes <span className="text-white/20 font-normal normal-case tracking-normal">(optional)</span>
                        </label>
                        <textarea
                          value={orderNotes}
                          onChange={(e) => setOrderNotes(e.target.value)}
                          placeholder="Any special requests..."
                          rows={2}
                          className="w-full px-4 py-3 rounded-xl bg-white/[0.015] border border-white/[0.05] text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-[#f97316] resize-none"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Payment Method */}
                  <div className="rounded-2xl border border-white/[0.04] bg-white/[0.012] p-6">
                    <div className="flex items-center gap-3 mb-5">
                      <div className="w-7 h-7 rounded-lg bg-[#f97316]/15 flex items-center justify-center text-xs font-bold text-[#f97316]">2</div>
                      <h2 className="text-base font-bold text-white/90">Payment Method</h2>
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
                                ? "border-[#f97316] bg-[#f97316]/[0.06]"
                                : "border-white/[0.04] hover:border-[#f97316]/30 hover:bg-white/[0.02]"
                            }`}>
                            <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: option.color + "15" }}>
                              <Icon className="h-5 w-5" />
                            </div>
                            <div className="text-left flex-1">
                              <p className="font-semibold text-sm text-white/90">{option.name}</p>
                              <p className="text-xs text-white/40 font-mono">
                                {option.ticker} {amt ? `~${amt} ${option.ticker}` : ""}
                              </p>
                            </div>
                            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                              isSelected ? "border-[#f97316]" : "border-white/[0.1]"
                            }`}>
                              {isSelected && <div className="w-2.5 h-2.5 rounded-full bg-[#f97316]" />}
                            </div>
                          </button>
                        )
                      })}

                      {/* PayPal */}
                      <button onClick={() => setPaymentMethod("paypal")}
                        className={`w-full flex items-center gap-4 p-4 rounded-xl border transition-all ${
                          paymentMethod === "paypal"
                            ? "border-[#f97316] bg-[#f97316]/[0.06]"
                            : "border-white/[0.04] hover:border-[#f97316]/30 hover:bg-white/[0.02]"
                        }`}>
                        <PayPalIcon className="h-10 w-10" />
                        <div className="text-left flex-1">
                          <p className="font-semibold text-sm text-white/90">PayPal</p>
                          <p className="text-xs text-white/40">Friends &amp; Family only</p>
                        </div>
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                          paymentMethod === "paypal" ? "border-[#f97316]" : "border-white/[0.1]"
                        }`}>
                          {paymentMethod === "paypal" && <div className="w-2.5 h-2.5 rounded-full bg-[#f97316]" />}
                        </div>
                      </button>

                      {/* Discord */}
                      <button onClick={() => setPaymentMethod("discord")}
                        className={`w-full flex items-center gap-4 p-4 rounded-xl border transition-all ${
                          paymentMethod === "discord"
                            ? "border-[#f97316] bg-[#f97316]/[0.06]"
                            : "border-white/[0.04] hover:border-[#f97316]/30 hover:bg-white/[0.02]"
                        }`}>
                        <DiscordIcon className="h-10 w-10" />
                        <div className="text-left flex-1">
                          <p className="font-semibold text-sm text-white/90">Via Discord</p>
                          <p className="text-xs text-white/40">Open a ticket</p>
                        </div>
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                          paymentMethod === "discord" ? "border-[#f97316]" : "border-white/[0.1]"
                        }`}>
                          {paymentMethod === "discord" && <div className="w-2.5 h-2.5 rounded-full bg-[#f97316]" />}
                        </div>
                      </button>
                    </div>
                  </div>

                  {paymentMethod === "paypal" && (
                    <div className="rounded-2xl border border-[#003087]/20 bg-[#003087]/5 p-5">
                      <p className="text-sm font-bold mb-3 flex items-center gap-2 text-white/90"><DiscordIcon className="w-4 h-4" /> Discord Username Required</p>
                      <input type="text" value={discordUser} onChange={(e) => setDiscordUser(e.target.value)} placeholder="Enter Discord username"
                        className="w-full h-12 px-4 rounded-xl bg-white/[0.015] border border-[#003087]/15 text-sm text-white placeholder:text-white/20 focus:outline-none focus:ring-1 focus:ring-[#003087]/20 transition-all" />
                    </div>
                  )}

                  {/* Discount Code */}
                  <div className="rounded-2xl border border-white/[0.04] bg-white/[0.012] p-6">
                    <div className="flex items-center gap-2 mb-4">
                      <Tag className="h-4 w-4 text-[#f97316]" />
                      <h3 className="text-sm font-bold text-white/90">Discount Code</h3>
                    </div>
                    {appliedCoupon ? (
                      <div className="flex items-center gap-3 rounded-xl border border-[#f97316]/20 bg-[#f97316]/5 px-4 py-3.5">
                        <Sparkles className="w-4 h-4 text-[#f97316]" />
                        <div className="flex-1">
                          <p className="text-sm font-black text-[#f97316]">{appliedCoupon.code}</p>
                          <p className="text-[11px] text-[#f97316]/60">{appliedCoupon.percent}% discount applied</p>
                        </div>
                        <button onClick={() => { setAppliedCoupon(null); setCouponCode("") }} className="p-1.5 hover:bg-white/[0.04] rounded-lg transition-colors"><X className="h-4 w-4 text-white/30" /></button>
                      </div>
                    ) : (
                      <div className="flex gap-2">
                        <input type="text" value={couponCode}
                          onChange={(e) => { setCouponCode(e.target.value); setCouponError("") }}
                          onKeyDown={(e) => e.key === "Enter" && applyCoupon()}
                          placeholder="Enter code"
                          className="flex-1 h-11 px-4 rounded-xl bg-white/[0.015] border border-white/[0.05] text-sm font-mono text-white placeholder:text-white/20 focus:outline-none focus:border-[#f97316] transition-all" />
                        <button onClick={applyCoupon}
                          className="px-5 h-11 rounded-xl bg-white/[0.04] border border-white/[0.06] text-sm font-semibold text-white/60 hover:bg-white/[0.08] hover:text-white/90 transition-all">
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

                  {/* Upsell */}
                  {!items.some(i => (i.variant.product_id || i.variant.product?.id) === "perm-spoofer") && items.some(i => {
                    const pid = i.variant.product_id || i.variant.product?.id
                    return pid && ["fortnite-external", "blurred", "streck"].includes(pid)
                  }) && (
                    <div className="rounded-xl border border-[#f97316]/20 bg-[#f97316]/[0.04] p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Image src="/images/products/perm-spoofer.png" alt="" width={40} height={40} className="rounded-lg" />
                          <div>
                            <p className="text-sm font-semibold text-white/90">Add Perm Spoofer</p>
                            <p className="text-xs text-white/40">
                              <span className="line-through">{"£"}35</span>{" "}
                              <span className="text-[#f97316] font-bold">{"£"}25</span>{" "}
                              <span className="text-emerald-400 text-[10px]">save 28%</span>
                            </p>
                            <p className="text-[10px] text-white/20">67% of buyers add this</p>
                          </div>
                        </div>
                        <button
                          onClick={() => {
                            const product = PRODUCTS.find(p => p.id === "perm-spoofer")
                            if (!product) return
                            const variant = product.variants[0]
                            addItem({
                              id: variant.id,
                              name: variant.name,
                              price: 25,
                              product_id: product.id,
                              is_lifetime: false,
                              duration_days: null,
                              created_at: "",
                              product: { id: product.id, name: product.name, slug: product.id, description: product.description, category: product.category, image_url: product.image, image: product.image, created_at: "", updated_at: "" },
                            })
                          }}
                          className="px-3 py-1.5 rounded-lg bg-[#f97316]/15 text-[#f97316] text-xs font-bold hover:bg-[#f97316]/25 transition-colors"
                        >
                          + Add
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Shipping address — required for physical bundles only */}
                  {hasPhysicalItems && (
                    <div className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-4 space-y-3">
                      <div className="flex items-center gap-2">
                        <Package className="h-4 w-4 text-[#f97316]" />
                        <p className="text-sm font-bold text-white">Shipping address</p>
                        <span className="text-[10px] font-semibold text-red-400 uppercase tracking-wider">Required</span>
                      </div>
                      <p className="text-[11.5px] text-white/40 -mt-2">
                        Your DMA bundle ships within 24h. Double-check — we can't change this after payment confirmation.
                      </p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <input
                          value={shipping.fullName}
                          onChange={(e) => setShipping((s) => ({ ...s, fullName: e.target.value }))}
                          placeholder="Full name"
                          className="sm:col-span-2 h-10 rounded-lg border border-white/[0.08] bg-white/[0.02] px-3 text-sm text-white placeholder:text-white/25 outline-none focus:border-[#f97316]/40"
                        />
                        <input
                          value={shipping.line1}
                          onChange={(e) => setShipping((s) => ({ ...s, line1: e.target.value }))}
                          placeholder="Address line 1"
                          className="sm:col-span-2 h-10 rounded-lg border border-white/[0.08] bg-white/[0.02] px-3 text-sm text-white placeholder:text-white/25 outline-none focus:border-[#f97316]/40"
                        />
                        <input
                          value={shipping.line2}
                          onChange={(e) => setShipping((s) => ({ ...s, line2: e.target.value }))}
                          placeholder="Apartment, suite (optional)"
                          className="sm:col-span-2 h-10 rounded-lg border border-white/[0.08] bg-white/[0.02] px-3 text-sm text-white placeholder:text-white/25 outline-none focus:border-[#f97316]/40"
                        />
                        <input
                          value={shipping.city}
                          onChange={(e) => setShipping((s) => ({ ...s, city: e.target.value }))}
                          placeholder="City"
                          className="h-10 rounded-lg border border-white/[0.08] bg-white/[0.02] px-3 text-sm text-white placeholder:text-white/25 outline-none focus:border-[#f97316]/40"
                        />
                        <input
                          value={shipping.postalCode}
                          onChange={(e) => setShipping((s) => ({ ...s, postalCode: e.target.value }))}
                          placeholder="Postal code"
                          className="h-10 rounded-lg border border-white/[0.08] bg-white/[0.02] px-3 text-sm text-white placeholder:text-white/25 outline-none focus:border-[#f97316]/40"
                        />
                        <input
                          value={shipping.country}
                          onChange={(e) => setShipping((s) => ({ ...s, country: e.target.value }))}
                          placeholder="Country"
                          className="h-10 rounded-lg border border-white/[0.08] bg-white/[0.02] px-3 text-sm text-white placeholder:text-white/25 outline-none focus:border-[#f97316]/40"
                        />
                        <input
                          value={shipping.phone}
                          onChange={(e) => setShipping((s) => ({ ...s, phone: e.target.value }))}
                          placeholder="Phone (for courier)"
                          className="h-10 rounded-lg border border-white/[0.08] bg-white/[0.02] px-3 text-sm text-white placeholder:text-white/25 outline-none focus:border-[#f97316]/40"
                        />
                      </div>
                    </div>
                  )}

                  {/* Auto-renew reminder (only for time-limited items) */}
                  {hasRenewableItems && (
                    <label className="flex items-start gap-3 cursor-pointer group rounded-xl border border-emerald-500/15 bg-emerald-500/[0.03] p-4 hover:bg-emerald-500/[0.06] transition-colors">
                      <div className={cn(
                        "mt-0.5 h-5 w-5 rounded-md border-2 flex items-center justify-center shrink-0 transition-all duration-200",
                        autoRenew ? "bg-emerald-500 border-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.3)]" : "border-white/[0.15] group-hover:border-white/[0.3]"
                      )}>
                        {autoRenew && <Check className="h-3 w-3 text-white" />}
                      </div>
                      <input type="checkbox" checked={autoRenew} onChange={(e) => setAutoRenew(e.target.checked)} className="sr-only" />
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-white/90 flex items-center gap-1.5">
                          <RefreshCw className="h-3.5 w-3.5 text-emerald-400" />
                          Remind me before my license expires
                        </p>
                        <p className="text-[11.5px] text-white/40 mt-1 leading-relaxed">
                          We'll email you 3 days before expiration with a one-click checkout link. No auto-billing — you stay in control. Cancel anytime.
                        </p>
                      </div>
                    </label>
                  )}

                  {/* TOS */}
                  <label className="flex items-start gap-3 cursor-pointer group px-1 py-1">
                    <div className={cn(
                      "mt-0.5 h-5 w-5 rounded-md border-2 flex items-center justify-center shrink-0 transition-all duration-200",
                      agreedTos ? "bg-[#f97316] border-[#f97316] shadow-[0_0_10px_rgba(249,115,22,0.3)]" : "border-white/[0.1] group-hover:border-white/[0.2]"
                    )}>
                      {agreedTos && <Check className="h-3 w-3 text-white" />}
                    </div>
                    <input type="checkbox" checked={agreedTos} onChange={(e) => setAgreedTos(e.target.checked)} className="sr-only" />
                    <span className="text-xs text-white/30 leading-relaxed">
                      {"I agree to the Terms of Service. All sales are final. Products are delivered digitally."}
                    </span>
                  </label>

                  {/* Continue Button */}
                  <button disabled={!canProceed} onClick={handleProceed}
                    className="w-full h-14 rounded-xl text-white font-bold text-base flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-lg shadow-orange-500/20 hover:shadow-xl hover:shadow-orange-500/30 mt-6"
                    style={{ background: canProceed ? "linear-gradient(135deg, #f97316, #ea580c)" : "rgba(249,115,22,0.3)" }}>
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
                  <div className="rounded-2xl border border-white/[0.04] bg-white/[0.012] p-5">
                    <div className="flex items-center gap-3 mb-3">
                      <Clock className={cn("h-4 w-4", timeLeft < 300 ? "text-red-500" : "text-[#f97316]")} />
                      <span className={cn("text-xl font-mono font-bold", timeLeft < 300 ? "text-red-500" : "text-[#f97316]")}>{formatTime(timeLeft)}</span>
                      <span className="text-sm text-white/40">remaining</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-white/[0.04] overflow-hidden">
                      <div
                        className={cn("h-full rounded-full transition-all duration-1000", timeLeft < 300 ? "bg-red-500" : "")}
                        style={{ width: `${(timeLeft / TIMER_SECONDS) * 100}%`, background: timeLeft < 300 ? undefined : "linear-gradient(to right, #f97316, #f59e0b)" }}
                      />
                    </div>
                  </div>

                  {/* Crypto payment details */}
                  {paymentMethod === "crypto" && (
                    <div className="rounded-2xl border border-white/[0.04] bg-white/[0.012] p-6">
                      {/* Crypto name */}
                      <div className="flex items-center gap-3 mb-6">
                        {(() => { const Icon = selectedCrypto.icon; return <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: selectedCrypto.color + "15" }}><Icon className="h-5 w-5" /></div> })()}
                        <div>
                          <p className="font-bold text-white/90">{selectedCrypto.name}</p>
                          <p className="text-xs text-white/40">{selectedCrypto.name.includes("TRC") ? "TRON Network" : selectedCrypto.name.includes("Ethereum") ? "Ethereum Network" : `${selectedCrypto.name} Mainnet`}</p>
                        </div>
                      </div>

                      {/* Amount */}
                      <div className="rounded-xl bg-white/[0.02] border border-white/[0.04] p-5 text-center mb-6">
                        <p className="text-[10px] uppercase tracking-widest text-white/30 mb-1">Amount Due</p>
                        <p className="text-3xl font-black text-white">
                          {cryptoAmount} <span className="text-lg text-white/40">{selectedCrypto.ticker}</span>
                        </p>
                        <p className="text-[11px] text-white/30 mt-1.5">
                          Rate locked at {cryptoRates[RATE_KEY_MAP[selectedCrypto.id]]?.toLocaleString("en-US", { maximumFractionDigits: 2 })} USD
                        </p>
                        <button onClick={() => copyToClipboard(cryptoAmount || "", "amount")}
                          className={cn("mt-3 inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all",
                            copiedField === "amount" ? "bg-emerald-500/15 text-emerald-400" : "bg-white/[0.04] text-white/40 hover:text-white/90 hover:bg-white/[0.08]"
                          )}>{copiedField === "amount" ? <><Check className="h-3 w-3" /> Copied</> : <><Copy className="h-3 w-3" /> Copy Amount</>}</button>
                        <div className="mt-3 flex items-center justify-center gap-2 text-[10.5px] text-white/30">
                          <RefreshCw className={cn("h-3 w-3", ratesLoading && "animate-spin")} />
                          <span>
                            {ratesLoading ? "Refreshing rate…" : <>Auto-refresh in <span className="text-white/60 font-mono">{ratesNextRefresh}s</span></>}
                          </span>
                          <button onClick={fetchRates} disabled={ratesLoading} className="ml-1 text-primary hover:text-primary/80 disabled:opacity-40 font-medium">Refresh now</button>
                        </div>
                      </div>

                      {/* QR Code — encodes the wallet address only (universally scannable by every wallet) */}
                      <div className="flex justify-center mb-6">
                        <div className="p-4 bg-white rounded-2xl">
                          <Image src={`https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(selectedCrypto.address)}&bgcolor=FFFFFF&color=000000&format=png&margin=1`} alt="QR" width={220} height={220} className="rounded-lg" unoptimized crossOrigin="anonymous" />
                        </div>
                      </div>

                      {/* Wallet Address */}
                      <div className="mb-6">
                        <p className="text-[10px] uppercase tracking-widest text-white/30 mb-2">Wallet Address</p>
                        <button
                          onClick={() => copyToClipboard(selectedCrypto.address, "wallet")}
                          className={cn(
                            "w-full flex items-center gap-2 p-3 rounded-xl border transition-all text-left",
                            copiedField === "wallet"
                              ? "bg-emerald-500/[0.06] border-emerald-500/20"
                              : "bg-white/[0.02] border-white/[0.04] hover:border-white/[0.12]"
                          )}
                          aria-label="Copy wallet address"
                        >
                          <code className="text-xs text-white/60 flex-1 truncate font-mono">{selectedCrypto.address}</code>
                          <span className={cn("shrink-0 inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all",
                            copiedField === "wallet" ? "bg-emerald-500/15 text-emerald-400" : "bg-white/[0.06] text-white/50"
                          )}>{copiedField === "wallet" ? <><Check className="h-3 w-3" /> Copied</> : <><Copy className="h-3 w-3" /> Tap to copy</>}</span>
                        </button>
                      </div>

                      {/* Warning */}
                      <div className="flex items-start gap-2 p-3 rounded-xl bg-yellow-500/5 border border-yellow-500/10 mb-6">
                        <AlertTriangle className="h-4 w-4 text-yellow-500 mt-0.5 shrink-0" />
                        <p className="text-xs text-white/40">
                          Send only <span className="text-yellow-500 font-bold">{selectedCrypto.ticker}</span> on the correct network. Other assets will be lost.
                        </p>
                      </div>

                      {/* Confirm button */}
                      <button onClick={handleConfirmPayment} disabled={timeLeft <= 0}
                        className="w-full h-14 rounded-xl text-white font-bold text-base flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-lg shadow-orange-500/20 hover:shadow-xl hover:shadow-orange-500/30"
                        style={{ background: timeLeft <= 0 ? "rgba(249,115,22,0.3)" : "linear-gradient(135deg, #f97316, #ea580c)" }}>
                        {timeLeft <= 0 ? "Session Expired" : <><CheckCircle2 className="h-4 w-4" /> Confirm Payment Sent</>}
                      </button>

                      <button onClick={() => { setStep("form"); setTimeLeft(TIMER_SECONDS) }}
                        className="w-full text-center mt-3 text-sm text-white/30 hover:text-[#f97316] transition-colors">
                        Change payment method
                      </button>
                    </div>
                  )}

                  {/* PayPal payment details */}
                  {paymentMethod === "paypal" && (
                    <div className="rounded-2xl border border-white/[0.04] bg-white/[0.012] p-6">
                      <div className="flex items-center gap-3 mb-6">
                        <PayPalIcon className="h-8 w-8" />
                        <div>
                          <p className="font-bold text-white/90">PayPal</p>
                          <p className="text-xs text-white/40">Friends &amp; Family only</p>
                        </div>
                      </div>

                      <div className="rounded-xl bg-white/[0.02] border border-white/[0.04] p-5 text-center mb-6">
                        <p className="text-[10px] uppercase tracking-widest text-white/30 mb-1">Send To</p>
                        <p className="text-lg font-bold text-white/90">{PAYPAL_EMAIL}</p>
                        <button onClick={() => copyToClipboard(PAYPAL_EMAIL, "paypal")}
                          className={cn("mt-2 inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all",
                            copiedField === "paypal" ? "bg-emerald-500/15 text-emerald-400" : "bg-white/[0.04] text-white/40 hover:text-white/90 hover:bg-white/[0.08]"
                          )}>{copiedField === "paypal" ? <><Check className="h-3 w-3" /> Copied</> : <><Copy className="h-3 w-3" /> Copy</>}</button>
                      </div>

                      <div className="rounded-xl bg-white/[0.02] border border-white/[0.04] p-5 text-center mb-6">
                        <p className="text-[10px] uppercase tracking-widest text-white/30 mb-1">Amount</p>
                        <p className="text-3xl font-black text-white">{"£"}{finalTotal.toFixed(2)}</p>
                      </div>

                      <div className="flex items-start gap-2 p-3 rounded-xl bg-yellow-500/5 border border-yellow-500/10 mb-6">
                        <AlertTriangle className="h-4 w-4 text-yellow-500 mt-0.5 shrink-0" />
                        <p className="text-xs text-white/40">
                          Send as <span className="text-yellow-500 font-bold">Friends &amp; Family</span>. Include order ID <span className="font-mono font-bold text-white/90">{orderId}</span> in the note.
                        </p>
                      </div>

                      <button onClick={handleConfirmPayment} disabled={timeLeft <= 0}
                        className="w-full h-14 rounded-xl text-white font-bold text-base flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-lg shadow-orange-500/20 hover:shadow-xl hover:shadow-orange-500/30"
                        style={{ background: timeLeft <= 0 ? "rgba(249,115,22,0.3)" : "linear-gradient(135deg, #f97316, #ea580c)" }}>
                        {timeLeft <= 0 ? "Session Expired" : <><CheckCircle2 className="h-4 w-4" /> Confirm Payment Sent</>}
                      </button>

                      <button onClick={() => { setStep("form"); setTimeLeft(TIMER_SECONDS) }}
                        className="w-full text-center mt-3 text-sm text-white/30 hover:text-[#f97316] transition-colors">
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
                <div className="rounded-2xl border border-white/[0.04] bg-white/[0.012] p-6">
                  <div className="flex items-center gap-2 mb-5">
                    <Package className="h-4 w-4 text-white/30" />
                    <h3 className="text-base font-bold text-white/90">Order Summary</h3>
                    <span className="ml-auto text-xs text-white/30 font-mono">{orderId}</span>
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
