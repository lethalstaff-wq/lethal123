export function ProductCardSkeleton() {
  return (
    <div className="rounded-2xl border border-white/[0.06] bg-white/[0.015] overflow-hidden">
      <div className="h-48 bg-white/[0.025] animate-pulse" />
      <div className="p-5 space-y-3">
        <div className="h-4 w-20 bg-white/[0.04] rounded animate-pulse" />
        <div className="h-5 w-3/4 bg-white/[0.04] rounded animate-pulse" />
        <div className="h-4 w-full bg-white/[0.04] rounded animate-pulse" />
        <div className="h-6 w-16 bg-white/[0.04] rounded animate-pulse" />
      </div>
    </div>
  )
}

export function ProductGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  )
}

export function ReviewSkeleton() {
  return (
    <div className="rounded-xl border border-white/[0.06] bg-white/[0.015] p-5 space-y-3">
      <div className="flex items-center gap-3">
        <div className="h-8 w-8 rounded-full bg-white/[0.04] animate-pulse" />
        <div className="space-y-1.5 flex-1">
          <div className="h-4 w-24 bg-white/[0.04] rounded animate-pulse" />
          <div className="h-3 w-16 bg-white/[0.04] rounded animate-pulse" />
        </div>
        <div className="h-4 w-20 bg-white/[0.04] rounded animate-pulse" />
      </div>
      <div className="h-4 w-full bg-white/[0.04] rounded animate-pulse" />
      <div className="h-4 w-3/4 bg-white/[0.04] rounded animate-pulse" />
    </div>
  )
}
