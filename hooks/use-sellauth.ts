"use client"

import { useCallback } from "react"

const SHOP_DOMAIN = process.env.NEXT_PUBLIC_SELLAUTH_SHOP_DOMAIN || "lethalsolutions"

export function useSellAuth() {
  const openCheckout = useCallback(
    (productId: string, options?: { quantity?: number }) => {
      // Build SellAuth checkout URL
      let url = `https://${SHOP_DOMAIN}.mysellauth.com/checkout/${productId}`

      const params = new URLSearchParams()
      if (options?.quantity && options.quantity > 1) {
        params.set("quantity", String(options.quantity))
      }

      const qs = params.toString()
      if (qs) url += `?${qs}`

      // Open in new tab
      window.open(url, "_blank", "noopener,noreferrer")
    },
    [],
  )

  return { openCheckout }
}
