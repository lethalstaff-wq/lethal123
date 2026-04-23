"use client"

import { ArrowRight, Mail, Clock } from "lucide-react"
import { SectionEyebrow } from "@/components/section-eyebrow"
import { useDiscordOnline } from "@/components/discord-online"
import { FALLBACK_STATS } from "@/lib/fallback-stats"
import { DiscordIcon, TelegramIcon } from "@/components/icons"

type Stats = { online: number; members: number; invite: string }

// Placeholder members — will swap to real avatar images + usernames later.
type Member = { name: string; grad: string; role: string }
const MEMBERS: Member[] = [
  { name: "zk",    grad: "from-orange-400 to-red-600",    role: "FN" },
  { name: "vex",   grad: "from-violet-400 to-purple-700", role: "Val" },
  { name: "rxn",   grad: "from-cyan-400 to-blue-700",     role: "WZ" },
  { name: "ty1er", grad: "from-emerald-400 to-green-700", role: "FN" },
  { name: "drix",  grad: "from-amber-400 to-orange-600",  role: "CoD" },
  { name: "kev",   grad: "from-rose-400 to-pink-700",     role: "PUBG" },
  { name: "dxn",   grad: "from-indigo-400 to-blue-800",   role: "R6" },
]

function CommunityCTA({ s }: { s: Stats }) {
  return (
    <div className="flex items-center justify-center gap-3 flex-wrap">
      <a
        href={s.invite}
        target="_blank"
        rel="noopener noreferrer"
        className="relative overflow-hidden inline-flex items-center gap-2.5 px-7 py-3.5 rounded-xl text-[14px] font-bold text-white group"
        style={{
          background: "linear-gradient(135deg, #f97316, #ea580c)",
          boxShadow: "0 14px 38px rgba(249,115,22,0.55), inset 0 1px 0 rgba(255,255,255,0.18)",
        }}
      >
        <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full bg-gradient-to-r from-transparent via-white/30 to-transparent transition-transform duration-1000 pointer-events-none" />
        <DiscordIcon className="relative z-10 h-4 w-4" />
        <span className="relative z-10">Join Discord</span>
        <ArrowRight className="relative z-10 h-4 w-4 group-hover:translate-x-1 transition-transform" />
      </a>
      <a
        href="mailto:support@lethalsolutions.me"
        className="inline-flex items-center gap-1.5 px-4 py-3 rounded-xl text-[13px] font-semibold text-white/70 bg-white/[0.025] border border-white/[0.07] hover:border-[#f97316]/30 hover:text-white transition-all"
      >
        <Mail className="h-3.5 w-3.5" /> Email
      </a>
      <a
        href="https://t.me/lethalsolutions"
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1.5 px-4 py-3 rounded-xl text-[13px] font-semibold text-white/70 bg-white/[0.025] border border-white/[0.07] hover:border-[#f97316]/30 hover:text-white transition-all"
      >
        <TelegramIcon className="h-3.5 w-3.5" /> Telegram
      </a>
    </div>
  )
}

function AvatarStack({ s }: { s: Stats }) {
  return (
    <div className="max-w-[900px] mx-auto px-6 sm:px-10">
      <div
        className="relative rounded-[32px] p-11 sm:p-14 overflow-hidden border border-white/[0.08]"
        style={{
          background:
            "radial-gradient(ellipse 60% 50% at 50% 100%, rgba(249,115,22,0.14), transparent 60%), linear-gradient(180deg, rgba(255,255,255,0.02), rgba(255,255,255,0.005))",
          boxShadow: "0 50px 120px -40px rgba(0,0,0,0.85), inset 0 1px 0 rgba(255,255,255,0.04)",
        }}
      >
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-2/3 h-px bg-gradient-to-r from-transparent via-[#f97316]/60 to-transparent" />

        <div className="relative text-center">
          {/* Avatar stack */}
          <div className="relative h-[76px] mb-8 flex items-center justify-center">
            {MEMBERS.map((m, i) => {
              const offset = (i - (MEMBERS.length - 1) / 2) * 40
              return (
                <div
                  key={m.name}
                  className="group absolute top-1/2 left-1/2"
                  style={{
                    transform: `translate(calc(-50% + ${offset}px), -50%)`,
                    zIndex: i % 2 === 0 ? 10 - i : i,
                  }}
                >
                  <div
                    className={`relative w-[60px] h-[60px] rounded-full bg-gradient-to-br ${m.grad} flex items-center justify-center text-white font-bold text-[14px] ring-[3.5px] ring-black transition-transform duration-400 group-hover:-translate-y-2 group-hover:scale-110 cursor-default`}
                    style={{ boxShadow: "0 10px 28px -6px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.25)" }}
                  >
                    {m.name[0].toUpperCase()}
                  </div>
                  <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 px-2 py-0.5 rounded-full bg-black/80 border border-white/[0.1] text-[9.5px] font-semibold text-white/75 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                    @{m.name} <span className="text-white/35">· {m.role}</span>
                  </div>
                </div>
              )
            })}
            {/* +N counter */}
            <div
              className="absolute top-1/2 left-1/2 rounded-full ring-[3.5px] ring-black flex items-center justify-center text-[11.5px] font-bold text-white tabular-nums"
              style={{
                width: 60,
                height: 60,
                transform: `translate(calc(-50% + ${(MEMBERS.length - (MEMBERS.length - 1) / 2) * 40}px), -50%)`,
                zIndex: 0,
                background: "linear-gradient(135deg, #f97316, #c2410c)",
                boxShadow: "0 12px 32px -6px rgba(249,115,22,0.6), inset 0 1px 0 rgba(255,255,255,0.25)",
              }}
            >
              +{(s.members - MEMBERS.length).toLocaleString()}
            </div>
          </div>

          <h3 className="font-display text-[34px] sm:text-[42px] font-bold tracking-[-0.04em] leading-[1.02] mb-3">
            <span
              style={{
                background: "linear-gradient(180deg, #fff, rgba(200,200,215,0.85))",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              Join{" "}
            </span>
            <span
              className="tabular-nums"
              style={{
                background: "linear-gradient(180deg, #ffb366 0%, #f97316 50%, #c2410c 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                filter: "drop-shadow(0 0 35px rgba(249,115,22,0.45))",
              }}
            >
              {s.members.toLocaleString()}
            </span>
            <span
              style={{
                background: "linear-gradient(180deg, #fff, rgba(200,200,215,0.85))",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              {" "}players
            </span>
          </h3>
          <p className="text-[15px] text-white/55 mb-9 max-w-md mx-auto leading-relaxed">
            Real names, real squads, real fixes. Ask a question — someone's always awake.
          </p>

          {/* Live row */}
          <div
            className="inline-flex items-center gap-3 mb-8 px-5 py-2.5 rounded-full bg-white/[0.025] border border-white/[0.07]"
            style={{ boxShadow: "inset 0 1px 0 rgba(255,255,255,0.04)" }}
          >
            <span className="inline-flex items-center gap-1.5 text-[12.5px] tabular-nums">
              <span className="relative flex items-center justify-center">
                <span className="absolute w-2 h-2 rounded-full bg-emerald-400/40 animate-ping" />
                <span className="relative w-1.5 h-1.5 rounded-full bg-emerald-400" />
              </span>
              <span className="text-emerald-400 font-bold">{s.online.toLocaleString()}</span>
              <span className="text-emerald-400/55 text-[10px] uppercase tracking-wider font-semibold">online</span>
            </span>
            <span className="w-px h-3.5 bg-white/[0.15]" />
            <span className="inline-flex items-center gap-1.5 text-[12.5px]">
              <Clock className="h-3 w-3 text-[#fbbf24]" />
              <span className="text-white/75">24/7 support</span>
            </span>
          </div>

          <CommunityCTA s={s} />
        </div>
      </div>
    </div>
  )
}

export function ContactSection() {
  const { count: liveOnline, members: liveMembers, invite: liveInvite } = useDiscordOnline()
  const s: Stats = {
    online: liveOnline ?? FALLBACK_STATS.discordOnline,
    members: liveMembers ?? FALLBACK_STATS.discordMembers,
    invite: liveInvite ?? "https://discord.gg/lethaldma",
  }

  return (
    <section id="contact" className="py-32 lg:py-40 px-0 relative z-10">
      <div className="max-w-[1000px] mx-auto px-6 sm:px-10 mb-16">
        <div className="text-center">
          <SectionEyebrow number="07" label="Community" />
          <h2 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold tracking-[-0.04em] leading-[0.95] mb-4">
            <span
              style={{
                background: "linear-gradient(180deg, rgba(255,255,255,1), rgba(180,180,195,0.85))",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              Join the{" "}
            </span>
            <span
              style={{
                background: "linear-gradient(180deg, #ffb366 0%, #f97316 45%, #c2410c 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                filter: "drop-shadow(0 0 50px rgba(249, 115, 22, 0.43))",
              }}
            >
              community
            </span>
          </h2>
          <p className="text-white/55 text-[15px] max-w-lg mx-auto">
            {s.members.toLocaleString()} members. Get support, share configs, stay ahead.
          </p>
        </div>
      </div>

      <AvatarStack s={s} />
    </section>
  )
}
