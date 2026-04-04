import type { MetadataRoute } from "next"

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin", "/api", "/checkout", "/dashboard"],
      },
    ],
    sitemap: "https://www.lethalsolutions.me/sitemap.xml",
  }
}
