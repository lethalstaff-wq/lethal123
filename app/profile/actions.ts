"use server"

import { createClient } from "@/lib/supabase/server"
import { createClient as createServiceClient } from "@supabase/supabase-js"
import { redirect } from "next/navigation"

function serviceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY!
  return createServiceClient(url, key, { auth: { persistSession: false } })
}

export async function updateProfilePreferences(prefs: {
  display_name?: string | null
  discord_username?: string | null
  notify_order_updates?: boolean
  notify_promotions?: boolean
  notify_renewal_reminders?: boolean
  notify_product_updates?: boolean
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Not authenticated")

  const { error } = await supabase
    .from("profiles")
    .update(prefs)
    .eq("id", user.id)

  if (error) throw new Error(error.message)
}

export async function deleteMyAccount(confirmationEmail: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Not authenticated")

  // Require typing email to confirm
  if (confirmationEmail.trim().toLowerCase() !== (user.email ?? "").toLowerCase()) {
    throw new Error("Email confirmation does not match")
  }

  // Cancel active renewal reminders so we don't email a deleted user
  await supabase
    .from("renewal_reminders")
    .update({ cancelled_at: new Date().toISOString() })
    .eq("user_email", user.email ?? "")
    .is("cancelled_at", null)

  // Admin delete — requires service role
  const admin = serviceClient()
  const { error } = await admin.auth.admin.deleteUser(user.id)
  if (error) throw new Error(error.message)

  await supabase.auth.signOut()
  redirect("/")
}
