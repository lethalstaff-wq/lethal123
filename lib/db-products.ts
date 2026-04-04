import { createClient as createServiceClient } from "@supabase/supabase-js"
import { PRODUCTS, type Product, type ProductVariant, formatPrice } from "@/lib/products"

// Re-export these for convenience
export { formatPrice, type Product, type ProductVariant }

function getDbClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) return null
  return createServiceClient(url, key)
}

export async function getProductsFromDB(): Promise<Product[]> {
  const db = getDbClient()
  if (!db) return PRODUCTS

  try {
    const { data, error } = await db
      .from("products")
      .select("*, product_variants(*)")
      .order("sort_order", { ascending: true })

    if (error || !data || data.length === 0) return PRODUCTS

    return data.map((p) => ({
      id: p.id,
      name: p.name,
      description: p.description || "",
      image: p.image || "/placeholder.svg",
      category: p.category || "cheat",
      popular: p.popular || false,
      badge: p.badge || undefined,
      sellAuthProductId: p.sell_auth_product_id || undefined,
      variants: (p.product_variants || [])
        .sort((a: { sort_order: number }, b: { sort_order: number }) => (a.sort_order || 0) - (b.sort_order || 0))
        .map((v: { id: string; name: string; price_in_pence: number; sell_auth_variant?: string }) => ({
          id: v.id,
          name: v.name,
          priceInPence: v.price_in_pence,
          sellAuthVariant: v.sell_auth_variant || undefined,
        })),
    }))
  } catch {
    return PRODUCTS
  }
}

export async function getProductByIdFromDB(id: string): Promise<Product | null> {
  const products = await getProductsFromDB()
  return products.find((p) => p.id === id) || null
}
