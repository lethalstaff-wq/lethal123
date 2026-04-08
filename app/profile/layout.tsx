import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Profile | Lethal Solutions",
  description: "Manage your account, orders, licenses and settings.",
  robots: "noindex, nofollow",
}

// This page calls the Supabase browser client at component top level, which
// runs during Next.js's static prerender phase and crashes when
// NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY aren't available
// in the build environment. The page is user-specific and has no business
// being statically prerendered anyway — mark the whole segment dynamic.
export const dynamic = "force-dynamic"

export default function ProfileLayout({ children }: { children: React.ReactNode }) {
  return children
}
