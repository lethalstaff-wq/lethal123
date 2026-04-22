"use client"

import { useEffect, useRef, useState } from "react"
import { Check, Download, KeyRound, Terminal, Gamepad2, Shield } from "lucide-react"

type Step = {
  n: string
  icon: typeof Download
  title: string
  sub: string
  body: string
  mockType: "terminal" | "keys" | "settings" | "download" | "done"
  mockData: { lines?: string[]; keys?: { label: string; value: string }[]; done?: string }
}

const STEPS: Step[] = [
  {
    n: "01",
    icon: Download,
    title: "Purchase & receive license",
    sub: "Instant delivery after checkout",
    body: "Pay with crypto or PayPal. Your license key and download link arrive in your inbox within 60 seconds. No human review, no queue.",
    mockType: "download",
    mockData: { lines: ["✓ Payment verified", "✓ License generated", "→ license.key (sent to inbox)"] },
  },
  {
    n: "02",
    icon: KeyRound,
    title: "Activate your key",
    sub: "One input — seconds",
    body: "Paste your license in the launcher. We handle hardware binding, refresh tokens, and all the boring stuff invisibly.",
    mockType: "keys",
    mockData: {
      keys: [
        { label: "License", value: "LS-A7K3-9F2X-P4QM" },
        { label: "Status", value: "Active" },
        { label: "Expires", value: "Lifetime" },
      ],
    },
  },
  {
    n: "03",
    icon: Terminal,
    title: "Download loader",
    sub: "Signed binary, 4 MB",
    body: "Small, signed, single-file loader. No installers, no registry writes. Runs once, streams the latest build directly into memory.",
    mockType: "terminal",
    mockData: {
      lines: [
        "$ lethal-loader --verify",
        "✓ Signature valid (Ed25519)",
        "✓ Anti-cheat posture clean",
        "→ Fetching build 4.2.1…",
        "▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ 100%",
        "✓ Ready",
      ],
    },
  },
  {
    n: "04",
    icon: Gamepad2,
    title: "Launch game",
    sub: "Any order, anti-cheat safe",
    body: "Open the loader before or after the game — both work. Our injection engine attaches safely without triggering Vanguard, EAC, BattlEye, or Ricochet.",
    mockType: "settings",
    mockData: {
      keys: [
        { label: "Game", value: "Valorant" },
        { label: "Anti-cheat", value: "Vanguard · OK" },
        { label: "Detection", value: "0 flags" },
        { label: "Latency overhead", value: "< 1 ms" },
      ],
    },
  },
  {
    n: "05",
    icon: Shield,
    title: "Play undetected",
    sub: "Day one. Week fifty.",
    body: "You're in. Any patch lands, we push an update within 2 hours on average. Discord support is live 24/7 if anything feels off.",
    mockType: "done",
    mockData: { done: "99.8% undetection rate since launch" },
  },
]

function StepMock({ step }: { step: Step }) {
  const [typed, setTyped] = useState(0)

  useEffect(() => {
    if (step.mockType !== "terminal") return
    const lines = step.mockData.lines || []
    const total = lines.length
    setTyped(0)
    let i = 0
    const intv = setInterval(() => {
      i++; setTyped(i)
      if (i >= total) clearInterval(intv)
    }, 280)
    return () => clearInterval(intv)
  }, [step])

  return (
    <div className="rounded-2xl border border-white/[0.08] bg-black/60 backdrop-blur-md overflow-hidden shadow-[0_24px_60px_rgba(0,0,0,0.45),0_0_40px_rgba(249,115,22,0.08)]">
      {/* Window chrome */}
      <div className="flex items-center gap-1.5 px-4 py-3 border-b border-white/[0.06] bg-white/[0.02]">
        <span className="w-2.5 h-2.5 rounded-full bg-red-500/60" />
        <span className="w-2.5 h-2.5 rounded-full bg-amber-500/60" />
        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/60" />
        <span className="ml-3 text-[10px] font-mono text-white/35 uppercase tracking-[0.22em]">
          {step.mockType === "terminal" ? "loader ~ bash" : step.mockType === "keys" ? "license" : step.mockType === "settings" ? "game · status" : step.mockType === "download" ? "checkout · success" : "status"}
        </span>
      </div>

      <div className="p-6 min-h-[240px]">
        {step.mockType === "terminal" && (
          <div className="font-mono text-[12.5px] text-white/75 space-y-1">
            {step.mockData.lines?.slice(0, typed).map((line, i) => (
              <div
                key={i}
                className={
                  line.startsWith("$") ? "text-[#f97316]" :
                  line.startsWith("✓") ? "text-emerald-400" :
                  line.startsWith("→") ? "text-sky-300" :
                  "text-white/60"
                }
              >
                {line}
              </div>
            ))}
            {typed < (step.mockData.lines?.length || 0) && (
              <span className="inline-block w-1.5 h-4 bg-[#f97316] align-middle animate-pulse" />
            )}
          </div>
        )}

        {step.mockType === "keys" && (
          <div className="space-y-3">
            {step.mockData.keys?.map((kv, i) => (
              <div key={i} className="flex items-center justify-between gap-4 px-4 py-3 rounded-xl bg-white/[0.02] border border-white/[0.04]">
                <span className="text-[11px] uppercase tracking-[0.2em] text-white/40 font-bold">{kv.label}</span>
                <span className="font-mono text-[13px] text-white font-semibold">{kv.value}</span>
              </div>
            ))}
          </div>
        )}

        {step.mockType === "settings" && (
          <div className="grid grid-cols-2 gap-3">
            {step.mockData.keys?.map((kv, i) => (
              <div key={i} className="rounded-xl bg-white/[0.02] border border-white/[0.05] p-4">
                <p className="text-[10px] uppercase tracking-[0.2em] text-white/40 font-bold mb-1.5">{kv.label}</p>
                <p className={`text-[14px] font-display font-bold tracking-tight ${kv.value.includes("OK") || kv.value.includes("0") || kv.value.includes("< 1") ? "text-emerald-300" : "text-white"}`}>{kv.value}</p>
              </div>
            ))}
          </div>
        )}

        {step.mockType === "download" && (
          <div className="space-y-2 font-mono text-[13px]">
            {step.mockData.lines?.map((line, i) => (
              <div key={i} className={`flex items-center gap-2 ${line.startsWith("✓") ? "text-emerald-400" : "text-sky-300"}`}>
                <span>{line}</span>
              </div>
            ))}
          </div>
        )}

        {step.mockType === "done" && (
          <div className="flex flex-col items-center justify-center h-full text-center py-8">
            <div
              className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-emerald-600/10 border border-emerald-500/30 flex items-center justify-center mb-4"
              style={{ boxShadow: "inset 0 1px 0 rgba(255,255,255,0.08), 0 0 40px rgba(16,185,129,0.25)" }}
            >
              <Check className="h-7 w-7 text-emerald-400" strokeWidth={3} />
            </div>
            <p className="font-display text-lg font-bold text-white">All clear</p>
            <p className="text-[13px] text-white/55 mt-1">{step.mockData.done}</p>
          </div>
        )}
      </div>
    </div>
  )
}

export function InteractiveSetupGuide() {
  const [activeIdx, setActiveIdx] = useState(0)
  const stepRefs = useRef<(HTMLDivElement | null)[]>([])

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        // Pick the step most centered in viewport
        const best = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0]
        if (best) {
          const idx = stepRefs.current.findIndex((r) => r === best.target)
          if (idx !== -1) setActiveIdx(idx)
        }
      },
      { threshold: [0.4, 0.6, 0.8], rootMargin: "-20% 0px -20% 0px" },
    )
    stepRefs.current.forEach((r) => r && observer.observe(r))
    return () => observer.disconnect()
  }, [])

  return (
    <section className="py-16 px-6 sm:px-10 relative z-10">
      <div className="max-w-[1200px] mx-auto grid lg:grid-cols-[1fr_minmax(380px,520px)] gap-10 lg:gap-16 items-start">
        {/* Steps list */}
        <div className="space-y-16 lg:space-y-32">
          {STEPS.map((step, i) => {
            const Icon = step.icon
            const active = i === activeIdx
            return (
              <div
                key={step.n}
                ref={(el) => { stepRefs.current[i] = el }}
                className="relative"
              >
                <div className="flex items-start gap-5">
                  <div
                    className={`shrink-0 w-14 h-14 rounded-2xl flex items-center justify-center border transition-all duration-500 ${
                      active
                        ? "bg-gradient-to-br from-[#f97316]/22 to-[#ea580c]/8 border-[#f97316]/40 shadow-[0_0_24px_rgba(249,115,22,0.35),inset_0_1px_0_rgba(255,255,255,0.08)]"
                        : "bg-white/[0.02] border-white/[0.06] text-white/35"
                    }`}
                  >
                    <Icon className={`h-6 w-6 transition-colors duration-500 ${active ? "text-[#f97316]" : "text-white/40"}`} style={active ? { filter: "drop-shadow(0 0 8px rgba(249,115,22,0.7))" } : undefined} />
                  </div>
                  <div className="flex-1 min-w-0 pt-1">
                    <div className="flex items-center gap-3 mb-1.5">
                      <span className={`font-mono text-[11px] font-bold tracking-[0.18em] transition-colors duration-500 ${active ? "text-[#f97316]" : "text-white/30"}`}>
                        STEP {step.n}
                      </span>
                      <span className="h-px w-8 bg-white/[0.06]" />
                      <span className="text-[10px] text-white/35 uppercase tracking-[0.18em] font-semibold">{step.sub}</span>
                    </div>
                    <h3 className={`font-display text-2xl sm:text-3xl font-bold tracking-[-0.025em] leading-[1.1] mb-3 transition-colors duration-500 ${active ? "text-white" : "text-white/55"}`}>
                      {step.title}
                    </h3>
                    <p className={`text-[14.5px] leading-[1.7] transition-colors duration-500 ${active ? "text-white/70" : "text-white/35"}`}>
                      {step.body}
                    </p>
                  </div>
                </div>
                {/* Mobile mock */}
                <div className="mt-6 lg:hidden">
                  <StepMock step={step} />
                </div>
              </div>
            )
          })}
        </div>

        {/* Sticky mock panel (desktop) */}
        <div className="hidden lg:block sticky top-28">
          <StepMock step={STEPS[activeIdx]} />
          {/* Progress dots */}
          <div className="mt-6 flex justify-center gap-2">
            {STEPS.map((_, i) => (
              <span
                key={i}
                className={`transition-all duration-500 rounded-full ${
                  i === activeIdx ? "w-8 h-1.5 bg-[#f97316] shadow-[0_0_10px_rgba(249,115,22,0.7)]" : "w-1.5 h-1.5 bg-white/20"
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
