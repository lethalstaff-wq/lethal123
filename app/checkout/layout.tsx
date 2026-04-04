import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Checkout | Lethal Solutions",
  description: "Complete your purchase securely with PayPal or cryptocurrency payment options.",
}

export default function CheckoutLayout({ children }: { children: React.ReactNode }) {
  return children
}
