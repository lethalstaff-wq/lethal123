import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Track Order",
  description: "Track your order status and access downloads. Enter your order ID or email to check delivery progress.",
  alternates: { canonical: "/track" },
  robots: { index: false, follow: false },
}

export default function TrackLayout({ children }: { children: React.ReactNode }) {
  return children
}
