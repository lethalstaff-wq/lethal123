import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Reviews | Lethal Solutions",
  description:
    "Read verified customer reviews of our premium gaming solutions. 4.9/5 average rating from 2,000+ customers.",
}

export default function ReviewsLayout({ children }: { children: React.ReactNode }) {
  return children
}
