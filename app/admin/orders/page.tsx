import { AdminShell } from "@/components/admin-shell"
import { AdminOrdersClient } from "@/components/admin-orders"
import { getOrders } from "@/app/admin/actions"

export default async function AdminOrdersPage() {
  let orders: Awaited<ReturnType<typeof getOrders>> = []
  try {
    orders = await getOrders()
  } catch (e) {
    console.error("Failed to fetch orders:", e)
  }

  return (
    <AdminShell>
      <AdminOrdersClient orders={orders} />
    </AdminShell>
  )
}
