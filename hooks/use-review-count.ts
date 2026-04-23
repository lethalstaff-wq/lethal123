"use client"

import useSWR from "swr"
import { getTotalReviewCount } from "@/lib/review-counts"

const fetcher = (url: string) => fetch(url).then(r => r.json())

// Live total that matches the number shown on /reviews. Falls back to the
// seeded constant so SSR and first paint aren't blank.
export function useReviewCount(): number {
  const fallback = getTotalReviewCount()
  const { data } = useSWR<{ totalCount: number }>("/api/reviews/count", fetcher, {
    revalidateOnFocus: false,
    fallbackData: { totalCount: fallback },
  })
  const n = data?.totalCount
  return typeof n === "number" && n > 0 ? n : fallback
}
