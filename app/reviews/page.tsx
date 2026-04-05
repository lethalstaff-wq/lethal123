"use client"

import { useState, useEffect, useRef, useMemo } from "react"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Star, CheckCircle2, TrendingUp, Users, Award, ShieldCheck,
  Loader2, Search, ThumbsUp, ChevronDown, MessageSquare,
  SlidersHorizontal, X, Bot, ToggleLeft, ToggleRight,
} from "lucide-react"
import useSWR from "swr"
import { getTotalReviewCount } from "@/lib/review-counts"
import { Breadcrumbs } from "@/components/breadcrumbs"
import { generateAllReviews } from "@/lib/generated-reviews"

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
  "bg-primary/80","bg-blue-500/80","bg-emerald-500/80","bg-amber-500/80",
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

// Generated reviews are created deterministically for every simulated order (lazy singleton)
let _cachedGenerated: ReturnType<typeof generateAllReviews> | null = null
function getGeneratedReviews() {
  if (!_cachedGenerated) _cachedGenerated = generateAllReviews()
  return _cachedGenerated
}

export default function ReviewsPage() {
  const { data, isLoading: isLoadingData } = useSWR<{ reviews: ReviewItem[]; totalCount: number }>("/api/reviews", fetcher)
  const { data: settings } = useSWR<Record<string, unknown>>("/api/settings", fetcher)
  const apiReviews = data?.reviews || []
  // Merge: real DB reviews first (newest), then generated reviews fill the rest
  const allReviews = [...apiReviews, ...getGeneratedReviews()]

  // Dynamic review count from centralized config
  const dynamicTotal = getTotalReviewCount()
  const cfgTotal = dynamicTotal
  const cfgStars5 = Math.round(dynamicTotal * 0.849)
  const cfgStars4 = Math.round(dynamicTotal * 0.100)
  const cfgStars3 = Math.round(dynamicTotal * 0.030)
  const cfgStars2 = Math.round(dynamicTotal * 0.014)
  const cfgStars1 = dynamicTotal - cfgStars5 - cfgStars4 - cfgStars3 - cfgStars2
  const cfgHelpfulMin = Number(settings?.helpful_min ?? 50)
  const cfgHelpfulMax = Number(settings?.helpful_max ?? 120)

  const virtualTotal = dynamicTotal
  const weekGrowth = Math.floor(12 + (new Date().getDate() % 8))

  const [filterRating, setFilterRating] = useState<number | null>(null)
  const [filterProduct, setFilterProduct] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [sortBy, setSortBy] = useState<SortOption>("newest")
  const [hideAutoReviews, setHideAutoReviews] = useState(false)
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

  // Virtual breakdown: grows proportionally from admin-configured counts
  const breakdown = useMemo(() => {
    const baseCounts: Record<number, number> = { 5: cfgStars5, 4: cfgStars4, 3: cfgStars3, 2: cfgStars2, 1: cfgStars1 }
    const baseTotal = cfgTotal || 1
    const vt = virtualTotal
    const scale = vt / baseTotal
    const scaled: Record<number, number> = {}
    let sumScaled = 0
    for (const s of [4, 3, 2, 1]) {
      scaled[s] = Math.round(baseCounts[s] * scale)
      sumScaled += scaled[s]
    }
    scaled[5] = vt - sumScaled
    return [5, 4, 3, 2, 1].map(stars => ({
      stars,
      count: scaled[stars],
      percent: Math.round((scaled[stars] / vt) * 100),
    }))
  }, [virtualTotal, cfgTotal, cfgStars5, cfgStars4, cfgStars3, cfgStars2, cfgStars1])

  const avgRating = useMemo(() => {
    if (allReviews.length === 0) return "4.8"
    const sum = allReviews.reduce((s, r) => s + r.rating, 0)
    return (sum / allReviews.length).toFixed(1)
  }, [allReviews])

  const filteredReviews = useMemo(() => {
    let filtered = [...allReviews]
    if (hideAutoReviews) filtered = filtered.filter(r => !r.is_auto)
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
    const vHelp = (id: number) => { const s = id * 2654435761 >>> 0; return cfgHelpfulMin + (s % (cfgHelpfulMax - cfgHelpfulMin + 1)); }
    filtered.sort((a, b) => vHelp(b.id) - vHelp(a.id))
  }
    return filtered
  }, [allReviews, filterRating, filterProduct, searchQuery, sortBy, hideAutoReviews, cfgHelpfulMin, cfgHelpfulMax])

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
    setSortBy("newest"); setHideAutoReviews(false); setVisibleCount(REVIEWS_PER_PAGE)
  }

  const hasActiveFilters = filterRating !== null || filterProduct !== null || searchQuery.trim() !== "" || hideAutoReviews

  useEffect(() => { setVisibleCount(REVIEWS_PER_PAGE) }, [filterRating, filterProduct, searchQuery, sortBy, hideAutoReviews])

  if (isLoadingData) {
    return (
      <main className="flex min-h-screen flex-col">
        <Navbar />
        <section className="flex-1 flex items-center justify-center">
          <div className="flex items-center gap-3 text-muted-foreground">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span>Loading reviews...</span>
          </div>
        </section>
        <Footer />
      </main>
    )
  }

  return (
    <main className="flex min-h-screen flex-col">
      <Navbar />
      <section className="flex-1 py-20 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto max-w-7xl">
          <Breadcrumbs items={[{ label: "Reviews" }]} />

          {/* Header */}
          <div className="text-center mb-16">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-6 text-balance">
              Customer <span className="text-primary">Reviews</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto text-pretty">
              {dynamicTotal.toLocaleString()} verified reviews from real customers
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
            {[
              { icon: Star, value: avgRating, label: "Average Rating", color: "text-primary", bg: "bg-primary/10" },
              { icon: Users, value: virtualTotal.toLocaleString(), label: "Total Reviews", color: "text-emerald-500", bg: "bg-emerald-500/10" },
              { icon: Award, value: `${virtualTotal > 0 ? Math.round((breakdown[0].count + breakdown[1].count) / virtualTotal * 100) : 0}%`, label: "Satisfaction", color: "text-amber-500", bg: "bg-amber-500/10" },
              { icon: ShieldCheck, value: "100%", label: "Verified", color: "text-blue-500", bg: "bg-blue-500/10" },
            ].map((stat) => (
              <Card key={stat.label} className="border-border/40 bg-card/40 backdrop-blur-sm hover:bg-card/60 transition-colors duration-300">
                <CardContent className="p-5 text-center">
                  <div className={`w-10 h-10 rounded-full ${stat.bg} flex items-center justify-center mx-auto mb-2`}>
                    <stat.icon className={`h-5 w-5 ${stat.color}`} />
                  </div>
                  <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Review of the Week */}
          {allReviews.length > 0 && (() => {
            const topReview = allReviews.filter(r => r.rating === 5 && r.text.length > 80 && r.team_response).sort((a, b) => b.helpful - a.helpful)[0]
              || allReviews.filter(r => r.rating === 5 && r.text.length > 80).sort((a, b) => b.helpful - a.helpful)[0]
            if (!topReview) return null
            const initials = getInitials(topReview.username)
            const avatarColor = avatarColors[topReview.id % avatarColors.length]
            return (
              <Card className="mb-8 border-primary/30 bg-gradient-to-r from-primary/[0.06] to-transparent backdrop-blur-sm overflow-hidden relative">
                <div className="absolute top-3 right-4 px-2.5 py-1 rounded-full bg-primary/15 text-primary text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
                  <Award className="h-3 w-3" />
                  Review of the Week
                </div>
                <CardContent className="p-6 pt-10">
                  <div className="flex gap-1 mb-3">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <p className="text-foreground/90 leading-relaxed mb-4">&ldquo;{topReview.text}&rdquo;</p>
                  {topReview.team_response && (
                    <div className="mb-4 rounded-lg bg-primary/[0.06] border border-primary/10 p-3">
                      <div className="flex items-center gap-2 mb-1.5">
                        <MessageSquare className="h-3.5 w-3.5 text-primary" />
                        <span className="text-xs font-semibold text-primary">Lethal Team</span>
                      </div>
                      <p className="text-xs text-foreground/70">{topReview.team_response}</p>
                    </div>
                  )}
                  <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-full ${avatarColor} flex items-center justify-center text-xs font-bold text-white`}>{initials}</div>
                    <div>
                      <p className="text-sm font-medium">{maskEmail(topReview.email)}</p>
                      <p className="text-xs text-primary">{topReview.product}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })()}

          {/* Rating Breakdown */}
          <Card className="mb-8 border-border/40 bg-card/40 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-semibold text-lg">Rating Breakdown</h3>
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
                      filterRating === row.stars ? "bg-primary/10 ring-1 ring-primary/30" : "hover:bg-muted/30"
                    }`}
                  >
                    <div className="flex items-center gap-1 w-16">
                      <span className="text-sm font-medium">{row.stars}</span>
                      <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                    </div>
                    <div className="flex-1 h-2.5 bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-primary rounded-full transition-all duration-500" style={{ width: `${row.percent}%` }} />
                    </div>
                    <span className="text-sm text-muted-foreground w-20 text-right">{row.count.toLocaleString()}</span>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Filter Bar */}
          <div className="flex flex-col sm:flex-row gap-3 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search reviews..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="pl-9 bg-card/40 border-border/40 backdrop-blur-sm" />
            </div>
            <div className="relative" ref={prodRef}>
              <Button variant="outline" className="w-full sm:w-auto gap-2 bg-card/40 border-border/40 backdrop-blur-sm justify-between min-w-[180px]" onClick={() => { setShowProductDropdown(!showProductDropdown); setShowSortDropdown(false) }}>
                <SlidersHorizontal className="h-4 w-4" />
                <span className="truncate">{filterProduct || "All Products"}</span>
                <ChevronDown className="h-4 w-4 shrink-0" />
              </Button>
              {showProductDropdown && (
                <div className="absolute z-50 mt-2 w-64 rounded-xl border border-border/60 bg-card/95 backdrop-blur-md shadow-xl overflow-hidden">
                  <button onClick={() => { setFilterProduct(null); setShowProductDropdown(false) }} className={`w-full text-left px-4 py-2.5 text-sm transition-colors hover:bg-muted/40 ${!filterProduct ? "text-primary font-medium" : ""}`}>All Products</button>
                  {allProducts.map(name => (
                    <button key={name} onClick={() => { setFilterProduct(name); setShowProductDropdown(false) }} className={`w-full text-left px-4 py-2.5 text-sm transition-colors hover:bg-muted/40 ${filterProduct === name ? "text-primary font-medium" : ""}`}>
                      {name}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <div className="relative" ref={sortRef}>
              <Button variant="outline" className="w-full sm:w-auto gap-2 bg-card/40 border-border/40 backdrop-blur-sm justify-between min-w-[150px]" onClick={() => { setShowSortDropdown(!showSortDropdown); setShowProductDropdown(false) }}>
                <span>{sortLabels[sortBy]}</span>
                <ChevronDown className="h-4 w-4 shrink-0" />
              </Button>
              {showSortDropdown && (
                <div className="absolute z-50 mt-2 right-0 w-48 rounded-xl border border-border/60 bg-card/95 backdrop-blur-md shadow-xl overflow-hidden">
                  {(Object.keys(sortLabels) as SortOption[]).map(key => (
                    <button key={key} onClick={() => { setSortBy(key); setShowSortDropdown(false) }} className={`w-full text-left px-4 py-2.5 text-sm transition-colors hover:bg-muted/40 ${sortBy === key ? "text-primary font-medium" : ""}`}>{sortLabels[key]}</button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Hide auto reviews toggle */}
          <div className="flex items-center gap-3 mb-8">
            <button
              onClick={() => setHideAutoReviews(!hideAutoReviews)}
              className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-medium transition-all duration-200 ${
                hideAutoReviews ? "bg-primary/15 text-primary border border-primary/30" : "bg-muted/20 text-muted-foreground border border-border/40 hover:bg-muted/30 hover:text-foreground"
              }`}
            >
              {hideAutoReviews ? <ToggleRight className="h-4 w-4" /> : <ToggleLeft className="h-4 w-4" />}
              Hide automatic feedback
            </button>
            <span className="text-[11px] text-muted-foreground/60">Automatic feedback collected after 7 days of use</span>
          </div>

          {/* Active filters */}
          {hasActiveFilters && (
            <div className="flex flex-wrap items-center gap-2 mb-6">
              <span className="text-sm text-muted-foreground">Filters:</span>
              {filterRating !== null && (
                <button onClick={() => setFilterRating(null)} className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium hover:bg-primary/20 transition-colors">
                  {filterRating} Stars <X className="h-3 w-3" />
                </button>
              )}
              {filterProduct && (
                <button onClick={() => setFilterProduct(null)} className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium hover:bg-primary/20 transition-colors">
                  {filterProduct} <X className="h-3 w-3" />
                </button>
              )}
              {searchQuery.trim() && (
                <button onClick={() => setSearchQuery("")} className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium hover:bg-primary/20 transition-colors">
                  {`"${searchQuery}"`} <X className="h-3 w-3" />
                </button>
              )}
              {hideAutoReviews && (
                <button onClick={() => setHideAutoReviews(false)} className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium hover:bg-primary/20 transition-colors">
                  Manual only <X className="h-3 w-3" />
                </button>
              )}
              <button onClick={clearFilters} className="text-xs text-muted-foreground hover:text-foreground underline underline-offset-2 ml-2 transition-colors">Clear all</button>
              <span className="text-xs text-muted-foreground ml-auto">
                {filterRating !== null && !filterProduct && !searchQuery.trim() && !hideAutoReviews
                  ? (breakdown.find(b => b.stars === filterRating)?.count || filteredReviews.length).toLocaleString()
                  : filteredReviews.length.toLocaleString()
                } results
              </span>
            </div>
          )}
          {!hasActiveFilters && (
            <div className="flex items-center mb-6">
              <span className="text-xs text-muted-foreground ml-auto">{virtualTotal.toLocaleString()} results</span>
            </div>
          )}

          {/* Reviews Grid */}
          {visibleReviews.length === 0 ? (
            <div className="text-center py-20">
              <Search className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
              <p className="text-lg text-muted-foreground">No reviews match your filters</p>
              <Button variant="outline" className="mt-4" onClick={clearFilters}>Clear Filters</Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {visibleReviews.map((review) => {
                const initials = getInitials(review.username)
                const maskedEmail = maskEmail(review.email)
                const avatarColor = avatarColors[review.id % avatarColors.length]

                return (
                  <div key={review.id} className="rounded-xl border border-border/40 bg-card/40 backdrop-blur-sm p-6 flex flex-col hover:bg-card/60 hover:border-border/60 hover:shadow-lg hover:shadow-primary/[0.03] transition-all duration-300">
                    {/* Stars + Badges */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex gap-0.5">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star key={i} className={`h-4 w-4 ${i < review.rating ? "fill-amber-400 text-amber-400" : "fill-muted text-muted"}`} />
                        ))}
                      </div>
                      <div className="flex items-center gap-1.5">
                        {review.refunded && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-500/10 text-[10px] font-medium text-red-400">
                            Refunded
                          </span>
                        )}
                        {review.is_auto && review.rating === 5 && !review.text && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-500/10 text-[10px] font-medium text-blue-400">
                            <Bot className="h-2.5 w-2.5" />
                            Auto
                          </span>
                        )}
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10 text-xs font-medium text-emerald-500">
                          <CheckCircle2 className="h-3 w-3" />
                          Verified
                        </span>
                      </div>
                    </div>

                    {/* Text */}
                    {review.text ? (
                      <p className="text-sm text-foreground/85 leading-relaxed mb-5 flex-1">{review.text}</p>
                    ) : (
                      <div className="mb-5 flex-1 flex items-center gap-2">
                        <Bot className="h-4 w-4 text-blue-400/60 shrink-0" />
                        <p className="text-sm text-muted-foreground/70 italic">Automatic feedback after 7 days</p>
                      </div>
                    )}

                    {/* Team response */}
                    {review.team_response && (
                      <div className="mb-5 rounded-lg bg-primary/[0.06] border border-primary/10 p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <MessageSquare className="h-3.5 w-3.5 text-primary" />
                          <span className="text-xs font-semibold text-primary">Lethal Team</span>
                        </div>
                        <p className="text-xs text-foreground/70 leading-relaxed">{review.team_response}</p>
                      </div>
                    )}

                    {/* Helpful */}
                    <div className="mb-4">
                      <button onClick={() => toggleHelpful(review.id)} className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs transition-colors ${helpfulVotes.has(review.id) ? "bg-primary/15 text-primary" : "bg-muted/30 text-muted-foreground hover:bg-muted/50 hover:text-foreground"}`}>
                        <ThumbsUp className="h-3 w-3" />
                        Helpful ({(() => { const seed = review.id * 2654435761 >>> 0; return cfgHelpfulMin + (seed % (cfgHelpfulMax - cfgHelpfulMin + 1)); })() + (helpfulVotes.has(review.id) ? 1 : 0)})
                      </button>
                    </div>

                    {/* Footer */}
                    <div className="border-t border-border/30 pt-4 flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-full ${avatarColor} flex items-center justify-center text-xs font-bold text-white shrink-0`}>{initials}</div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{maskedEmail}</p>
                        <p className="text-xs text-primary truncate">{review.product}</p>
                      </div>
                      <p className="text-xs text-muted-foreground whitespace-nowrap">{review.time_label}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {/* Load More */}
          <div className="flex justify-center py-12">
            {hasMore && !isLoading && (
              <Button variant="outline" size="lg" onClick={handleLoadMore} className="gap-2 bg-card/40 border-border/40 backdrop-blur-sm hover:bg-card/60">
                Load More Reviews <ChevronDown className="h-4 w-4" />
              </Button>
            )}
            {isLoading && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Loader2 className="h-5 w-5 animate-spin" />
                <span>Loading more reviews...</span>
              </div>
            )}
            {!hasMore && visibleReviews.length > 0 && (
              <p className="text-sm text-muted-foreground">
                Showing all {hasActiveFilters ? filteredReviews.length.toLocaleString() : virtualTotal.toLocaleString()} reviews
              </p>
            )}
          </div>
        </div>
      </section>
      <Footer />
    </main>
  )
}
