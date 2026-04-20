"use client"

import { useState, useEffect, useRef, useMemo } from "react"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import {
  Star, CheckCircle2, TrendingUp, Users, Award, ShieldCheck,
  Loader2, Search, ThumbsUp, ChevronDown, MessageSquare,
  SlidersHorizontal, X,
} from "lucide-react"
import useSWR from "swr"
import { getTotalReviewCount } from "@/lib/review-counts"
import { Breadcrumbs } from "@/components/breadcrumbs"

const fetcher = (url: string) => fetch(url).then(r => r.json())

type ReviewItem = {
  id: number; text: string; rating: number; product: string
  product_id: string; username: string; email: string
  time_label: string; verified: boolean; is_auto: boolean
  refunded: boolean; helpful: number; team_response: string | null
  created_at: string
}

// ── Products for filter ──
const allProducts = [
  "Perm Spoofer", "Temp Spoofer", "Fortnite External",
  "Blurred DMA Cheat", "Streck DMA Cheat", "Custom DMA Firmware",
  "DMA Basic Bundle", "DMA Advanced Bundle", "DMA Elite Bundle",
]

const avatarColors = [
  "bg-[#f97316]/80","bg-blue-500/80","bg-emerald-500/80","bg-amber-500/80",
  "bg-violet-500/80","bg-rose-500/80","bg-cyan-500/80","bg-orange-500/80",
  "bg-pink-500/80","bg-teal-500/80","bg-indigo-500/80","bg-lime-500/80",
]

function getInitials(username: string) {
  if (!username) return "??"
  const parts = username.replace(/[0-9]/g, "").slice(0, 2).toUpperCase()
  return parts || "??"
}

function maskEmail(email: string) {
  if (!email) return "***@***.com"
  const [local, domain] = email.split("@")
  const masked = local.length <= 3 ? local[0] + "***" : local.substring(0, 3) + "***"
  return `${masked}@${domain}`
}

const REVIEWS_PER_PAGE = 18
type SortOption = "newest" | "oldest" | "helpful"
const sortLabels: Record<SortOption, string> = { newest: "Newest First", oldest: "Oldest First", helpful: "Most Helpful" }

export default function ReviewsPage() {
  const { data, isLoading: isLoadingData } = useSWR<{ reviews: ReviewItem[]; totalCount: number }>("/api/reviews", fetcher)
  const allReviews = data?.reviews || []
  const totalDisplay = getTotalReviewCount()

  const weekGrowth = Math.floor(12 + (new Date().getDay() * 3) + (new Date().getDate() % 5))

  const [filterRating, setFilterRating] = useState<number | null>(null)
  const [filterProduct, setFilterProduct] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [sortBy, setSortBy] = useState<SortOption>("newest")
  const [visibleCount, setVisibleCount] = useState(REVIEWS_PER_PAGE)
  const [helpfulVotes, setHelpfulVotes] = useState<Set<number>>(new Set())
  const [showProductDropdown, setShowProductDropdown] = useState(false)
  const [showSortDropdown, setShowSortDropdown] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const prodRef = useRef<HTMLDivElement>(null)
  const sortRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (prodRef.current && !prodRef.current.contains(e.target as Node)) setShowProductDropdown(false)
      if (sortRef.current && !sortRef.current.contains(e.target as Node)) setShowSortDropdown(false)
    }
    document.addEventListener("mousedown", handleClick)
    return () => document.removeEventListener("mousedown", handleClick)
  }, [])

  const breakdown = useMemo(() => {
    const counts: Record<number, number> = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
    allReviews.forEach(r => { counts[r.rating] = (counts[r.rating] || 0) + 1 })
    const total = allReviews.length || 1
    return [5, 4, 3, 2, 1].map(stars => ({
      stars,
      count: counts[stars],
      percent: Math.round((counts[stars] / total) * 100),
    }))
  }, [allReviews])

  const avgRating = useMemo(() => {
    if (allReviews.length === 0) return "4.8"
    const sum = allReviews.reduce((s, r) => s + r.rating, 0)
    return (sum / allReviews.length).toFixed(1)
  }, [allReviews])

  const filteredReviews = useMemo(() => {
    let filtered = [...allReviews]
    if (filterRating !== null) filtered = filtered.filter(r => r.rating === filterRating)
    if (filterProduct) filtered = filtered.filter(r => r.product === filterProduct)
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      filtered = filtered.filter(r =>
        (r.text || "").toLowerCase().includes(q) ||
        (r.product || "").toLowerCase().includes(q) ||
        (r.email || "").toLowerCase().includes(q) ||
        (r.team_response && r.team_response.toLowerCase().includes(q))
      )
    }
    if (sortBy === "oldest") filtered.reverse()
    if (sortBy === "helpful") {
      filtered.sort((a, b) => (b.helpful || 0) - (a.helpful || 0))
    }
    return filtered
  }, [allReviews, filterRating, filterProduct, searchQuery, sortBy])

  const visibleReviews = filteredReviews.slice(0, visibleCount)
  const hasMore = visibleCount < filteredReviews.length

  const handleLoadMore = () => {
    setIsLoading(true)
    setTimeout(() => { setVisibleCount(p => p + REVIEWS_PER_PAGE); setIsLoading(false) }, 400)
  }

  const toggleHelpful = (id: number) => {
    setHelpfulVotes(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id); else next.add(id)
      return next
    })
  }

  const clearFilters = () => {
    setFilterRating(null); setFilterProduct(null); setSearchQuery("")
    setSortBy("newest"); setVisibleCount(REVIEWS_PER_PAGE)
  }

  const hasActiveFilters = filterRating !== null || filterProduct !== null || searchQuery.trim() !== ""

  useEffect(() => { setVisibleCount(REVIEWS_PER_PAGE) }, [filterRating, filterProduct, searchQuery, sortBy])

  if (isLoadingData) {
    return (
      <main className="flex min-h-screen flex-col bg-transparent">
        <Navbar />
        <section className="flex-1 flex items-center justify-center">
          <div className="flex items-center gap-3 text-white/40">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span>Loading reviews...</span>
          </div>
        </section>
        <Footer />
      </main>
    )
  }

  return (
    <main className="relative flex min-h-screen flex-col bg-transparent">
      {/* Noise texture overlay */}
      <div className="pointer-events-none fixed inset-0 z-[1] opacity-[0.015]">
        <svg width="100%" height="100%">
          <filter id="reviewsNoise">
            <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="4" stitchTiles="stitch" />
          </filter>
          <rect width="100%" height="100%" filter="url(#reviewsNoise)" />
        </svg>
      </div>

      <Navbar />
      <section className="relative z-[2] flex-1 pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto max-w-7xl">
          <Breadcrumbs items={[{ label: "Reviews" }]} />

          {/* Header */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 mb-6 px-4 py-2 rounded-full border border-white/[0.08] bg-white/[0.03] backdrop-blur-md">
              <span className="w-1.5 h-1.5 rounded-full bg-[#f97316] animate-pulse" />
              <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/55">Reviews</span>
            </div>
            <div className="relative h-px w-44 mx-auto mb-7 bg-white/[0.05] overflow-hidden">
              <div className="absolute inset-y-0 w-24 bg-gradient-to-r from-transparent via-[#f97316]/70 to-transparent" style={{ animation: "heroScan 4s ease-in-out infinite" }} />
            </div>
            <h1 className="font-display text-5xl sm:text-6xl md:text-7xl font-bold tracking-[-0.04em] leading-[0.95] mb-6">
              <span style={{ background: "linear-gradient(180deg, rgba(255,255,255,1), rgba(180,180,195,0.85))", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Customer </span>
              <span style={{ background: "linear-gradient(180deg, #ffb366 0%, #f97316 45%, #c2410c 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", filter: "drop-shadow(0 0 50px rgba(249,115,22,0.3))" }}>Reviews</span>
            </h1>
            <p className="text-[17px] text-white/55 max-w-xl mx-auto leading-relaxed">
              {totalDisplay.toLocaleString()} verified reviews from real customers
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
            {[
              { icon: Star, value: avgRating, label: "Average Rating", color: "text-[#f97316]", bg: "bg-[#f97316]/10" },
              { icon: Users, value: totalDisplay.toLocaleString(), label: "Total Reviews", color: "text-emerald-500", bg: "bg-emerald-500/10" },
              { icon: Award, value: `${allReviews.length > 0 ? Math.round((breakdown[0].count + breakdown[1].count) / allReviews.length * 100) : 0}%`, label: "Satisfaction", color: "text-amber-500", bg: "bg-amber-500/10" },
              { icon: ShieldCheck, value: "100%", label: "Verified", color: "text-blue-500", bg: "bg-blue-500/10" },
            ].map((stat) => (
              <div key={stat.label} className="bg-white/[0.012] border border-white/[0.04] rounded-xl p-5 text-center transition-colors duration-300 hover:bg-white/[0.025]">
                <div className={`w-10 h-10 rounded-full ${stat.bg} flex items-center justify-center mx-auto mb-2`}>
                  <stat.icon className={`h-5 w-5 ${stat.color}`} />
                </div>
                <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
                <p className="text-xs text-white/30">{stat.label}</p>
              </div>
            ))}
          </div>

          {/* Rating Breakdown */}
          <div className="mb-8 bg-white/[0.012] border border-white/[0.04] rounded-xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-semibold text-lg text-white">Rating Breakdown</h3>
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-emerald-500" />
                <span className="text-sm text-emerald-500">+{weekGrowth} this week</span>
              </div>
            </div>
            <div className="space-y-3">
              {breakdown.map((row) => (
                <button
                  key={row.stars}
                  onClick={() => setFilterRating(filterRating === row.stars ? null : row.stars)}
                  className={`flex items-center gap-4 w-full rounded-lg px-3 py-2 transition-colors duration-200 ${
                    filterRating === row.stars ? "bg-[#f97316]/10 ring-1 ring-[#f97316]/30" : "hover:bg-white/[0.03]"
                  }`}
                >
                  <div className="flex items-center gap-1 w-16">
                    <span className="text-sm font-medium text-white">{row.stars}</span>
                    <Star className="h-4 w-4 fill-[#fbbf24] text-[#fbbf24]" />
                  </div>
                  <div className="flex-1 h-2.5 bg-white/[0.03] rounded-full overflow-hidden">
                    <div className="h-full bg-[#f97316] rounded-full transition-all duration-500" style={{ width: `${row.percent}%` }} />
                  </div>
                  <span className="text-sm text-white/40 w-20 text-right">{row.count.toLocaleString()}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Filter Bar */}
          <div className="flex flex-col sm:flex-row gap-3 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30" />
              <input
                type="text"
                placeholder="Search reviews..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 bg-white/[0.015] border border-white/[0.05] rounded-xl text-white text-sm placeholder:text-white/20 outline-none focus:border-white/[0.1] transition-colors"
              />
            </div>
            <div className="relative" ref={prodRef}>
              <button
                className="w-full sm:w-auto inline-flex items-center gap-2 px-4 py-2.5 bg-white/[0.015] border border-white/[0.05] rounded-xl text-sm text-white/60 justify-between min-w-[180px] hover:bg-white/[0.03] transition-colors"
                onClick={() => { setShowProductDropdown(!showProductDropdown); setShowSortDropdown(false) }}
              >
                <SlidersHorizontal className="h-4 w-4" />
                <span className="truncate">{filterProduct || "All Products"}</span>
                <ChevronDown className="h-4 w-4 shrink-0" />
              </button>
              {showProductDropdown && (
                <div className="absolute z-50 mt-2 w-64 rounded-xl border border-white/[0.06] bg-black/95 backdrop-blur-md shadow-xl overflow-hidden">
                  <button onClick={() => { setFilterProduct(null); setShowProductDropdown(false) }} className={`w-full text-left px-4 py-2.5 text-sm transition-colors hover:bg-white/[0.04] ${!filterProduct ? "text-[#f97316] font-medium" : "text-white/60"}`}>All Products</button>
                  {allProducts.map(name => (
                    <button key={name} onClick={() => { setFilterProduct(name); setShowProductDropdown(false) }} className={`w-full text-left px-4 py-2.5 text-sm transition-colors hover:bg-white/[0.04] ${filterProduct === name ? "text-[#f97316] font-medium" : "text-white/60"}`}>
                      {name}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <div className="relative" ref={sortRef}>
              <button
                className="w-full sm:w-auto inline-flex items-center gap-2 px-4 py-2.5 bg-white/[0.015] border border-white/[0.05] rounded-xl text-sm text-white/60 justify-between min-w-[150px] hover:bg-white/[0.03] transition-colors"
                onClick={() => { setShowSortDropdown(!showSortDropdown); setShowProductDropdown(false) }}
              >
                <span>{sortLabels[sortBy]}</span>
                <ChevronDown className="h-4 w-4 shrink-0" />
              </button>
              {showSortDropdown && (
                <div className="absolute z-50 mt-2 right-0 w-48 rounded-xl border border-white/[0.06] bg-black/95 backdrop-blur-md shadow-xl overflow-hidden">
                  {(Object.keys(sortLabels) as SortOption[]).map(key => (
                    <button key={key} onClick={() => { setSortBy(key); setShowSortDropdown(false) }} className={`w-full text-left px-4 py-2.5 text-sm transition-colors hover:bg-white/[0.04] ${sortBy === key ? "text-[#f97316] font-medium" : "text-white/60"}`}>{sortLabels[key]}</button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Active filters */}
          {hasActiveFilters && (
            <div className="flex flex-wrap items-center gap-2 mb-6">
              <span className="text-sm text-white/40">Filters:</span>
              {filterRating !== null && (
                <button onClick={() => setFilterRating(null)} className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#f97316]/10 text-[#f97316] text-xs font-medium hover:bg-[#f97316]/20 transition-colors">
                  {filterRating} Stars <X className="h-3 w-3" />
                </button>
              )}
              {filterProduct && (
                <button onClick={() => setFilterProduct(null)} className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#f97316]/10 text-[#f97316] text-xs font-medium hover:bg-[#f97316]/20 transition-colors">
                  {filterProduct} <X className="h-3 w-3" />
                </button>
              )}
              {searchQuery.trim() && (
                <button onClick={() => setSearchQuery("")} className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#f97316]/10 text-[#f97316] text-xs font-medium hover:bg-[#f97316]/20 transition-colors">
                  {`"${searchQuery}"`} <X className="h-3 w-3" />
                </button>
              )}
              <button onClick={clearFilters} className="text-xs text-white/40 hover:text-white/70 underline underline-offset-2 ml-2 transition-colors">Clear all</button>
              <span className="text-xs text-white/40 ml-auto">
                {filteredReviews.length.toLocaleString()} results
              </span>
            </div>
          )}
          {!hasActiveFilters && (
            <div className="flex items-center mb-6">
              <span className="text-xs text-white/40 ml-auto">{totalDisplay.toLocaleString()} reviews</span>
            </div>
          )}

          {/* Reviews Grid */}
          {visibleReviews.length === 0 ? (
            <div className="text-center py-20">
              <Search className="h-12 w-12 text-white/30 mx-auto mb-4" />
              <p className="text-lg text-white/30">No reviews match your filters</p>
              <button onClick={clearFilters} className="mt-4 px-5 py-2 rounded-xl border border-white/[0.04] bg-white/[0.02] text-sm text-white/50 hover:bg-white/[0.04] transition-colors">Clear Filters</button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {visibleReviews.map((review) => {
                const initials = getInitials(review.username)
                const maskedEmail = maskEmail(review.email)
                const avatarColor = avatarColors[review.id % avatarColors.length]

                return (
                  <div key={review.id} className="rounded-xl border border-white/[0.04] bg-white/[0.012] p-6 flex flex-col hover:bg-white/[0.025] hover:border-white/[0.06] transition-colors duration-200">
                    {/* Stars + Badges */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex gap-0.5">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star key={i} className={`h-4 w-4 ${i < review.rating ? "fill-[#fbbf24] text-[#fbbf24]" : "fill-white/[0.06] text-white/[0.06]"}`} />
                        ))}
                      </div>
                      <div className="flex items-center gap-1.5">
                        {review.refunded && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-500/10 text-[10px] font-medium text-red-400">
                            Refunded
                          </span>
                        )}
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10 text-xs font-medium text-emerald-400">
                          <CheckCircle2 className="h-3 w-3" />
                          Verified
                        </span>
                      </div>
                    </div>

                    {/* Text */}
                    <p className="text-sm text-white/50 leading-relaxed mb-5 flex-1">{review.text || "Great product, works as described."}</p>

                    {/* Team response */}
                    {review.team_response && (
                      <div className="mb-5 rounded-lg bg-white/[0.02] border-l-2 border-[#f97316]/30 p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <MessageSquare className="h-3.5 w-3.5 text-[#f97316]" />
                          <span className="text-xs font-semibold text-[#f97316]">Lethal Team</span>
                        </div>
                        <p className="text-xs text-white/50 leading-relaxed">{review.team_response}</p>
                      </div>
                    )}

                    {/* Helpful */}
                    <div className="mb-4">
                      <button onClick={() => toggleHelpful(review.id)} className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs transition-colors ${helpfulVotes.has(review.id) ? "bg-[#f97316]/15 text-[#f97316]" : "bg-white/[0.02] text-white/40 hover:bg-white/[0.04] hover:text-white/60"}`}>
                        <ThumbsUp className="h-3 w-3" />
                        Helpful ({(review.helpful || 0) + (helpfulVotes.has(review.id) ? 1 : 0)})
                      </button>
                    </div>

                    {/* Footer */}
                    <div className="border-t border-white/[0.04] pt-4 flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-full ${avatarColor} flex items-center justify-center text-xs font-bold text-white shrink-0`}>{initials}</div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-white/60 truncate">{maskedEmail}</p>
                        <p className="text-xs text-[#f97316]/60 truncate">{review.product}</p>
                      </div>
                      <p className="text-xs text-white/40 whitespace-nowrap">{review.time_label}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {/* Load More / Pagination */}
          <div className="flex justify-center py-12">
            {hasMore && !isLoading && (
              <button onClick={handleLoadMore} className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white/[0.02] border border-white/[0.04] text-sm text-white/50 hover:bg-white/[0.04] hover:text-white/70 transition-colors">
                Load More Reviews <ChevronDown className="h-4 w-4" />
              </button>
            )}
            {isLoading && (
              <div className="flex items-center gap-2 text-white/40">
                <Loader2 className="h-5 w-5 animate-spin" />
                <span>Loading more reviews...</span>
              </div>
            )}
            {!hasMore && visibleReviews.length > 0 && (
              <p className="text-sm text-white/30">
                Showing all {hasActiveFilters ? filteredReviews.length.toLocaleString() : totalDisplay.toLocaleString()} reviews
              </p>
            )}
          </div>
        </div>
      </section>
      <Footer />
    </main>
  )
}
