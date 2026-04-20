"use client"

import Link from "next/link"
import { Logo } from "@/components/logo"
import { DiscordIcon, YouTubeIcon, TelegramIcon } from "@/components/icons"
import { ArrowUp, Shield, Zap, Globe } from "lucide-react"

export function Footer() {
  const currentYear = new Date().getFullYear()

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  return (
    <footer className="border-t border-white/[0.06] mt-auto relative overflow-hidden bg-transparent">
      {/* Shimmer line */}
      <div className="absolute top-0 left-0 right-0 h-px overflow-hidden">
        <div className="absolute top-0 left-[-40%] w-[40%] h-full bg-gradient-to-r from-transparent via-white/[0.08] to-transparent" style={{ animation: "footerShimmer 6s ease-in-out infinite" }} />
      </div>
      <style dangerouslySetInnerHTML={{ __html: "@keyframes footerShimmer { 0%,100% { left: -40%; } 50% { left: 100%; } }" }} />
      {/* Subtle top glow line */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-2/3 h-px bg-gradient-to-r from-transparent via-[#f97316]/40 to-transparent" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/3 h-[6px] bg-gradient-to-b from-[#f97316]/15 to-transparent blur-md pointer-events-none" />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-10">

          {/* Brand */}
          <div className="md:col-span-2">
            <Logo className="mb-4" />
            <p className="text-sm text-white/55 leading-relaxed max-w-xs mb-6">
              Kernel-level gaming tools trusted by thousands. Undetected since day one.
            </p>
            {/* Trust badges */}
            <div className="flex items-center gap-3 flex-wrap">
              {[
                { icon: Shield, label: "Secure" },
                { icon: Zap, label: "Instant" },
                { icon: Globe, label: "24/7" },
              ].map(({ icon: Icon, label }) => (
                <div key={label} className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/[0.03] border border-white/[0.06] text-white/45 text-[11px] font-medium hover:border-[#f97316]/30 hover:text-[#f97316] transition-colors">
                  <Icon className="h-3 w-3" />
                  <span>{label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Products */}
          <div>
            <h4 className="font-display text-xs font-bold text-white/85 uppercase tracking-[0.18em] mb-4">Products</h4>
            <ul className="space-y-2.5">
              {[
                { label: "All Products", href: "/products" },
                { label: "Compare", href: "/compare" },
                { label: "Reviews", href: "/reviews" },
              ].map((item) => (
                <li key={item.label}>
                  <Link href={item.href} className="text-sm text-white/45 hover:text-[#f97316] hover:translate-x-0.5 transition-all inline-block">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className="font-display text-xs font-bold text-white/85 uppercase tracking-[0.18em] mb-4">Resources</h4>
            <ul className="space-y-2.5">
              {[
                { label: "FAQ", href: "/faq" },
                { label: "Guides", href: "/guides" },
                { label: "Compare", href: "/compare" },
                { label: "Status", href: "/status" },
                { label: "Changelog", href: "/changelog" },
                { label: "Referrals", href: "/referrals" },
                { label: "Join Our Team", href: "/apply" },
              ].map((item) => (
                <li key={item.label}>
                  <Link href={item.href} className="text-sm text-white/45 hover:text-[#f97316] hover:translate-x-0.5 transition-all inline-block">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Account + Social */}
          <div>
            <h4 className="font-display text-xs font-bold text-white/85 uppercase tracking-[0.18em] mb-4">Account</h4>
            <ul className="space-y-2.5">
              {[
                { label: "Track Order", href: "/track" },
                { label: "Downloads", href: "/downloads" },
              ].map((item) => (
                <li key={item.label}>
                  <Link href={item.href} className="text-sm text-white/45 hover:text-[#f97316] hover:translate-x-0.5 transition-all inline-block">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>

            {/* Social icons */}
            <div className="flex gap-2 mt-6">
              {[
                { icon: DiscordIcon, href: "https://discord.gg/lethaldma", label: "Discord", hoverColor: "hover:bg-[#5865F2]/20 hover:text-[#5865F2] hover:border-[#5865F2]/30" },
                { icon: YouTubeIcon, href: "https://www.youtube.com/@ujukcheats-x4b", label: "YouTube", hoverColor: "hover:bg-red-500/20 hover:text-red-400 hover:border-red-500/30" },
                { icon: TelegramIcon, href: "https://t.me/lethalsolutions", label: "Telegram", hoverColor: "hover:bg-blue-400/20 hover:text-blue-400 hover:border-blue-400/30" },
              ].map(({ icon: Icon, href, label, hoverColor }) => (
                <Link
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`w-10 h-10 rounded-full bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-white/55 hover:-translate-y-0.5 transition-all duration-300 ${hoverColor}`}
                  aria-label={label}
                >
                  <Icon className="h-4 w-4" />
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-12 pt-6 border-t border-white/[0.06] flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-xs text-white/40">
            &copy; {currentYear} <span className="text-white/70 font-semibold">Lethal Solutions</span>. All rights reserved.
          </p>
          <div className="flex items-center gap-5">
            <Link href="/terms" className="text-xs text-white/40 hover:text-[#f97316] transition-colors">
              Terms
            </Link>
            <Link href="/privacy" className="text-xs text-white/40 hover:text-[#f97316] transition-colors">
              Privacy
            </Link>
            <button
              onClick={scrollToTop}
              className="ml-2 w-8 h-8 rounded-full bg-white/[0.04] hover:bg-[#f97316]/15 border border-white/[0.08] hover:border-[#f97316]/40 flex items-center justify-center text-white/45 hover:text-[#f97316] transition-all"
              aria-label="Back to top"
            >
              <ArrowUp className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>
    </footer>
  )
}
