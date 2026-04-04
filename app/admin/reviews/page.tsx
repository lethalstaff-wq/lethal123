import { AdminShell } from "@/components/admin-shell"
import { AdminReviews } from "@/components/admin-reviews"
import { getReviews, getProducts } from "@/app/admin/actions"

export default async function AdminReviewsPage() {
  let reviews: any[] = []
  let totalCount = 0
  let products: any[] = []

  try {
    const [reviewsData, productsData] = await Promise.all([getReviews(), getProducts()])
    reviews = reviewsData.reviews
    totalCount = reviewsData.totalCount
    products = productsData
  } catch (e) {
    console.error("Failed to fetch reviews:", e)
  }

  return (
    <AdminShell>
      <AdminReviews
        reviews={reviews}
        totalCount={totalCount}
        products={products.map(p => ({ id: p.id, name: p.name }))}
      />
    </AdminShell>
  )
}
