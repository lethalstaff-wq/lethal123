import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Wishlist",
  description: "Your saved products — ready to add to cart when you are.",
  alternates: { canonical: "/wishlist" },
  robots: { index: false, follow: false },
}

export default function WishlistLayout({ children }: { children: React.ReactNode }) {
  return children
}
