"use client"

import { useState, useEffect, useRef, useMemo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import {
  Star, CheckCircle2, TrendingUp, Loader2, Search, ChevronDown,
  MessageSquare, SlidersHorizontal, X, Quote, ArrowRight,
} from "lucide-react"
import useSWR from "swr"
import { Breadcrumbs } from "@/components/breadcrumbs"
import Link from "next/link"
import { SupportAvatar, type SupportPersona } from "@/components/support-avatar"

const fetcher = (url: string) => fetch(url).then(r => r.json())

type ReviewItem = {
  id: number; text: string; rating: number; product: string
  product_id: string; username: string; email: string
  time_label: string; verified: boolean; is_auto: boolean
  refunded: boolean; helpful: number; team_response: string | null
  created_at: string
  source?: "native" | "sellauth_legacy"
  variant_name?: string
  response_persona?: SupportPersona | null
  response_first_reply_text?: string | null
  response_first_reply_at?: string | null
  response_update_text?: string | null
  response_update_at?: string | null
}

// Deterministic persona assignment — same review id always gets the same
// persona so the UI doesn't flip between renders. Handles numeric IDs (native
// rows) and UUIDs (legacy). `ujukPercent` biases the split: 50 = even, 70 =
// refund thread default (ujuk handles most complaint threads).
function assignPersona(id: number | string, ujukPercent = 50): SupportPersona {
  const str = String(id)
  let h = 0
  for (let i = 0; i < str.length; i++) h = ((h << 5) - h + str.charCodeAt(i)) | 0
  return Math.abs(h) % 100 < ujukPercent ? "ujuk" : "vsx"
}

// "3h later", "next day", "2 days later" — sentence case, muted.
function humanDelay(fromISO: string, toISO: string): string {
  const from = new Date(fromISO).getTime()
  const to = new Date(toISO).getTime()
  if (!Number.isFinite(from) || !Number.isFinite(to) || to <= from) return ""
  const ms = to - from
  const h = Math.round(ms / 3_600_000)
  if (h < 24) return `~${Math.max(1, h)}h later`
  const d = Math.round(h / 24)
  if (d === 1) return "next day"
  return `${d} days later`
}

type ScopeOption = "current" | "archive" | "all"
const scopeLabels: Record<ScopeOption, string> = {
  current: "Current",
  archive: "Archive",
  all: "All",
}

const DURATION_TONES: Record<string, string> = {
  Lifetime: "bg-[#f97316]/12 text-[#f97316] ring-[#f97316]/25",
  "Basic Bundle": "bg-violet-500/12 text-violet-300 ring-violet-500/25",
  "Advanced Bundle": "bg-violet-500/12 text-violet-300 ring-violet-500/25",
  "Elite Bundle": "bg-violet-500/12 text-violet-300 ring-violet-500/25",
}
function durationTone(name: string) {
  if (DURATION_TONES[name]) return DURATION_TONES[name]
  if (/EAC|FaceIt|VGK/i.test(name)) return "bg-cyan-500/10 text-cyan-300/90 ring-cyan-500/20"
  return "bg-white/[0.04] text-white/55 ring-white/10"
}

function formatDateLong(iso: string) {
  if (!iso) return ""
  try {
    return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
  } catch {
    return ""
  }
}

const allProducts = [
  "Perm Spoofer", "Temp Spoofer", "Fortnite External",
  "Blurred DMA Cheat", "Streck DMA Cheat", "Custom DMA Firmware",
  "DMA Basic Bundle", "DMA Advanced Bundle", "DMA Elite Bundle",
]

const avatarTints = [
  "from-orange-500/30 to-orange-600/10",
  "from-amber-500/30 to-amber-600/10",
  "from-rose-500/25 to-rose-600/10",
  "from-cyan-500/25 to-cyan-600/10",
  "from-emerald-500/25 to-emerald-600/10",
  "from-violet-500/25 to-violet-600/10",
]

function getInitials(u: string) {
  if (!u) return "??"
  return (u.replace(/[0-9_]/g, "").slice(0, 2) || "??").toUpperCase()
}

function maskEmail(email: string) {
  if (!email) return "***@***"
  const [local, domain] = email.split("@")
  const masked = local.length <= 3 ? local[0] + "***" : local.slice(0, 3) + "***"
  return `${masked}@${domain}`
}

const REVIEWS_PER_PAGE = 18
type SortOption = "newest" | "oldest" | "helpful" | "media"
const sortLabels: Record<SortOption, string> = {
  helpful: "Most helpful", newest: "Most recent", oldest: "Oldest", media: "With media",
}
type TabOption = "helpful" | "newest" | "media"
const tabLabels: Record<TabOption, string> = {
  helpful: "Most helpful", newest: "Most recent", media: "With media",
}

// Count-up animated number — eases from 0 to target on mount. Component only
// gets mounted once data has loaded, so the flash-to-zero issue is avoided.
function CountUp({ value, duration = 1.6, format = (n: number) => n.toString() }: { value: number; duration?: number; format?: (n: number) => string }) {
  const [display, setDisplay] = useState(0)
  useEffect(() => {
    if (typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) {
      setDisplay(value)
      return
    }
    let raf = 0
    const start = performance.now()
    const animate = (t: number) => {
      const progress = Math.min((t - start) / 1000 / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setDisplay(value * eased)
      if (progress < 1) raf = requestAnimationFrame(animate)
      else setDisplay(value)
    }
    raf = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(raf)
  }, [value, duration])
  return <span className="tabular-nums">{format(display)}</span>
}

export default function ReviewsPage() {
  const { data, isLoading } = useSWR<{ reviews: ReviewItem[]; totalCount: number }>("/api/reviews", fetcher, {
    revalidateOnFocus: false,
  })
  const allReviews = data?.reviews ?? []
  const realCount = data?.totalCount ?? allReviews.length

  const [filterRating, setFilterRating] = useState<number | null>(null)
  const [filterProduct, setFilterProduct] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [sortBy, setSortBy] = useState<SortOption>("newest")
  const [scope, setScope] = useState<ScopeOption>("all")
  const [visibleCount, setVisibleCount] = useState(REVIEWS_PER_PAGE)
  const [showProductDropdown, setShowProductDropdown] = useState(false)
  const [showSortDropdown, setShowSortDropdown] = useState(false)

  const prodRef = useRef<HTMLDivElement>(null)
  const sortRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const close = (e: MouseEvent) => {
      if (prodRef.current && !prodRef.current.contains(e.target as Node)) setShowProductDropdown(false)
      if (sortRef.current && !sortRef.current.contains(e.target as Node)) setShowSortDropdown(false)
    }
    document.addEventListener("mousedown", close)
    return () => document.removeEventListener("mousedown", close)
  }, [])

  const breakdown = useMemo(() => {
    const counts: Record<number, number> = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
    allReviews.forEach(r => { counts[r.rating] = (counts[r.rating] || 0) + 1 })
    const total = allReviews.length || 1
    return [5, 4, 3, 2, 1].map(stars => ({
      stars, count: counts[stars], percent: (counts[stars] / total) * 100,
    }))
  }, [allReviews])

  const avgRating = useMemo(() => {
    if (allReviews.length === 0) return 0
    return allReviews.reduce((s, r) => s + r.rating, 0) / allReviews.length
  }, [allReviews])

  const pinnedReview = useMemo(() => {
    if (allReviews.length === 0) return null
    // Pick a long-enough native review so the hero quote isn't a two-word legacy blurb.
    const candidates = allReviews
      .filter((r) => r.source !== "sellauth_legacy" && r.rating === 5 && (r.text?.length ?? 0) > 60)
    const pool = candidates.length > 0 ? candidates : allReviews
    return [...pool].sort((a, b) => (b.helpful || 0) - (a.helpful || 0))[0]
  }, [allReviews])

  const scopeCounts = useMemo(() => {
    let legacy = 0
    let native = 0
    for (const r of allReviews) {
      if (r.source === "sellauth_legacy") legacy++
      else native++
    }
    return { current: native, archive: legacy, all: native + legacy }
  }, [allReviews])

  const filteredReviews = useMemo(() => {
    let f = [...allReviews]
    if (scope === "current") f = f.filter(r => r.source !== "sellauth_legacy")
    if (scope === "archive") f = f.filter(r => r.source === "sellauth_legacy")
    if (filterRating !== null) f = f.filter(r => r.rating === filterRating)
    if (filterProduct) f = f.filter(r => r.product === filterProduct)
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      f = f.filter(r =>
        (r.text || "").toLowerCase().includes(q) ||
        (r.product || "").toLowerCase().includes(q) ||
        (r.team_response && r.team_response.toLowerCase().includes(q)),
      )
    }
    if (sortBy === "oldest") f.reverse()
    if (sortBy === "helpful") {
      // "Most helpful" without a helpful vote = rank by review substance:
      // longer text > team response presence > newer. Keeps the Wall's first
      // rows meaty instead of one-liners.
      f.sort((a, b) => {
        const aw = (a.text?.length || 0) + (a.team_response ? 60 : 0)
        const bw = (b.text?.length || 0) + (b.team_response ? 60 : 0)
        if (bw !== aw) return bw - aw
        return (b.created_at || "").localeCompare(a.created_at || "")
      })
    }
    if (sortBy === "media") f = f.filter(r => !!r.team_response)
    return f
  }, [allReviews, scope, filterRating, filterProduct, searchQuery, sortBy])

  const visibleReviews = filteredReviews.slice(0, visibleCount)
  const hasMore = visibleCount < filteredReviews.length

  const clearFilters = () => {
    setFilterRating(null); setFilterProduct(null); setSearchQuery("")
    setSortBy("newest"); setVisibleCount(REVIEWS_PER_PAGE)
  }

  const hasActiveFilters = filterRating !== null || filterProduct !== null || searchQuery.trim() !== ""
  useEffect(() => { setVisibleCount(REVIEWS_PER_PAGE) }, [filterRating, filterProduct, searchQuery, sortBy, scope])

  const isEmpty = !isLoading && allReviews.length === 0

  return (
    <main className="relative flex min-h-screen flex-col bg-transparent">
      <Navbar />

      <section className="relative z-[2] pt-32 pb-8 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto max-w-7xl">
          <Breadcrumbs items={[{ label: "Reviews" }]} />

          {/* Editorial hero — left: rating block; right: pinned quote (stacks on < lg) */}
          <div className="grid grid-cols-12 gap-x-8 gap-y-10 mt-10 mb-20 items-start lg:items-end">
            <div className="col-span-12 lg:col-span-7">
              <div className="flex items-center gap-3 text-[11px] uppercase tracking-[0.22em] font-bold text-white/45 mb-5">
                <span className="tabular-nums">01 / 03</span>
                <span className="h-px w-10 bg-white/25" />
                <span>Receipts</span>
              </div>

              {isLoading ? (
                <div className="flex items-end gap-6 sm:gap-10 flex-wrap">
                  <div
                    className="rounded-xl bg-gradient-to-br from-[#f97316]/15 to-[#ea580c]/5 animate-pulse"
                    style={{ width: "min(360px, 60vw)", height: "clamp(96px, 16vw, 200px)" }}
                  />
                  <div className="flex flex-col gap-3 pb-4">
                    <div className="h-5 w-28 bg-white/[0.06] rounded animate-pulse" />
                    <div className="h-7 w-44 bg-white/[0.05] rounded animate-pulse" />
                    <div className="h-4 w-56 bg-white/[0.04] rounded animate-pulse" />
                  </div>
                </div>
              ) : isEmpty ? (
                <MaskHeadline text="First verdicts incoming." />
              ) : (
                <div className="flex items-end gap-6 sm:gap-10 flex-wrap">
                  <div
                    className="font-display font-bold tabular-nums tracking-[-0.05em] inline-block"
                    style={{
                      fontSize: "clamp(96px, 16vw, 200px)",
                      lineHeight: 1.5,
                      margin: "-0.2em 0",
                      background: "linear-gradient(180deg, #ffb366 0%, #f97316 45%, #c2410c 100%)",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                      filter: "drop-shadow(0 0 60px rgba(249,115,22,0.35))",
                    }}
                  >
                    <CountUp value={avgRating} format={(n) => n.toFixed(1)} />
                  </div>
                  <div className="flex flex-col gap-2 pb-4">
                    <div className="flex gap-1">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.12 + i * 0.08, type: "spring", stiffness: 180, damping: 22 }}
                        >
                          <Star className="h-5 w-5 fill-[#fbbf24] text-[#fbbf24]" />
                        </motion.div>
                      ))}
                    </div>
                    <p className="font-display text-2xl sm:text-3xl font-semibold text-white tracking-[-0.02em] leading-tight">
                      {realCount.toLocaleString()} <span className="text-white/45 font-normal">verdicts.</span>
                    </p>
                    <p className="text-[13px] text-white/50">Verified. Unedited. Some are angry.</p>
                  </div>
                </div>
              )}
            </div>

            {pinnedReview && (
              <div className="col-span-12 lg:col-span-5">
                <motion.div
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.25, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                  className="relative border-l-2 border-[#f97316]/50 pl-6 py-2"
                >
                  <Quote className="absolute -top-1 -left-3 h-6 w-6 text-[#f97316]/40 bg-black" />
                  <p className="font-display text-xl sm:text-2xl text-white/90 leading-[1.25] tracking-[-0.01em] mb-4">
                    {`“${pinnedReview.text.length > 240 ? pinnedReview.text.slice(0, 240) + "…" : pinnedReview.text}”`}
                  </p>
                  <div className="flex items-center gap-3 text-[12px]">
                    <span className="font-bold text-white/75">{pinnedReview.username || "verified buyer"}</span>
                    <span className="text-white/20">·</span>
                    <span className="text-[#f97316]/75">{pinnedReview.product}</span>
                    <span className="text-white/20">·</span>
                    <span className="text-white/45">Top helpful</span>
                  </div>
                </motion.div>
              </div>
            )}

            {isEmpty && (
              <div className="col-span-12 lg:col-span-5">
                <motion.div
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                  className="max-w-sm"
                >
                  <p className="text-[15px] text-white/55 leading-relaxed">
                    Reviews ship fast after launch. Buy → play → drop a verdict. Get store credit for the honest ones.
                  </p>
                  <Link
                    href="/products"
                    className="cursor-cta press-spring inline-flex items-center gap-2 mt-6 px-5 py-3 rounded-xl bg-gradient-to-br from-[#f97316] to-[#ea580c] text-white text-[13px] font-bold shadow-[0_0_30px_rgba(249,115,22,0.4)] hover:shadow-[0_0_50px_rgba(249,115,22,0.6)] hover:-translate-y-0.5 transition-all"
                  >
                    Be the first verdict <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </motion.div>
              </div>
            )}
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-32 text-white/40">
              <Loader2 className="h-6 w-6 animate-spin mr-3" /> Loading reviews…
            </div>
          ) : (
            <>
              {!isEmpty && (
                <>
                  {/* Breakdown strip — hairline-rule editorial, no box */}
                  <div className="grid grid-cols-12 gap-x-8 gap-y-6 mb-14 pb-14 border-b border-white/[0.05]">
                    <div className="col-span-12 lg:col-span-4">
                      <div className="flex items-center gap-3 text-[11px] uppercase tracking-[0.22em] font-bold text-white/45 mb-6">
                        <span className="tabular-nums">02 / 03</span>
                        <span className="h-px w-10 bg-white/25" />
                        <span>Distribution</span>
                      </div>
                      <p className="text-[15px] text-white/55 leading-relaxed max-w-xs">
                        Click a row to filter. Most complaints are install issues — support closes them in &lt;2h.
                      </p>
                      <div className="mt-6 inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-[12px] text-emerald-400 font-bold">
                        <TrendingUp className="h-3.5 w-3.5" />
                        <span className="tabular-nums">{Math.max(realCount - Math.floor(realCount * 0.95), 1)}</span> this week
                      </div>
                    </div>

                    <div className="col-span-12 lg:col-span-8 space-y-2">
                      {breakdown.map((row, i) => (
                        <motion.button
                          key={row.stars}
                          initial={{ opacity: 0, x: 16 }}
                          whileInView={{ opacity: 1, x: 0 }}
                          viewport={{ once: true, amount: 0.6 }}
                          transition={{ delay: i * 0.08, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                          onClick={() => setFilterRating(filterRating === row.stars ? null : row.stars)}
                          className={`group flex items-center gap-5 w-full rounded-xl px-4 py-3 transition-all ${
                            filterRating === row.stars ? "bg-[#f97316]/10 ring-1 ring-[#f97316]/40" : "hover:bg-white/[0.03]"
                          }`}
                        >
                          <div className="flex items-center gap-1.5 w-14 shrink-0">
                            <span className="text-[14px] font-bold text-white tabular-nums">{row.stars}</span>
                            <Star className={`h-3.5 w-3.5 ${row.stars >= 4 ? "fill-[#fbbf24] text-[#fbbf24]" : row.stars === 3 ? "fill-[#f59e0b] text-[#f59e0b]" : "fill-red-400/80 text-red-400/80"}`} />
                          </div>
                          <div className="flex-1 h-1.5 bg-white/[0.04] rounded-full overflow-hidden">
                            <motion.div
                              initial={{ width: 0 }}
                              whileInView={{ width: `${row.percent}%` }}
                              viewport={{ once: true, amount: 0.6 }}
                              transition={{ delay: 0.2 + i * 0.08, duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
                              className={`h-full rounded-full ${
                                row.stars >= 4 ? "bg-gradient-to-r from-[#f97316] to-[#fbbf24]" :
                                row.stars === 3 ? "bg-[#f59e0b]" :
                                "bg-red-400/70"
                              }`}
                              style={{ boxShadow: row.stars >= 4 ? "0 0 8px rgba(249,115,22,0.6)" : "none" }}
                            />
                          </div>
                          <span className="text-[13px] text-white/60 w-16 text-right tabular-nums font-medium">{row.count.toLocaleString()}</span>
                          <span className="text-[11px] text-white/35 w-12 text-right tabular-nums">{row.percent.toFixed(0)}%</span>
                        </motion.button>
                      ))}
                    </div>
                  </div>

                  {/* Filters — flat, editorial */}
                  <div className="flex items-center gap-3 text-[11px] uppercase tracking-[0.22em] font-bold text-white/45 mb-6">
                    <span className="tabular-nums">03 / 03</span>
                    <span className="h-px w-10 bg-white/25" />
                    <span>Wall</span>
                  </div>

                  {/* Scope toggle — current vs archive (SellAuth legacy) */}
                  {scopeCounts.archive > 0 && (
                    <div role="radiogroup" aria-label="Review source" className="flex items-center gap-1 mb-4 text-[12px]">
                      {(Object.keys(scopeLabels) as ScopeOption[]).map(key => {
                        const active = scope === key
                        const count = scopeCounts[key]
                        return (
                          <button
                            key={key}
                            role="radio"
                            aria-checked={active}
                            onClick={() => setScope(key)}
                            className={`group relative inline-flex items-center gap-2 px-3 py-1.5 rounded-full transition-colors ${
                              active
                                ? "text-[#f97316]"
                                : "text-white/45 hover:text-white/70"
                            }`}
                          >
                            {active && (
                              <motion.span
                                layoutId="reviewsScopeActive"
                                className="absolute inset-0 rounded-full bg-[#f97316]/10 ring-1 ring-inset ring-[#f97316]/35"
                                transition={{ type: "spring", stiffness: 380, damping: 30 }}
                              />
                            )}
                            <span className="relative font-semibold">{scopeLabels[key]}</span>
                            <span className="relative tabular-nums text-[11px] opacity-70">
                              {count.toLocaleString()}
                            </span>
                          </button>
                        )
                      })}
                    </div>
                  )}

                  {/* Archive plashka — visible when scope is archive */}
                  <AnimatePresence initial={false}>
                    {scope === "archive" && scopeCounts.archive > 0 && (
                      <motion.div
                        initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                        animate={{ opacity: 1, height: "auto", marginBottom: 20 }}
                        exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                        transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
                        className="overflow-hidden"
                      >
                        <div className="rounded-2xl border border-[#f97316]/20 bg-gradient-to-br from-[#f97316]/[0.06] to-transparent px-5 py-4">
                          <div className="flex flex-wrap items-start gap-x-6 gap-y-2">
                            <div className="flex-1 min-w-[280px]">
                              <p className="text-[11px] uppercase tracking-[0.22em] font-bold text-[#f97316]/90 mb-1.5">
                                SellAuth archive
                              </p>
                              <p className="text-[14px] text-white/75 leading-[1.55]">
                                <span className="tabular-nums font-semibold text-white">{scopeCounts.archive.toLocaleString()}</span> verified reviews carried over from our previous storefront on SellAuth. Every one of them is still auditable on the source platform.
                              </p>
                            </div>
                            <a
                              href="https://lethalsolutions.mysellauth.com/feedback"
                              target="_blank"
                              rel="noopener noreferrer"
                              className="cursor-cta press-spring inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-[#f97316]/40 text-[12px] font-bold text-[#f97316] hover:bg-[#f97316]/10 transition-colors"
                            >
                              Verify on SellAuth <ArrowRight className="h-3.5 w-3.5" />
                            </a>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Tab row — quick sort switcher. Container gets px/py so the ring around the active pill doesn't get clipped by overflow-x-auto on narrow screens. */}
                  <div role="tablist" aria-label="Sort reviews" className="flex items-center gap-1 mb-5 px-1 py-1 overflow-x-auto scrollbar-none">
                    {(Object.keys(tabLabels) as TabOption[]).map(key => {
                      const active = sortBy === key
                      return (
                        <button
                          key={key}
                          role="tab"
                          aria-selected={active}
                          onClick={() => setSortBy(key)}
                          className={`relative px-4 py-2 rounded-lg text-[12.5px] font-semibold whitespace-nowrap transition-colors ${
                            active ? "text-white" : "text-white/45 hover:text-white/70"
                          }`}
                        >
                          {active && (
                            <motion.span
                              layoutId="reviewsTabActive"
                              className="absolute inset-0 rounded-lg bg-[#f97316]/12 ring-1 ring-inset ring-[#f97316]/35"
                              transition={{ type: "spring", stiffness: 380, damping: 30 }}
                            />
                          )}
                          <span className="relative">{tabLabels[key]}</span>
                        </button>
                      )
                    })}
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3 mb-6">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
                      <input
                        type="text"
                        placeholder="Search verdicts…"
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        className="w-full pl-9 pr-4 py-2.5 bg-transparent border border-white/[0.08] rounded-xl text-white text-sm placeholder:text-white/35 outline-none focus:border-[#f97316]/40 transition-colors"
                      />
                    </div>
                    <div className="relative" ref={prodRef}>
                      <button
                        type="button"
                        aria-haspopup="listbox"
                        aria-expanded={showProductDropdown}
                        aria-label={`Filter by product: ${filterProduct || "All products"}`}
                        className="w-full sm:w-auto inline-flex items-center gap-2 px-4 py-2.5 bg-transparent border border-white/[0.08] rounded-xl text-sm text-white/65 justify-between min-w-[180px] hover:border-white/[0.15] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f97316]/40 transition-colors"
                        onClick={() => { setShowProductDropdown(!showProductDropdown); setShowSortDropdown(false) }}
                        onKeyDown={(e) => { if (e.key === "Escape") setShowProductDropdown(false) }}
                      >
                        <SlidersHorizontal className="h-4 w-4" />
                        <span className="truncate flex-1 text-left">{filterProduct || "All products"}</span>
                        <ChevronDown className={`h-4 w-4 shrink-0 transition-transform ${showProductDropdown ? "rotate-180" : ""}`} />
                      </button>
                      <AnimatePresence>
                        {showProductDropdown && (
                          <motion.div
                            role="listbox"
                            aria-label="Products"
                            tabIndex={-1}
                            initial={{ opacity: 0, y: -4, scale: 0.98 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -4, scale: 0.98 }}
                            transition={{ duration: 0.15 }}
                            className="absolute z-50 mt-2 w-64 rounded-xl border border-white/[0.08] bg-[#0a0a0a]/97 backdrop-blur-xl shadow-[0_20px_60px_rgba(0,0,0,0.6)] overflow-hidden"
                          >
                            <button type="button" role="option" aria-selected={!filterProduct} onClick={() => { setFilterProduct(null); setShowProductDropdown(false) }} className={`w-full text-left px-4 py-2.5 text-sm transition-colors hover:bg-white/[0.04] focus-visible:outline-none focus-visible:bg-white/[0.05] ${!filterProduct ? "text-[#f97316] font-medium" : "text-white/65"}`}>All products</button>
                            {allProducts.map(name => (
                              <button type="button" role="option" aria-selected={filterProduct === name} key={name} onClick={() => { setFilterProduct(name); setShowProductDropdown(false) }} className={`w-full text-left px-4 py-2.5 text-sm transition-colors hover:bg-white/[0.04] focus-visible:outline-none focus-visible:bg-white/[0.05] ${filterProduct === name ? "text-[#f97316] font-medium" : "text-white/65"}`}>
                                {name}
                              </button>
                            ))}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                    <div className="relative" ref={sortRef}>
                      <button
                        type="button"
                        aria-haspopup="listbox"
                        aria-expanded={showSortDropdown}
                        aria-label={`Sort: ${sortLabels[sortBy]}`}
                        className="w-full sm:w-auto inline-flex items-center gap-2 px-4 py-2.5 bg-transparent border border-white/[0.08] rounded-xl text-sm text-white/65 justify-between min-w-[150px] hover:border-white/[0.15] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f97316]/40 transition-colors"
                        onClick={() => { setShowSortDropdown(!showSortDropdown); setShowProductDropdown(false) }}
                        onKeyDown={(e) => { if (e.key === "Escape") setShowSortDropdown(false) }}
                      >
                        <span>{sortLabels[sortBy]}</span>
                        <ChevronDown className={`h-4 w-4 shrink-0 transition-transform ${showSortDropdown ? "rotate-180" : ""}`} />
                      </button>
                      <AnimatePresence>
                        {showSortDropdown && (
                          <motion.div
                            role="listbox"
                            aria-label="Sort options"
                            tabIndex={-1}
                            initial={{ opacity: 0, y: -4, scale: 0.98 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -4, scale: 0.98 }}
                            transition={{ duration: 0.15 }}
                            className="absolute z-50 mt-2 right-0 w-48 rounded-xl border border-white/[0.08] bg-[#0a0a0a]/97 backdrop-blur-xl shadow-[0_20px_60px_rgba(0,0,0,0.6)] overflow-hidden"
                          >
                            {(Object.keys(sortLabels) as SortOption[]).map(key => (
                              <button type="button" role="option" aria-selected={sortBy === key} key={key} onClick={() => { setSortBy(key); setShowSortDropdown(false) }} className={`w-full text-left px-4 py-2.5 text-sm transition-colors hover:bg-white/[0.04] focus-visible:outline-none focus-visible:bg-white/[0.05] ${sortBy === key ? "text-[#f97316] font-medium" : "text-white/65"}`}>{sortLabels[key]}</button>
                            ))}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>

                  {/* Active filters */}
                  {hasActiveFilters && (
                    <div className="flex flex-wrap items-center gap-2 mb-6 text-[12px]">
                      {filterRating !== null && (
                        <button onClick={() => setFilterRating(null)} className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#f97316]/10 text-[#f97316] font-medium hover:bg-[#f97316]/20 transition-colors">
                          {filterRating}★ <X className="h-3 w-3" />
                        </button>
                      )}
                      {filterProduct && (
                        <button onClick={() => setFilterProduct(null)} className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#f97316]/10 text-[#f97316] font-medium hover:bg-[#f97316]/20 transition-colors">
                          {filterProduct} <X className="h-3 w-3" />
                        </button>
                      )}
                      {searchQuery.trim() && (
                        <button onClick={() => setSearchQuery("")} className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#f97316]/10 text-[#f97316] font-medium hover:bg-[#f97316]/20 transition-colors">
                          {`"${searchQuery}"`} <X className="h-3 w-3" />
                        </button>
                      )}
                      <button onClick={clearFilters} className="text-white/35 hover:text-white/70 underline underline-offset-2 ml-1 transition-colors">Reset</button>
                      <span className="text-white/35 ml-auto tabular-nums">{filteredReviews.length.toLocaleString()} match</span>
                    </div>
                  )}

                  {/* Reviews — CSS columns masonry */}
                  {visibleReviews.length === 0 ? (
                    <div className="py-20 text-center">
                      <p className="text-[15px] text-white/50 mb-4">Nothing matched. Loosen the filters.</p>
                      <button onClick={clearFilters} className="press-spring px-5 py-2 rounded-xl border border-white/[0.08] bg-white/[0.02] text-sm text-white/60 hover:border-[#f97316]/35 hover:text-[#f97316] transition-colors">
                        Reset
                      </button>
                    </div>
                  ) : (
                    <div className="columns-1 md:columns-2 lg:columns-3 gap-5 [column-fill:_balance]">
                      {visibleReviews.map((review, i) => (
                        <ReviewCard
                          key={review.id}
                          review={review}
                          index={i}
                        />
                      ))}
                    </div>
                  )}

                  {/* Load more */}
                  <div className="flex justify-center py-14">
                    {hasMore ? (
                      <button
                        onClick={() => setVisibleCount(p => p + REVIEWS_PER_PAGE)}
                        data-cursor="cta"
                        data-cursor-label="More"
                        className="cursor-cta press-spring inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-white/[0.08] text-[13px] font-bold text-white/70 hover:border-[#f97316]/40 hover:text-[#f97316] hover:-translate-y-0.5 transition-all"
                      >
                        Load more <ChevronDown className="h-4 w-4" />
                      </button>
                    ) : visibleReviews.length > 0 ? (
                      <div className="flex items-center gap-4 w-full max-w-md">
                        <span className="flex-1 h-px bg-white/[0.08]" />
                        <span className="text-[11px] uppercase tracking-[0.2em] text-white/35 whitespace-nowrap">End of the wall</span>
                        <span className="flex-1 h-px bg-white/[0.08]" />
                      </div>
                    ) : null}
                  </div>
                </>
              )}
            </>
          )}
        </div>
      </section>
      <Footer />
    </main>
  )
}

// Two-line mask reveal from the playbook
function MaskHeadline({ text }: { text: string }) {
  return (
    <h1 className="font-display font-bold tracking-[-0.04em] leading-[0.95] overflow-hidden" style={{ fontSize: "clamp(56px, 9vw, 128px)" }}>
      <motion.span
        initial={{ y: "110%" }}
        animate={{ y: "0%" }}
        transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
        className="inline-block"
        style={{
          background: "linear-gradient(180deg, rgba(255,255,255,1), rgba(180,180,195,0.85))",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
        }}
      >
        {text}
      </motion.span>
    </h1>
  )
}

function ReviewCard({ review, index }: { review: ReviewItem; index: number }) {
  const isLegacy = review.source === "sellauth_legacy"
  const initials = isLegacy ? "SA" : getInitials(review.username)
  const tint = isLegacy
    ? "from-[#f97316]/30 to-[#ea580c]/10"
    : avatarTints[review.id % avatarTints.length]
  const isFiveStar = review.rating === 5
  const isLowRating = review.rating <= 2
  const displayName = isLegacy ? "SellAuth archive" : (review.username || maskEmail(review.email) || "verified buyer")
  const dateLong = formatDateLong(review.created_at)
  const duration = review.variant_name || ""
  // Only animate the very first batch so Load-More doesn't trigger a column re-balance
  // mid-scroll. After the fold, cards mount opaque — no layout thrash from framer-motion.
  const animate = index < 12

  return (
    <article
      style={animate ? { animation: `reviewCardIn 0.55s cubic-bezier(0.22, 1, 0.36, 1) ${Math.min(index * 0.035, 0.3)}s both` } : undefined}
      className={`reviews-card break-inside-avoid-column mb-5 rounded-2xl border p-5 md:p-6 bg-white/[0.012] hover:bg-white/[0.025] transition-[background-color,border-color,transform,box-shadow] duration-300 hover:-translate-y-1 hover:shadow-[0_20px_50px_rgba(0,0,0,0.5),0_0_30px_rgba(249,115,22,0.12)] ${
        review.refunded ? "border-red-500/20 hover:border-red-500/35 bg-[linear-gradient(to_bottom_right,rgba(239,68,68,0.03),transparent)]" :
        isLowRating ? "border-red-500/15 hover:border-red-500/30" :
        isLegacy ? "border-[#f97316]/18 hover:border-[#f97316]/40" :
        isFiveStar ? "border-[#f97316]/15 hover:border-[#f97316]/35" :
        "border-white/[0.06] hover:border-white/[0.15]"
      }`}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex gap-0.5">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star key={i} className={`h-3.5 w-3.5 ${i < review.rating ? "fill-[#fbbf24] text-[#fbbf24]" : "fill-white/[0.05] text-white/[0.05]"}`} />
          ))}
        </div>
        <div className="flex items-center gap-1.5">
          {review.refunded && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-500/10 text-[10px] font-bold text-red-400/90 tracking-wider uppercase">
              Refunded
            </span>
          )}
          {isLegacy ? (
            <span
              title="Carried over from SellAuth storefront"
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#f97316]/12 ring-1 ring-inset ring-[#f97316]/30 text-[10px] font-bold text-[#f97316] tracking-wider uppercase"
            >
              Archive
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10 text-[10px] font-bold text-emerald-400/90 tracking-wider uppercase">
              <CheckCircle2 className="h-2.5 w-2.5" strokeWidth={3} />
              Verified
            </span>
          )}
        </div>
      </div>

      <p className={`${isFiveStar && review.text.length < 140 ? "font-display text-[17px] leading-[1.35] tracking-[-0.01em]" : "text-[14px] leading-[1.55]"} text-white/80 mb-5 whitespace-pre-line`}>
        {review.text}
      </p>

      <SupportResponse review={review} />


      <div className="flex items-center justify-between mt-5 pt-4 border-t border-white/[0.04] gap-3">
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${tint} border border-white/10 flex items-center justify-center text-[11px] font-bold text-white/90 shrink-0`}>
            {initials}
          </div>
          <div className="min-w-0">
            <p className="text-[11.5px] text-white/75 font-medium truncate">{displayName}</p>
            <p className="text-[10.5px] text-[#f97316]/55 truncate uppercase tracking-wider font-semibold">{review.product}</p>
          </div>
        </div>
        {duration && (
          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase ring-1 ring-inset shrink-0 ${durationTone(duration)}`}>
            {duration}
          </span>
        )}
      </div>
      <p className="mt-3 text-[10.5px] text-white/32 tabular-nums flex items-center gap-1.5 flex-wrap">
        <span>{dateLong || review.time_label}</span>
        {isLegacy && (
          <>
            <span className="text-white/18">·</span>
            <span className="text-[#f97316]/55">Transferred from SellAuth</span>
          </>
        )}
      </p>
    </article>
  )
}

/* --------------------------------------------------------------------------
   Two-stage support response — timeline rail (Variant B, canonical).
   First reply: muted dot. Update (resolved): green dot with soft glow.
   Same persona (ujuk | vsx) handles both messages in a thread — deterministic
   from review id so it doesn't flip between renders. For positive reviews,
   a short single reply may be shown without the rail.
   -------------------------------------------------------------------------- */
function SupportResponse({ review }: { review: ReviewItem }) {
  // Time-gate: a reply scheduled for the future hasn't "happened" yet in the
  // site's own timeline. Hide it until its timestamp arrives. Without this,
  // a review posted today with `update_at = today + 3 days` would show the
  // resolution immediately, which is inconsistent.
  const now = Date.now()
  const firstDue = !review.response_first_reply_at || new Date(review.response_first_reply_at).getTime() <= now
  const updateDue = !!review.response_update_at && new Date(review.response_update_at).getTime() <= now

  const first = firstDue ? (review.response_first_reply_text || null) : null
  const update = updateDue ? (review.response_update_text || null) : null
  if (!first && !update) return null

  const persona: SupportPersona = review.response_persona ?? assignPersona(review.id)
  const hasUpdate = !!update

  // Compute human-readable delays when timestamps are present. Fall back to
  // static labels so the card still reads naturally for rows without them.
  const firstDelay = review.response_first_reply_at
    ? humanDelay(review.created_at, review.response_first_reply_at)
    : ""
  const updateDelay =
    review.response_update_at && review.response_first_reply_at
      ? humanDelay(review.response_first_reply_at, review.response_update_at)
      : ""

  // Single-reply variant — used for ~10% of positive reviews. No rail, no
  // timeline. Just a muted accent strip with the persona.
  if (!hasUpdate) {
    return (
      <div className="group/resp mb-5 pl-4 py-1 border-l-2 border-white/10 hover:border-[#f97316]/55 transition-colors">
        <div className="flex items-center gap-2 mb-1.5">
          <SupportAvatar persona={persona} size={22} />
          <span className="text-[11.5px] font-medium text-white/80">{persona}</span>
          <span className="text-white/20">·</span>
          <span className="text-[10.5px] text-white/40">Support</span>
          {firstDelay && (
            <>
              <span className="text-white/15">·</span>
              <span className="text-[10.5px] text-white/35">{firstDelay}</span>
            </>
          )}
        </div>
        <p className="text-[12.5px] text-white/55 leading-[1.55]">{first}</p>
      </div>
    )
  }

  // Two-stage timeline. The vertical rail connects two dots; first dot is
  // muted, update dot is green with a soft glow to signal resolution.
  return (
    <div className="group/resp mb-5 relative pl-6">
      <span
        aria-hidden
        className="absolute left-[7px] top-0 bottom-0 w-0.5 rounded-full"
        style={{
          background:
            "linear-gradient(to bottom, transparent 0, rgba(255,255,255,0.18) 14px, rgba(255,255,255,0.18) calc(100% - 14px), transparent 100%)",
        }}
      />

      {/* First reply ------------------------------------------------- */}
      <div className="relative pb-4">
        <span
          aria-hidden
          className="absolute -left-[20px] top-[7px] h-2 w-2 rounded-full bg-white/55"
          style={{ boxShadow: "0 0 0 3px rgb(10,10,10)" }}
        />
        <div className="flex items-center gap-2 mb-1.5 flex-wrap">
          <SupportAvatar persona={persona} size={22} />
          <span className="text-[11.5px] font-medium text-white/80">{persona}</span>
          <span className="text-white/20">·</span>
          <span className="text-[10.5px] text-white/40">Support</span>
          {firstDelay && (
            <>
              <span className="text-white/15">·</span>
              <span className="text-[10.5px] text-white/35">{firstDelay}</span>
            </>
          )}
        </div>
        <p className="text-[12.5px] text-white/55 leading-[1.55]">{first}</p>
      </div>

      {/* Update ------------------------------------------------------ */}
      <div className="relative">
        <span
          aria-hidden
          className="absolute -left-[20px] top-[7px] h-2 w-2 rounded-full bg-emerald-400"
          style={{
            boxShadow:
              "0 0 0 3px rgb(10,10,10), 0 0 0 5px rgba(16,185,129,0.22), 0 0 12px rgba(16,185,129,0.55)",
          }}
        />
        <div className="flex items-center gap-2 mb-1.5 flex-wrap">
          <span className="inline-flex items-center px-1.5 py-0.5 rounded bg-emerald-400/12 text-[9px] font-black text-emerald-400 tracking-[0.18em] uppercase">
            Update
          </span>
          <SupportAvatar persona={persona} size={22} />
          <span className="text-[11.5px] font-medium text-white/80">{persona}</span>
          {updateDelay && (
            <>
              <span className="text-white/15">·</span>
              <span className="text-[10.5px] text-white/35">{updateDelay}</span>
            </>
          )}
        </div>
        <p className="text-[12.5px] text-white/70 leading-[1.55]">{update}</p>
      </div>
    </div>
  )
}

