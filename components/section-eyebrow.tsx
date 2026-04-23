/**
 * Section eyebrow — small "01 / LABEL" marker above every section title.
 *
 * 5 variants drawn from real premium reference points:
 *
 *   pill        — EB1 refined (modern SaaS: Figma / Framer / Arc)
 *   display     — EB3 refined (cinematic product reveal)
 *   clean       — Apple Keynote: pure typography, no decorations
 *   editorial   — Hermès / Rolex / Porsche: thin gold line + centered caption
 *   enterprise  — Stripe / Linear / Vercel: tiny accent square + label
 *
 * Mapping below spreads them across the home page so each shows up once.
 * When a final pick is made, just set every row of DEFAULT_VARIANT_BY_NUMBER
 * to the winner — the rest of the site inherits automatically.
 */

export type EyebrowVariant =
  | "current"
  | "pill"
  | "display"
  | "clean"
  | "editorial"
  | "enterprise"

// Per-number overrides. Empty by default — every section across the whole
// site (Home, Reviews, Products, FAQ, Apply, etc.) inherits DEFAULT_VARIANT.
// Previously used for side-by-side preview; locked in now.
const DEFAULT_VARIANT_BY_NUMBER: Record<string, EyebrowVariant> = {}

// Chosen site-wide style: Apple Keynote "clean" — pure typography,
// no pills, no boxes. Orange chapter number + vertical rule + muted
// wide-tracked label. Max restraint.
const DEFAULT_VARIANT: EyebrowVariant = "clean"

type Props = { number?: string; label: string; variant?: EyebrowVariant }

export function SectionEyebrow({ number, label, variant }: Props) {
  const style: EyebrowVariant =
    variant ?? (number ? DEFAULT_VARIANT_BY_NUMBER[number] : undefined) ?? DEFAULT_VARIANT

  return (
    <div className="mb-4 select-none">
      {style === "current"    && <EyebrowCurrent    number={number} label={label} />}
      {style === "pill"       && <EyebrowPill       number={number} label={label} />}
      {style === "display"    && <EyebrowDisplay    number={number} label={label} />}
      {style === "clean"      && <EyebrowClean      number={number} label={label} />}
      {style === "editorial"  && <EyebrowEditorial  number={number} label={label} />}
      {style === "enterprise" && <EyebrowEnterprise number={number} label={label} />}
    </div>
  )
}

type InnerProps = { number?: string; label: string }

// ───────── Original (fallback) ─────────
function EyebrowCurrent({ number, label }: InnerProps) {
  return (
    <div className="flex items-center justify-center gap-4">
      <span className="h-px w-12 bg-gradient-to-r from-transparent to-[#f97316]/40" />
      <span className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.4em]">
        {number && (
          <>
            <span className="text-[#f97316] font-mono font-bold">{number}</span>
            <span className="text-white/25">/</span>
          </>
        )}
        <span className="text-white/45">{label}</span>
      </span>
      <span className="h-px w-12 bg-gradient-to-l from-transparent to-[#f97316]/40" />
    </div>
  )
}

// ═══════ EB1 · Glass Pill (refined) ═══════
// Reference: Figma, Framer, Arc browser — modern SaaS signature.
// Glass pill with backdrop-blur, pulse dot, gradient number, top highlight.
function EyebrowPill({ number, label }: InnerProps) {
  return (
    <div className="flex items-center justify-center">
      <span
        className="relative inline-flex items-center gap-2.5 px-4 py-2 rounded-full backdrop-blur-md overflow-hidden"
        style={{
          background: "linear-gradient(180deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.012) 100%)",
          boxShadow:
            "inset 0 1px 0 rgba(255,255,255,0.08), inset 0 0 0 1px rgba(255,255,255,0.07), 0 6px 20px -10px rgba(249,115,22,0.18)",
        }}
      >
        <span className="absolute top-0 left-6 right-6 h-px bg-gradient-to-r from-transparent via-[#f97316]/45 to-transparent" />
        <span className="relative flex items-center justify-center">
          <span className="absolute w-2 h-2 rounded-full bg-[#f97316]/40 animate-ping" />
          <span
            className="relative w-[6px] h-[6px] rounded-full bg-[#f97316]"
            style={{ boxShadow: "0 0 10px rgba(249,115,22,0.9)" }}
          />
        </span>
        {number && (
          <>
            <span
              className="font-display text-[11.5px] font-black tabular-nums leading-none tracking-[-0.02em]"
              style={{
                background: "linear-gradient(180deg, #ffd591 0%, #f97316 60%, #c2410c 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              {number}
            </span>
            <span className="w-px h-3 bg-white/[0.15]" />
          </>
        )}
        <span className="text-[10.5px] font-semibold uppercase tracking-[0.3em] text-white/75">
          {label}
        </span>
      </span>
    </div>
  )
}

// ═══════ EB3 · Display asymmetric (refined) ═══════
// Reference: cinematic product reveal trailers / cover pages.
// Oversize display-gradient number, vertical rule, wide-tracked caps label.
function EyebrowDisplay({ number, label }: InnerProps) {
  return (
    <div className="flex items-center justify-center gap-4">
      {number && (
        <>
          <span
            className="font-display font-black tabular-nums leading-none tracking-[-0.045em]"
            style={{
              fontSize: "27px",
              background: "linear-gradient(180deg, #ffd591 0%, #f97316 48%, #9a3412 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              filter: "drop-shadow(0 0 16px rgba(249,115,22,0.55))",
            }}
          >
            {number}
          </span>
          <span className="relative h-7 w-px">
            <span className="absolute inset-0 bg-gradient-to-b from-transparent via-[#f97316]/55 to-transparent" />
          </span>
        </>
      )}
      <span className="text-[10.5px] font-bold uppercase tracking-[0.42em] text-white/65">
        {label}
      </span>
    </div>
  )
}

// ═══════ EB NEW · Apple Keynote "clean" ═══════
// Reference: apple.com product pages, Things.app, Notion marketing.
// Pure typography. No pills, no boxes. Orange chapter number + em dash +
// extremely muted wide-tracked label. Max restraint. Looks expensive.
function EyebrowClean({ number, label }: InnerProps) {
  return (
    <div className="flex items-center justify-center gap-3">
      {number && (
        <>
          <span
            className="font-display text-[13.5px] font-bold tabular-nums leading-none tracking-[-0.015em] text-[#f97316]"
          >
            {number}
          </span>
          <span className="h-[11px] w-px bg-white/20" />
        </>
      )}
      <span className="text-[11.5px] font-medium uppercase tracking-[0.32em] text-white/55">
        {label}
      </span>
    </div>
  )
}

// ═══════ EB NEW · Hermès / Rolex "editorial" ═══════
// Reference: hermes.com, rolex.com, porsche.com editorial.
// Thin gradient hairline above, "No. NN" caption, main label below with
// extreme letter-spacing. Luxury magazine cover energy.
function EyebrowEditorial({ number, label }: InnerProps) {
  return (
    <div className="flex flex-col items-center gap-2">
      {number && (
        <span className="text-[9px] font-bold tabular-nums tracking-[0.5em] text-white/40">
          № {number}
        </span>
      )}
      <span
        className="h-px w-14"
        style={{ background: "linear-gradient(90deg, transparent, rgba(249,115,22,0.75), transparent)" }}
      />
      <span className="text-[11.5px] font-bold uppercase tracking-[0.48em] text-white/85 pl-[0.48em]">
        {label}
      </span>
    </div>
  )
}

// ═══════ EB NEW · Stripe / Linear "enterprise" ═══════
// Reference: stripe.com docs, linear.app, vercel.com.
// Small gradient accent square + number + divider + label. Professional,
// tight, confident. The eyebrow that seed-to-IPO SaaS companies use.
function EyebrowEnterprise({ number, label }: InnerProps) {
  return (
    <div className="flex items-center justify-center gap-3">
      <span
        className="relative w-[9px] h-[9px] rounded-[2px] shrink-0"
        style={{
          background: "linear-gradient(135deg, #f97316 0%, #c2410c 100%)",
          boxShadow:
            "0 3px 10px rgba(249,115,22,0.55), inset 0 1px 0 rgba(255,255,255,0.22), 0 0 0 1px rgba(249,115,22,0.25)",
        }}
      />
      {number && (
        <>
          <span className="text-[11px] font-bold tabular-nums text-[#f97316] leading-none">
            {number}
          </span>
          <span className="h-3 w-px bg-white/[0.15]" />
        </>
      )}
      <span className="text-[10.5px] font-semibold uppercase tracking-[0.28em] text-white/72">
        {label}
      </span>
    </div>
  )
}
