// Shared JSON-LD builders for Lethal Solutions.
// Every helper returns a plain object; stringify at render time inside a
// <script type="application/ld+json"> tag. Every @type is a real schema.org type.

export const SITE_URL = "https://www.lethalsolutions.me"
export const SITE_NAME = "Lethal Solutions"
export const DEFAULT_OG_IMAGE = `${SITE_URL}/images/banner.png`

export type BreadcrumbItem = { name: string; url: string }

/** BreadcrumbList — use on every significant page. `url` should be absolute. */
export function breadcrumbListJsonLd(items: BreadcrumbItem[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: item.url,
    })),
  }
}

/** WebSite with SiteSearch action — used on the home page. */
export function websiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_NAME,
    url: SITE_URL,
    potentialAction: {
      "@type": "SearchAction",
      target: `${SITE_URL}/products?q={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  }
}

/** Organization — once per site (rendered on home). */
export function organizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SITE_NAME,
    url: SITE_URL,
    logo: `${SITE_URL}/images/logo.png`,
    sameAs: [
      "https://discord.gg/lethaldma",
      "https://www.youtube.com/@ujukcheats-x4b",
      "https://t.me/lethalsolutions",
    ],
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "customer support",
      url: "https://discord.gg/lethaldma",
      availableLanguage: "English",
    },
  }
}

/** FAQPage — pass an array of {question, answer} pairs. */
export function faqPageJsonLd(items: Array<{ question: string; answer: string }>) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((q) => ({
      "@type": "Question",
      name: q.question,
      acceptedAnswer: { "@type": "Answer", text: q.answer },
    })),
  }
}

/** AggregateRating sub-object — embed inside a Product or use standalone on /reviews. */
export function aggregateRatingJsonLd(ratingValue: number, reviewCount: number) {
  return {
    "@type": "AggregateRating",
    ratingValue: ratingValue.toFixed(1),
    reviewCount: reviewCount.toString(),
    bestRating: "5",
    worstRating: "1",
  }
}

/** Article — for success stories and long-form guides. */
export function articleJsonLd(opts: {
  headline: string
  description: string
  url: string
  image?: string
  datePublished?: string
  dateModified?: string
  authorName?: string
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: opts.headline,
    description: opts.description,
    image: opts.image || DEFAULT_OG_IMAGE,
    url: opts.url,
    datePublished: opts.datePublished,
    dateModified: opts.dateModified || opts.datePublished,
    author: {
      "@type": "Organization",
      name: opts.authorName || SITE_NAME,
    },
    publisher: {
      "@type": "Organization",
      name: SITE_NAME,
      logo: { "@type": "ImageObject", url: `${SITE_URL}/images/logo.png` },
    },
  }
}

/** CollectionPage — for /products, /reviews, /guides listings. */
export function collectionPageJsonLd(opts: {
  name: string
  description: string
  url: string
}) {
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: opts.name,
    description: opts.description,
    url: opts.url,
    isPartOf: { "@type": "WebSite", name: SITE_NAME, url: SITE_URL },
  }
}

/** Absolute URL helper — forces a leading / and prepends site origin. */
export function absoluteUrl(path: string): string {
  if (path.startsWith("http")) return path
  return `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`
}
