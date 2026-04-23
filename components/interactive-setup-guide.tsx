"use client"

import { useEffect, useMemo, useState } from "react"
import {
  Check,
  Download,
  KeyRound,
  Terminal,
  Gamepad2,
  Shield,
  Cpu,
  Zap,
  HardDrive,
  Usb,
  Power,
  Package,
  FileDown,
  ChevronRight,
  ChevronLeft,
  Clock,
  ExternalLink,
  type LucideIcon,
} from "lucide-react"
import Link from "next/link"
import { GlossyButton } from "@/components/ui/glossy-button"

/* ─────────────────────────── Mock specifications ─────────────────────────── */

type Mock =
  | { kind: "terminal"; title: string; lines: string[] }
  | { kind: "download"; title: string; lines: string[] }
  | { kind: "keys"; title: string; rows: { label: string; value: string; tone?: "default" | "ok" | "warn" }[] }
  | { kind: "settings"; title: string; rows: { label: string; value: string; ok?: boolean }[] }
  | { kind: "done"; title: string; line: string }

type Step = {
  icon: LucideIcon
  title: string
  sub: string
  body: string
  minutes: number
  mock: Mock
}

type Kit = {
  id: "spoofer" | "external" | "dma" | "firmware"
  label: string
  short: string
  icon: LucideIcon
  /** Tailwind text-* class used on tab / sidebar accents */
  textClass: string
  /** "r,g,b" — used in inline styles */
  rgb: string
  totalMinutes: number
  steps: Step[]
}

/* ───────────────────────────────── Kits ───────────────────────────────────── */

const KITS: Kit[] = [
  {
    id: "spoofer",
    label: "HWID Spoofer",
    short: "Perm · Temp",
    icon: Package,
    textClass: "text-emerald-400",
    rgb: "16,185,129",
    totalMinutes: 4,
    steps: [
      {
        icon: Download,
        title: "Get your licence",
        sub: "Instant delivery",
        body:
          "After checkout your licence key is emailed within 60 seconds. Keep the email open — you'll paste the key in step 4. If it hasn't arrived, check spam once, then ping Discord.",
        minutes: 1,
        mock: {
          kind: "download",
          title: "checkout · success",
          lines: ["✓ Payment verified", "✓ Licence generated", "→ LS-A7K3-9F2X-P4QM sent to inbox"],
        },
      },
      {
        icon: Shield,
        title: "Close anti-cheat services",
        sub: "Disable before spoofing",
        body:
          "Fully quit Vanguard, EAC, BattlEye, and the game launcher. Open Task Manager → End task on anything game-related. Anti-cheats hold hardware IDs open — if they're running, the spoof won't apply cleanly.",
        minutes: 1,
        mock: {
          kind: "settings",
          title: "processes · pre-spoof",
          rows: [
            { label: "Vanguard (vgc / vgk)", value: "Stopped", ok: true },
            { label: "EasyAntiCheat",        value: "Stopped", ok: true },
            { label: "BattlEye (BE)",        value: "Stopped", ok: true },
            { label: "Riot / Steam client",  value: "Closed",  ok: true },
          ],
        },
      },
      {
        icon: Terminal,
        title: "Run spoofer as admin",
        sub: "Signed · kernel-level",
        body:
          "Right-click the spoofer you downloaded → Run as administrator. Windows SmartScreen may prompt once — More info → Run anyway. The binary is signed; it is deliberately not uploaded to VT to stay undetected.",
        minutes: 1,
        mock: {
          kind: "terminal",
          title: "lethal-spoofer.exe",
          lines: [
            "$ lethal-spoofer --check",
            "✓ Driver signature valid",
            "✓ Running as SYSTEM",
            "→ Enumerating hardware IDs…",
            "→ 18 IDs found · ready to randomise",
          ],
        },
      },
      {
        icon: KeyRound,
        title: "Paste key · hit Spoof",
        sub: "One click — a few seconds",
        body:
          "Paste your licence in the field and click Spoof. The tool randomises HWID/MAC/SMBIOS/disk serials in order, reports any that needed a reboot, and prints the new values.",
        minutes: 1,
        mock: {
          kind: "keys",
          title: "licence · activated",
          rows: [
            { label: "Licence",     value: "LS-A7K3-9F2X-P4QM" },
            { label: "Status",      value: "Active",   tone: "ok" },
            { label: "HWID rolled", value: "18 / 18",  tone: "ok" },
            { label: "Reboot",      value: "Required", tone: "warn" },
          ],
        },
      },
      {
        icon: Power,
        title: "Reboot · play clean",
        sub: "New identity on wake",
        body:
          "Do a full restart (not sleep). On next boot Windows reads the new serials — to any anti-cheat you're a fresh machine. Start the game as normal; no extra step during future sessions until you reboot or re-spoof.",
        minutes: 0,
        mock: {
          kind: "done",
          title: "ready",
          line: "New hardware fingerprint active · 0 detections on record",
        },
      },
    ],
  },
  {
    id: "external",
    label: "External Cheat",
    short: "Fortnite External",
    icon: Zap,
    textClass: "text-[#f97316]",
    rgb: "249,115,22",
    totalMinutes: 5,
    steps: [
      {
        icon: Download,
        title: "Grab the loader",
        sub: "Private Discord channel",
        body:
          "Your licence email includes a Discord invite with a #buyer-downloads channel. Download the Fortnite External loader from the pinned message — it's a single-file signed EXE, roughly 4 MB.",
        minutes: 1,
        mock: {
          kind: "download",
          title: "#buyer-downloads",
          lines: ["✓ Access granted", "→ fnx-loader-7.1.4.exe · 4.2 MB", "✓ Download complete"],
        },
      },
      {
        icon: Shield,
        title: "Whitelist in Windows Defender",
        sub: "Stops AV from quarantining",
        body:
          "Windows Security → Virus & threat protection → Exclusions → Add folder → pick the folder you saved the loader in. Full guide video pinned in Discord. This stops Defender from nuking the loader between updates.",
        minutes: 1,
        mock: {
          kind: "settings",
          title: "defender · exclusions",
          rows: [
            { label: "C:\\LS\\FNX",   value: "Whitelisted", ok: true },
            { label: "Real-time scan", value: "Skips folder", ok: true },
            { label: "Cloud upload",   value: "Disabled",     ok: true },
          ],
        },
      },
      {
        icon: KeyRound,
        title: "Activate licence",
        sub: "One-time bind to your PC",
        body:
          "Run the loader. First launch asks for the licence — paste it and press Enter. It binds to this machine until you hit Reset in the launcher or contact support. Re-activations are free.",
        minutes: 1,
        mock: {
          kind: "keys",
          title: "fnx · licence",
          rows: [
            { label: "Licence", value: "LS-A7K3-9F2X-P4QM" },
            { label: "Status",  value: "Active", tone: "ok" },
            { label: "Expires", value: "Lifetime" },
            { label: "Machine", value: "Bound",  tone: "ok" },
          ],
        },
      },
      {
        icon: Gamepad2,
        title: "Launch Fortnite · then loader",
        sub: "Order matters here",
        body:
          "Start Fortnite all the way into the lobby. Alt-tab, run the loader, click Inject. Features panel pops up — pick your config, close the menu, tab back. If the menu doesn't show, your overlay key is INSERT by default.",
        minutes: 2,
        mock: {
          kind: "terminal",
          title: "fnx-loader · inject",
          lines: [
            "→ Waiting for FortniteClient-Win64-Shipping…",
            "✓ Process found (PID 17420)",
            "✓ Memory scan clean (EAC posture ok)",
            "✓ Overlay attached",
            "→ Press INSERT to toggle menu",
          ],
        },
      },
      {
        icon: Shield,
        title: "Play — keep loader running",
        sub: "Close = detach",
        body:
          "You're in. Leave the loader window alone while you play — closing it detaches cleanly, but you'll need to re-inject next match. Updates download automatically whenever Epic patches; no manual step.",
        minutes: 0,
        mock: {
          kind: "done",
          title: "ready",
          line: "189 days undetected · auto-update on patch",
        },
      },
    ],
  },
  {
    id: "dma",
    label: "DMA Cheat",
    short: "Streck · Blurred",
    icon: Cpu,
    textClass: "text-[#f97316]",
    rgb: "249,115,22",
    totalMinutes: 12,
    steps: [
      {
        icon: HardDrive,
        title: "Two machines, one DMA card",
        sub: "Gaming PC + secondary",
        body:
          "DMA cheats read memory from a second PC through a PCIe card (Squirrel / CaptainDMA / LeetDMA). Gaming PC stays 100% clean — no loader, no driver, nothing anti-cheat can flag. Secondary runs the reader + overlay.",
        minutes: 2,
        mock: {
          kind: "settings",
          title: "hardware · checklist",
          rows: [
            { label: "Gaming PC · PCIe x4 slot",  value: "Populated",    ok: true },
            { label: "Secondary PC · USB 3",      value: "Connected",    ok: true },
            { label: "DMA card",                  value: "CaptainDMA",   ok: true },
            { label: "Monitor · HDMI loopback",   value: "Optional",     ok: true },
          ],
        },
      },
      {
        icon: Usb,
        title: "Flash Lethal firmware",
        sub: "Replaces stock signature",
        body:
          "Stock DMA firmware is fingerprinted by anti-cheats. Flash our Custom DMA Firmware through the included flasher on the secondary PC — one-time, ~30 s. Your card now reports as a generic PCIe device.",
        minutes: 3,
        mock: {
          kind: "terminal",
          title: "lethal-flasher",
          lines: [
            "$ lethal-flasher --target captaindma --region fw",
            "✓ Device detected (VID:DEAD PID:BEEF)",
            "✓ Signing payload with account key",
            "▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ 100%",
            "✓ Firmware flashed · please power-cycle",
          ],
        },
      },
      {
        icon: Download,
        title: "Install cheat loader on secondary",
        sub: "Runs next to the game, not inside",
        body:
          "Install Streck/Blurred on the SECONDARY PC only. Pin Discord's #buyer-downloads for the latest build. Loader needs MemProcFs + leechcore drivers once — the installer handles that automatically.",
        minutes: 3,
        mock: {
          kind: "download",
          title: "dma-loader · install",
          lines: [
            "✓ MemProcFs runtime present",
            "✓ leechcore drivers installed",
            "→ blurred-2026.04.dma · 47 MB",
            "✓ Extracted to C:\\LS\\DMA",
          ],
        },
      },
      {
        icon: KeyRound,
        title: "Activate & pair",
        sub: "Licence binds to the secondary",
        body:
          "Open the loader, paste your licence — it authorises the secondary PC and enumerates the DMA card. Pick the game profile (Fortnite for both Streck and Blurred) and click Start. Gaming PC side: nothing to do.",
        minutes: 2,
        mock: {
          kind: "keys",
          title: "dma · activation",
          rows: [
            { label: "Licence",     value: "LS-A7K3-9F2X-P4QM" },
            { label: "Status",      value: "Active",     tone: "ok" },
            { label: "DMA card",    value: "Recognised", tone: "ok" },
            { label: "Game profile", value: "Fortnite" },
          ],
        },
      },
      {
        icon: Shield,
        title: "Start Fortnite · play clean",
        sub: "Zero footprint on gaming PC",
        body:
          "Launch Fortnite as normal on the gaming PC. Overlay shows on the secondary monitor (or via HDMI loopback if you have one). Anti-cheat sees a stock machine on the game side and a harmless PCIe card on PCI bus.",
        minutes: 2,
        mock: {
          kind: "done",
          title: "ready",
          line: "120–164 days undetected · firmware fingerprint clean",
        },
      },
    ],
  },
  {
    id: "firmware",
    label: "DMA Firmware",
    short: "EAC · BE · FaceIt · VGK",
    icon: FileDown,
    textClass: "text-blue-400",
    rgb: "59,130,246",
    totalMinutes: 6,
    steps: [
      {
        icon: HardDrive,
        title: "Boot secondary PC · connect card",
        sub: "Flashing is done on the second rig",
        body:
          "Plug the DMA card into the SECONDARY PC via PCIe or USB. Never flash from the gaming PC — you want the new firmware live before you ever touch the card with a protected game. Keep the card powered while flashing.",
        minutes: 1,
        mock: {
          kind: "settings",
          title: "host · pre-flash",
          rows: [
            { label: "Host PC",           value: "Secondary", ok: true },
            { label: "Card link speed",   value: "USB 3 Gen2", ok: true },
            { label: "Power · 5V",        value: "Stable",    ok: true },
            { label: "Antivirus",         value: "Disabled temp", ok: true },
          ],
        },
      },
      {
        icon: Download,
        title: "Grab your firmware package",
        sub: "Ships with signing key",
        body:
          "Licence email includes the firmware ZIP matching the tier you bought (EAC/BE, Slotted, FaceIt/VGK). Extract somewhere writable — the flasher needs to place the signing payload next to the binary.",
        minutes: 1,
        mock: {
          kind: "download",
          title: "firmware · 5.0.0",
          lines: [
            "✓ Tier: FaceIt · VGK",
            "→ lethal-fw-5.0.0.zip · 18 MB",
            "✓ Extracted to C:\\LS\\Firmware",
            "✓ Signing key present",
          ],
        },
      },
      {
        icon: Terminal,
        title: "Run the flasher as admin",
        sub: "One command, ~30 s",
        body:
          "Open PowerShell as admin in the extracted folder. Run `.\\lethal-flasher.exe --apply`. It verifies the signature, writes the new firmware blob, and prints the new PCI ID. Don't unplug mid-flash.",
        minutes: 1,
        mock: {
          kind: "terminal",
          title: "lethal-flasher · apply",
          lines: [
            "$ .\\lethal-flasher.exe --apply",
            "✓ Signature valid (Ed25519)",
            "✓ Target detected",
            "▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ 100%",
            "✓ PCI ID now: 10EE:7024 (generic)",
          ],
        },
      },
      {
        icon: KeyRound,
        title: "Validate the new fingerprint",
        sub: "Be sure before you load a cheat",
        body:
          "Run `.\\lethal-flasher.exe --verify`. Confirms the new VID:PID, checks that the firmware responds to a memory probe, and simulates what each AC will see. If any row comes back red, flash again before going live.",
        minutes: 2,
        mock: {
          kind: "settings",
          title: "firmware · verify",
          rows: [
            { label: "Reported VID/PID",       value: "10EE:7024", ok: true },
            { label: "EAC posture simulator",  value: "Clean",     ok: true },
            { label: "BattlEye posture",       value: "Clean",     ok: true },
            { label: "FaceIt / VGK posture",   value: "Clean",     ok: true },
          ],
        },
      },
      {
        icon: Shield,
        title: "You're signed — load any cheat",
        sub: "Firmware is game-agnostic",
        body:
          "Card now passes every major anti-cheat's DMA fingerprint check. You can pair Streck, Blurred, or any third-party DMA cheat you bring. Updates drop automatically whenever an AC rotates its signature set.",
        minutes: 1,
        mock: {
          kind: "done",
          title: "ready",
          line: "Firmware signed · 134 days clean on this tier",
        },
      },
    ],
  },
]

/* ────────────────────────────── Mock renderer ──────────────────────────────── */

function StepMock({ mock, accentRgb }: { mock: Mock; accentRgb: string }) {
  const [typed, setTyped] = useState(0)

  useEffect(() => {
    if (mock.kind !== "terminal" && mock.kind !== "download") return
    setTyped(0)
    let i = 0
    const iv = setInterval(() => {
      i++
      setTyped(i)
      if (i >= mock.lines.length) clearInterval(iv)
    }, 260)
    return () => clearInterval(iv)
  }, [mock])

  return (
    <div
      className="relative rounded-2xl overflow-hidden bg-black/70 backdrop-blur-md"
      style={{
        border: "1px solid rgba(255,255,255,0.08)",
        boxShadow: `0 24px 60px rgba(0,0,0,0.5), 0 0 50px rgba(${accentRgb},0.09), inset 0 1px 0 rgba(255,255,255,0.035)`,
      }}
    >
      {/* Accent top hairline */}
      <span
        aria-hidden="true"
        className="absolute top-0 left-10 right-10 h-px"
        style={{ background: `linear-gradient(90deg, transparent, rgba(${accentRgb},0.55), transparent)` }}
      />

      {/* Window chrome */}
      <div className="flex items-center gap-1.5 px-4 py-3 border-b border-white/[0.06] bg-white/[0.02]">
        <span className="w-2.5 h-2.5 rounded-full bg-red-500/60" />
        <span className="w-2.5 h-2.5 rounded-full bg-amber-500/60" />
        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/60" />
        <span className="ml-3 text-[9.5px] font-mono text-white/35 uppercase tracking-[0.22em]">
          {mock.title}
        </span>
      </div>

      <div className="p-6 min-h-[260px]">
        {mock.kind === "terminal" && (
          <div className="font-mono text-[12.5px] space-y-1">
            {mock.lines.slice(0, typed).map((line, i) => (
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
            {typed < mock.lines.length && (
              <span className="inline-block w-1.5 h-4 bg-[#f97316] align-middle animate-pulse" />
            )}
          </div>
        )}

        {mock.kind === "download" && (
          <div className="font-mono text-[13px] space-y-2">
            {mock.lines.slice(0, typed).map((line, i) => (
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
            {typed < mock.lines.length && (
              <span className="inline-block w-1.5 h-4 bg-[#f97316] align-middle animate-pulse" />
            )}
          </div>
        )}

        {mock.kind === "keys" && (
          <div className="space-y-2.5">
            {mock.rows.map((kv, i) => (
              <div key={i} className="flex items-center justify-between gap-4 px-4 py-3 rounded-xl bg-white/[0.025] border border-white/[0.05]">
                <span className="text-[10px] uppercase tracking-[0.2em] text-white/40 font-bold">{kv.label}</span>
                <span
                  className={
                    "font-mono text-[13px] font-semibold " +
                    (kv.tone === "ok" ? "text-emerald-400" :
                     kv.tone === "warn" ? "text-amber-400" : "text-white")
                  }
                >
                  {kv.value}
                </span>
              </div>
            ))}
          </div>
        )}

        {mock.kind === "settings" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {mock.rows.map((kv, i) => (
              <div key={i} className="rounded-xl bg-white/[0.02] border border-white/[0.05] p-4">
                <p className="text-[9.5px] uppercase tracking-[0.2em] text-white/35 font-bold mb-1.5">{kv.label}</p>
                <p className={`text-[13px] font-display font-bold tracking-tight ${kv.ok ? "text-emerald-300" : "text-white"}`}>
                  {kv.ok && <Check className="inline h-3 w-3 mr-1" />}
                  {kv.value}
                </p>
              </div>
            ))}
          </div>
        )}

        {mock.kind === "done" && (
          <div className="flex flex-col items-center justify-center h-full text-center py-8">
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
              style={{
                background: `linear-gradient(135deg, rgba(${accentRgb},0.22), rgba(${accentRgb},0.08))`,
                border: `1px solid rgba(${accentRgb},0.4)`,
                boxShadow: `inset 0 1px 0 rgba(255,255,255,0.08), 0 0 40px rgba(${accentRgb},0.3)`,
              }}
            >
              <Check className="h-7 w-7" style={{ color: `rgb(${accentRgb})` }} strokeWidth={3} />
            </div>
            <p className="font-display text-lg font-bold text-white">All clear</p>
            <p className="text-[13px] text-white/55 mt-1 max-w-[260px]">{mock.line}</p>
          </div>
        )}
      </div>
    </div>
  )
}

/* ─────────────────────────────── Main guide ──────────────────────────────── */

export function InteractiveSetupGuide() {
  const [activeKitId, setActiveKitId] = useState<Kit["id"]>("spoofer")
  const [stepIdx, setStepIdx] = useState(0)
  const [completed, setCompleted] = useState<Record<string, Set<number>>>({})

  const kit = useMemo(() => KITS.find((k) => k.id === activeKitId) ?? KITS[0], [activeKitId])
  const step = kit.steps[stepIdx]
  const StepIcon = step.icon
  const doneSet = completed[kit.id] ?? new Set<number>()
  const progress = Math.round((stepIdx / (kit.steps.length - 1)) * 100)

  // Reset step when kit changes
  const chooseKit = (id: Kit["id"]) => {
    setActiveKitId(id)
    setStepIdx(0)
  }

  const markStepDone = () => {
    const next = new Set(doneSet)
    next.add(stepIdx)
    setCompleted({ ...completed, [kit.id]: next })
  }

  const goNext = () => {
    markStepDone()
    if (stepIdx < kit.steps.length - 1) setStepIdx(stepIdx + 1)
  }
  const goPrev = () => {
    if (stepIdx > 0) setStepIdx(stepIdx - 1)
  }

  return (
    <section className="pb-24 px-6 sm:px-10 relative z-10">
      <div className="max-w-[1200px] mx-auto">

        {/* Kit tabs */}
        <div className="relative rounded-3xl border border-white/[0.07] bg-white/[0.014] overflow-hidden mb-6"
             style={{ boxShadow: "0 30px 80px -40px rgba(0,0,0,0.7), inset 0 1px 0 rgba(255,255,255,0.025)" }}>
          <div className="absolute top-0 left-10 right-10 h-px bg-gradient-to-r from-transparent via-[#f97316]/45 to-transparent" />
          <div className="relative p-3 sm:p-4 flex items-center gap-2 overflow-x-auto">
            {KITS.map((k) => {
              const active = k.id === kit.id
              const KIcon = k.icon
              return (
                <button
                  key={k.id}
                  onClick={() => chooseKit(k.id)}
                  className={`group/tab relative inline-flex items-center gap-2.5 px-4 sm:px-5 h-12 rounded-2xl transition-colors duration-300 shrink-0 ${
                    active ? "text-white" : "text-white/55 hover:text-white/80"
                  }`}
                  style={
                    active
                      ? {
                          background: `linear-gradient(180deg, rgba(${k.rgb},0.14) 0%, rgba(${k.rgb},0.04) 100%)`,
                          boxShadow: `inset 0 0 0 1px rgba(${k.rgb},0.4), 0 6px 22px -8px rgba(${k.rgb},0.5)`,
                        }
                      : undefined
                  }
                >
                  <KIcon className={`h-4 w-4 ${active ? k.textClass : "text-white/40"}`} />
                  <span className="flex flex-col items-start leading-tight">
                    <span className="text-[12.5px] font-bold uppercase tracking-[0.14em]">{k.label}</span>
                    <span className={`text-[9.5px] uppercase tracking-[0.18em] font-semibold ${active ? "text-white/55" : "text-white/30"}`}>
                      {k.short}
                    </span>
                  </span>
                  {active && (
                    <span className="ml-1 inline-flex items-center gap-1 rounded-full bg-white/[0.06] border border-white/[0.1] px-2 py-0.5 text-[9px] font-bold uppercase tracking-[0.18em] text-white/65">
                      <Clock className="h-2.5 w-2.5" />
                      {k.totalMinutes}m
                    </span>
                  )}
                </button>
              )
            })}
          </div>
        </div>

        {/* Main wizard layout */}
        <div className="grid lg:grid-cols-[280px_1fr] gap-5">

          {/* Sidebar stepper */}
          <aside
            className="relative rounded-3xl border border-white/[0.07] bg-white/[0.014] p-3 sm:p-4 self-start"
            style={{ boxShadow: "0 30px 80px -40px rgba(0,0,0,0.7), inset 0 1px 0 rgba(255,255,255,0.025)" }}
          >
            <p className="text-[9.5px] font-bold uppercase tracking-[0.22em] text-white/40 px-2 pt-1 pb-2">
              {kit.label} setup
            </p>
            <ol className="space-y-1">
              {kit.steps.map((s, i) => {
                const active = i === stepIdx
                const isDone = doneSet.has(i)
                return (
                  <li key={i}>
                    <button
                      onClick={() => setStepIdx(i)}
                      className={`w-full text-left rounded-xl px-3 py-2.5 flex items-center gap-3 transition-colors duration-200 ${
                        active ? "bg-white/[0.04]" : "hover:bg-white/[0.02]"
                      }`}
                      style={
                        active
                          ? {
                              boxShadow: `inset 0 0 0 1px rgba(${kit.rgb},0.32), inset 3px 0 0 rgba(${kit.rgb},0.9)`,
                            }
                          : undefined
                      }
                    >
                      <span
                        className={`shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black tabular-nums ${
                          isDone
                            ? "bg-emerald-500/20 text-emerald-300"
                            : active
                              ? ""
                              : "bg-white/[0.04] text-white/45"
                        }`}
                        style={
                          active && !isDone
                            ? {
                                background: `rgba(${kit.rgb},0.2)`,
                                color: "#fff",
                                boxShadow: `inset 0 0 0 1px rgba(${kit.rgb},0.5)`,
                              }
                            : undefined
                        }
                      >
                        {isDone ? <Check className="h-3 w-3" strokeWidth={3} /> : String(i + 1).padStart(2, "0")}
                      </span>
                      <span className="min-w-0 flex-1">
                        <p className={`text-[12.5px] font-semibold truncate ${active ? "text-white" : "text-white/65"}`}>
                          {s.title}
                        </p>
                        <p className="text-[10px] text-white/35 font-semibold uppercase tracking-[0.14em] truncate">
                          {s.sub}
                        </p>
                      </span>
                      {active && <ChevronRight className="h-3.5 w-3.5 text-white/45 shrink-0" />}
                    </button>
                  </li>
                )
              })}
            </ol>

            {/* Progress bar */}
            <div className="mt-3 px-2 pt-3 border-t border-white/[0.04]">
              <div className="flex items-center justify-between text-[9.5px] font-bold uppercase tracking-[0.18em] text-white/35 mb-2">
                <span>Progress</span>
                <span className="tabular-nums text-white/60">{stepIdx + 1} / {kit.steps.length}</span>
              </div>
              <div className="h-1 rounded-full bg-white/[0.04] overflow-hidden">
                <div
                  className="h-full rounded-full transition-[width] duration-500"
                  style={{
                    width: `${progress}%`,
                    background: `linear-gradient(90deg, rgba(${kit.rgb},0.55), rgba(${kit.rgb},1))`,
                    boxShadow: `0 0 10px rgba(${kit.rgb},0.5)`,
                  }}
                />
              </div>
            </div>
          </aside>

          {/* Active step card */}
          <div
            className="relative rounded-3xl border border-white/[0.07] bg-white/[0.014] overflow-hidden"
            style={{ boxShadow: "0 30px 80px -40px rgba(0,0,0,0.75), inset 0 1px 0 rgba(255,255,255,0.025)" }}
          >
            {/* Top accent hairline */}
            <span
              aria-hidden="true"
              className="absolute top-0 left-10 right-10 h-px"
              style={{ background: `linear-gradient(90deg, transparent, rgba(${kit.rgb},0.55), transparent)` }}
            />
            {/* Ambient corner glow */}
            <span
              aria-hidden="true"
              className="absolute -top-24 -right-24 w-72 h-72 rounded-full pointer-events-none opacity-55"
              style={{ background: `radial-gradient(circle, rgba(${kit.rgb},0.16), transparent 70%)`, filter: "blur(50px)" }}
            />

            <div className="relative p-6 sm:p-8">
              {/* Header */}
              <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
                <div className="flex items-start gap-4">
                  <div
                    className="shrink-0 w-14 h-14 rounded-2xl flex items-center justify-center"
                    style={{
                      background: `rgba(${kit.rgb},0.12)`,
                      border: `1px solid rgba(${kit.rgb},0.35)`,
                      boxShadow: `0 0 22px rgba(${kit.rgb},0.25), inset 0 1px 0 rgba(255,255,255,0.06)`,
                    }}
                  >
                    <StepIcon className="h-6 w-6" style={{ color: `rgb(${kit.rgb})`, filter: `drop-shadow(0 0 10px rgba(${kit.rgb},0.6))` }} />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-3 mb-1.5 flex-wrap">
                      <span className="font-mono text-[10px] font-bold tracking-[0.2em] uppercase" style={{ color: `rgb(${kit.rgb})` }}>
                        Step {String(stepIdx + 1).padStart(2, "0")}
                      </span>
                      <span className="h-px w-6 bg-white/[0.08]" />
                      <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/45">{step.sub}</span>
                    </div>
                    <h3 className="font-display text-[26px] sm:text-[30px] font-bold tracking-[-0.025em] leading-[1.1]">
                      {step.title}
                    </h3>
                  </div>
                </div>
                <span className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 bg-white/[0.03] border border-white/[0.06] text-[10px] font-bold uppercase tracking-[0.18em] text-white/55">
                  <Clock className="h-3 w-3 text-white/45" />
                  ≈ {step.minutes || "<1"}m
                </span>
              </div>

              {/* Body text */}
              <p className="text-[14.5px] leading-[1.75] text-white/70 mb-6 max-w-[640px]">{step.body}</p>

              {/* Mock */}
              <StepMock mock={step.mock} accentRgb={kit.rgb} />

              {/* Navigation */}
              <div className="mt-7 flex flex-wrap items-center justify-between gap-3">
                <button
                  onClick={goPrev}
                  disabled={stepIdx === 0}
                  className="inline-flex items-center gap-2 h-10 px-4 rounded-full border border-white/[0.07] bg-white/[0.02] text-[12px] font-bold uppercase tracking-[0.16em] text-white/60 hover:text-white hover:border-white/[0.15] transition-colors disabled:opacity-35 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="h-3.5 w-3.5" />
                  Back
                </button>

                {stepIdx < kit.steps.length - 1 ? (
                  <GlossyButton
                    onClick={goNext}
                    shape="pill"
                    size="md"
                    rightIcon={<ChevronRight className="h-4 w-4" />}
                  >
                    {doneSet.has(stepIdx) ? "Next step" : "Mark done · next"}
                  </GlossyButton>
                ) : (
                  <button
                    onClick={markStepDone}
                    className={`inline-flex items-center gap-2 h-10 px-5 rounded-full border text-[12px] font-bold uppercase tracking-[0.16em] transition-colors ${
                      doneSet.has(stepIdx)
                        ? "border-emerald-500/45 bg-emerald-500/[0.12] text-emerald-300"
                        : "border-white/[0.08] bg-white/[0.02] text-white/65 hover:border-emerald-500/40 hover:text-emerald-300"
                    }`}
                  >
                    {doneSet.has(stepIdx) ? (
                      <><Check className="h-3.5 w-3.5" /> All steps complete</>
                    ) : (
                      <><Check className="h-3.5 w-3.5" /> Finish setup</>
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Stuck? help row */}
        <div
          className="mt-8 rounded-2xl border border-white/[0.06] bg-white/[0.014] px-5 py-4 flex flex-wrap items-center justify-between gap-4"
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
              <Zap className="h-4 w-4 text-[#5865F2]" />
            </span>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-white/40">Something off?</p>
              <p className="text-[13.5px] font-semibold text-white/85 mt-0.5">Setup channel is live 24/7 · avg first reply under 5 min</p>
            </div>
          </div>
          <Link
            href="https://discord.gg/lethaldma"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 h-10 px-4 rounded-full border border-[#5865F2]/30 bg-[#5865F2]/10 hover:bg-[#5865F2]/20 text-[12px] font-bold uppercase tracking-[0.16em] text-white/85 transition-colors"
          >
            Open #setup
            <ExternalLink className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    </section>
  )
}
