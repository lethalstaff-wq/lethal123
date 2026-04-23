"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import Image from "next/image"
import {
  Check,
  ChevronLeft,
  ChevronRight,
  Clock,
  Cpu,
  FileDown,
  KeyRound,
  MessagesSquare,
  Minus,
  Package,
  Play,
  Power,
  RotateCcw,
  Shield,
  Square,
  Terminal,
  Usb,
  X as XIcon,
  Zap,
  type LucideIcon,
} from "lucide-react"
import Link from "next/link"
import { GlossyButton } from "@/components/ui/glossy-button"

/* ───────────────────── Menu slot — hot-swappable embed zone ───────────────────

   Each kit defines a `menuSlot` pointing at EITHER an image under /public OR
   (later) a React component imported dynamically. When the flow reaches the
   final stage, the installer window "opens" the menu — whatever's provided in
   the slot renders inside the window's content area at its full size.

   To drop a real menu later, either:
   • put a PNG/WEBP at the referenced path in /public, or
   • swap the slot definition below to `render: () => <YourMenuComponent />`
   Nothing else in the component needs to change.                                */

type MenuSlot =
  | { kind: "placeholder"; hint: string }
  | { kind: "image";       src: string; alt: string }
  | { kind: "component";   render: () => React.ReactNode }

/* ─────────────────────── Installer stage definitions ─────────────────────── */

type Stage =
  | { kind: "boot";      title: string; sub: string; copy: string }
  | { kind: "checks";    title: string; sub: string; lines: string[] }
  | { kind: "download";  title: string; sub: string; lines: string[]; fileLabel: string; fileSize: string }
  | { kind: "license";   title: string; sub: string; key: string; rows: { label: string; value: string; tone?: "ok" | "warn" }[] }
  | { kind: "menu";      title: string; sub: string; slot: MenuSlot }

type Kit = {
  id: "spoofer" | "external" | "dma" | "firmware"
  label: string
  short: string
  icon: LucideIcon
  rgb: string
  totalMinutes: number
  difficulty: "Easy" | "Moderate" | "Advanced"
  toolsNeeded: string
  /** Displayed in the installer window's title bar */
  windowTitle: string
  stages: Stage[]
}

/* ──────────────────────────────── Kits ──────────────────────────────────── */

const KITS: Kit[] = [
  {
    id: "spoofer",
    label: "HWID Spoofer",
    short: "Perm · Temp",
    icon: Package,
    rgb: "16,185,129",
    totalMinutes: 4,
    difficulty: "Easy",
    toolsNeeded: "Windows admin",
    windowTitle: "lethal-spoofer · installer",
    stages: [
      {
        kind: "boot",
        title: "Welcome to Lethal Spoofer",
        sub: "Signed kernel loader · runs once",
        copy:
          "Hit Start install below. We'll verify your payment, fetch your licence, run compatibility checks, then hand you the spoofer menu.",
      },
      {
        kind: "download",
        title: "Payment verified · preparing licence",
        sub: "This usually takes 30–60 seconds",
        fileLabel: "lethal-spoofer-setup.exe",
        fileSize: "12.4 MB",
        lines: [
          "✓ Payment verified",
          "✓ Order linked to account",
          "→ Generating licence LS-A7K3-9F2X-P4QM",
          "→ Signing payload…",
          "✓ Licence ready",
        ],
      },
      {
        kind: "checks",
        title: "Pre-flight checks",
        sub: "Confirming your machine is ready",
        lines: [
          "$ lethal-spoofer --preflight",
          "✓ Driver signature valid",
          "✓ Running as SYSTEM",
          "→ Scanning anti-cheat services…",
          "✓ Vanguard · EAC · BattlEye · all stopped",
          "→ Enumerating hardware IDs (18 found)",
          "✓ Ready to spoof",
        ],
      },
      {
        kind: "license",
        title: "Licence activated",
        sub: "One-time bind to this machine",
        key: "LS-A7K3-9F2X-P4QM",
        rows: [
          { label: "Tier",      value: "Permanent",  tone: "ok"   },
          { label: "Status",    value: "Active",     tone: "ok"   },
          { label: "Expires",   value: "Lifetime"                  },
          { label: "Reboot",    value: "Required",   tone: "warn" },
        ],
      },
      {
        kind: "menu",
        title: "Opening Spoofer",
        sub: "Live menu preview",
        slot: {
          kind: "placeholder",
          hint:
            "Drop the real Spoofer menu PNG (or a <Component/>) into the kit's menuSlot in interactive-setup-guide.tsx and it renders here full-size.",
        },
      },
    ],
  },
  {
    id: "external",
    label: "External Cheat",
    short: "Fortnite External",
    icon: Zap,
    rgb: "249,115,22",
    totalMinutes: 5,
    difficulty: "Easy",
    toolsNeeded: "Discord access",
    windowTitle: "fnx-loader · installer",
    stages: [
      {
        kind: "boot",
        title: "Welcome to Fortnite External",
        sub: "External overlay · ~4 MB",
        copy:
          "This walkthrough simulates the first launch: payment → licence → Defender whitelist → injection check. Your real menu lands in the last stage.",
      },
      {
        kind: "download",
        title: "Pulling signed loader",
        sub: "Fetched from #buyer-downloads",
        fileLabel: "fnx-loader.exe",
        fileSize: "4.2 MB",
        lines: [
          "✓ Payment verified",
          "✓ Discord access granted",
          "→ Fetching fnx-loader.exe",
          "✓ Signature Ed25519 valid",
          "✓ Download complete",
        ],
      },
      {
        kind: "checks",
        title: "Defender whitelist",
        sub: "Folder exclusion applied",
        lines: [
          "$ fnx-loader --selfcheck",
          "→ Requesting Defender exclusion C:\\LS\\FNX",
          "✓ Exclusion added",
          "✓ Real-time scan will skip folder",
          "→ Probing Fortnite posture…",
          "✓ EAC posture clean · ready to inject",
        ],
      },
      {
        kind: "license",
        title: "Licence activated",
        sub: "Bound to this PC",
        key: "LS-A7K3-9F2X-P4QM",
        rows: [
          { label: "Tier",    value: "Lifetime", tone: "ok" },
          { label: "Status",  value: "Active",   tone: "ok" },
          { label: "Machine", value: "Bound",    tone: "ok" },
          { label: "Key",     value: "INSERT · toggle menu" },
        ],
      },
      {
        kind: "menu",
        title: "Opening FNX menu",
        sub: "Live menu preview",
        slot: {
          kind: "placeholder",
          hint:
            "Drop the Fortnite External menu screenshot here. The wrapper keeps a 16:10 aspect and caps width so your UI looks crisp.",
        },
      },
    ],
  },
  {
    id: "dma",
    label: "DMA Cheat",
    short: "Streck · Blurred",
    icon: Cpu,
    rgb: "249,115,22",
    totalMinutes: 12,
    difficulty: "Advanced",
    toolsNeeded: "Secondary PC · DMA card",
    windowTitle: "lethal-dma · installer",
    stages: [
      {
        kind: "boot",
        title: "Welcome to Lethal DMA",
        sub: "Installs on the secondary PC only",
        copy:
          "This runs on the second rig next to your gaming PC. The simulator will verify your payment, pull the DMA runtime, check your card, then open the loader menu.",
      },
      {
        kind: "download",
        title: "Pulling DMA runtime",
        sub: "MemProcFs + leechcore + loader",
        fileLabel: "lethal-dma-setup.zip",
        fileSize: "47 MB",
        lines: [
          "✓ Payment verified",
          "→ Fetching MemProcFs runtime",
          "✓ leechcore drivers installed",
          "→ Fetching loader · streck / blurred profile",
          "✓ Extracted to C:\\LS\\DMA",
        ],
      },
      {
        kind: "checks",
        title: "Hardware probe",
        sub: "Looking for your DMA card",
        lines: [
          "$ lethal-dma --probe",
          "→ Enumerating PCIe / USB devices…",
          "✓ CaptainDMA detected (VID:10EE PID:7024)",
          "✓ Firmware signature matches Lethal build",
          "→ Opening leechcore session…",
          "✓ Memory probe successful",
        ],
      },
      {
        kind: "license",
        title: "Paired with secondary PC",
        sub: "Gaming PC stays untouched",
        key: "LS-A7K3-9F2X-P4QM",
        rows: [
          { label: "DMA card",     value: "Recognised", tone: "ok" },
          { label: "Game profile", value: "Fortnite",   tone: "ok" },
          { label: "Firmware",     value: "Lethal 5.0.0" },
          { label: "Status",       value: "Active",     tone: "ok" },
        ],
      },
      {
        kind: "menu",
        title: "Opening DMA loader",
        sub: "Live menu preview",
        slot: {
          kind: "placeholder",
          hint:
            "Drop the Streck/Blurred loader menu here. If the two share a layout, same slot is fine; otherwise override per-kit.",
        },
      },
    ],
  },
  {
    id: "firmware",
    label: "DMA Firmware",
    short: "EAC · BE · FaceIt · VGK",
    icon: FileDown,
    rgb: "59,130,246",
    totalMinutes: 6,
    difficulty: "Moderate",
    toolsNeeded: "Secondary PC · DMA card",
    windowTitle: "lethal-flasher · installer",
    stages: [
      {
        kind: "boot",
        title: "Welcome to Lethal Firmware",
        sub: "Flashed on the secondary PC",
        copy:
          "Simulator runs through payment verification, firmware download, signature check, and the --verify pass. Real flasher UI drops into the final stage.",
      },
      {
        kind: "download",
        title: "Pulling firmware package",
        sub: "Signed for your tier",
        fileLabel: "lethal-fw-5.0.0.zip",
        fileSize: "18 MB",
        lines: [
          "✓ Payment verified",
          "→ Tier: FaceIt · VGK",
          "→ Downloading lethal-fw-5.0.0.zip",
          "✓ Extracted to C:\\LS\\Firmware",
          "✓ Signing key present",
        ],
      },
      {
        kind: "checks",
        title: "Apply + verify",
        sub: "Flash sequence complete",
        lines: [
          "$ .\\lethal-flasher.exe --apply",
          "✓ Signature valid (Ed25519)",
          "✓ Target detected",
          "▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ 100%",
          "$ .\\lethal-flasher.exe --verify",
          "✓ PCI ID now 10EE:7024 (generic)",
          "✓ EAC · BE · FaceIt · VGK posture clean",
        ],
      },
      {
        kind: "license",
        title: "Firmware signed",
        sub: "Good to pair any cheat",
        key: "LS-A7K3-9F2X-P4QM",
        rows: [
          { label: "Tier",          value: "FaceIt · VGK", tone: "ok" },
          { label: "Reported VID",  value: "10EE",         tone: "ok" },
          { label: "Reported PID",  value: "7024",         tone: "ok" },
          { label: "Days clean",    value: "134",          tone: "ok" },
        ],
      },
      {
        kind: "menu",
        title: "Opening flasher UI",
        sub: "Live menu preview",
        slot: {
          kind: "placeholder",
          hint:
            "Drop the flasher control panel screenshot (or a live component) here. Keep the 16:10 wrapper for crisp sizing.",
        },
      },
    ],
  },
]

/* ─────────────────────── Typing animation helper hook ─────────────────────── */

function useTyped(lines: string[] | undefined, active: boolean) {
  const [typed, setTyped] = useState(0)
  useEffect(() => {
    if (!active || !lines || lines.length === 0) { setTyped(0); return }
    setTyped(0)
    let i = 0
    const iv = setInterval(() => {
      i++; setTyped(i)
      if (i >= lines.length) clearInterval(iv)
    }, 240)
    return () => clearInterval(iv)
  }, [active, lines])
  return typed
}

/* ────────────────────── Progress-bar helper for download ───────────────────── */

function useProgress(active: boolean, duration = 2200) {
  const [pct, setPct] = useState(0)
  useEffect(() => {
    if (!active) { setPct(0); return }
    setPct(0)
    const start = performance.now()
    let raf = 0
    const tick = (now: number) => {
      const t = Math.min((now - start) / duration, 1)
      const eased = 1 - Math.pow(1 - t, 3)
      setPct(eased * 100)
      if (t < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [active, duration])
  return pct
}

/* ──────────────────────────────── Stage body ──────────────────────────────── */

function StageBody({ stage, rgb, isActive }: { stage: Stage; rgb: string; isActive: boolean }) {
  // One hook order regardless of stage kind — safe for lines/pct
  const typed = useTyped(
    stage.kind === "checks" ? stage.lines :
    stage.kind === "download" ? stage.lines :
    undefined,
    isActive,
  )
  const pct = useProgress(isActive && stage.kind === "download")

  if (stage.kind === "boot") {
    return (
      <div className="flex flex-col items-center justify-center text-center py-10 px-6">
        <div
          className="w-16 h-16 rounded-2xl flex items-center justify-center mb-5"
          style={{
            background: `radial-gradient(circle at 30% 30%, rgba(${rgb},0.3), rgba(${rgb},0.05) 70%)`,
            border: `1px solid rgba(${rgb},0.35)`,
            boxShadow: `0 0 26px rgba(${rgb},0.35), inset 0 1px 0 rgba(255,255,255,0.08)`,
          }}
        >
          <Power className="h-7 w-7" style={{ color: `rgb(${rgb})`, filter: `drop-shadow(0 0 10px rgba(${rgb},0.55))` }} />
        </div>
        <h3 className="font-display text-[22px] sm:text-[26px] font-bold tracking-[-0.025em] text-white mb-2">
          {stage.title}
        </h3>
        <p className="text-[12px] uppercase tracking-[0.18em] font-bold mb-4" style={{ color: `rgb(${rgb})` }}>
          {stage.sub}
        </p>
        <p className="text-[13.5px] leading-[1.7] text-white/60 max-w-[460px]">
          {stage.copy}
        </p>
      </div>
    )
  }

  if (stage.kind === "checks") {
    return (
      <div className="font-mono text-[12.5px] space-y-1.5 py-2">
        {stage.lines.slice(0, typed).map((line, i) => (
          <div
            key={i}
            className={
              line.startsWith("$") ? "text-[#f97316]" :
              line.startsWith("✓") ? "text-emerald-400" :
              line.startsWith("→") ? "text-sky-300" :
              "text-white/70"
            }
          >
            {line}
          </div>
        ))}
        {typed < stage.lines.length && (
          <span className="inline-block w-1.5 h-4 align-middle animate-pulse" style={{ background: `rgb(${rgb})` }} />
        )}
      </div>
    )
  }

  if (stage.kind === "download") {
    return (
      <div className="space-y-5 py-2">
        {/* File row */}
        <div className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.03] border border-white/[0.06]">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
            style={{
              background: `rgba(${rgb},0.12)`,
              border: `1px solid rgba(${rgb},0.3)`,
              boxShadow: `0 0 14px rgba(${rgb},0.22)`,
            }}
          >
            <FileDown className="h-4 w-4" style={{ color: `rgb(${rgb})` }} />
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-mono text-[12.5px] text-white/85 truncate">{stage.fileLabel}</p>
            <p className="text-[10px] text-white/40 font-semibold uppercase tracking-[0.18em] mt-0.5">
              {stage.fileSize} · Signed · Ed25519
            </p>
          </div>
          <span className="text-[10.5px] font-mono tabular-nums text-white/55">{Math.round(pct)}%</span>
        </div>
        {/* Progress bar */}
        <div className="relative h-1.5 rounded-full bg-white/[0.05] overflow-hidden">
          <div
            className="absolute inset-y-0 left-0 rounded-full transition-[width]"
            style={{
              width: `${pct}%`,
              background: `linear-gradient(90deg, rgba(${rgb},0.65), rgba(${rgb},1))`,
              boxShadow: `0 0 10px rgba(${rgb},0.5)`,
            }}
          />
          {pct > 2 && pct < 99 && (
            <span
              className="absolute inset-y-0 w-10 pointer-events-none"
              style={{ background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.45), transparent)", animation: "tierShine 1.8s ease-in-out infinite" }}
            />
          )}
        </div>
        {/* Log lines */}
        <div className="font-mono text-[12px] space-y-1.5">
          {stage.lines.slice(0, typed).map((line, i) => (
            <div
              key={i}
              className={
                line.startsWith("✓") ? "text-emerald-400" :
                line.startsWith("→") ? "text-sky-300" :
                "text-white/60"
              }
            >
              {line}
            </div>
          ))}
          {typed < stage.lines.length && (
            <span className="inline-block w-1.5 h-4 align-middle animate-pulse" style={{ background: `rgb(${rgb})` }} />
          )}
        </div>
      </div>
    )
  }

  if (stage.kind === "license") {
    return (
      <div className="space-y-4 py-2">
        {/* Big licence card */}
        <div
          className="relative rounded-2xl overflow-hidden p-5"
          style={{
            background: `linear-gradient(135deg, rgba(${rgb},0.10), rgba(255,255,255,0.012) 70%)`,
            border: `1px solid rgba(${rgb},0.3)`,
            boxShadow: `inset 0 1px 0 rgba(255,255,255,0.05), 0 0 30px rgba(${rgb},0.18)`,
          }}
        >
          <span
            aria-hidden="true"
            className="absolute top-0 left-8 right-8 h-px"
            style={{ background: `linear-gradient(90deg, transparent, rgba(${rgb},0.55), transparent)` }}
          />
          <div className="flex items-center gap-2 mb-3">
            <KeyRound className="h-4 w-4" style={{ color: `rgb(${rgb})` }} />
            <span className="text-[10px] font-bold uppercase tracking-[0.22em] text-white/50">Licence key</span>
          </div>
          <p className="font-mono text-[18px] font-bold tracking-[0.08em] text-white tabular-nums">{stage.key}</p>
        </div>
        {/* Rows */}
        <div className="grid sm:grid-cols-2 gap-2">
          {stage.rows.map((kv, i) => (
            <div key={i} className="flex items-center justify-between gap-3 rounded-xl bg-white/[0.025] border border-white/[0.05] px-3.5 py-2.5">
              <span className="text-[10px] uppercase tracking-[0.18em] text-white/40 font-bold">{kv.label}</span>
              <span
                className={
                  "text-[12.5px] font-display font-bold inline-flex items-center gap-1.5 " +
                  (kv.tone === "ok" ? "text-emerald-300" :
                   kv.tone === "warn" ? "text-amber-300" : "text-white")
                }
              >
                {kv.tone === "ok" && <Check className="h-3 w-3" strokeWidth={3} />}
                {kv.value}
              </span>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (stage.kind === "menu") {
    return (
      <div className="p-0">
        <MenuSlotEmbed slot={stage.slot} rgb={rgb} active={isActive} />
      </div>
    )
  }

  return null
}

/* ───────────────── The embeddable slot (placeholder / image / component) ──── */

function MenuSlotEmbed({ slot, rgb, active }: { slot: MenuSlot; rgb: string; active: boolean }) {
  if (slot.kind === "image") {
    return (
      <div
        className="relative rounded-xl overflow-hidden"
        style={{
          border: `1px solid rgba(${rgb},0.25)`,
          boxShadow: `inset 0 1px 0 rgba(255,255,255,0.05), 0 24px 60px -30px rgba(0,0,0,0.8), 0 0 28px rgba(${rgb},0.15)`,
          aspectRatio: "16 / 10",
        }}
      >
        <Image src={slot.src} alt={slot.alt} fill className="object-cover" sizes="(max-width: 640px) 100vw, 800px" />
      </div>
    )
  }
  if (slot.kind === "component") {
    return (
      <div
        className="relative rounded-xl overflow-hidden"
        style={{
          border: `1px solid rgba(${rgb},0.25)`,
          boxShadow: `inset 0 1px 0 rgba(255,255,255,0.05), 0 24px 60px -30px rgba(0,0,0,0.8), 0 0 28px rgba(${rgb},0.15)`,
        }}
      >
        {slot.render()}
      </div>
    )
  }
  // placeholder
  return (
    <div
      className="relative rounded-xl overflow-hidden flex flex-col items-center justify-center text-center p-8"
      style={{
        aspectRatio: "16 / 10",
        background: `radial-gradient(ellipse 80% 60% at 50% 30%, rgba(${rgb},0.08), transparent 70%), repeating-linear-gradient(135deg, rgba(255,255,255,0.015) 0 12px, transparent 12px 24px)`,
        border: `1px dashed rgba(${rgb},0.35)`,
      }}
    >
      <div
        className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-4 transition-transform duration-1000 ${active ? "scale-100 opacity-100" : "scale-90 opacity-60"}`}
        style={{
          background: `rgba(${rgb},0.12)`,
          border: `1px solid rgba(${rgb},0.35)`,
          boxShadow: `0 0 22px rgba(${rgb},0.3), inset 0 1px 0 rgba(255,255,255,0.08)`,
        }}
      >
        <Terminal className="h-6 w-6" style={{ color: `rgb(${rgb})` }} />
      </div>
      <p className="font-display text-[18px] font-bold tracking-[-0.02em] text-white mb-1.5">Menu slot</p>
      <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-white/40 mb-4">Ready for your live UI</p>
      <p className="text-[12.5px] leading-[1.7] text-white/55 max-w-[460px]">{slot.hint}</p>
      <p className="mt-5 text-[10px] font-mono text-white/30">
        kit.menuSlot → <span style={{ color: `rgb(${rgb})` }}>image · component</span>
      </p>
    </div>
  )
}

/* ──────────────────────────── Installer window shell ───────────────────────── */

function InstallerWindow({
  kit,
  stageIdx,
  setStageIdx,
  running,
  setRunning,
  completed,
  setCompleted,
}: {
  kit: Kit
  stageIdx: number
  setStageIdx: (i: number) => void
  running: boolean
  setRunning: (r: boolean) => void
  completed: Set<number>
  setCompleted: (s: Set<number>) => void
}) {
  const totalStages = kit.stages.length
  const stage = kit.stages[stageIdx]
  const isLast = stageIdx === totalStages - 1
  const isBootStage = stage.kind === "boot"

  // Auto-advance scripted stages while running
  useEffect(() => {
    if (!running) return
    if (stage.kind === "boot") return // boot waits for explicit Start
    const duration =
      stage.kind === "download" ? 3600 :
      stage.kind === "checks" ? 2600 :
      stage.kind === "license" ? 2400 :
      4000
    const t = setTimeout(() => {
      const next = new Set(completed)
      next.add(stageIdx)
      setCompleted(next)
      if (stageIdx < totalStages - 1) {
        setStageIdx(stageIdx + 1)
      } else {
        setRunning(false)
      }
    }, duration)
    return () => clearTimeout(t)
  }, [running, stage.kind, stageIdx, totalStages, completed, setStageIdx, setRunning, setCompleted])

  const startRun = () => {
    setRunning(true)
    if (stage.kind === "boot") {
      const next = new Set(completed)
      next.add(stageIdx)
      setCompleted(next)
      setStageIdx(Math.min(stageIdx + 1, totalStages - 1))
    }
  }

  const restart = () => {
    setRunning(false)
    setCompleted(new Set())
    setStageIdx(0)
  }

  return (
    <div
      className="relative rounded-2xl overflow-hidden"
      style={{
        background: "linear-gradient(180deg, rgba(10,10,12,0.95), rgba(0,0,0,0.98))",
        border: "1px solid rgba(255,255,255,0.07)",
        boxShadow: `0 40px 100px -40px rgba(0,0,0,0.9), 0 0 60px rgba(${kit.rgb},0.12), inset 0 1px 0 rgba(255,255,255,0.03)`,
      }}
    >
      <span
        aria-hidden="true"
        className="absolute top-0 left-10 right-10 h-px"
        style={{ background: `linear-gradient(90deg, transparent, rgba(${kit.rgb},0.55), transparent)` }}
      />

      {/* OS window title bar */}
      <div className="relative flex items-center px-4 py-3 border-b border-white/[0.05] bg-white/[0.02]">
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-red-500/70 flex items-center justify-center"><XIcon className="h-2 w-2 text-red-950 opacity-0 hover:opacity-100" /></span>
          <span className="w-3 h-3 rounded-full bg-amber-500/70"><Minus className="h-2 w-2 opacity-0" /></span>
          <span className="w-3 h-3 rounded-full bg-emerald-500/70"><Square className="h-2 w-2 opacity-0" /></span>
        </div>
        <div className="absolute left-1/2 -translate-x-1/2 flex items-center gap-2 text-[10.5px] font-mono uppercase tracking-[0.22em] text-white/40">
          <span
            className="inline-flex items-center justify-center w-4 h-4 rounded-sm"
            style={{ background: `rgba(${kit.rgb},0.18)`, border: `1px solid rgba(${kit.rgb},0.35)` }}
          >
            <kit.icon className="h-2.5 w-2.5" style={{ color: `rgb(${kit.rgb})` }} />
          </span>
          {kit.windowTitle}
        </div>
        <span className="ml-auto text-[9.5px] font-mono uppercase tracking-[0.22em] text-white/30">
          Stage {String(stageIdx + 1).padStart(2, "0")} / {String(totalStages).padStart(2, "0")}
        </span>
      </div>

      {/* Stage header band */}
      <div className="relative flex items-center justify-between gap-4 px-6 py-4 border-b border-white/[0.04]">
        <div className="min-w-0">
          <p className="text-[9.5px] font-bold uppercase tracking-[0.2em]" style={{ color: `rgb(${kit.rgb})` }}>
            {stage.sub}
          </p>
          <h3 className="font-display text-[18px] font-bold tracking-[-0.02em] text-white truncate mt-1">{stage.title}</h3>
        </div>
        <div className="flex items-center gap-2">
          {!running && !isBootStage && stageIdx < totalStages - 1 && (
            <button
              onClick={() => setRunning(true)}
              className="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg bg-white/[0.04] border border-white/[0.07] text-[10px] font-bold uppercase tracking-[0.16em] text-white/65 hover:text-white hover:border-white/[0.15] transition-colors"
            >
              <Play className="h-3 w-3" />
              Resume
            </button>
          )}
          <button
            onClick={restart}
            title="Restart simulation"
            className="inline-flex items-center justify-center h-8 w-8 rounded-lg bg-white/[0.04] border border-white/[0.07] text-white/55 hover:text-white hover:border-white/[0.15] transition-colors"
          >
            <RotateCcw className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Stage body */}
      <div className={`relative ${stage.kind === "menu" ? "p-4 sm:p-5" : "p-6 sm:p-8"} min-h-[340px]`}>
        <StageBody stage={stage} rgb={kit.rgb} isActive={true} />
      </div>

      {/* Footer control bar */}
      <div className="relative flex items-center justify-between gap-3 px-5 py-3.5 border-t border-white/[0.05] bg-white/[0.015] flex-wrap">
        <div className="flex items-center gap-2">
          {/* Stage pips */}
          {kit.stages.map((_, i) => {
            const isStageActive = i === stageIdx
            const isStageDone = completed.has(i)
            return (
              <button
                key={i}
                onClick={() => { setRunning(false); setStageIdx(i) }}
                aria-label={`Stage ${i + 1}`}
                className="group/pip relative h-[5px] rounded-full overflow-hidden transition-all"
                style={{
                  width: isStageActive ? 40 : 16,
                  background: "rgba(255,255,255,0.06)",
                }}
              >
                <span
                  className="absolute inset-0 rounded-full transition-opacity duration-400"
                  style={
                    isStageDone
                      ? { background: "linear-gradient(90deg, rgba(16,185,129,0.7), rgba(16,185,129,1))", opacity: 1 }
                      : isStageActive
                        ? { background: `linear-gradient(90deg, rgba(${kit.rgb},0.65), rgba(${kit.rgb},1))`, opacity: 1, boxShadow: `0 0 8px rgba(${kit.rgb},0.55)` }
                        : { opacity: 0 }
                  }
                />
              </button>
            )
          })}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => { setRunning(false); setStageIdx(Math.max(0, stageIdx - 1)) }}
            disabled={stageIdx === 0}
            className="inline-flex items-center justify-center h-9 w-9 rounded-full border border-white/[0.07] bg-white/[0.02] text-white/55 hover:text-white hover:border-white/[0.15] transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          {isBootStage ? (
            <GlossyButton
              onClick={startRun}
              shape="pill"
              size="sm"
              leftIcon={<Play className="h-3.5 w-3.5" />}
            >
              Start install
            </GlossyButton>
          ) : isLast ? (
            <button
              onClick={restart}
              className="inline-flex items-center gap-1.5 h-9 px-4 rounded-full border border-emerald-500/45 bg-emerald-500/[0.12] text-emerald-300 text-[11px] font-bold uppercase tracking-[0.16em] hover:bg-emerald-500/[0.18] transition-colors shadow-[0_0_18px_rgba(16,185,129,0.3)]"
            >
              <Check className="h-3.5 w-3.5" />
              Install complete · replay
            </button>
          ) : (
            <GlossyButton
              onClick={() => {
                const next = new Set(completed)
                next.add(stageIdx)
                setCompleted(next)
                setStageIdx(Math.min(stageIdx + 1, totalStages - 1))
              }}
              shape="pill"
              size="sm"
              rightIcon={<ChevronRight className="h-3.5 w-3.5" />}
            >
              Next stage
            </GlossyButton>
          )}
        </div>
      </div>
    </div>
  )
}

/* ────────────────────────── Top-level component ───────────────────────────── */

export function InteractiveSetupGuide() {
  const [activeKitId, setActiveKitId] = useState<Kit["id"]>("spoofer")
  const [stageIdx, setStageIdx] = useState(0)
  const [running, setRunning] = useState(false)
  const [completedByKit, setCompletedByKit] = useState<Record<string, Set<number>>>({})

  const kit = useMemo(() => KITS.find((k) => k.id === activeKitId) ?? KITS[0], [activeKitId])
  const completed = completedByKit[kit.id] ?? new Set<number>()

  const setCompleted = (s: Set<number>) => {
    setCompletedByKit({ ...completedByKit, [kit.id]: s })
  }

  const chooseKit = (id: Kit["id"]) => {
    setActiveKitId(id)
    setStageIdx(0)
    setRunning(false)
  }

  return (
    <section className="pb-24 px-6 sm:px-10 relative z-10">
      <div className="max-w-[1100px] mx-auto">

        {/* Tab rail — minimal underline-style */}
        <div className="relative mb-8">
          <div className="flex items-end gap-1 overflow-x-auto">
            {KITS.map((k) => {
              const active = k.id === kit.id
              const KIcon = k.icon
              return (
                <button
                  key={k.id}
                  onClick={() => chooseKit(k.id)}
                  className="group/tab relative inline-flex items-center gap-2 px-4 sm:px-5 h-11 transition-colors shrink-0"
                >
                  <KIcon
                    className={`h-3.5 w-3.5 transition-colors ${active ? "" : "text-white/35 group-hover/tab:text-white/55"}`}
                    style={active ? { color: `rgb(${k.rgb})`, filter: `drop-shadow(0 0 6px rgba(${k.rgb},0.65))` } : undefined}
                  />
                  <span className={`text-[12.5px] font-bold uppercase tracking-[0.16em] transition-colors ${active ? "text-white" : "text-white/45 group-hover/tab:text-white/75"}`}>
                    {k.label}
                  </span>
                  {active && (
                    <span
                      className="absolute left-3 right-3 bottom-0 h-[2px] rounded-t-sm"
                      style={{
                        background: `linear-gradient(90deg, transparent, rgb(${k.rgb}) 50%, transparent)`,
                        boxShadow: `0 0 12px rgba(${k.rgb},0.6)`,
                      }}
                    />
                  )}
                </button>
              )
            })}
          </div>
          <div className="absolute left-0 right-0 bottom-0 h-px bg-white/[0.06]" />
        </div>

        {/* Product banner above the installer */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-5 mb-5">
          <div>
            <p
              className="font-mono text-[10.5px] font-bold uppercase tracking-[0.22em] mb-2"
              style={{ color: `rgb(${kit.rgb})` }}
            >
              {kit.short}
            </p>
            <h2 className="font-display text-[30px] sm:text-[38px] font-bold tracking-[-0.03em] leading-[1.02]">
              <span style={{ background: "linear-gradient(180deg, rgba(255,255,255,1), rgba(180,180,195,0.8))", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                {kit.label}
              </span>
              <span className="text-white/30 font-light"> / installer</span>
            </h2>
          </div>
          <div className="flex flex-wrap gap-2">
            <StatChip icon={<Clock className="h-3 w-3" />} label="Est."  value={`${kit.totalMinutes}m total`} rgb={kit.rgb} />
            <StatChip icon={<Zap className="h-3 w-3" />}   label="Level" value={kit.difficulty}                rgb={kit.rgb} />
            <StatChip icon={<Cpu className="h-3 w-3" />}   label="Needs" value={kit.toolsNeeded}                rgb={kit.rgb} />
          </div>
        </div>

        {/* Installer window */}
        <InstallerWindow
          kit={kit}
          stageIdx={stageIdx}
          setStageIdx={setStageIdx}
          running={running}
          setRunning={setRunning}
          completed={completed}
          setCompleted={setCompleted}
        />

        {/* Dev / embed note */}
        <div
          className="mt-4 rounded-xl border border-white/[0.05] bg-white/[0.008] px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 text-[11px] text-white/40"
        >
          <span className="inline-flex items-center gap-2">
            <Usb className="h-3 w-3 text-white/35" />
            This is a demo walkthrough — real product menus will be embedded in each final stage as soon as the builds ship.
          </span>
          <span className="font-mono text-[10px] text-white/30">interactive-setup-guide.tsx → kit.stages[last].slot</span>
        </div>

        {/* Discord help row */}
        <div
          className="mt-6 rounded-2xl border border-white/[0.06] bg-white/[0.014] px-5 py-4 flex flex-wrap items-center justify-between gap-4"
          style={{ boxShadow: "inset 0 1px 0 rgba(255,255,255,0.02)" }}
        >
          <div className="flex items-center gap-3">
            <span
              className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
              style={{
                background: "rgba(88,101,242,0.10)",
                border: "1px solid rgba(88,101,242,0.30)",
                boxShadow: "0 0 14px rgba(88,101,242,0.18), inset 0 1px 0 rgba(255,255,255,0.06)",
              }}
            >
              <MessagesSquare className="h-4 w-4 text-[#5865F2]" />
            </span>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-white/40">Something off?</p>
              <p className="text-[13.5px] font-semibold text-white/85 mt-0.5">#setup is live 24/7 · average first reply under 5 min</p>
            </div>
          </div>
          <Link
            href="https://discord.gg/lethaldma"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 h-10 px-4 rounded-full border border-[#5865F2]/35 bg-[#5865F2]/10 hover:bg-[#5865F2]/20 text-[11.5px] font-bold uppercase tracking-[0.16em] text-white/90 transition-colors"
          >
            Open Discord
            <ChevronRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    </section>
  )
}

/* ──────────────────────────── small helper ──────────────────────────────── */

function StatChip({ icon, label, value, rgb }: { icon: React.ReactNode; label: string; value: string; rgb: string }) {
  return (
    <span
      className="inline-flex items-center gap-2 rounded-full border border-white/[0.07] bg-white/[0.02] px-3 py-1.5"
      style={{ boxShadow: "inset 0 1px 0 rgba(255,255,255,0.025)" }}
    >
      <span style={{ color: `rgb(${rgb})` }}>{icon}</span>
      <span className="text-[9.5px] font-bold uppercase tracking-[0.2em] text-white/40">{label}</span>
      <span className="text-[11px] font-semibold text-white/80 tabular-nums">{value}</span>
    </span>
  )
}
