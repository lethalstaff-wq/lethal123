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
      {/* Button — left side, above live purchases area */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed bottom-20 left-6 z-[75] p-3.5 rounded-2xl bg-[#5865F2] text-white shadow-lg shadow-[#5865F2]/25 hover:shadow-xl hover:-translate-y-0.5 transition-all ${isOpen ? "opacity-0 pointer-events-none" : ""}`}
      >
        <MessageCircle className="h-5 w-5" />
      </button>

      {/* Panel */}
      {isOpen && (
        <div className="fixed bottom-6 left-6 z-[100] w-[340px] rounded-2xl border border-white/[0.08] bg-[#0c0c0e] shadow-2xl overflow-hidden animate-in slide-in-from-bottom-4 fade-in duration-300">
          {/* Header */}
          <div className="flex items-center justify-between p-4 bg-[#5865F2]">
            <div>
              <p className="font-bold text-white text-sm">Need help?</p>
              <p className="text-[11px] text-white/70">Quick answers below or chat on Discord</p>
            </div>
            <button onClick={() => setIsOpen(false)} className="p-1.5 rounded-lg text-white/60 hover:text-white hover:bg-white/10">
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* FAQ */}
          <div className="p-3 max-h-[300px] overflow-y-auto space-y-1.5">
            {QUICK_FAQ.map((faq, i) => (
              <details key={i} className="group rounded-lg border border-white/[0.04] overflow-hidden">
                <summary className="flex items-center justify-between p-3 cursor-pointer text-sm font-medium hover:bg-white/[0.02] transition-colors list-none">
                  {faq.q}
                  <ChevronRight className="h-3.5 w-3.5 text-white/20 group-open:rotate-90 transition-transform shrink-0 ml-2" />
                </summary>
                <p className="px-3 pb-3 text-xs text-white/50 leading-relaxed">{faq.a}</p>
              </details>
            ))}
          </div>

          {/* Discord CTA */}
          <div className="p-3 border-t border-white/[0.06]">
            <a
              href="https://discord.gg/lethaldma"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-[#5865F2] hover:bg-[#4752C4] text-white text-sm font-semibold transition-colors"
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
