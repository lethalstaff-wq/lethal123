import type { Metadata } from "next"
import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"

export const metadata: Metadata = {
  title: "Admin Panel",
  robots: "noindex, nofollow",
}

// Admin pages query Supabase on every request and must never be prerendered
// at build time — both because the data is live and because the service-role
// credentials may not be available in preview/build environments. Marking the
// segment force-dynamic at the layout level cascades to every page below.
export const dynamic = "force-dynamic"

// RBAC guard — only logged-in users whose profile has is_admin=true reach
// /admin/*. Unauthed visitors go to /admin/login. Authed non-admins get
// redirected home (not to login — avoids redirect loop and leaking that
// admin exists to random signups).
export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect("/admin/login")

  const { data: profile } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", user.id)
    .single()

  if (!profile?.is_admin) redirect("/")

  return <>{children}</>
}
