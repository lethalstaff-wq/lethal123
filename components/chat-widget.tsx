"use client"

import { useState } from "react"
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

  return (
    <>
      {/* Button — right side (Intercom/Crisp convention) */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Open chat"
        style={{ bottom: 24, transition: "bottom 0.6s cubic-bezier(0.16, 1, 0.3, 1)" }}
        className={`fixed right-6 z-[75] p-3.5 rounded-full bg-black/80 backdrop-blur-xl border border-white/[0.10] text-white/55 hover:border-[#f97316]/40 hover:text-[#f97316] hover:-translate-y-0.5 hover:shadow-[0_10px_30px_rgba(249, 115, 22, 0.26)] shadow-[0_6px_20px_rgba(0,0,0,0.4)] transition-all duration-300 group ${isOpen ? "opacity-0 pointer-events-none" : ""}`}
      >
        <MessageCircle className="h-[18px] w-[18px] group-hover:scale-110 transition-transform" />
      </button>

      {/* Panel */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 z-[100] w-[calc(100vw-3rem)] sm:w-[360px] bg-black/95 backdrop-blur-xl border border-white/[0.10] rounded-2xl shadow-[0_30px_80px_rgba(0,0,0,0.7),0_0_60px_rgba(249, 115, 22, 0.14)] overflow-hidden animate-in slide-in-from-bottom-4 fade-in duration-300">
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#f97316]/60 to-transparent pointer-events-none" />
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-white/[0.06] bg-gradient-to-b from-[#f97316]/[0.04] to-transparent">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#f97316]/25 to-[#ea580c]/15 border border-[#f97316]/30 flex items-center justify-center shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_0_18px_rgba(249, 115, 22, 0.26)]">
                <MessageCircle className="h-[18px] w-[18px] text-[#f97316]" style={{ filter: "drop-shadow(0 0 8px rgba(249, 115, 22, 0.85))" }} />
              </div>
              <div>
                <p className="font-display text-white font-bold text-[15px] tracking-tight">Need help?</p>
                <p className="text-[11px] text-white/55 font-medium">Quick answers below or chat on Discord</p>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} aria-label="Close chat" className="p-2 rounded-full text-white/45 hover:text-white hover:bg-white/[0.06] transition-all">
              <X className="h-[18px] w-[18px]" />
            </button>
          </div>

          {/* FAQ */}
          <div className="p-3 max-h-[300px] overflow-y-auto space-y-2">
            {QUICK_FAQ.map((faq, i) => (
              <details key={i} className="group rounded-xl bg-white/[0.025] border border-white/[0.07] overflow-hidden hover:border-[#f97316]/25 transition-colors">
                <summary className="flex items-center justify-between p-3 cursor-pointer text-[13px] text-white/75 font-semibold hover:bg-white/[0.03] hover:text-white transition-colors list-none">
                  {faq.q}
                  <ChevronRight className="h-3.5 w-3.5 text-white/30 group-open:rotate-90 group-open:text-[#f97316] transition-all shrink-0 ml-2" />
                </summary>
                <p className="px-3 pb-3 text-[12px] text-white/55 leading-relaxed">{faq.a}</p>
              </details>
            ))}
          </div>

          {/* Discord CTA */}
          <div className="p-3 border-t border-white/[0.06]">
            <a
              href="https://discord.gg/lethaldma"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-gradient-to-br from-[#f97316] to-[#ea580c] text-white text-[14px] font-bold transition-all hover:scale-[1.02] hover:brightness-110 shadow-[0_8px_24px_rgba(249, 115, 22, 0.46),inset_0_1px_0_rgba(255,255,255,0.08)]"
            >
              <ExternalLink className="h-4 w-4" />
              Open Discord Ticket
            </a>
          </div>
        </div>
      )}
    </>
  )
}
