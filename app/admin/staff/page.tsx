import { AdminShell } from "@/components/admin-shell"
import { AdminStaffApplications } from "@/components/admin-staff-applications"
import { getStaffApplications } from "@/app/admin/actions"

export default async function AdminStaffPage() {
  let applications: Awaited<ReturnType<typeof getStaffApplications>> = []
  try {
    applications = await getStaffApplications()
  } catch {
    // Table might not exist yet — show empty state
  }
  return (
    <AdminShell>
      <AdminStaffApplications applications={applications} />
    </AdminShell>
  )
}
