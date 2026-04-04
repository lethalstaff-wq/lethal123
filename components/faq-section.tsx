"use client"

import { useState } from "react"
import { ChevronDown, HelpCircle } from "lucide-react"

const faqs = [
  {
    q: "Is it safe to use?",
    a: "Yes. All our products are tested daily against the latest anti-cheat updates. We maintain a 99.8% undetected rate across EAC, BattlEye, Vanguard, and Ricochet. If a detection ever occurs, we push a patch within 24 hours and extend affected subscriptions.",
  },
  {
    q: "What payment methods do you accept?",
    a: "We accept Bitcoin (BTC), Ethereum (ETH), Litecoin (LTC), USDT (TRC-20/ERC-20), and PayPal (Friends & Family). All crypto payments are processed instantly. PayPal orders may take up to 30 minutes for manual verification.",
  },
  {
    q: "How fast is delivery?",
    a: "Digital products (cheats, spoofers, firmware files) are delivered instantly after payment confirmation. DMA hardware ships within 24 hours with full tracking. Most crypto payments confirm in under 5 minutes.",
  },
  {
    q: "What DMA cards do you support?",
    a: "We support all major DMA cards including 75T, 100T, M.2, and ZDMA. Our custom firmware is compatible with most Intel and AMD motherboards. Check the product page for a full compatibility list or ask in our Discord before purchasing.",
  },
  {
    q: "Does the spoofer work after HWID ban?",
    a: "Yes, that's exactly what it's designed for. The Perm Spoofer changes your hardware identifiers at the kernel level, allowing you to play on a new account even after a hardware ban. It works on all major anti-cheats.",
  },
  {
    q: "What if it doesn't work on my setup?",
    a: "Our support team is available 24/7 on Discord to help troubleshoot. If we can't get it working on your specific hardware, we offer a full refund within 24 hours of purchase. We also list supported hardware on every product page.",
  },
  {
    q: "Do you offer refunds?",
    a: "Yes. If the product doesn't work on your setup and our support team can't resolve it, we issue a full refund within 24 hours. For subscription products, we offer partial refunds for unused time. Open a ticket on Discord to request a refund.",
  },
  {
    q: "How do I set everything up?",
    a: "Every product comes with a step-by-step setup guide. For DMA products, we also have video tutorials. If you get stuck, open a ticket in our Discord and a team member will walk you through it via screen share if needed.",
  },
]

function FaqItem({ faq, isOpen, onClick }: { faq: typeof faqs[number]; isOpen: boolean; onClick: () => void }) {
  return (
    <div className={`border rounded-xl overflow-hidden bg-card/30 backdrop-blur-sm transition-all duration-300 ${isOpen ? "border-primary/30 shadow-lg shadow-primary/5 bg-primary/[0.02]" : "border-border/50 hover:border-border/80"}`}>
      <button
        onClick={onClick}
        className="w-full flex items-center justify-between p-5 text-left gap-4"
      >
        <span className="font-semibold text-sm">{faq.q}</span>
        <ChevronDown className={`h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`} />
      </button>
      <div
        className="overflow-hidden transition-all duration-300"
        style={{ maxHeight: isOpen ? "300px" : "0", opacity: isOpen ? 1 : 0 }}
      >
        <p className="px-5 pb-5 text-sm text-muted-foreground leading-relaxed">{faq.a}</p>
      </div>
    </div>
  )
}

export function FaqSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0)

  return (
    <section id="faq" className="py-24 px-4 sm:px-6 lg:px-8">
      <div className="container mx-auto max-w-3xl">
        <div className="text-center mb-14">
          <div className="inline-flex items-center gap-2 mb-4 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-semibold">
            <HelpCircle className="h-3.5 w-3.5" />
            FAQ
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold mb-4 text-balance">
            Frequently asked <span className="text-primary">questions</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">
            Everything you need to know before purchasing. Still have questions? Ask in our Discord.
          </p>
        </div>

        <div className="flex flex-col gap-3">
          {faqs.map((faq, i) => (
            <FaqItem
              key={i}
              faq={faq}
              isOpen={openIndex === i}
              onClick={() => setOpenIndex(openIndex === i ? null : i)}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
