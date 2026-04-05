"use client"

import { ArrowRight, Zap, Shield, Headphones, BookOpen, Mail, MessageSquare } from "lucide-react"

function DiscordIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
    </svg>
  )
}

export function ContactSection() {
  return (
    <section id="contact" className="py-24 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute w-[600px] h-[600px] bg-[#5865F2]/5 rounded-full blur-[150px] top-0 left-1/4" />
        <div className="absolute w-[400px] h-[400px] bg-primary/5 rounded-full blur-[120px] bottom-0 right-1/4" />
      </div>

      <div className="container mx-auto max-w-5xl relative z-10">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-6">
            <DiscordIcon className="h-4 w-4" />
            <span>Community Hub</span>
          </div>
          <h2 className="text-4xl sm:text-5xl font-bold mb-4">
            Join the <span className="text-primary">community</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">
            9,200+ members already in. Get support, share configs, and stay ahead of every update.
          </p>
        </div>

        {/* Discord Card */}
        <div className="rounded-2xl border border-white/[0.06] bg-card/80 backdrop-blur-sm overflow-hidden mb-6">
          <div className="h-1 bg-gradient-to-r from-primary via-accent to-primary" />

          <div className="p-8">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 mb-6">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl overflow-hidden shadow-lg shadow-primary/10 border border-white/10">
                  <img src="/images/ava.png" alt="Lethal Solutions" className="w-full h-full object-cover" />
                </div>
                <div>
                  <h3 className="text-xl font-bold">Lethal Solutions</h3>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="flex items-center gap-1.5 text-sm">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      <span className="text-emerald-400 font-medium">3,147 online</span>
                    </span>
                    <span className="text-white/15">&bull;</span>
                    <span className="text-sm text-white/40">9,248 members</span>
                  </div>
                </div>
              </div>
              <a
                href="https://discord.gg/lethaldma"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl bg-[#5865F2] hover:bg-[#4752C4] text-white font-semibold text-sm transition-all hover:shadow-lg hover:shadow-[#5865F2]/25 hover:-translate-y-0.5 group whitespace-nowrap"
              >
                Join Server
                <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
              </a>
            </div>

            <p className="text-[15px] text-white/50 mb-8 max-w-2xl leading-relaxed">
              Open a ticket in <span className="text-white font-medium">#contact-us</span> for purchases, setup help, or any questions. Our staff responds in minutes, not hours.
            </p>

            {/* Feature cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { icon: Zap, title: "< 5 min response", desc: "Average staff reply time" },
                { icon: Shield, title: "Verified team", desc: "Trusted & experienced" },
                { icon: Headphones, title: "24/7 available", desc: "Round the clock support" },
                { icon: BookOpen, title: "Setup guides", desc: "Step-by-step tutorials" },
              ].map((item, i) => (
                <div key={i} className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.04]">
                  <item.icon className="h-5 w-5 text-primary mb-3" />
                  <p className="text-sm font-semibold text-white/80">{item.title}</p>
                  <p className="text-[11px] text-white/30 mt-0.5">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Email + Telegram */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <a
            href="mailto:support@lethalsolutions.me"
            className="group flex items-center gap-4 p-5 rounded-2xl border border-white/[0.06] bg-card/50 hover:border-primary/20 hover:bg-primary/[0.02] transition-all"
          >
            <div className="p-3 rounded-xl bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white transition-all">
              <Mail className="h-5 w-5" />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-sm">Email Support</p>
              <p className="text-xs text-muted-foreground">support@lethalsolutions.me</p>
            </div>
            <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
          </a>
          <a
            href="https://t.me/lethalsolutions"
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-center gap-4 p-5 rounded-2xl border border-white/[0.06] bg-card/50 hover:border-primary/20 hover:bg-primary/[0.02] transition-all"
          >
            <div className="p-3 rounded-xl bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white transition-all">
              <MessageSquare className="h-5 w-5" />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-sm">Telegram</p>
              <p className="text-xs text-muted-foreground">@lethalsolutions</p>
            </div>
            <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
          </a>
        </div>
      </div>
    </section>
  )
}
