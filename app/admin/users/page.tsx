import { AdminShell } from "@/components/admin-shell"
import { AdminUsersClient } from "@/components/admin-users"
import { getUsers } from "@/app/admin/actions"
import { createClient } from "@/lib/supabase/server"

export default async function AdminUsersPage() {
  let users: Awaited<ReturnType<typeof getUsers>> = []
  let currentUserId = ""
  try {
    users = await getUsers()
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    currentUserId = user?.id ?? ""
  } catch (e) {
    console.error("Failed to fetch users:", e)
  }

  return (
    <AdminShell>
      <AdminUsersClient users={users} currentUserId={currentUserId} />
    </AdminShell>
  )
}
