/**
 * Cinematic section eyebrow — small "01 / LABEL" or just "— LABEL —" line.
 * Renders two side divider lines and a centered label. When `number` is
 * omitted, the label stands alone between the lines (used on pages with a
 * single hero section where numbering makes no sense).
 */
export function SectionEyebrow({ number, label }: { number?: string; label: string }) {
  return (
    <div className="flex items-center justify-center gap-4 mb-4 select-none">
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
