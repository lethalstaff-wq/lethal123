const WISHLIST_KEY = "lethal_wishlist"

export function getWishlist(): string[] {
  if (typeof window === "undefined") return []
  try { return JSON.parse(localStorage.getItem(WISHLIST_KEY) || "[]") } catch { return [] }
}

export function toggleWishlist(productId: string): boolean {
  const list = getWishlist()
  const exists = list.includes(productId)
  const updated = exists ? list.filter(id => id !== productId) : [...list, productId]
  localStorage.setItem(WISHLIST_KEY, JSON.stringify(updated))
  window.dispatchEvent(new Event("wishlist-update"))
  return !exists
}

export function isInWishlist(productId: string): boolean {
  return getWishlist().includes(productId)
}
