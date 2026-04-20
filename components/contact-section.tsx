"use client"

import { ArrowRight, Zap, Shield, Headphones, BookOpen, Mail, MessageSquare } from "lucide-react"

export function ContactSection() {
  return (
    <section id="contact" className="py-24 px-6 sm:px-10 relative z-10">
      <div className="max-w-[1000px] mx-auto">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/[0.08] bg-white/[0.03] backdrop-blur-md mb-6">
            <MessageSquare className="h-3.5 w-3.5 text-[#f97316]" />
            <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/55">Community</span>
          </div>
          <div className="relative h-px w-44 mx-auto mb-7 bg-white/[0.05] overflow-hidden">
            <div className="absolute inset-y-0 w-24 bg-gradient-to-r from-transparent via-[#f97316]/70 to-transparent" style={{ animation: "heroScan 4s ease-in-out infinite" }} />
          </div>
          <h2 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold tracking-[-0.04em] leading-[0.95] mb-4">
            <span style={{ background: "linear-gradient(180deg, rgba(255,255,255,1), rgba(180,180,195,0.85))", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Join the </span>
            <span style={{ background: "linear-gradient(180deg, #ffb366 0%, #f97316 45%, #c2410c 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", filter: "drop-shadow(0 0 50px rgba(249,115,22,0.3))" }}>community</span>
          </h2>
          <p className="text-white/55 text-[16px] max-w-lg mx-auto">8,700+ members. Get support, share configs, stay ahead.</p>
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
                className="inline-flex items-center gap-2.5 px-7 py-3.5 rounded-xl text-[14px] font-bold text-white cursor-pointer group transition-all hover:scale-[1.03] hover:brightness-110"
                style={{ background: "linear-gradient(135deg, #f97316, #ea580c)", boxShadow: "0 8px 24px rgba(249,115,22,0.32), inset 0 1px 0 rgba(255,255,255,0.08)" }}>
                Join Server <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
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
                <div key={i} className="group p-4 rounded-xl bg-white/[0.022] border border-white/[0.06] hover:border-[#f97316]/25 hover:bg-white/[0.04] hover:-translate-y-0.5 transition-all duration-300">
                  <div className="w-9 h-9 rounded-lg bg-white/[0.03] border border-white/[0.05] group-hover:bg-[#f97316]/10 group-hover:border-[#f97316]/25 flex items-center justify-center mb-3 transition-all">
                    <c.icon className="h-4 w-4 text-white/55 group-hover:text-[#f97316] transition-colors" />
                  </div>
                  <p className="text-[13px] font-bold text-white">{c.title}</p>
                  <p className="text-[11px] text-white/45 mt-0.5">{c.desc}</p>
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
              className="group flex items-center gap-4 p-5 rounded-2xl border border-white/[0.06] bg-white/[0.022] backdrop-blur-xl hover:border-[#f97316]/30 hover:bg-white/[0.04] hover:-translate-y-1 hover:shadow-[0_18px_40px_rgba(0,0,0,0.4),0_0_30px_rgba(249,115,22,0.10)] transition-all duration-300">
              <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.06] group-hover:bg-gradient-to-br group-hover:from-[#f97316]/20 group-hover:to-[#ea580c]/10 group-hover:border-[#f97316]/30 transition-all">
                <c.icon className="h-[18px] w-[18px] text-white/55 group-hover:text-[#f97316] transition-colors" />
              </div>
              <div className="flex-1">
                <p className="font-display font-bold text-[15px] text-white tracking-tight">{c.title}</p>
                <p className="text-[12px] text-white/55 mt-0.5">{c.sub}</p>
              </div>
              <ArrowRight className="h-4 w-4 text-white/30 group-hover:text-[#f97316] group-hover:translate-x-1 transition-all duration-300" />
            </a>
          ))}
        </div>
      </div>
    </section>
  )
}
