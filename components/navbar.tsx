"use client"

import Link from "next/link"
import { Logo } from "@/components/logo"
import { MobileMenu } from "@/components/mobile-menu"
import { useState, useEffect, useRef } from "react"
import { ShoppingCart, User, Search, X, ArrowRight, Package } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useCart } from "@/lib/cart-context"
import { useRouter } from "next/navigation"
import { cn } from "@/lib/utils"

interface SearchResult {
  id: string
  name: string
  category: string
  price: number
}

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<SearchResult[]>([])
  const [searching, setSearching] = useState(false)
  const searchRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const { itemCount } = useCart()
  const router = useRouter()

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20)
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
    if (searchOpen && inputRef.current) {
      inputRef.current.focus()
    }
  }, [searchOpen])

  useEffect(() => {
    const searchProducts = async () => {
      if (!searchQuery.trim()) {
        setSearchResults([])
        return
      }
      setSearching(true)
      try {
        const res = await fetch(`/api/products/search?q=${encodeURIComponent(searchQuery)}`)
        const data = await res.json()
        setSearchResults(data.products || [])
      } catch {
        setSearchResults([])
      }
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
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        isScrolled 
          ? "py-3 bg-background/80 backdrop-blur-xl border-b border-border/40 shadow-lg shadow-black/5" 
          : "py-5 bg-transparent"
      }`}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="hover:opacity-80 transition-opacity">
            <Logo />
          </Link>

          {/* Center nav links - pill style */}
          <div className="hidden lg:flex items-center">
            <div className={`flex items-center rounded-full px-1.5 py-1.5 transition-all duration-300 ${
              isScrolled ? "bg-muted/50" : "bg-white/5 backdrop-blur-sm"
            }`}>
              {navLinks.map((link) => (
                <Link 
                  key={link.label}
                  href={link.href} 
                  className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-background/80 rounded-full transition-all duration-200"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Right side */}
          <div className="flex items-center gap-2">
            {/* Search - desktop: Cmd+K button, mobile: inline search */}
            <div ref={searchRef} className="relative">
              {/* Desktop: search trigger */}
              <button
                onClick={() => setSearchOpen(!searchOpen)}
                className="hidden sm:flex items-center gap-2 h-9 px-3 rounded-lg bg-muted/30 border border-border/40 hover:bg-muted/50 hover:border-border/60 transition-all text-muted-foreground text-xs"
                aria-label="Search products"
              >
                <Search className="h-3.5 w-3.5" />
                <span className="text-muted-foreground/50">Search...</span>
              </button>
              {/* Mobile: icon button */}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSearchOpen(!searchOpen)}
                className="sm:hidden h-10 w-10 rounded-full hover:bg-muted/50"
                aria-label={searchOpen ? "Close search" : "Search products"}
              >
                {searchOpen ? <X className="h-[18px] w-[18px]" /> : <Search className="h-[18px] w-[18px]" />}
              </Button>

              {/* Search Dropdown - mobile only */}
              {searchOpen && (
                <div className="absolute right-0 top-full mt-2 w-[320px] sm:w-[400px] rounded-2xl border border-border/50 bg-card/95 backdrop-blur-xl shadow-2xl shadow-black/20 overflow-hidden z-50">
                  <div className="p-3 border-b border-border/30">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <input
                        ref={inputRef}
                        type="text"
                        placeholder="Search products..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full h-10 pl-10 pr-4 rounded-xl bg-muted/30 border-0 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                      />
                    </div>
                  </div>

                  <div className="max-h-[300px] overflow-y-auto">
                    {searching ? (
                      <div className="p-8 text-center text-sm text-muted-foreground">Searching...</div>
                    ) : searchResults.length > 0 ? (
                      <div className="p-2">
                        {searchResults.map((product) => (
                          <button
                            key={product.id}
                            onClick={() => handleResultClick(product.id)}
                            className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-muted/30 text-left transition-colors group"
                          >
                            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                              <Package className="h-5 w-5 text-primary" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-bold text-foreground truncate">{product.name}</p>
                              <p className="text-xs text-muted-foreground">{product.category}</p>
                            </div>
                            <span className="text-sm font-bold text-primary">£{(product.price / 100).toFixed(2)}</span>
                            <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                          </button>
                        ))}
                      </div>
                    ) : searchQuery ? (
                      <div className="p-8 text-center">
                        <p className="text-sm text-muted-foreground">No products found</p>
                      </div>
                    ) : (
                      <div className="p-8 text-center">
                        <p className="text-sm text-muted-foreground">Start typing to search...</p>
                      </div>
                    )}
                  </div>

                  <div className="p-3 border-t border-border/30 bg-muted/5">
                    <Link
                      href="/products"
                      onClick={() => setSearchOpen(false)}
                      className="flex items-center justify-center gap-2 text-sm text-primary font-medium hover:underline"
                    >
                      View all products
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {/* Customer Login */}
            <Link 
              href="/login"
              className="hidden sm:flex items-center gap-2 px-5 py-2.5 rounded-full bg-primary hover:bg-primary/90 transition-all text-primary-foreground text-sm font-semibold hover:scale-105 hover:shadow-lg hover:shadow-primary/25"
            >
              <User className="h-4 w-4" />
              Customer Login
            </Link>
            
            <Link href="/cart">
              <Button variant="ghost" size="icon" className="relative h-10 w-10 rounded-full hover:bg-muted/50" aria-label="Shopping cart">
                <ShoppingCart className="h-[18px] w-[18px]" />
                {itemCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 h-5 w-5 rounded-full bg-primary text-primary-foreground text-[10px] flex items-center justify-center font-bold">
                    {itemCount}
                  </span>
                )}
              </Button>
            </Link>
            
            <div className="lg:hidden">
              <MobileMenu />
            </div>
          </div>
        </div>
      </div>
    </nav>
  )
}
