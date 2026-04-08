import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Referral Program | Lethal Solutions",
  description: "Earn rewards by referring friends. Get discounts on every successful referral through the Lethal Solutions referral program.",
}

// The referrals page calls the Supabase browser client at component top level
// to check the logged-in user. That runs during Next.js's prerender phase and
// crashes when Supabase env vars aren't present in the build environment.
// Mark the segment dynamic so it renders per-request instead.
export const dynamic = "force-dynamic"

export default function ReferralsLayout({ children }: { children: React.ReactNode }) {
  return children
}
