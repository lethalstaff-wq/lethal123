"use client"

import Link from "next/link"
import { Logo } from "@/components/logo"
import { DiscordIcon, YouTubeIcon, TelegramIcon } from "@/components/icons"
import { Shield, Zap, Globe } from "lucide-react"

export function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="border-t border-white/[0.08] mt-auto relative overflow-hidden bg-transparent">
      {/* Top accent line + halo */}
      <div className="absolute top-0 left-0 right-0 h-px overflow-hidden">
        <div className="absolute top-0 left-[-40%] w-[40%] h-full bg-gradient-to-r from-transparent via-white/[0.10] to-transparent" style={{ animation: "footerShimmer 6s ease-in-out infinite" }} />
      </div>
      <style dangerouslySetInnerHTML={{ __html: "@keyframes footerShimmer { 0%,100% { left: -40%; } 50% { left: 100%; } }" }} />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-2/3 h-px bg-gradient-to-r from-transparent via-[#f97316]/55 to-transparent" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/3 h-[8px] bg-gradient-to-b from-[#f97316]/20 to-transparent blur-md pointer-events-none" />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-10">

          {/* Brand + socials (LEFT side) */}
          <div className="md:col-span-2">
            <Logo className="mb-4" />
            <p className="text-sm text-white/65 leading-relaxed max-w-xs mb-5">
              Kernel-level gaming tools trusted by <span className="text-white font-semibold">8,700+</span> players. Undetected since day one.
            </p>

            {/* Trust badges */}
            <div className="flex items-center gap-2 flex-wrap mb-6">
              {[
                { icon: Shield, label: "Secure" },
                { icon: Zap, label: "Instant" },
                { icon: Globe, label: "24/7" },
              ].map(({ icon: Icon, label }) => (
                <div key={label} className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/[0.04] border border-white/[0.08] text-white/65 text-[11px] font-semibold hover:border-[#f97316]/30 hover:text-[#f97316] hover:bg-[#f97316]/[0.06] transition-all">
                  <Icon className="h-3 w-3" />
                  <span>{label}</span>
                </div>
              ))}
            </div>

            {/* Social icons — moved to LEFT (under brand) per user feedback */}
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/55 mb-3">Connect</p>
              <div className="flex items-center gap-2.5">
                {[
                  { icon: DiscordIcon, href: "https://discord.gg/lethaldma", label: "Discord", brand: "#5865F2" },
                  { icon: YouTubeIcon, href: "https://www.youtube.com/@ujukcheats-x4b", label: "YouTube", brand: "#ff0033" },
                  { icon: TelegramIcon, href: "https://t.me/lethalsolutions", label: "Telegram", brand: "#26a5e4" },
                ].map(({ icon: Icon, href, label, brand }) => (
                  <Link
                    key={label}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={label}
                    className="group relative w-11 h-11 rounded-full bg-white/[0.04] border border-white/[0.10] flex items-center justify-center text-white/65 hover:text-white hover:-translate-y-0.5 transition-all duration-300 overflow-hidden"
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

          {/* Products */}
          <div>
            <h4 className="font-display text-xs font-bold text-white uppercase tracking-[0.18em] mb-4">Products</h4>
            <ul className="space-y-2.5">
              {[
                { label: "All Products", href: "/products" },
                { label: "Compare", href: "/compare" },
                { label: "Reviews", href: "/reviews" },
                { label: "Status", href: "/status" },
              ].map((item) => (
                <li key={item.label}>
                  <Link href={item.href} className="text-sm text-white/55 hover:text-[#f97316] hover:translate-x-0.5 transition-all inline-block">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className="font-display text-xs font-bold text-white uppercase tracking-[0.18em] mb-4">Resources</h4>
            <ul className="space-y-2.5">
              {[
                { label: "FAQ", href: "/faq" },
                { label: "Guides", href: "/guides" },
                { label: "Changelog", href: "/changelog" },
                { label: "Referrals", href: "/referrals" },
                { label: "Join Our Team", href: "/apply" },
              ].map((item) => (
                <li key={item.label}>
                  <Link href={item.href} className="text-sm text-white/55 hover:text-[#f97316] hover:translate-x-0.5 transition-all inline-block">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Account */}
          <div>
            <h4 className="font-display text-xs font-bold text-white uppercase tracking-[0.18em] mb-4">Account</h4>
            <ul className="space-y-2.5">
              {[
                { label: "Track Order", href: "/track" },
                { label: "Downloads", href: "/downloads" },
                { label: "My Account", href: "/profile" },
                { label: "Cart", href: "/cart" },
              ].map((item) => (
                <li key={item.label}>
                  <Link href={item.href} className="text-sm text-white/55 hover:text-[#f97316] hover:translate-x-0.5 transition-all inline-block">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom strip — no duplicate back-to-top arrow (one already lives on the left bottom corner) */}
        <div className="mt-12 pt-6 border-t border-white/[0.06] flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-[12px] text-white/55">
            &copy; {currentYear} <span className="text-white font-semibold">Lethal Solutions</span>. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <Link href="/terms" className="text-[12px] text-white/55 hover:text-[#f97316] font-medium transition-colors">
              Terms
            </Link>
            <span className="w-px h-3 bg-white/[0.12]" />
            <Link href="/privacy" className="text-[12px] text-white/55 hover:text-[#f97316] font-medium transition-colors">
              Privacy
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
