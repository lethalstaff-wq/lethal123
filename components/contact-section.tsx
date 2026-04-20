"use client"

import { ArrowRight, Zap, Shield, Headphones, BookOpen, Mail, MessageSquare } from "lucide-react"

export function ContactSection() {
  return (
    <section id="contact" className="py-24 px-6 sm:px-10 relative z-10">
      <div className="max-w-[1000px] mx-auto">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/[0.06] bg-white/[0.02] mb-6">
            <MessageSquare className="h-3.5 w-3.5 text-white/30" />
            <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/40">Community</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-[-0.03em] leading-[1.1] mb-4 text-white">
            Join the <span style={{ background: "linear-gradient(135deg, #f97316, #fb923c)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>community</span>
          </h2>
          <p className="text-white/35 text-[15px] max-w-lg mx-auto">8,700+ members. Get support, share configs, stay ahead.</p>
        </div>

        {/* Discord card */}
        <div className="rounded-xl border border-white/[0.04] bg-white/[0.012] overflow-hidden mb-5">
          <div className="h-px bg-gradient-to-r from-transparent via-[#f97316]/30 to-transparent" />
          <div className="p-8">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 mb-6">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl overflow-hidden border border-white/[0.06]">
                  <img src="/images/ava.png" alt="Lethal Solutions" className="w-full h-full object-cover" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white/90">Lethal Solutions</h3>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="flex items-center gap-1.5 text-sm"><span className="w-2 h-2 rounded-full bg-emerald-500/60 animate-pulse" /><span className="text-emerald-400/60 font-medium text-[13px]">3,147 online</span></span>
                    <span className="text-white/10">&bull;</span>
                    <span className="text-[13px] text-white/25">8,734 members</span>
                  </div>
                </div>
              </div>
              <a href="https://discord.gg/lethaldma" target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl text-[14px] font-bold text-white cursor-pointer group transition-all"
                style={{ background: "linear-gradient(135deg, #f97316, #ea580c)", boxShadow: "0 0 20px rgba(249,115,22,0.2)" }}>
                Join Server <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
              </a>
            </div>

            <p className="text-[14px] text-white/35 mb-8 max-w-2xl leading-relaxed">
              Open a ticket in <span className="text-white/60 font-medium">#contact-us</span> for purchases, setup help, or any questions.
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { icon: Zap, title: "< 5 min response", desc: "Average staff reply" },
                { icon: Shield, title: "Verified team", desc: "Trusted & experienced" },
                { icon: Headphones, title: "24/7 available", desc: "Round the clock" },
                { icon: BookOpen, title: "Setup guides", desc: "Step-by-step tutorials" },
              ].map((c, i) => (
                <div key={i} className="p-4 rounded-xl bg-white/[0.015] border border-white/[0.03]">
                  <c.icon className="h-4 w-4 text-white/15 mb-3" />
                  <p className="text-[13px] font-semibold text-white/60">{c.title}</p>
                  <p className="text-[11px] text-white/20 mt-0.5">{c.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Email + Telegram */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[
            { href: "mailto:support@lethalsolutions.me", icon: Mail, title: "Email Support", sub: "support@lethalsolutions.me" },
            { href: "https://t.me/lethalsolutions", icon: MessageSquare, title: "Telegram", sub: "@lethalsolutions" },
          ].map((c, i) => (
            <a key={i} href={c.href} target={i === 1 ? "_blank" : undefined} rel={i === 1 ? "noopener noreferrer" : undefined}
              className="group flex items-center gap-4 p-5 rounded-xl border border-white/[0.04] bg-white/[0.012] hover:border-white/[0.08] hover:bg-white/[0.02] transition-all">
              <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.04] group-hover:bg-[#f97316]/10 group-hover:border-[#f97316]/15 transition-all">
                <c.icon className="h-4 w-4 text-white/20 group-hover:text-[#f97316]/70 transition-colors" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-[14px] text-white/70">{c.title}</p>
                <p className="text-[12px] text-white/25">{c.sub}</p>
              </div>
              <ArrowRight className="h-4 w-4 text-white/10 group-hover:text-[#f97316]/50 group-hover:translate-x-1 transition-all" />
            </a>
          ))}
        </div>
      </div>
    </section>
  )
}
