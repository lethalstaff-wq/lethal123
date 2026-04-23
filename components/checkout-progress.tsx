"use client"

import { useEffect, useState } from "react"
import { usePathname } from "next/navigation"
import { useCart } from "@/lib/cart-context"

const CHECKOUT_PATHS = ["/cart", "/checkout"]

export function CheckoutProgress() {
  const pathname = usePathname()
  const { items } = useCart()
  const [visible, setVisible] = useState(false)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const isCheckoutFlow = CHECKOUT_PATHS.some((p) => pathname.startsWith(p))
    // Hide the 3-step progress indicator on /cart when the cart is empty —
    // a thin orange bar sitting at 33% reads as a broken loading indicator.
    const hideForEmptyCart = pathname === "/cart" && items.length === 0
    setVisible(isCheckoutFlow && !hideForEmptyCart)

    if (pathname === "/cart") {
      setProgress(33)
    } else if (pathname === "/checkout") {
      setProgress(66)
    } else if (pathname.includes("/checkout/success")) {
      setProgress(100)
    }
  }, [pathname, items.length])

  if (!visible) return null

  return (
    <div className="fixed top-0 left-0 right-0 z-[60] h-[3px] bg-border/20">
      <div
        className="h-full bg-gradient-to-r from-primary via-primary to-accent rounded-r-full transition-all duration-700 ease-out shadow-[0_0_10px_rgba(249, 115, 22, 0.72)]"
        style={{ width: `${progress}%` }}
      />
    </div>
  )
}
