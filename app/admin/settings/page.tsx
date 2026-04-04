import { AdminShell } from "@/components/admin-shell"
import { AdminSettings } from "@/components/admin-settings"
import { getSettings } from "@/app/admin/actions"
import { createClient } from "@/lib/supabase/server"

export default async function AdminSettingsPage() {
  let settings: Record<string, unknown> = {}
  let userEmail = ""
  try {
    settings = await getSettings()
    const supabase = await createClient()
    const { data: { session } } = await supabase.auth.getSession()
    userEmail = session?.user?.email ?? ""
  } catch (e) {
    console.error("Failed to fetch settings:", e)
  }

  return (
    <AdminShell>
      <AdminSettings settings={settings} userEmail={userEmail} />
    </AdminShell>
  )
}
