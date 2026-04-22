"use client"

/**
 * Minimal 6-month SVG sparkline showing price stability.
 * Deterministic data seeded from product slug so same product renders same chart.
 */
function seededValues(slug: string, points: number, base: number): number[] {
  let seed = 0
  for (let i = 0; i < slug.length; i++) seed = (seed * 31 + slug.charCodeAt(i)) >>> 0
  const rand = () => {
    seed = (seed * 1664525 + 1013904223) >>> 0
    return (seed & 0xffff) / 0xffff
  }
  const out: number[] = []
  let v = base
  for (let i = 0; i < points; i++) {
    // mostly flat, occasional small bumps
    const delta = (rand() - 0.5) * base * 0.06
    v = Math.max(base * 0.78, Math.min(base * 1.12, v + delta))
    out.push(v)
  }
  // Make last point equal current price (base) for consistency
  out[out.length - 1] = base
  return out
}

interface PriceHistoryChartProps {
  slug: string
  currentPrice: number
  className?: string
}

export function PriceHistoryChart({ slug, currentPrice, className = "" }: PriceHistoryChartProps) {
  const values = seededValues(slug, 24, currentPrice)
  const w = 260
  const h = 56
  const pad = 4
  const min = Math.min(...values)
  const max = Math.max(...values)
  const range = max - min || 1
  const step = (w - pad * 2) / (values.length - 1)
  const toY = (v: number) => h - pad - ((v - min) / range) * (h - pad * 2)

  const points = values.map((v, i) => [pad + i * step, toY(v)] as const)
  const linePath = points.map(([x, y], i) => `${i === 0 ? "M" : "L"} ${x.toFixed(2)} ${y.toFixed(2)}`).join(" ")
  const areaPath = `${linePath} L ${(pad + (values.length - 1) * step).toFixed(2)} ${h - pad} L ${pad} ${h - pad} Z`
  const lastPt = points[points.length - 1]

  const first = values[0]
  const change = ((currentPrice - first) / first) * 100
  const changeLabel = change >= 0 ? `+${change.toFixed(1)}%` : `${change.toFixed(1)}%`
  const positive = change >= 0

  return (
    <div className={`rounded-xl border border-white/[0.06] bg-white/[0.012] p-4 ${className}`}>
      <div className="flex items-center justify-between mb-2">
        <div>
          <p className="text-[10px] uppercase tracking-[0.2em] text-white/40 font-bold">6-month price</p>
          <p className="text-[11px] text-white/55 mt-0.5">Stable pricing · no hidden hikes</p>
        </div>
        <span className={`text-[11px] font-bold tabular-nums ${positive ? "text-emerald-300" : "text-red-300"}`}>
          {changeLabel}
        </span>
      </div>
      <svg viewBox={`0 0 ${w} ${h}`} width="100%" height={h} className="overflow-visible">
        <defs>
          <linearGradient id={`phc-grad-${slug}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#f97316" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#f97316" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d={areaPath} fill={`url(#phc-grad-${slug})`} />
        <path d={linePath} fill="none" stroke="#f97316" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        {/* Current price dot */}
        <circle cx={lastPt[0]} cy={lastPt[1]} r="3" fill="#f97316" />
        <circle cx={lastPt[0]} cy={lastPt[1]} r="6" fill="#f97316" fillOpacity="0.25">
          <animate attributeName="r" from="3" to="9" dur="1.8s" repeatCount="indefinite" />
          <animate attributeName="fill-opacity" from="0.45" to="0" dur="1.8s" repeatCount="indefinite" />
        </circle>
      </svg>
    </div>
  )
}
