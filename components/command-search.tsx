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
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setOpen(false)} />

      {/* Modal */}
      <div className="relative max-w-lg w-full mx-auto mt-[15vh] px-4">
        <div className="rounded-2xl border border-border/50 bg-card/95 backdrop-blur-xl shadow-2xl shadow-black/40 overflow-hidden">
          {/* Input */}
          <div className="flex items-center gap-3 px-4 border-b border-border/30">
            <Search className="h-4 w-4 text-muted-foreground shrink-0" />
            <input
              ref={inputRef}
              type="text"
              placeholder="Search products, pages..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyNav}
              className="flex-1 h-14 bg-transparent text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none"
            />
            <button
              onClick={() => setOpen(false)}
              className="px-2 py-1 rounded-md bg-muted/30 text-[10px] font-bold text-muted-foreground"
            >
              ESC
            </button>
          </div>

          {/* Results */}
          <div className="max-h-[350px] overflow-y-auto p-2">
            {searching ? (
              <div className="py-8 text-center text-sm text-muted-foreground">Searching...</div>
            ) : results.length > 0 ? (
              <>
                <p className="px-3 py-2 text-[10px] font-bold text-muted-foreground/50 uppercase tracking-wider">Products</p>
                {results.map((product, i) => (
                  <button
                    key={product.id}
                    onClick={() => navigate(`/products/${product.id}`)}
                    className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl text-left transition-colors ${
                      i === selectedIndex ? "bg-primary/10 text-foreground" : "hover:bg-muted/20 text-foreground"
                    }`}
                  >
                    <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                      <Package className="h-4 w-4 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm truncate">{product.name}</p>
                      <p className="text-xs text-muted-foreground">{product.category}</p>
                    </div>
                    <span className="text-sm font-bold text-primary">£{(product.price / 100).toFixed(0)}</span>
                    {i === selectedIndex && <CornerDownLeft className="h-3.5 w-3.5 text-muted-foreground" />}
                  </button>
                ))}
              </>
            ) : query ? (
              <div className="py-8 text-center text-sm text-muted-foreground">No results for &quot;{query}&quot;</div>
            ) : (
              <>
                <p className="px-3 py-2 text-[10px] font-bold text-muted-foreground/50 uppercase tracking-wider">Quick links</p>
                {QUICK_LINKS.map((link, i) => (
                  <button
                    key={link.href}
                    onClick={() => navigate(link.href)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-colors ${
                      i === selectedIndex ? "bg-primary/10" : "hover:bg-muted/20"
                    }`}
                  >
                    <ArrowRight className="h-3.5 w-3.5 text-muted-foreground" />
                    <span className="text-sm font-medium">{link.label}</span>
                    {i === selectedIndex && <CornerDownLeft className="h-3.5 w-3.5 text-muted-foreground ml-auto" />}
                  </button>
                ))}
              </>
            )}
          </div>

          {/* Footer hint */}
          <div className="px-4 py-3 border-t border-border/30 bg-muted/5 flex items-center gap-4 text-[10px] text-muted-foreground/50">
            <span className="flex items-center gap-1"><kbd className="px-1.5 py-0.5 rounded bg-muted/30 font-mono">↑↓</kbd> navigate</span>
            <span className="flex items-center gap-1"><kbd className="px-1.5 py-0.5 rounded bg-muted/30 font-mono">↵</kbd> select</span>
            <span className="flex items-center gap-1"><kbd className="px-1.5 py-0.5 rounded bg-muted/30 font-mono">esc</kbd> close</span>
          </div>
        </div>
      </div>
    </div>
  )
}
