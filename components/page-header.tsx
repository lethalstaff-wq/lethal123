// Shared page header — eyebrow + scan-line + gradient H1 + sub.
// Use on every content page for visual consistency with Home/Apply hero.
import type { LucideIcon } from "lucide-react"
import { SectionEyebrow } from "@/components/section-eyebrow"

interface PageHeaderProps {
  /** Eyebrow label — accepts "pill" prop name for backward compat */
  pill: string
  /** Deprecated: retained for backward compat with existing call sites */
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

export function PageHeader({ pill, prefix, accent, suffix, description, paddingTop = "pt-36" }: PageHeaderProps) {
  return (
    <section className={`relative ${paddingTop} pb-16 px-6 sm:px-10 z-10`}>
      <div className="max-w-5xl mx-auto text-center">
        <SectionEyebrow label={pill} />

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
              filter: "drop-shadow(0 0 50px rgba(249, 115, 22, 0.43))",
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
