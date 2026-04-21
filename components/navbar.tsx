"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { Logo } from "@/components/logo"
import { MobileMenu } from "@/components/mobile-menu"
import { useState, useEffect, useRef } from "react"
import { ShoppingCart, User, Search, X, ArrowRight, Package } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useCart } from "@/lib/cart-context"
import { useRouter, usePathname } from "next/navigation"
import { createClient } from "@/lib/supabase/client"

interface SearchResult {
  id: string
  name: string
  category: string
  price: number
}

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [scrollProgress, setScrollProgress] = useState(0)
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<SearchResult[]>([])
  const [searching, setSearching] = useState(false)
  const searchRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const { itemCount } = useCart()
  const router = useRouter()
  const pathname = usePathname()
  const [isAuthed, setIsAuthed] = useState(false)

  useEffect(() => {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) return
    let mounted = true
    let unsubscribe: (() => void) | null = null
    try {
      const supabase = createClient()
      supabase.auth.getSession().then(({ data }) => { if (mounted) setIsAuthed(!!data.session) })
      const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
        if (mounted) setIsAuthed(!!session)
      })
      unsubscribe = () => sub.subscription.unsubscribe()
    } catch (e) {
      console.error("[navbar] auth init failed:", e)
    }
    return () => { mounted = false; unsubscribe?.() }
  }, [])

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight
      setScrollProgress(totalHeight > 0 ? (window.scrollY / totalHeight) * 100 : 0)
    }
    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setSearchOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  useEffect(() => {
    if (searchOpen && inputRef.current) inputRef.current.focus()
  }, [searchOpen])

  useEffect(() => {
    const searchProducts = async () => {
      if (!searchQuery.trim()) { setSearchResults([]); return }
      setSearching(true)
      try {
        const res = await fetch(`/api/products/search?q=${encodeURIComponent(searchQuery)}`)
        const data = await res.json()
        setSearchResults(data.products || [])
      } catch { setSearchResults([]) }
      setSearching(false)
    }
    const debounce = setTimeout(searchProducts, 300)
    return () => clearTimeout(debounce)
  }, [searchQuery])

  const handleResultClick = (id: string) => {
    setSearchOpen(false)
    setSearchQuery("")
    router.push(`/products/${id}`)
  }

  const navLinks = [
    { label: "Home", href: "/" },
    { label: "Products", href: "/products" },
    { label: "Guides", href: "/guides" },
    { label: "Reviews", href: "/reviews" },
    { label: "Track Order", href: "/track" },
    { label: "Status", href: "/status" },
  ]

  return (
    <>
      {/* Scroll progress with glow */}
      <div className="fixed top-0 left-0 right-0 z-[61] h-[2px] bg-transparent pointer-events-none">
        <div
          className="h-full transition-all duration-150 ease-out"
          style={{
            width: `${scrollProgress}%`,
            background: "linear-gradient(90deg, #f97316, #fb923c, #fbbf24)",
            boxShadow: "0 0 12px rgba(249, 115, 22, 0.8)",
          }}
        />
      </div>

      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          isScrolled
            ? "py-2.5 bg-black/75 backdrop-blur-xl border-b border-white/[0.06] shadow-[0_8px_32px_rgba(0,0,0,0.4)]"
            : "py-4 bg-gradient-to-b from-black/50 to-transparent"
        }`}
      >
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-10">
            {/* Logo */}
            <Link href="/" className="hover:opacity-80 transition-opacity shrink-0">
              <Logo />
            </Link>

            {/* Center nav — pill with layoutId morph */}
            <div className="hidden lg:flex items-center absolute left-1/2 -translate-x-1/2">
              <div className="flex items-center gap-0.5 rounded-full px-1.5 py-1 backdrop-blur-xl bg-white/[0.04] border border-white/[0.08] shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
                {navLinks.map((link) => {
                  const isActive = link.href === "/" ? pathname === "/" : pathname.startsWith(link.href)
                  return (
                    <Link
                      key={link.label}
                      href={link.href}
                      data-cursor="cta"
                      data-cursor-label={link.label}
                      className={`cursor-cta relative px-4 py-1.5 text-[13px] font-semibold rounded-full transition-colors duration-200 ${
                        isActive ? "text-white" : "text-white/55 hover:text-white"
                      }`}
                    >
                      {isActive && (
                        <motion.span
                          layoutId="navbar-active-pill"
                          className="absolute inset-0 rounded-full bg-gradient-to-br from-[#f97316] to-[#ea580c] shadow-[0_4px_14px_rgba(249,115,22,0.6)]"
                          transition={{ type: "spring", stiffness: 380, damping: 30 }}
                        />
                      )}
                      <span className="relative z-[2]">{link.label}</span>
                    </Link>
                  )
                })}
              </div>
            </div>

            {/* Right side */}
            <div className="flex items-center gap-2 shrink-0">
              {/* Search */}
              <div ref={searchRef} className="relative">
                <button
                  onClick={() => setSearchOpen(!searchOpen)}
                  className="hidden sm:flex items-center gap-2 h-8 px-3 rounded-full bg-white/[0.04] border border-white/[0.06] hover:bg-white/[0.06] hover:border-white/[0.1] transition-all text-white/40 text-xs"
                  aria-label="Search products"
                >
                  <Search className="h-3.5 w-3.5" />
                  <span>Search...</span>
                </button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setSearchOpen(!searchOpen)}
                  className="sm:hidden h-9 w-9 rounded-full hover:bg-white/[0.06]"
                  aria-label={searchOpen ? "Close search" : "Search products"}
                >
                  {searchOpen ? <X className="h-4 w-4" /> : <Search className="h-4 w-4" />}
                </Button>

                {/* Search Dropdown */}
                {searchOpen && (
                  <div className="absolute right-0 top-full mt-2 w-[320px] sm:w-[400px] rounded-2xl border border-white/[0.06] bg-white/[0.02] backdrop-blur-xl shadow-2xl shadow-black/20 overflow-hidden z-50">
                    <div className="p-3 border-b border-white/[0.06]">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
                        <input
                          ref={inputRef}
                          type="text"
                          placeholder="Search products..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="w-full h-10 pl-10 pr-4 rounded-xl bg-white/[0.05] border-0 text-sm text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-[#f97316]/50"
                        />
                      </div>
                    </div>
                    <div className="max-h-[300px] overflow-y-auto">
                      {searching ? (
                        <div className="p-8 text-center text-sm text-white/40">Searching...</div>
                      ) : searchResults.length > 0 ? (
                        <div className="p-2">
                          {searchResults.map((product) => (
                            <button
                              key={product.id}
                              onClick={() => handleResultClick(product.id)}
                              className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-white/[0.05] text-left transition-colors group"
                            >
                              <div className="w-10 h-10 rounded-lg bg-[#f97316]/10 flex items-center justify-center shrink-0">
                                <Package className="h-5 w-5 text-[#f97316]" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="font-bold text-white truncate">{product.name}</p>
                                <p className="text-xs text-white/40">{product.category}</p>
                              </div>
                              <span className="text-sm font-bold text-[#f97316]">{"£"}{(product.price / 100).toFixed(2)}</span>
                              <ArrowRight className="h-4 w-4 text-white/40 opacity-0 group-hover:opacity-100 transition-opacity" />
                            </button>
                          ))}
                        </div>
                      ) : searchQuery ? (
                        <div className="p-8 text-center">
                          <p className="text-sm text-white/40">No products found</p>
                        </div>
                      ) : (
                        <div className="p-8 text-center">
                          <p className="text-sm text-white/40">Start typing to search...</p>
                        </div>
                      )}
                    </div>
                    <div className="p-3 border-t border-white/[0.06] bg-white/[0.015]">
                      <Link
                        href="/products"
                        onClick={() => setSearchOpen(false)}
                        className="flex items-center justify-center gap-2 text-sm text-[#f97316] font-bold hover:text-[#fbbf24] transition-colors"
                      >
                        View all products
                        <ArrowRight className="h-4 w-4" />
                      </Link>
                    </div>
                  </div>
                )}
              </div>

              {/* Login or My Account */}
              <Link href={isAuthed ? "/profile" : "/login"}>
                <Button
                  size="sm"
                  className="hidden sm:inline-flex bg-gradient-to-br from-[#f97316] to-[#ea580c] hover:brightness-110 text-white text-xs font-bold rounded-full px-4 h-8 gap-1.5 shadow-[0_4px_14px_rgba(249, 115, 22, 0.46)] hover:shadow-[0_6px_20px_rgba(249, 115, 22, 0.72)] hover:-translate-y-0.5 transition-all duration-300 border-0"
                >
                  <User className="h-3.5 w-3.5" />
                  {isAuthed ? "My Account" : "Customer Login"}
                </Button>
              </Link>

              {/* Cart */}
              <Link href="/cart">
                <Button variant="ghost" size="icon" className="relative h-9 w-9 rounded-full hover:bg-white/[0.08] hover:text-[#f97316] text-white/70 transition-colors" aria-label="Shopping cart">
                  <ShoppingCart className="h-[18px] w-[18px]" />
                  {itemCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 h-[18px] min-w-[18px] px-1 rounded-full bg-gradient-to-br from-[#f97316] to-[#ea580c] text-[10px] font-bold flex items-center justify-center text-white shadow-[0_2px_8px_rgba(249, 115, 22, 0.72)]">
                      {itemCount}
                    </span>
                  )}
                </Button>
              </Link>

              {/* Mobile menu */}
              <div className="lg:hidden">
                <MobileMenu />
              </div>
            </div>
          </div>
        </div>
      </nav>
    </>
  )
}
