import type { MetadataRoute } from "next"
import { PRODUCTS } from "@/lib/products"

const GUIDE_SLUGS = [
  "what-is-dma",
  "second-pc-setup",
  "memory-map",
  "troubleshooting",
  "kmbox-net",
  "kmbox-b-plus",
  "system-time-sync",
  "fuser-setup",
  "dna-id",
  "flash-tools",
]

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://www.lethalsolutions.me"
  const now = new Date()

  const staticPages: MetadataRoute.Sitemap = [
    { url: baseUrl, lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: `${baseUrl}/products`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: `${baseUrl}/reviews`, lastModified: now, changeFrequency: "weekly", priority: 0.8 },
    { url: `${baseUrl}/status`, lastModified: now, changeFrequency: "daily", priority: 0.8 },
    { url: `${baseUrl}/faq`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${baseUrl}/guides`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${baseUrl}/compare`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${baseUrl}/changelog`, lastModified: now, changeFrequency: "weekly", priority: 0.6 },
    { url: `${baseUrl}/referrals`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${baseUrl}/apply`, lastModified: now, changeFrequency: "monthly", priority: 0.5 },
    { url: `${baseUrl}/track`, lastModified: now, changeFrequency: "yearly", priority: 0.5 },
    { url: `${baseUrl}/downloads`, lastModified: now, changeFrequency: "yearly", priority: 0.5 },
    { url: `${baseUrl}/terms`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
    { url: `${baseUrl}/privacy`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
  ]

  const productPages: MetadataRoute.Sitemap = PRODUCTS.map((product) => ({
    url: `${baseUrl}/products/${product.id}`,
    lastModified: now,
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }))

  const guidePages: MetadataRoute.Sitemap = GUIDE_SLUGS.map((slug) => ({
    url: `${baseUrl}/guides/${slug}`,
    lastModified: now,
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }))

  return [...staticPages, ...productPages, ...guidePages]
}
