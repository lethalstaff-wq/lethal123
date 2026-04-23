"use client"

import useSWR from "swr"
import { getTotalReviewCount } from "@/lib/review-counts"

const fetcher = (url: string) => fetch(url).then((r) => r.json())

// Live total that matches the number shown on /reviews. Falls back to the
// seeded constant so SSR and first paint aren't blank.
//
// Reads two SWR caches:
//  - "/api/reviews/count"  — lightweight count query fired by this hook
//  - "/api/reviews"        — the full fetch used by /reviews page
//
// If /reviews has been visited this session, its totalCount is already in
// cache and we prefer it (matches what the user actually saw on the reviews
// page). Otherwise we fall back to /api/reviews/count, then the static const.
// We also refresh every 2 min so the number keeps up with the hourly cron
// drip of new reviews.
export function useReviewCount(): number {
  const fallback = getTotalReviewCount()

  const { data: countData } = useSWR<{ totalCount: number }>(
    "/api/reviews/count",
    fetcher,
    {
      revalidateOnFocus: false,
      refreshInterval: 120_000,
      fallbackData: { totalCount: fallback },
    },
  )

  // Read-only: never trigger a fetch for the big payload from this hook.
  const { data: fullData } = useSWR<{ totalCount: number }>(
    "/api/reviews",
    null,
    { revalidateOnMount: false, revalidateIfStale: false },
  )

  const fromFull = fullData?.totalCount
  const fromCount = countData?.totalCount

  if (typeof fromFull === "number" && fromFull > 0) return fromFull
  if (typeof fromCount === "number" && fromCount > 0) return fromCount
  return fallback
}
