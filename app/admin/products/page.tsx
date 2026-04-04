import { AdminShell } from "@/components/admin-shell"
import { AdminProducts } from "@/components/admin-products"
import { getProducts } from "@/app/admin/actions"

export default async function AdminProductsPage() {
  let products: Awaited<ReturnType<typeof getProducts>> = []
  try {
    products = await getProducts()
  } catch (e) {
    console.error("Failed to fetch products:", e)
  }

  return (
    <AdminShell>
      <AdminProducts products={products} />
    </AdminShell>
  )
}
