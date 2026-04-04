import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Login | Lethal Solutions",
  description: "Sign in to your account or create a new one to manage your purchases and licenses.",
}

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return children
}
