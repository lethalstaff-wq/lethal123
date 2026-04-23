"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Keyboard } from "lucide-react"

/**
 * Keyboard shortcuts help overlay. Press `?` anywhere to open.
 * Supports vim-style `g`+key navigation: `g h` = home, `g p` = products, etc.
 */
const NAV: Record<string, { href: string; label: string }> = {
  h: { href: "/", label: "Home" },
  p: { href: "/products", label: "Products" },
  g: { href: "/guides", label: "Guides" },
  r: { href: "/reviews", label: "Reviews" },
  t: { href: "/track", label: "Track Order" },
  s: { href: "/status", label: "System Status" },
  f: { href: "/faq", label: "FAQ" },
  c: { href: "/compare", label: "Compare" },
  d: { href: "/downloads", label: "Downloads" },
  l: { href: "/changelog", label: "Changelog" },
}

export function ShortcutsOverlay() {
  const [open, setOpen] = useState(false)
  const [gArmed, setGArmed] = useState(false)
  const router = useRouter()

  useEffect(() => {
    let gTimer: number | undefined

    const isTyping = (t: EventTarget | null) => {
      if (!(t instanceof HTMLElement)) return false
      const tag = t.tagName
      return tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT" || t.isContentEditable
    }

    const onKey = (e: KeyboardEvent) => {
      if (isTyping(e.target)) return
      if (e.metaKey || e.ctrlKey || e.altKey) return
      // Screenshot/automation escape hatch: append ?noshortcuts to any URL or
      // set localStorage.noshortcuts = '1' to disable vim-style navigation so
      // Playwright runs don't page-jump on stray key events. No prod impact.
      if (typeof window !== "undefined") {
        if (window.location.search.includes("noshortcuts")) {
          try { localStorage.setItem("noshortcuts", "1") } catch {}
          return
        }
        try { if (localStorage.getItem("noshortcuts") === "1") return } catch {}
      }

      // Toggle shortcuts overlay
      if (e.key === "?") {
        e.preventDefault()
        setOpen((p) => !p)
        return
      }
      if (e.key === "Escape" && open) { setOpen(false); return }

      // g + X navigation
      if (e.key === "g") {
        setGArmed(true)
        if (gTimer) window.clearTimeout(gTimer)
        gTimer = window.setTimeout(() => setGArmed(false), 1200)
        return
      }
      if (gArmed) {
        const nav = NAV[e.key.toLowerCase()]
        if (nav) {
          e.preventDefault()
          setGArmed(false)
          setOpen(false)
          router.push(nav.href)
        } else {
          setGArmed(false)
        }
      }
    }
    document.addEventListener("keydown", onKey)
    return () => {
      document.removeEventListener("keydown", onKey)
      if (gTimer) window.clearTimeout(gTimer)
    }
  }, [open, gArmed, router])

  // Body scroll lock
  useEffect(() => {
    if (!open) return
    const prev = document.body.style.overflow
    document.body.style.overflow = "hidden"
    return () => { document.body.style.overflow = prev }
  }, [open])

  return (
    <>
      {/* g-armed hint — small floating pill */}
      {gArmed && !open && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[90] px-3 py-1.5 rounded-full bg-[#f97316]/15 border border-[#f97316]/40 backdrop-blur-md text-[11px] font-bold text-[#f97316] shadow-[0_8px_24px_rgba(249,115,22,0.25)]">
          <span className="opacity-60">Waiting for key…</span> <kbd className="ml-1 px-1.5 py-0.5 rounded bg-black/30 border border-[#f97316]/30 font-mono">h</kbd> home · <kbd className="px-1.5 py-0.5 rounded bg-black/30 border border-[#f97316]/30 font-mono">p</kbd> products
        </div>
      )}

      {!open ? null : (
        <div className="fixed inset-0 z-[115]" role="dialog" aria-modal="true" data-lenis-prevent>
          <div className="absolute inset-0 bg-black/70 backdrop-blur-md animate-in fade-in duration-200" onClick={() => setOpen(false)} />
          <div className="relative max-w-lg w-full mx-auto mt-[12vh] px-4 animate-in fade-in slide-in-from-top-4 duration-200" data-lenis-prevent>
            <div className="rounded-2xl border border-white/[0.10] bg-[#0a0a0a]/95 backdrop-blur-xl shadow-[0_30px_80px_rgba(0,0,0,0.65),0_0_60px_rgba(249,115,22,0.12)] overflow-hidden">
              <div className="h-px bg-gradient-to-r from-transparent via-[#f97316]/60 to-transparent" />

              <div className="flex items-center gap-3 px-5 py-4 border-b border-white/[0.06]">
                <div className="w-8 h-8 rounded-lg bg-[#f97316]/12 border border-[#f97316]/30 flex items-center justify-center">
                  <Keyboard className="h-4 w-4 text-[#f97316]" />
                </div>
                <div className="flex-1">
                  <p className="font-display font-bold text-[15px] text-white tracking-tight">Keyboard shortcuts</p>
                  <p className="text-[11px] text-white/45">Power-user navigation</p>
                </div>
                <button onClick={() => setOpen(false)} className="px-2 py-1 rounded-md bg-white/[0.06] border border-white/[0.08] text-[10px] font-bold text-white/65 font-mono hover:bg-white/[0.10] hover:text-white transition-colors">ESC</button>
              </div>

              <div className="p-5 space-y-5" data-lenis-prevent>
                {/* Global */}
                <div>
                  <p className="text-[10px] font-bold text-white/40 uppercase tracking-[0.2em] mb-3">Global</p>
                  <div className="space-y-1.5">
                    <Row label="Open search" keys={["⌘", "K"]} />
                    <Row label="Show this overlay" keys={["?"]} />
                    <Row label="Close overlay" keys={["Esc"]} />
                  </div>
                </div>

                {/* Navigation */}
                <div>
                  <p className="text-[10px] font-bold text-white/40 uppercase tracking-[0.2em] mb-3">Go to…</p>
                  <div className="grid grid-cols-2 gap-1.5">
                    {Object.entries(NAV).map(([k, v]) => (
                      <Row key={k} label={v.label} keys={["g", k]} />
                    ))}
                  </div>
                </div>
              </div>

              <div className="px-5 py-3 border-t border-white/[0.06] bg-white/[0.015] flex items-center justify-between text-[11px] text-white/50">
                <span>Press <kbd className="px-1.5 py-0.5 rounded bg-white/[0.06] border border-white/[0.08] font-mono text-white/75">g</kbd> then a letter</span>
                <span className="text-white/30">Inspired by Linear / Arc</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

function Row({ label, keys }: { label: string; keys: string[] }) {
  return (
    <div className="flex items-center justify-between gap-3 px-2 py-2 rounded-lg hover:bg-white/[0.03] transition-colors">
      <span className="text-[13px] text-white/75 font-medium">{label}</span>
      <div className="flex items-center gap-1">
        {keys.map((k, i) => (
          <kbd key={i} className="px-1.5 py-0.5 rounded bg-white/[0.06] border border-white/[0.08] text-[10px] font-mono text-white/85 min-w-[22px] text-center">{k}</kbd>
        ))}
      </div>
    </div>
  )
}
