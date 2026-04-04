export interface Product {
  id: string
  name: string
  slug: string
  description: string | null
  category: string
  image_url: string | null
  image?: string
  created_at: string
  updated_at: string
  variants?: ProductVariant[]
  sellAuthProductId?: string
}

export interface ProductVariant {
  id: string
  product_id: string
  name: string
  price: number
  duration_days: number | null
  is_lifetime: boolean
  created_at: string
  sellAuthVariant?: string
}

export interface CartItem {
  id: string
  user_id: string
  product_variant_id: string
  quantity: number
  created_at: string
  variant?: ProductVariant & { product?: Product }
}

export interface Review {
  id: string
  user_id: string | null
  product_id: string | null
  rating: number
  content: string
  author_name: string
  author_title: string
  is_featured: boolean
  created_at: string
}

export interface Order {
  id: string
  user_id: string
  status: "pending" | "paid" | "processing" | "completed" | "cancelled" | "refunded" | "confirmed"
  total: number
  payment_method: string | null
  created_at: string
  updated_at: string
  items?: OrderItem[]
}

export interface OrderItem {
  id: string
  order_id: string
  product_variant_id: string
  quantity: number
  price: number
  variant?: ProductVariant & { product?: Product }
}
