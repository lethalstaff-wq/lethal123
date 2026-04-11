"use client"

import { useState, useEffect } from "react"
import { MessageCircle, X, ChevronRight, ExternalLink } from "lucide-react"

const QUICK_FAQ = [
  { q: "How fast is delivery?", a: "Digital products are instant. DMA hardware ships in 24h." },
  { q: "Is it safe / undetected?", a: "Yes. 99.8% undetected rate. We update within 2 hours of any game patch." },
  { q: "What payment methods?", a: "BTC, ETH, LTC, USDT (TRC-20), and PayPal (Friends & Family)." },
  { q: "Do I need a DMA card?", a: "Only for DMA cheats. Fortnite External works on a single PC." },
  { q: "What if I get banned?", a: "Our spoofers fix HWID bans. Perm Spoofer = permanent fix." },
]

export function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false)
  const [pushed, setPushed] = useState(false)

  useEffect(() => {
    const onScroll = () => setPushed(window.scrollY > 500)
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  return (
    <>
      {/* Button — left side, pushed up when back-to-top is visible */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{ bottom: pushed ? 80 : 24, transition: "bottom 0.6s cubic-bezier(0.16, 1, 0.3, 1)" }}
        className={`fixed left-6 z-[75] p-3.5 rounded-xl bg-black/80 backdrop-blur-md border border-white/[0.06] text-white/50 hover:border-white/[0.1] hover:text-white/70 group ${isOpen ? "opacity-0 pointer-events-none" : ""}`}
      >
        <MessageCircle className="h-5 w-5 text-white/20 group-hover:text-[#f97316] transition-all" />
      </button>

      {/* Panel */}
      {isOpen && (
        <div className="fixed bottom-6 left-6 z-[100] w-[340px] bg-black/95 backdrop-blur-xl border border-white/[0.06] rounded-2xl shadow-[0_30px_60px_rgba(0,0,0,0.5)] overflow-hidden animate-in slide-in-from-bottom-4 fade-in duration-300">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-white/[0.06]">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#f97316]/10 flex items-center justify-center">
                <MessageCircle className="h-4 w-4 text-[#f97316]" />
              </div>
              <div>
                <p className="text-white font-bold text-sm">Need help?</p>
                <p className="text-[11px] text-white/40">Quick answers below or chat on Discord</p>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="p-1.5 rounded-xl text-white/30 hover:text-white/60 hover:bg-white/[0.06] transition-all">
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* FAQ */}
          <div className="p-3 max-h-[300px] overflow-y-auto space-y-1.5">
            {QUICK_FAQ.map((faq, i) => (
              <details key={i} className="group rounded-xl bg-white/[0.012] border border-white/[0.04] overflow-hidden">
                <summary className="flex items-center justify-between p-3 cursor-pointer text-sm text-white/50 font-medium hover:bg-white/[0.02] hover:text-white/70 transition-colors list-none">
                  {faq.q}
                  <ChevronRight className="h-3.5 w-3.5 text-white/20 group-open:rotate-90 group-open:text-[#f97316] transition-all shrink-0 ml-2" />
                </summary>
                <p className="px-3 pb-3 text-xs text-white/40 leading-relaxed">{faq.a}</p>
              </details>
            ))}
          </div>

          {/* Discord CTA */}
          <div className="p-3 border-t border-white/[0.06]">
            <a
              href="https://discord.gg/lethaldma"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-gradient-to-r from-[#f97316] to-[#ea580c] text-white text-sm font-semibold transition-colors hover:shadow-lg hover:shadow-[#f97316]/20"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              Open Discord Ticket
            </a>
          </div>
        </div>
      )}
    </>
  )
}
