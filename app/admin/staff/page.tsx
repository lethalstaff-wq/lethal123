import { AdminShell } from "@/components/admin-shell"
import { AdminStaffApplications } from "@/components/admin-staff-applications"
import { getStaffApplications } from "@/app/admin/actions"

export default async function AdminStaffPage() {
  const applications = await getStaffApplications()
  return (
    <AdminShell>
      <AdminStaffApplications applications={applications} />
    </AdminShell>
  )
}
