"use client"

import dynamic from "next/dynamic"

const FortuneWheelPopup = dynamic(() => import("@/components/fortune-wheel-popup").then((m) => ({ default: m.FortuneWheelPopup })), {
  ssr: false,
})
const LivePurchases = dynamic(
  () => import("@/components/live-purchases").then((m) => ({ default: m.LivePurchases })),
  { ssr: false },
)

export function ClientOverlays() {
  return (
    <>
      <FortuneWheelPopup />
      <LivePurchases />
    </>
  )
}
