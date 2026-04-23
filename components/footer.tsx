"use client"

import Link from "next/link"
import { Logo } from "@/components/logo"
import { DiscordIcon, YouTubeIcon, TelegramIcon } from "@/components/icons"
import { Shield, Zap, Globe } from "lucide-react"

type Link = { label: string; desc: string; href: string }

const productLinks: Link[] = [
  { label: "All Products",   desc: "Full catalog",            href: "/products" },
  { label: "Media Library",  desc: "Videos & screenshots",    href: "/media" },
  { label: "Reviews",        desc: "Verified feedback",       href: "/reviews" },
  { label: "Status",         desc: "Live uptime",             href: "/status" },
]

const resourceLinks: Link[] = [
  { label: "Setup Guide",    desc: "First-run walkthrough", href: "/setup" },
  { label: "FAQ",            desc: "Common questions",      href: "/faq" },
  { label: "Guides",         desc: "Deep-dive tutorials",   href: "/guides" },
  { label: "Changelog",      desc: "Latest patches",        href: "/changelog" },
]

const accountLinks: Link[] = [
  { label: "Track Order",    desc: "Where's my stuff",    href: "/track" },
  { label: "Downloads",      desc: "Your files & keys",   href: "/downloads" },
  { label: "My Account",     desc: "Profile & billing",   href: "/profile" },
  { label: "Cart",           desc: "Checkout basket",     href: "/cart" },
]

const companyLinks: Link[] = [
  { label: "Join Our Team",  desc: "We're hiring",        href: "/apply" },
  { label: "Referrals",      desc: "Earn 20% lifetime",   href: "/referrals" },
  { label: "Success Stories",desc: "Real customer wins",  href: "/stories" },
  { label: "Contact",        desc: "Get in touch",        href: "mailto:support@lethalsolutions.me" },
]

const socials = [
  { icon: DiscordIcon,  href: "https://discord.gg/lethaldma",           label: "Discord",  brand: "#5865F2" },
  { icon: YouTubeIcon,  href: "https://www.youtube.com/@ujukcheats-x4b", label: "YouTube",  brand: "#ff0033" },
  { icon: TelegramIcon, href: "https://t.me/lethalsolutions",           label: "Telegram", brand: "#26a5e4" },
]

const trustPills = [
  { icon: Shield, label: "Secure" },
  { icon: Zap, label: "Instant" },
  { icon: Globe, label: "24/7" },
]

function LinkList({ title, items }: { title: string; items: Link[] }) {
  return (
    <div>
      <h4 className="font-display text-xs font-bold text-white uppercase tracking-[0.18em] mb-5">
        {title}
      </h4>
      <ul className="space-y-3.5">
        {items.map((item) => (
          <li key={item.label}>
            <Link href={item.href} className="group block">
              <span className="block text-[13.5px] font-semibold text-white/80 group-hover:text-[#f97316] transition-colors leading-tight">
                {item.label}
              </span>
              <span className="block text-[11.5px] text-white/40 group-hover:text-white/55 transition-colors leading-tight mt-1">
                {item.desc}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}

export function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="border-t border-white/[0.08] mt-auto relative overflow-hidden bg-transparent">
      {/* Top accent */}
      <div className="absolute top-0 left-0 right-0 h-px overflow-hidden">
        <div
          className="absolute top-0 left-[-40%] w-[40%] h-full bg-gradient-to-r from-transparent via-[#f97316]/65 to-transparent"
          style={{ animation: "footerShimmer 6s ease-in-out infinite" }}
        />
      </div>
      <style
        dangerouslySetInnerHTML={{
          __html: "@keyframes footerShimmer { 0%,100% { left: -40%; } 50% { left: 100%; } }",
        }}
      />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-2/3 h-px bg-gradient-to-r from-transparent via-[#f97316]/55 to-transparent" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/3 h-[8px] bg-gradient-to-b from-[#f97316]/20 to-transparent blur-md pointer-events-none" />

      <div
        aria-hidden="true"
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 60% 55% at 50% 100%, rgba(249,115,22,0.07), transparent 70%)",
        }}
      />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-8 relative">
        {/* Desktop: flex layout — Brand fixed width on left, 4 link columns
            distributed evenly across remaining space with justify-between so
            first col flushes against Brand and last col flushes against the
            right container edge. Mobile: stacked 2-col grid. */}
        <div className="flex flex-col md:flex-row md:items-start gap-12 md:gap-14">
          {/* Brand — fixed width so links get the rest of the row */}
          <div className="md:w-[280px] md:shrink-0">
            <Logo className="mb-4" />
            <p className="text-[13px] text-white/60 leading-relaxed mb-5">
              Kernel-level tools trusted by{" "}
              <span className="text-white font-semibold">8,700+</span> players.
              <br />
              Undetected since day one.
            </p>
            <div className="flex items-center gap-1.5 flex-wrap mb-6">
              {trustPills.map(({ icon: Icon, label }) => (
                <span
                  key={label}
                  className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full bg-white/[0.04] border border-white/[0.08] text-white/65 text-[10.5px] font-semibold"
                >
                  <Icon className="h-3 w-3" />
                  {label}
                </span>
              ))}
            </div>

            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/40 mb-3">
              Connect
            </p>
            <div className="flex items-center gap-2.5">
              {socials.map(({ icon: Icon, href, label, brand }) => (
                <Link
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="group relative w-10 h-10 rounded-full bg-white/[0.04] border border-white/[0.10] flex items-center justify-center text-white/70 hover:text-white hover:-translate-y-0.5 transition-all duration-300 overflow-hidden"
                >
                  <Icon className="h-[16px] w-[16px] relative z-[1]" />
                  <span
                    className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    style={{
                      background: `${brand}26`,
                      boxShadow: `0 0 22px ${brand}55, inset 0 0 0 1px ${brand}66`,
                    }}
                  />
                </Link>
              ))}
            </div>
          </div>

          {/* 4 link columns — evenly distributed across remaining row width.
              justify-between puts first flush-left-after-brand and last
              flush-right against container edge. */}
          <div className="flex-1 grid grid-cols-2 md:flex md:justify-between gap-x-6 gap-y-12 min-w-0">
            <LinkList title="Products"  items={productLinks} />
            <LinkList title="Resources" items={resourceLinks} />
            <LinkList title="Company"   items={companyLinks} />
            <LinkList title="Account"   items={accountLinks} />
          </div>
        </div>

        {/* Divider */}
        <div className="relative mt-14 mb-6 h-px">
          <div className="absolute inset-0 bg-white/[0.05]" />
          <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-1/3 bg-gradient-to-r from-transparent via-[#f97316]/35 to-transparent" />
        </div>

        {/* Bottom strip */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-[12px] text-white/55">
            &copy; {currentYear}{" "}
            <span className="text-white/75 font-semibold">Lethal Solutions</span>. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="relative flex items-center justify-center">
                <span className="absolute w-2 h-2 rounded-full bg-emerald-400/40 animate-ping" />
                <span className="relative w-1.5 h-1.5 rounded-full bg-emerald-400" />
              </span>
              <span className="text-[11px] text-white/55 font-medium">All systems operational</span>
            </div>
            <span className="w-px h-3 bg-white/[0.12]" />
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
