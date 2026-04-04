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
    <footer className="border-t border-border/50 mt-auto relative overflow-hidden">
      {/* Subtle top glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-10">

          {/* Brand */}
          <div className="md:col-span-2">
            <Logo className="mb-4" />
            <p className="text-sm text-white/40 leading-relaxed max-w-xs mb-6">
              Kernel-level gaming tools trusted by thousands. Undetected since day one.
            </p>
            {/* Trust badges */}
            <div className="flex items-center gap-4">
              {[
                { icon: Shield, label: "Secure" },
                { icon: Zap, label: "Instant" },
                { icon: Globe, label: "24/7" },
              ].map(({ icon: Icon, label }) => (
                <div key={label} className="flex items-center gap-1.5 text-white/20 text-xs">
                  <Icon className="h-3.5 w-3.5" />
                  <span>{label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Products */}
          <div>
            <h4 className="text-xs font-bold text-white/60 uppercase tracking-wider mb-4">Products</h4>
            <ul className="space-y-2.5">
              {[
                { label: "All Products", href: "/products" },
                { label: "DMA Cheats", href: "/products" },
                { label: "Spoofers", href: "/products" },
                { label: "Bundles", href: "/products" },
              ].map((item) => (
                <li key={item.label}>
                  <Link href={item.href} className="text-sm text-white/30 hover:text-primary transition-colors">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className="text-xs font-bold text-white/60 uppercase tracking-wider mb-4">Resources</h4>
            <ul className="space-y-2.5">
              {[
                { label: "FAQ", href: "/faq" },
                { label: "Guides", href: "/guides" },
                { label: "Status", href: "/status" },
                { label: "Changelog", href: "/changelog" },
              ].map((item) => (
                <li key={item.label}>
                  <Link href={item.href} className="text-sm text-white/30 hover:text-primary transition-colors">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Account + Social */}
          <div>
            <h4 className="text-xs font-bold text-white/60 uppercase tracking-wider mb-4">Account</h4>
            <ul className="space-y-2.5">
              {[
                { label: "Track Order", href: "/track" },
                { label: "Downloads", href: "/downloads" },
                { label: "Dashboard", href: "/dashboard" },
              ].map((item) => (
                <li key={item.label}>
                  <Link href={item.href} className="text-sm text-white/30 hover:text-primary transition-colors">
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
                  className={`w-9 h-9 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center text-white/30 transition-all duration-300 ${hoverColor}`}
                  aria-label={label}
                >
                  <Icon className="h-4 w-4" />
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-12 pt-6 border-t border-white/5 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-xs text-white/20">
            &copy; {currentYear} Lethal Solutions
          </p>
          <div className="flex items-center gap-5">
            <Link href="/terms" className="text-xs text-white/20 hover:text-white/50 transition-colors">
              Terms
            </Link>
            <Link href="/privacy" className="text-xs text-white/20 hover:text-white/50 transition-colors">
              Privacy
            </Link>
            <button
              onClick={scrollToTop}
              className="ml-2 w-8 h-8 rounded-xl bg-white/5 hover:bg-primary/20 border border-white/5 hover:border-primary/30 flex items-center justify-center text-white/20 hover:text-primary transition-all"
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
