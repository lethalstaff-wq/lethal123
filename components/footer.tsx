"use client"

import Link from "next/link"
import { Logo } from "@/components/logo"
import { DiscordIcon, YouTubeIcon, TelegramIcon } from "@/components/icons"
import { ArrowUp } from "lucide-react"

export function Footer() {
  const currentYear = new Date().getFullYear()

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  return (
    <footer className="border-t border-border mt-auto">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          {/* Brand */}
          <div className="md:col-span-1">
            <Logo className="mb-4" />
            <p className="text-sm text-white/40 leading-relaxed">
              Premium gaming solutions for competitive players.
            </p>
          </div>

          {/* Products */}
          <div>
            <h4 className="text-sm font-semibold text-white mb-4">Products</h4>
            <ul className="space-y-2">
              {["All Products", "DMA Cheats", "Spoofers", "Hardware"].map((item) => (
                <li key={item}>
                  <Link href="/products" className="text-sm text-white/40 hover:text-white transition-colors">
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className="text-sm font-semibold text-white mb-4">Resources</h4>
            <ul className="space-y-2">
              {[
                { label: "FAQ", href: "/faq" },
                { label: "Guides", href: "/guides" },
                { label: "Changelog", href: "/changelog" },
                { label: "Status", href: "/status" },
              ].map((item) => (
                <li key={item.label}>
                  <Link href={item.href} className="text-sm text-white/40 hover:text-white transition-colors">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="text-sm font-semibold text-white mb-4">Account</h4>
            <ul className="space-y-2">
              {[
                { label: "Track Order", href: "/track" },
                { label: "Downloads", href: "/downloads" },
                { label: "Discord", href: "https://discord.gg/lethaldma", external: true },
              ].map((item) => (
                <li key={item.label}>
                  <Link
                    href={item.href}
                    target={item.external ? "_blank" : undefined}
                    rel={item.external ? "noopener noreferrer" : undefined}
                    className="text-sm text-white/40 hover:text-white transition-colors"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
            
            {/* Social icons */}
            <div className="flex gap-3 mt-6">
              <Link href="https://discord.gg/lethaldma" target="_blank" rel="noopener noreferrer" className="text-white/40 hover:text-white transition-colors" aria-label="Discord">
                <DiscordIcon className="h-5 w-5" />
              </Link>
              <Link href="https://www.youtube.com/@ujukcheats-x4b" target="_blank" rel="noopener noreferrer" className="text-white/40 hover:text-white transition-colors" aria-label="YouTube">
                <YouTubeIcon className="h-5 w-5" />
              </Link>
              <Link href="https://t.me/lethalsolutions" target="_blank" rel="noopener noreferrer" className="text-white/40 hover:text-white transition-colors" aria-label="Telegram">
                <TelegramIcon className="h-5 w-5" />
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-12 pt-6 border-t border-border flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-xs text-white/30">
            &copy; {currentYear} Lethal Solutions. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <Link href="/terms" className="text-xs text-white/30 hover:text-white/60 transition-colors">
              Terms
            </Link>
            <Link href="/privacy" className="text-xs text-white/30 hover:text-white/60 transition-colors">
              Privacy
            </Link>
            <button
              onClick={scrollToTop}
              className="ml-2 w-8 h-8 rounded-lg bg-white/5 hover:bg-primary/20 border border-white/10 hover:border-primary/30 flex items-center justify-center text-white/30 hover:text-primary transition-all"
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
