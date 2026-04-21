"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { Search, ArrowRight, Package, Command, X, CornerDownLeft } from "lucide-react"
import { useRouter } from "next/navigation"

interface SearchResult {
  id: string
  name: string
  category: string
  price: number
}

const QUICK_LINKS = [
  { label: "All Products", href: "/products" },
  { label: "Reviews", href: "/reviews" },
  { label: "Track Order", href: "/track" },
  { label: "Status Page", href: "/status" },
  { label: "FAQ", href: "/faq" },
  { label: "Guides", href: "/guides" },
]

export function CommandSearch() {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<SearchResult[]>([])
  const [searching, setSearching] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  // Cmd+K / Ctrl+K to open
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault()
        setOpen(true)
      }
      if (e.key === "Escape") {
        setOpen(false)
      }
    }
    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [])

  // Focus input when opened
  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 50)
      setQuery("")
      setResults([])
      setSelectedIndex(0)
    }
  }, [open])

  // Search API
  useEffect(() => {
    if (!query.trim()) {
      setResults([])
      return
    }
    const timer = setTimeout(async () => {
      setSearching(true)
      try {
        const res = await fetch(`/api/products/search?q=${encodeURIComponent(query)}`)
        const data = await res.json()
        setResults(data.products || [])
      } catch {
        setResults([])
      }
      setSearching(false)
      setSelectedIndex(0)
    }, 200)
    return () => clearTimeout(timer)
  }, [query])

  const totalItems = results.length > 0 ? results.length : QUICK_LINKS.length

  const navigate = useCallback((href: string) => {
    setOpen(false)
    router.push(href)
  }, [router])

  const handleKeyNav = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault()
      setSelectedIndex((i) => (i + 1) % totalItems)
    } else if (e.key === "ArrowUp") {
      e.preventDefault()
      setSelectedIndex((i) => (i - 1 + totalItems) % totalItems)
    } else if (e.key === "Enter") {
      e.preventDefault()
      if (results.length > 0) {
        navigate(`/products/${results[selectedIndex]?.id}`)
      } else {
        navigate(QUICK_LINKS[selectedIndex]?.href || "/products")
      }
    }
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-[100]" role="dialog" aria-modal="true">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setOpen(false)} />

      {/* Modal */}
      <div className="relative max-w-lg w-full mx-auto mt-[15vh] px-4">
        <div className="rounded-2xl border border-white/[0.10] bg-[#0a0a0a]/95 backdrop-blur-xl shadow-[0_24px_60px_rgba(0,0,0,0.55),0_0_40px_rgba(249,115,22,0.08)] overflow-hidden">
          {/* Input */}
          <div className="flex items-center gap-3 px-4 border-b border-white/[0.06]">
            <Search className="h-4 w-4 text-[#f97316] shrink-0" style={{ filter: "drop-shadow(0 0 6px rgba(249,115,22,0.55))" }} />
            <input
              ref={inputRef}
              type="text"
              placeholder="Search products, pages..."
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
          <div className="max-h-[350px] overflow-y-auto p-2">
            {searching ? (
              <div className="py-8 text-center text-[13px] text-white/55">Searching...</div>
            ) : results.length > 0 ? (
              <>
                <p className="px-3 py-2 text-[10px] font-bold text-white/40 uppercase tracking-[0.18em]">Products</p>
                {results.map((product, i) => (
                  <button
                    key={product.id}
                    onClick={() => navigate(`/products/${product.id}`)}
                    className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl text-left transition-all ${
                      i === selectedIndex ? "bg-[#f97316]/[0.10] border border-[#f97316]/25" : "border border-transparent hover:bg-white/[0.03]"
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
                    {i === selectedIndex && <CornerDownLeft className="h-3.5 w-3.5 text-[#f97316]" />}
                  </button>
                ))}
              </>
            ) : query ? (
              <div className="py-8 text-center text-[13px] text-white/55">No results for &quot;<span className="text-white">{query}</span>&quot;</div>
            ) : (
              <>
                <p className="px-3 py-2 text-[10px] font-bold text-white/40 uppercase tracking-[0.18em]">Quick links</p>
                {QUICK_LINKS.map((link, i) => (
                  <button
                    key={link.href}
                    onClick={() => navigate(link.href)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all ${
                      i === selectedIndex ? "bg-[#f97316]/[0.10] border border-[#f97316]/25" : "border border-transparent hover:bg-white/[0.03]"
                    }`}
                  >
                    <ArrowRight className={`h-3.5 w-3.5 ${i === selectedIndex ? "text-[#f97316]" : "text-white/45"}`} />
                    <span className={`text-[13.5px] font-medium ${i === selectedIndex ? "text-white" : "text-white/75"}`}>{link.label}</span>
                    {i === selectedIndex && <CornerDownLeft className="h-3.5 w-3.5 text-[#f97316] ml-auto" />}
                  </button>
                ))}
              </>
            )}
          </div>

          {/* Footer hint */}
          <div className="px-4 py-3 border-t border-white/[0.06] bg-white/[0.015] flex items-center gap-4 text-[10px] text-white/45">
            <span className="flex items-center gap-1"><kbd className="px-1.5 py-0.5 rounded bg-white/[0.06] border border-white/[0.08] font-mono text-white/65">↑↓</kbd> navigate</span>
            <span className="flex items-center gap-1"><kbd className="px-1.5 py-0.5 rounded bg-white/[0.06] border border-white/[0.08] font-mono text-white/65">↵</kbd> select</span>
            <span className="flex items-center gap-1"><kbd className="px-1.5 py-0.5 rounded bg-white/[0.06] border border-white/[0.08] font-mono text-white/65">esc</kbd> close</span>
          </div>
        </div>
      </div>
    </div>
  )
}
