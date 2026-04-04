import { getCoupons } from "@/app/admin/actions"
import { AdminCouponsClient } from "@/components/admin-coupons"

export default async function AdminCouponsPage() {
  const coupons = await getCoupons()
  return <AdminCouponsClient coupons={coupons} />
}
