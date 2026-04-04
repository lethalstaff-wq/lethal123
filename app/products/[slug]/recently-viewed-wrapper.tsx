"use client"

import { useEffect } from "react"
import { RecentlyViewed, trackProductView } from "@/components/recently-viewed"

export function RecentlyViewedWrapper({ productId }: { productId: string }) {
  useEffect(() => {
    trackProductView(productId)
  }, [productId])

  return <RecentlyViewed currentProductId={productId} />
}
