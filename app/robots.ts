import type { MetadataRoute } from "next"

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/api/",
          "/admin/",
          "/profile",
          "/cart",
          "/wishlist",
          "/track",
          "/auth/",
          "/checkout",
          "/dashboard",
          "/download/",
          "/downloads",
          "/login",
          "/forgot-password",
          "/reset-password",
          "/keeper",
          "/ref/",
        ],
      },
    ],
    sitemap: "https://www.lethalsolutions.me/sitemap.xml",
    host: "https://www.lethalsolutions.me",
  }
}
