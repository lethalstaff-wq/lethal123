import { createClient } from "@/lib/supabase/server"
import { NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get("q")

  if (!query || query.length < 2) {
    return NextResponse.json({ products: [] })
  }

  const supabase = await createClient()

  const { data: products, error } = await supabase
    .from("products")
    .select("id, name, category, product_variants(price_in_pence)")
    .ilike("name", `%${query}%`)
    .limit(5)

  if (error) {
    return NextResponse.json({ products: [] })
  }

  const formattedProducts = products.map(p => ({
    id: p.id,
    name: p.name,
    category: p.category || "Product",
    price: p.product_variants?.[0]?.price_in_pence || 0
  }))

  return NextResponse.json({ products: formattedProducts })
}
