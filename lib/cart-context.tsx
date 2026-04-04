"use client"

import { createContext, useContext, useState, useEffect, useMemo, type ReactNode } from "react"
import type { ProductVariant, Product } from "@/lib/types"

interface CartItemWithDetails {
  variant: ProductVariant & { product?: Product }
  quantity: number
}

interface CartContextType {
  items: CartItemWithDetails[]
  addItem: (variant: ProductVariant & { product?: Product }, quantity?: number) => void
  removeItem: (variantId: string) => void
  updateQuantity: (variantId: string, quantity: number) => void
  clearCart: () => void
  itemCount: number
  total: number
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItemWithDetails[]>([])

  // Load cart from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem("cart")
    if (saved) {
      try {
        setItems(JSON.parse(saved))
      } catch {
        localStorage.removeItem("cart")
      }
    }
  }, [])

  // Save cart to localStorage on change
  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(items))
  }, [items])

  const MAX_QUANTITY = 10

  const addItem = (variant: ProductVariant & { product?: Product }, quantity = 1) => {
    setItems((prev) => {
      const existing = prev.find((item) => item.variant.id === variant.id)
      if (existing) {
        return prev.map((item) =>
          item.variant.id === variant.id ? { ...item, quantity: Math.min(item.quantity + quantity, MAX_QUANTITY) } : item,
        )
      }
      return [...prev, { variant, quantity: Math.min(quantity, MAX_QUANTITY) }]
    })
  }

  const removeItem = (variantId: string) => {
    setItems((prev) => prev.filter((item) => item.variant.id !== variantId))
  }

  const updateQuantity = (variantId: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(variantId)
      return
    }
    setItems((prev) => prev.map((item) => (item.variant.id === variantId ? { ...item, quantity } : item)))
  }

  const clearCart = () => setItems([])

  const itemCount = useMemo(() => items.reduce((sum, item) => sum + item.quantity, 0), [items])
  const total = useMemo(() => items.reduce((sum, item) => sum + item.variant.price * item.quantity, 0), [items])

  return (
    <CartContext.Provider value={{ items, addItem, removeItem, updateQuantity, clearCart, itemCount, total }}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error("useCart must be used within a CartProvider")
  }
  return context
}
