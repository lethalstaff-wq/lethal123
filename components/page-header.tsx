// Shared page header — pill + scan-line + gradient H1 + sub.
// Use on every content page for visual consistency with Home/Apply hero.
import type { LucideIcon } from "lucide-react"

interface PageHeaderProps {
  pill: string
  icon?: LucideIcon
  /** Title prefix (white→silver) */
  prefix?: string
  /** Title accent (orange gradient + glow) */
  accent: string
  /** Title suffix (white→silver) */
  suffix?: string
  description?: string
  /** Extra padding-top class (default pt-36) */
  paddingTop?: string
}

export function PageHeader({ pill, icon: Icon, prefix, accent, suffix, description, paddingTop = "pt-36" }: PageHeaderProps) {
  return (
    <section className={`relative ${paddingTop} pb-16 px-6 sm:px-10 z-10`}>
      <div className="max-w-5xl mx-auto text-center">
        <div className="inline-flex items-center gap-2 mb-6 px-4 py-2 rounded-full border border-white/[0.08] bg-white/[0.03] backdrop-blur-md">
          {Icon ? (
            <Icon className="h-3.5 w-3.5 text-[#f97316]" />
          ) : (
            <span className="w-1.5 h-1.5 rounded-full bg-[#f97316] animate-pulse" />
          )}
          <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/55">{pill}</span>
        </div>

        {/* Scan line divider */}
        <div className="relative h-px w-44 mx-auto mb-7 bg-white/[0.05] overflow-hidden">
          <div
            className="absolute inset-y-0 w-24 bg-gradient-to-r from-transparent via-[#f97316]/70 to-transparent"
            style={{ animation: "heroScan 4s ease-in-out infinite" }}
          />
        </div>

        <h1 className="font-display text-5xl sm:text-6xl md:text-7xl font-bold tracking-[-0.04em] leading-[0.95] mb-6">
          {prefix && (
            <span
              style={{
                background: "linear-gradient(180deg, rgba(255,255,255,1), rgba(180,180,195,0.85))",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              {prefix}{" "}
            </span>
          )}
          <span
            style={{
              background: "linear-gradient(180deg, #ffb366 0%, #f97316 45%, #c2410c 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              filter: "drop-shadow(0 0 50px rgba(249,115,22,0.3))",
            }}
          >
            {accent}
          </span>
          {suffix && (
            <span
              style={{
                background: "linear-gradient(180deg, rgba(255,255,255,1), rgba(180,180,195,0.85))",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              {" "}
              {suffix}
            </span>
          )}
        </h1>

        {description && (
          <p className="text-[17px] text-white/55 max-w-2xl mx-auto leading-relaxed">{description}</p>
        )}
      </div>
    </section>
  )
}
