"use client"

import Link from "next/link"
import Image from "next/image"
import { Logo } from "@/components/logo"
import { DiscordIcon, YouTubeIcon, TelegramIcon } from "@/components/icons"
import { ArrowUp, Shield, Zap, Globe, Lock } from "lucide-react"

export function Footer() {
  const currentYear = new Date().getFullYear()
  const scrollToTop = () => window.scrollTo({ top: 0, behavior: "smooth" })

  const paymentMethods = [
    { src: "/images/icons/bitcoin.svg", label: "Bitcoin" },
    { src: "/images/icons/ethereum.svg", label: "Ethereum" },
    { src: "/images/icons/litecoin.svg", label: "Litecoin" },
    { src: "/images/icons/tether.svg", label: "Tether" },
    { src: "/images/icons/paypal.svg", label: "PayPal" },
  ]

  const socials = [
    { icon: DiscordIcon, href: "https://discord.gg/lethaldma", label: "Discord", brand: "#5865F2" },
    { icon: YouTubeIcon, href: "https://www.youtube.com/@ujukcheats-x4b", label: "YouTube", brand: "#ff0033" },
    { icon: TelegramIcon, href: "https://t.me/lethalsolutions", label: "Telegram", brand: "#26a5e4" },
  ]

  const productLinks = [
    { label: "All Products", href: "/products" },
    { label: "Compare", href: "/compare" },
    { label: "Reviews", href: "/reviews" },
    { label: "Status", href: "/status" },
  ]

  const resourceLinks = [
    { label: "FAQ", href: "/faq" },
    { label: "Guides", href: "/guides" },
    { label: "Changelog", href: "/changelog" },
    { label: "Referrals", href: "/referrals" },
    { label: "Join Our Team", href: "/apply" },
  ]

  const accountLinks = [
    { label: "Track Order", href: "/track" },
    { label: "Downloads", href: "/downloads" },
    { label: "My Account", href: "/profile" },
    { label: "Cart", href: "/cart" },
  ]

  return (
    <footer className="relative border-t border-white/[0.08] mt-auto bg-transparent overflow-hidden">
      {/* Top gradient line */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#f97316]/55 to-transparent pointer-events-none" />
      {/* Top glow halo */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-[8px] bg-gradient-to-b from-[#f97316]/20 to-transparent blur-md pointer-events-none" />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Main grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10">
          {/* Brand column */}
          <div className="md:col-span-5">
            <Logo className="mb-5" />
            <p className="text-[15px] text-white/65 leading-relaxed max-w-md mb-7">
              Kernel-level gaming tools trusted by <span className="text-white font-semibold">8,700+</span> players. Undetected since day one. Built by competitive gamers, for competitive gamers.
            </p>

            {/* Trust badges */}
            <div className="flex items-center gap-2 flex-wrap mb-8">
              {[
                { icon: Shield, label: "Encrypted" },
                { icon: Zap, label: "Instant" },
                { icon: Lock, label: "Private" },
                { icon: Globe, label: "24/7 Support" },
              ].map(({ icon: Icon, label }) => (
                <div key={label} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/[0.03] border border-white/[0.08] text-[11px] font-semibold text-white/65 hover:border-[#f97316]/30 hover:text-[#f97316] hover:bg-[#f97316]/[0.06] transition-all">
                  <Icon className="h-3 w-3" />
                  <span>{label}</span>
                </div>
              ))}
            </div>

            {/* Social icons — moved to LEFT per user request */}
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/55 mb-3">Connect</p>
              <div className="flex items-center gap-2.5">
                {socials.map(({ icon: Icon, href, label, brand }) => (
                  <Link
                    key={label}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={label}
                    className="group relative w-11 h-11 rounded-full bg-white/[0.04] border border-white/[0.10] flex items-center justify-center text-white/65 hover:text-white hover:-translate-y-0.5 transition-all duration-300"
                    style={{ ['--brand' as string]: brand }}
                  >
                    <Icon className="h-[18px] w-[18px] relative z-[1]" />
                    {/* Brand color glow on hover */}
                    <span
                      className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                      style={{ background: `${brand}26`, boxShadow: `0 0 24px ${brand}55, inset 0 0 0 1px ${brand}66` }}
                    />
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {/* Spacer */}
          <div className="hidden md:block md:col-span-1" />

          {/* Products */}
          <div className="md:col-span-2">
            <h4 className="font-display text-xs font-bold text-white uppercase tracking-[0.18em] mb-4">Shop</h4>
            <ul className="space-y-2.5">
              {productLinks.map((item) => (
                <li key={item.label}>
                  <Link href={item.href} className="text-[14px] text-white/55 hover:text-[#f97316] hover:translate-x-0.5 transition-all inline-block">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources */}
          <div className="md:col-span-2">
            <h4 className="font-display text-xs font-bold text-white uppercase tracking-[0.18em] mb-4">Resources</h4>
            <ul className="space-y-2.5">
              {resourceLinks.map((item) => (
                <li key={item.label}>
                  <Link href={item.href} className="text-[14px] text-white/55 hover:text-[#f97316] hover:translate-x-0.5 transition-all inline-block">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Account */}
          <div className="md:col-span-2">
            <h4 className="font-display text-xs font-bold text-white uppercase tracking-[0.18em] mb-4">Account</h4>
            <ul className="space-y-2.5">
              {accountLinks.map((item) => (
                <li key={item.label}>
                  <Link href={item.href} className="text-[14px] text-white/55 hover:text-[#f97316] hover:translate-x-0.5 transition-all inline-block">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Payment methods row */}
        <div className="mt-12 pt-8 border-t border-white/[0.06]">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/55 mb-3">We Accept</p>
              <div className="flex items-center gap-2 flex-wrap">
                {paymentMethods.map((p) => (
                  <div
                    key={p.label}
                    title={p.label}
                    className="group w-12 h-12 rounded-xl bg-white/[0.04] border border-white/[0.10] flex items-center justify-center hover:bg-white/[0.08] hover:border-white/[0.20] hover:scale-110 transition-all duration-300"
                  >
                    <Image src={p.src} alt={p.label} width={26} height={26} className="w-7 h-7" />
                  </div>
                ))}
              </div>
            </div>

            {/* SSL / Secure badge */}
            <div className="inline-flex items-center gap-3 px-4 py-3 rounded-2xl bg-emerald-500/[0.06] border border-emerald-500/20">
              <div className="w-9 h-9 rounded-lg bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center">
                <Lock className="h-4 w-4 text-emerald-400" />
              </div>
              <div>
                <p className="text-[12px] font-bold text-white">SSL Secure Checkout</p>
                <p className="text-[10px] text-white/55">256-bit encryption · PCI compliant</p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom strip */}
        <div className="mt-10 pt-6 border-t border-white/[0.06] flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-[12px] text-white/45">
            &copy; {currentYear} <span className="text-white/85 font-semibold">Lethal Solutions</span>. All rights reserved. Built for competitive gamers.
          </p>
          <div className="flex items-center gap-5">
            <Link href="/terms" className="text-[12px] text-white/45 hover:text-[#f97316] transition-colors font-medium">
              Terms
            </Link>
            <Link href="/privacy" className="text-[12px] text-white/45 hover:text-[#f97316] transition-colors font-medium">
              Privacy
            </Link>
            <button
              onClick={scrollToTop}
              aria-label="Back to top"
              className="group ml-2 w-9 h-9 rounded-full bg-white/[0.04] hover:bg-[#f97316]/15 border border-white/[0.08] hover:border-[#f97316]/40 flex items-center justify-center text-white/55 hover:text-[#f97316] hover:-translate-y-0.5 transition-all"
            >
              <ArrowUp className="h-4 w-4 group-hover:-translate-y-0.5 transition-transform" />
            </button>
          </div>
        </div>
      </div>
    </footer>
  )
}
