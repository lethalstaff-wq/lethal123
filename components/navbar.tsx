"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { Logo } from "@/components/logo"
import { MobileMenu } from "@/components/mobile-menu"
import { useState, useEffect } from "react"
import { ShoppingCart, User, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useCart } from "@/lib/cart-context"
import { usePathname } from "next/navigation"
import { createClient } from "@/lib/supabase/client"

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [scrollProgress, setScrollProgress] = useState(0)
  const { itemCount } = useCart()
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
              <div
                className="flex items-center gap-0.5 rounded-full px-1.5 py-1 backdrop-blur-xl bg-white/[0.035] border border-white/[0.07]"
                style={{
                  boxShadow:
                    "inset 0 1px 0 rgba(255,255,255,0.05), inset 0 0 0 0.5px rgba(255,255,255,0.02), 0 8px 32px -12px rgba(0,0,0,0.5)",
                }}
              >
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
                      style={
                        isActive
                          ? { textShadow: "0 1px 2px rgba(90,30,0,0.35)" }
                          : undefined
                      }
                    >
                      {isActive && (
                        <motion.span
                          layoutId="navbar-active-pill"
                          className="absolute inset-0 rounded-full overflow-hidden"
                          style={{
                            background:
                              "linear-gradient(180deg, #fb923c 0%, #f97316 52%, #ea580c 100%)",
                            boxShadow: [
                              "inset 0 1px 0 rgba(255,255,255,0.32)",
                              "inset 0 -1px 0 rgba(0,0,0,0.22)",
                              "inset 0 0 0 0.5px rgba(255,255,255,0.22)",
                              "0 2px 6px -1px rgba(249,115,22,0.45)",
                              "0 8px 24px -6px rgba(249,115,22,0.6)",
                            ].join(", "),
                          }}
                          transition={{ type: "spring", stiffness: 380, damping: 30 }}
                        >
                          {/* Glossy top sheen */}
                          <span
                            className="absolute inset-x-0 top-0 h-1/2 rounded-t-full pointer-events-none"
                            style={{
                              background:
                                "linear-gradient(180deg, rgba(255,255,255,0.22) 0%, rgba(255,255,255,0) 100%)",
                            }}
                          />
                        </motion.span>
                      )}
                      <span className="relative z-[2]">{link.label}</span>
                    </Link>
                  )
                })}
              </div>
            </div>

            {/* Right side */}
            <div className="flex items-center gap-2 shrink-0">
              {/* Search — now opens the global ⌘K command palette */}
              <div className="relative">
                <button
                  onClick={() => window.dispatchEvent(new Event("ls:open-cmdk"))}
                  className="hidden sm:flex items-center gap-2 h-8 pl-3 pr-1.5 rounded-full bg-white/[0.04] border border-white/[0.06] hover:bg-white/[0.06] hover:border-white/[0.1] transition-all text-white/40 text-xs"
                  aria-label="Open search"
                >
                  <Search className="h-3.5 w-3.5" />
                  <span>Search…</span>
                  <kbd className="ml-1 px-1.5 py-0.5 rounded bg-white/[0.06] border border-white/[0.08] text-[9px] font-mono text-white/65">⌘K</kbd>
                </button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => window.dispatchEvent(new Event("ls:open-cmdk"))}
                  className="sm:hidden h-9 w-9 rounded-full hover:bg-white/[0.06]"
                  aria-label="Open search"
                >
                  <Search className="h-4 w-4" />
                </Button>

              </div>

              {/* Login or My Account — matches active nav pill treatment */}
              <Link href={isAuthed ? "/profile" : "/login"} className="hidden sm:inline-flex">
                <Button
                  size="sm"
                  className="group/login relative overflow-hidden text-white text-xs font-bold rounded-full px-4 h-8 gap-1.5 border-0 hover:-translate-y-0.5 transition-transform duration-300"
                  style={{
                    background:
                      "linear-gradient(180deg, #fb923c 0%, #f97316 52%, #ea580c 100%)",
                    boxShadow: [
                      "inset 0 1px 0 rgba(255,255,255,0.32)",
                      "inset 0 -1px 0 rgba(0,0,0,0.22)",
                      "inset 0 0 0 0.5px rgba(255,255,255,0.22)",
                      "0 2px 6px -1px rgba(249,115,22,0.45)",
                      "0 8px 24px -6px rgba(249,115,22,0.6)",
                    ].join(", "),
                    textShadow: "0 1px 2px rgba(90,30,0,0.35)",
                  }}
                >
                  {/* Glossy top sheen — same as active nav pill */}
                  <span
                    aria-hidden="true"
                    className="absolute inset-x-0 top-0 h-1/2 rounded-t-full pointer-events-none"
                    style={{
                      background:
                        "linear-gradient(180deg, rgba(255,255,255,0.22) 0%, rgba(255,255,255,0) 100%)",
                    }}
                  />
                  {/* Hover glow amplifier */}
                  <span
                    aria-hidden="true"
                    className="absolute inset-0 rounded-full opacity-0 group-hover/login:opacity-100 transition-opacity duration-300 pointer-events-none"
                    style={{
                      boxShadow:
                        "0 4px 12px -2px rgba(249,115,22,0.6), 0 12px 32px -6px rgba(249,115,22,0.7)",
                    }}
                  />
                  <User className="relative z-[1] h-3.5 w-3.5" />
                  <span className="relative z-[1]">
                    {isAuthed ? "My Account" : "Customer Login"}
                  </span>
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
