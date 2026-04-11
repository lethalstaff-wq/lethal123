"use client"

import { useState, useEffect } from "react"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { useCart } from "@/lib/cart-context"
import { getWishlist, toggleWishlist } from "@/lib/wishlist"
import { PRODUCTS, formatPrice } from "@/lib/products"
import { Heart, ShoppingCart, ArrowRight, Trash2, Zap } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { toast } from "sonner"

export default function WishlistPage() {
  const [wishlistIds, setWishlistIds] = useState<string[]>([])
  const { addItem } = useCart()

  useEffect(() => {
    setWishlistIds(getWishlist())
    const handler = () => setWishlistIds(getWishlist())
    window.addEventListener("wishlist-update", handler)
    return () => window.removeEventListener("wishlist-update", handler)
  }, [])

  const products = wishlistIds
    .map(id => PRODUCTS.find(p => p.id === id))
    .filter(Boolean) as typeof PRODUCTS

  const handleAddToCart = (product: typeof PRODUCTS[number]) => {
    const variant = product.variants[0]
    addItem({
      id: variant.id,
      name: variant.name,
      price: variant.priceInPence / 100,
      product_id: product.id,
      is_lifetime: variant.name.toLowerCase().includes("lifetime"),
      duration_days: null,
      created_at: "",
      product: {
        id: product.id,
        name: product.name,
        slug: product.id,
        description: product.description,
        category: product.category,
        image_url: product.image,
        image: product.image,
        created_at: "",
        updated_at: "",
      },
    })
    toast.success(`${product.name} added to cart`)
  }

  const handleRemove = (productId: string) => {
    toggleWishlist(productId)
    setWishlistIds(getWishlist())
  }

  if (products.length === 0) {
    return (
      <main className="flex min-h-screen flex-col bg-black">
        <Navbar />
        <section className="flex-1 py-32 px-4 sm:px-6 lg:px-8">
          <div className="container mx-auto max-w-md text-center">
            <div className="w-20 h-20 rounded-2xl bg-white/[0.04] flex items-center justify-center mx-auto mb-6">
              <Heart className="h-10 w-10 text-white/20" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-3">Your wishlist is empty</h1>
            <p className="text-white/40 mb-8 text-sm">Browse our products and save the ones you like.</p>
            <Link href="/products">
              <button className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-[#f97316] to-[#ea580c] text-white font-medium hover:opacity-90 transition-opacity mx-auto">
                Browse Products
                <ArrowRight className="h-4 w-4" />
              </button>
            </Link>
          </div>
        </section>
        <Footer />
      </main>
    )
  }

  return (
    <main className="flex min-h-screen flex-col bg-black">
      <Navbar />
      <section className="flex-1 py-20 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto max-w-5xl">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white"><span className="text-[#f97316]">Wishlist</span></h1>
            <p className="text-sm text-white/40 mt-1">{products.length} saved {products.length === 1 ? "item" : "items"}</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {products.map((product) => {
              const minPrice = Math.min(...product.variants.map(v => v.priceInPence))
              return (
                <div key={product.id} className="rounded-2xl border border-white/[0.04] bg-white/[0.012] overflow-hidden group">
                  <Link href={`/products/${product.id}`}>
                    <div className="relative aspect-[4/3] bg-gradient-to-b from-white/[0.02] to-transparent flex items-center justify-center p-6">
                      <Image src={product.image} alt={product.name} width={200} height={200} className="object-contain max-h-[140px] w-auto group-hover:scale-105 transition-transform" />
                    </div>
                  </Link>
                  <div className="p-4 border-t border-white/[0.03] space-y-3">
                    <div>
                      <Link href={`/products/${product.id}`} className="font-bold text-sm text-white hover:text-[#f97316] transition-colors">{product.name}</Link>
                      <p className="text-xs text-white/40 mt-0.5 line-clamp-1">{product.description}</p>
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="text-lg font-bold text-[#f97316]">{formatPrice(minPrice)}</p>
                      <div className="flex items-center gap-2">
                        <button onClick={() => handleRemove(product.id)} className="p-2 rounded-lg text-white/40 hover:text-red-400 hover:bg-red-400/10 transition-all">
                          <Trash2 className="h-4 w-4" />
                        </button>
                        <button onClick={() => handleAddToCart(product)} className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-[#f97316]/10 text-[#f97316] text-xs font-semibold hover:bg-[#f97316] hover:text-white transition-all">
                          <ShoppingCart className="h-3.5 w-3.5" />
                          Add to Cart
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>
      <Footer />
    </main>
  )
}
