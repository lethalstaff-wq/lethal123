import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Admin Panel",
  robots: "noindex, nofollow",
}

// Admin pages query Supabase on every request and must never be prerendered
// at build time — both because the data is live and because the service-role
// credentials may not be available in preview/build environments. Marking the
// segment force-dynamic at the layout level cascades to every page below.
export const dynamic = "force-dynamic"

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
