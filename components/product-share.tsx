"use client"

import { useState } from "react"
import { Check, Link2, Share2 } from "lucide-react"
import { DiscordIcon, TelegramIcon } from "@/components/icons"

interface ProductShareProps {
  productName: string
  slug: string
  price?: number
}

/**
 * Compact share row for product pages — copy link + Discord/Telegram quick share.
 * Ref param appended so site can track which channel brought the click.
 */
export function ProductShare({ productName, slug, price }: ProductShareProps) {
  const [copied, setCopied] = useState(false)
  const base = typeof window !== "undefined" ? window.location.origin : "https://www.lethalsolutions.me"
  const link = `${base}/products/${slug}`

  const copy = async (suffix = "copy") => {
    try {
      await navigator.clipboard.writeText(`${link}?r=${suffix}`)
      setCopied(true)
      setTimeout(() => setCopied(false), 1800)
    } catch { /* noop */ }
  }

  const discordUrl = `https://discord.com/channels/@me?content=${encodeURIComponent(
    `Check this out: ${productName}${price ? ` from £${price}` : ""} → ${link}?r=discord`,
  )}`
  const telegramUrl = `https://t.me/share/url?url=${encodeURIComponent(`${link}?r=telegram`)}&text=${encodeURIComponent(
    `${productName}${price ? ` · from £${price}` : ""}`,
  )}`

  return (
    <div className="flex items-center gap-2 flex-wrap" role="group" aria-label="Share product">
      <button
        onClick={() => copy("share")}
        data-cursor="cta"
        data-cursor-label={copied ? "Copied" : "Copy"}
        className={`cursor-cta press-spring inline-flex items-center gap-2 px-3.5 py-2 rounded-full text-[12px] font-semibold transition-all ${
          copied
            ? "bg-emerald-500/15 border border-emerald-500/40 text-emerald-300"
            : "bg-white/[0.04] border border-white/[0.08] text-white/65 hover:border-[#f97316]/35 hover:bg-[#f97316]/[0.06] hover:text-[#f97316]"
        }`}
      >
        {copied ? <Check className="h-3.5 w-3.5" strokeWidth={3} /> : <Link2 className="h-3.5 w-3.5" />}
        {copied ? "Link copied" : "Copy link"}
      </button>

      <a
        href={discordUrl}
        target="_blank"
        rel="noopener noreferrer"
        data-cursor="cta"
        data-cursor-label="Discord"
        aria-label="Share on Discord"
        className="cursor-cta press-spring inline-flex items-center justify-center w-9 h-9 rounded-full bg-[#5865F2]/[0.10] border border-[#5865F2]/25 text-[#a5b4fc] hover:bg-[#5865F2]/[0.20] hover:border-[#5865F2]/50 hover:text-white transition-all"
      >
        <DiscordIcon className="h-4 w-4" />
      </a>

      <a
        href={telegramUrl}
        target="_blank"
        rel="noopener noreferrer"
        data-cursor="cta"
        data-cursor-label="Telegram"
        aria-label="Share on Telegram"
        className="cursor-cta press-spring inline-flex items-center justify-center w-9 h-9 rounded-full bg-[#26a5e4]/[0.10] border border-[#26a5e4]/25 text-[#7dd3fc] hover:bg-[#26a5e4]/[0.20] hover:border-[#26a5e4]/50 hover:text-white transition-all"
      >
        <TelegramIcon className="h-4 w-4" />
      </a>

      <div className="inline-flex items-center gap-1.5 pl-1 text-[11px] text-white/35">
        <Share2 className="h-3 w-3" />
        <span className="uppercase tracking-[0.15em] font-semibold">Earn £10 per sign-up</span>
      </div>
    </div>
  )
}
