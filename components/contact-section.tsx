"use client"

import { useState, useEffect } from "react"
import { Mail, Zap, Shield, Headphones, ArrowRight, Users, MessageSquare, Clock, Star } from "lucide-react"

function DiscordIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
    </svg>
  )
}

export function ContactSection() {
  const [memberCount, setMemberCount] = useState(1247)
  const [onlineCount, setOnlineCount] = useState(89)

  useEffect(() => {
    const interval = setInterval(() => {
      setOnlineCount(prev => {
        const delta = Math.random() > 0.5 ? 1 : -1
        return Math.max(60, Math.min(140, prev + delta))
      })
    }, 5000)
    return () => clearInterval(interval)
  }, [])

  return (
    <section id="contact" className="py-24 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#5865F2]/5 rounded-full blur-[150px]" />
      </div>

      <div className="container mx-auto max-w-5xl relative z-10">
        {/* Header */}
        <div className="text-center mb-14">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#5865F2]/10 border border-[#5865F2]/20 text-[#5865F2] text-sm font-medium mb-6">
            <DiscordIcon className="h-4 w-4" />
            Community Hub
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">
            Join the <span className="text-[#5865F2]">community</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">
            {memberCount.toLocaleString()}+ members already in. Get support, share configs, and stay ahead of every update.
          </p>
        </div>

        {/* Main Discord card */}
        <a
          href="https://discord.gg/lethaldma"
          target="_blank"
          rel="noopener noreferrer"
          className="group block"
        >
          <div className="relative rounded-3xl border border-[#5865F2]/20 bg-gradient-to-br from-[#5865F2]/[0.08] via-card/50 to-card/30 backdrop-blur-sm p-8 sm:p-10 hover:border-[#5865F2]/40 transition-all duration-500 overflow-hidden">
            {/* Decorative elements */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#5865F2]/5 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/3" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-primary/5 rounded-full blur-[60px] translate-y-1/2 -translate-x-1/3" />

            <div className="relative flex flex-col md:flex-row items-start md:items-center gap-8">
              {/* Left — Icon + Info */}
              <div className="flex-1">
                <div className="flex items-center gap-4 mb-5">
                  <div className="p-4 rounded-2xl bg-[#5865F2] text-white shadow-lg shadow-[#5865F2]/30 group-hover:scale-110 transition-transform duration-300">
                    <DiscordIcon className="h-8 w-8" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold group-hover:text-[#5865F2] transition-colors">Lethal Solutions</h3>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="flex items-center gap-1.5 text-xs">
                        <span className="relative flex h-2 w-2">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                        </span>
                        <span className="text-emerald-400 font-medium">{onlineCount} online</span>
                      </span>
                      <span className="text-muted-foreground/30">|</span>
                      <span className="text-xs text-muted-foreground">{memberCount.toLocaleString()} members</span>
                    </div>
                  </div>
                </div>

                <p className="text-muted-foreground mb-6 max-w-lg">
                  Open a ticket in <span className="text-foreground font-medium">#contact-us</span> for purchases, setup help, or any questions. Our staff responds in minutes, not hours.
                </p>

                {/* Stats chips */}
                <div className="flex flex-wrap gap-3">
                  {[
                    { icon: Zap, text: "< 5 min response", color: "text-yellow-400 bg-yellow-400/10 border-yellow-400/20" },
                    { icon: Shield, text: "Verified staff", color: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20" },
                    { icon: Clock, text: "24/7 support", color: "text-blue-400 bg-blue-400/10 border-blue-400/20" },
                    { icon: Star, text: "Setup guides", color: "text-primary bg-primary/10 border-primary/20" },
                  ].map(({ icon: Icon, text, color }) => (
                    <span key={text} className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border ${color}`}>
                      <Icon className="h-3 w-3" />
                      {text}
                    </span>
                  ))}
                </div>
              </div>

              {/* Right — CTA */}
              <div className="flex flex-col items-center gap-3 shrink-0">
                <div className="px-8 py-4 rounded-2xl bg-[#5865F2] text-white font-bold text-lg shadow-lg shadow-[#5865F2]/20 group-hover:shadow-[#5865F2]/40 group-hover:scale-105 transition-all duration-300 flex items-center gap-3">
                  Join Server
                  <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </div>
                <span className="text-xs text-muted-foreground">Free to join</span>
              </div>
            </div>

            {/* Channel previews */}
            <div className="relative grid grid-cols-2 sm:grid-cols-4 gap-3 mt-8 pt-8 border-t border-white/5">
              {[
                { name: "#announcements", desc: "Updates & patches", icon: "📢" },
                { name: "#contact-us", desc: "Open a ticket", icon: "🎫" },
                { name: "#setup-help", desc: "Get started fast", icon: "⚙️" },
                { name: "#showcase", desc: "Community clips", icon: "🎬" },
              ].map((ch) => (
                <div key={ch.name} className="rounded-xl bg-white/[0.03] border border-white/5 p-3 hover:bg-white/[0.06] transition-colors">
                  <span className="text-lg mb-1 block">{ch.icon}</span>
                  <p className="text-xs font-semibold text-foreground/80 truncate">{ch.name}</p>
                  <p className="text-[10px] text-muted-foreground truncate">{ch.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </a>

        {/* Bottom row — Email + Telegram */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
          <a href="mailto:support@lethalsolutions.me" className="group block">
            <div className="rounded-2xl border border-border/40 bg-card/30 backdrop-blur-sm p-6 hover:border-primary/30 transition-all duration-300 h-full">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white transition-all">
                  <Mail className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-bold group-hover:text-primary transition-colors">Email Support</h3>
                  <p className="text-xs text-muted-foreground">support@lethalsolutions.me</p>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground ml-auto group-hover:text-primary group-hover:translate-x-1 transition-all" />
              </div>
            </div>
          </a>
          <a href="https://t.me/lethalsolutions" target="_blank" rel="noopener noreferrer" className="group block">
            <div className="rounded-2xl border border-border/40 bg-card/30 backdrop-blur-sm p-6 hover:border-blue-400/30 transition-all duration-300 h-full">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-blue-400/10 text-blue-400 group-hover:bg-blue-500 group-hover:text-white transition-all">
                  <MessageSquare className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-bold group-hover:text-blue-400 transition-colors">Telegram</h3>
                  <p className="text-xs text-muted-foreground">@lethalsolutions</p>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground ml-auto group-hover:text-blue-400 group-hover:translate-x-1 transition-all" />
              </div>
            </div>
          </a>
        </div>
      </div>
    </section>
  )
}
