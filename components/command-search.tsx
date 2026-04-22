"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { Search, Package, CornerDownLeft, Home, Compass, MessageSquare, Activity, Download, BookOpen, GitCompare, Sparkles, Clock } from "lucide-react"
import { useRouter, usePathname } from "next/navigation"

interface SearchResult {
  id: string
  name: string
  category: string
  price: number
}

type PageItem = { label: string; href: string; icon: typeof Home; sub?: string }

const PAGES: PageItem[] = [
  { label: "Home", href: "/", icon: Home },
  { label: "All Products", href: "/products", icon: Package },
  { label: "Compare", href: "/compare", icon: GitCompare },
  { label: "Reviews", href: "/reviews", icon: MessageSquare },
  { label: "Guides", href: "/guides", icon: BookOpen },
  { label: "FAQ", href: "/faq", icon: Sparkles },
  { label: "Track Order", href: "/track", icon: Compass },
  { label: "Downloads", href: "/downloads", icon: Download },
  { label: "System Status", href: "/status", icon: Activity },
  { label: "Changelog", href: "/changelog", icon: Clock },
]

const RECENT_KEY = "ls_cmdk_recent"
const MAX_RECENT = 5

function loadRecent(): string[] {
  if (typeof window === "undefined") return []
  try {
    const raw = window.localStorage.getItem(RECENT_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed.slice(0, MAX_RECENT) : []
  } catch { return [] }
}

function saveRecent(href: string) {
  if (typeof window === "undefined") return
  try {
    const prev = loadRecent().filter((h) => h !== href)
    const next = [href, ...prev].slice(0, MAX_RECENT)
    window.localStorage.setItem(RECENT_KEY, JSON.stringify(next))
  } catch { /* noop */ }
}

export function CommandSearch() {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<SearchResult[]>([])
  const [searching, setSearching] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [recent, setRecent] = useState<string[]>([])
  const inputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()
  const pathname = usePathname()

  // Cmd+K / Ctrl+K to open + custom event for navbar button
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && (e.key === "k" || e.key === "K")) {
        e.preventDefault()
        setOpen((prev) => !prev)
      }
      if (e.key === "Escape") setOpen(false)
    }
    const handleCustom = () => setOpen(true)
    document.addEventListener("keydown", handleKeyDown)
    window.addEventListener("ls:open-cmdk", handleCustom)
    return () => {
      document.removeEventListener("keydown", handleKeyDown)
      window.removeEventListener("ls:open-cmdk", handleCustom)
    }
  }, [])

  // Auto-close on route change
  useEffect(() => { setOpen(false) }, [pathname])

  // Lock body scroll while palette is open. Lenis keeps running, but we add
  // data-lenis-prevent to the modal so inner scroll works natively.
  useEffect(() => {
    if (!open) return
    const prevOverflow = document.body.style.overflow
    const prevPadding = document.body.style.paddingRight
    const scrollBarWidth = window.innerWidth - document.documentElement.clientWidth
    document.body.style.overflow = "hidden"
    if (scrollBarWidth > 0) document.body.style.paddingRight = `${scrollBarWidth}px`
    return () => {
      document.body.style.overflow = prevOverflow
      document.body.style.paddingRight = prevPadding
    }
  }, [open])

  // Focus + reset + load recent when opened
  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 50)
      setQuery("")
      setResults([])
      setSelectedIndex(0)
      setRecent(loadRecent())
    }
  }, [open])

  // Search API
  useEffect(() => {
    if (!query.trim()) { setResults([]); return }
    const timer = setTimeout(async () => {
      setSearching(true)
      try {
        const res = await fetch(`/api/products/search?q=${encodeURIComponent(query)}`)
        const data = await res.json()
        setResults(data.products || [])
      } catch { setResults([]) }
      setSearching(false)
      setSelectedIndex(0)
    }, 180)
    return () => clearTimeout(timer)
  }, [query])

  // Filtered page list when user types
  const q = query.trim().toLowerCase()
  const filteredPages = q
    ? PAGES.filter((p) => p.label.toLowerCase().includes(q))
    : []
  const recentItems = !q
    ? recent.map((href) => PAGES.find((p) => p.href === href)).filter(Boolean) as PageItem[]
    : []
  const pagesSection = q ? filteredPages : PAGES.filter((p) => !recentItems.includes(p))

  // Build flat item list for keyboard nav
  type FlatItem =
    | { kind: "page"; item: PageItem }
    | { kind: "product"; item: SearchResult }
  const flat: FlatItem[] = [
    ...recentItems.map((item) => ({ kind: "page" as const, item })),
    ...results.map((item) => ({ kind: "product" as const, item })),
    ...pagesSection.map((item) => ({ kind: "page" as const, item })),
  ]

  const navigate = useCallback((href: string) => {
    saveRecent(href)
    setOpen(false)
    router.push(href)
  }, [router])

  const handleKeyNav = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault()
      setSelectedIndex((i) => (i + 1) % Math.max(flat.length, 1))
    } else if (e.key === "ArrowUp") {
      e.preventDefault()
      setSelectedIndex((i) => (i - 1 + Math.max(flat.length, 1)) % Math.max(flat.length, 1))
    } else if (e.key === "Enter") {
      e.preventDefault()
      const chosen = flat[selectedIndex]
      if (!chosen) return
      if (chosen.kind === "page") navigate(chosen.item.href)
      else navigate(`/products/${chosen.item.id}`)
    }
  }

  if (!open) return null

  let cursor = 0
  const idxOf = () => cursor++

  return (
    <div className="fixed inset-0 z-[120]" role="dialog" aria-modal="true" data-lenis-prevent>
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-md animate-in fade-in duration-200"
        onClick={() => setOpen(false)}
        data-lenis-prevent
      />

      {/* Modal */}
      <div className="relative max-w-xl w-full mx-auto mt-[14vh] px-4 animate-in fade-in slide-in-from-top-4 duration-200" data-lenis-prevent>
        <div className="rounded-2xl border border-white/[0.10] bg-[#0a0a0a]/95 backdrop-blur-xl shadow-[0_30px_80px_rgba(0,0,0,0.65),0_0_60px_rgba(249,115,22,0.14)] overflow-hidden">
          {/* Top orange accent line */}
          <div className="h-px bg-gradient-to-r from-transparent via-[#f97316]/60 to-transparent" />

          {/* Input */}
          <div className="flex items-center gap-3 px-4 border-b border-white/[0.06]">
            <Search className="h-4 w-4 text-[#f97316] shrink-0" style={{ filter: "drop-shadow(0 0 6px rgba(249, 115, 22, 0.8))" }} />
            <input
              ref={inputRef}
              type="text"
              placeholder="Search products, pages… try 'spoofer' or 'reviews'"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyNav}
              className="flex-1 h-14 bg-transparent text-[14px] text-white placeholder:text-white/40 focus:outline-none"
            />
            <button
              onClick={() => setOpen(false)}
              className="px-2 py-1 rounded-md bg-white/[0.06] border border-white/[0.08] text-[10px] font-bold text-white/65 font-mono hover:bg-white/[0.10] hover:text-white transition-colors"
            >
              ESC
            </button>
          </div>

          {/* Results */}
          <div className="max-h-[420px] overflow-y-auto p-2" data-lenis-prevent>
            {searching && (
              <div className="py-8 text-center text-[13px] text-white/55">Searching…</div>
            )}

            {!searching && recentItems.length > 0 && !q && (
              <>
                <p className="px-3 py-2 text-[10px] font-bold text-white/40 uppercase tracking-[0.18em]">Recent</p>
                {recentItems.map((p) => {
                  const idx = idxOf()
                  const Icon = p.icon
                  const active = idx === selectedIndex
                  return (
                    <button
                      key={`recent-${p.href}`}
                      onClick={() => navigate(p.href)}
                      onMouseEnter={() => setSelectedIndex(idx)}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all ${
                        active ? "bg-[#f97316]/[0.10] border border-[#f97316]/25" : "border border-transparent hover:bg-white/[0.03]"
                      }`}
                    >
                      <span className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${active ? "bg-[#f97316]/20 text-[#f97316]" : "bg-white/[0.03] text-white/55"}`}>
                        <Clock className="h-3.5 w-3.5" />
                      </span>
                      <span className={`flex-1 text-[13.5px] font-medium ${active ? "text-white" : "text-white/75"}`}>{p.label}</span>
                      {active && <CornerDownLeft className="h-3.5 w-3.5 text-[#f97316]" />}
                      <Icon className="h-3.5 w-3.5 text-white/30" />
                    </button>
                  )
                })}
              </>
            )}

            {!searching && results.length > 0 && (
              <>
                <p className="px-3 py-2 text-[10px] font-bold text-white/40 uppercase tracking-[0.18em]">Products</p>
                {results.map((product) => {
                  const idx = idxOf()
                  const active = idx === selectedIndex
                  return (
                    <button
                      key={product.id}
                      onClick={() => navigate(`/products/${product.id}`)}
                      onMouseEnter={() => setSelectedIndex(idx)}
                      className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl text-left transition-all ${
                        active ? "bg-[#f97316]/[0.10] border border-[#f97316]/25" : "border border-transparent hover:bg-white/[0.03]"
                      }`}
                    >
                      <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-[#f97316]/20 to-[#ea580c]/10 border border-[#f97316]/25 flex items-center justify-center shrink-0">
                        <Package className="h-4 w-4 text-[#f97316]" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-display font-bold text-[13.5px] text-white truncate tracking-tight">{product.name}</p>
                        <p className="text-[11px] text-white/55">{product.category}</p>
                      </div>
                      <span className="text-[13px] font-bold text-[#f97316] tabular-nums">£{(product.price / 100).toFixed(0)}</span>
                      {active && <CornerDownLeft className="h-3.5 w-3.5 text-[#f97316]" />}
                    </button>
                  )
                })}
              </>
            )}

            {!searching && pagesSection.length > 0 && (
              <>
                <p className="px-3 py-2 text-[10px] font-bold text-white/40 uppercase tracking-[0.18em]">{q ? "Pages" : "Jump to"}</p>
                {pagesSection.map((p) => {
                  const idx = idxOf()
                  const active = idx === selectedIndex
                  const Icon = p.icon
                  return (
                    <button
                      key={p.href}
                      onClick={() => navigate(p.href)}
                      onMouseEnter={() => setSelectedIndex(idx)}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all ${
                        active ? "bg-[#f97316]/[0.10] border border-[#f97316]/25" : "border border-transparent hover:bg-white/[0.03]"
                      }`}
                    >
                      <span className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${active ? "bg-[#f97316]/20 text-[#f97316]" : "bg-white/[0.03] text-white/55"}`}>
                        <Icon className="h-3.5 w-3.5" />
                      </span>
                      <span className={`flex-1 text-[13.5px] font-medium ${active ? "text-white" : "text-white/75"}`}>{p.label}</span>
                      {active && <CornerDownLeft className="h-3.5 w-3.5 text-[#f97316]" />}
                    </button>
                  )
                })}
              </>
            )}

            {!searching && results.length === 0 && pagesSection.length === 0 && q && (
              <div className="py-10 text-center text-[13px] text-white/55">
                No matches for &quot;<span className="text-white">{query}</span>&quot;
              </div>
            )}
          </div>

          {/* Footer hint */}
          <div className="px-4 py-3 border-t border-white/[0.06] bg-white/[0.015] flex items-center gap-4 text-[10px] text-white/45">
            <span className="flex items-center gap-1"><kbd className="px-1.5 py-0.5 rounded bg-white/[0.06] border border-white/[0.08] font-mono text-white/65">↑↓</kbd> navigate</span>
            <span className="flex items-center gap-1"><kbd className="px-1.5 py-0.5 rounded bg-white/[0.06] border border-white/[0.08] font-mono text-white/65">↵</kbd> select</span>
            <span className="flex items-center gap-1"><kbd className="px-1.5 py-0.5 rounded bg-white/[0.06] border border-white/[0.08] font-mono text-white/65">esc</kbd> close</span>
            <span className="ml-auto flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 rounded bg-[#f97316]/10 border border-[#f97316]/25 font-mono text-[#f97316]">⌘K</kbd>
              <span>toggle</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
