import type { Metadata } from "next"
import { SITE_URL, DEFAULT_OG_IMAGE } from "@/lib/seo-jsonld"

export const metadata: Metadata = {
  title: "Referral Program — Earn Rewards",
  description:
    "Refer friends and earn store credit, loyalty points, and leaderboard tiers. Get rewarded every time a referral purchases.",
  keywords: ["referral program", "loyalty rewards", "affiliate"],
  alternates: { canonical: "/referrals" },
  openGraph: {
    title: "Referral Program — Earn Rewards | Lethal Solutions",
    description: "Earn store credit and loyalty tier perks for every successful referral.",
    url: `${SITE_URL}/referrals`,
    type: "website",
    siteName: "Lethal Solutions",
    images: [{ url: DEFAULT_OG_IMAGE, width: 1200, height: 630, alt: "Referral Program" }],
  },
  twitter: { card: "summary_large_image", images: [DEFAULT_OG_IMAGE] },
}

// The referrals page calls the Supabase browser client at component top level
// to check the logged-in user. That runs during Next.js's prerender phase and
// crashes when Supabase env vars aren't present in the build environment.
// Mark the segment dynamic so it renders per-request instead.
export const dynamic = "force-dynamic"

export default function ReferralsLayout({ children }: { children: React.ReactNode }) {
  return children
}
