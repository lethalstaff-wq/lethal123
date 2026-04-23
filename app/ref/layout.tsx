import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Referral",
  description: "Redeem your referral code and get started.",
  robots: { index: false, follow: false },
}

export default function RefLayout({ children }: { children: React.ReactNode }) {
  return children
}
