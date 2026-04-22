# SEO Changes — night-redesign branch

Date: 2026-04-21. Scope: metadata, JSON-LD, sitemap/robots. No visual layout or copy changes.

## Files touched

### New files
- `lib/seo-jsonld.ts` — shared helpers: `breadcrumbListJsonLd`, `websiteJsonLd`, `organizationJsonLd`, `faqPageJsonLd`, `aggregateRatingJsonLd`, `articleJsonLd`, `collectionPageJsonLd`, `absoluteUrl`. Exports `SITE_URL`, `SITE_NAME`, `DEFAULT_OG_IMAGE`.
- `app/apply/layout.tsx` — server metadata + Careers BreadcrumbList (client page had no metadata).
- `app/cart/layout.tsx` — noindex metadata.
- `app/wishlist/layout.tsx` — noindex metadata.
- `app/forgot-password/layout.tsx` — noindex metadata.
- `app/reset-password/layout.tsx` — noindex metadata.
- `app/ref/layout.tsx` — noindex metadata for /ref/[code].
- `app/guides/[slug]/layout.tsx` — dynamic `generateMetadata` per guide slug (10 slugs mapped) + Article + BreadcrumbList JSON-LD. Fixes the fact that `app/guides/[slug]/page.tsx` is a client component and can't export metadata.

### Modified — root
- `app/layout.tsx` — expanded root metadata: richer title, 9 keywords, publisher/creator, formatDetection, applicationName, locale, `robots` object (index/follow, googleBot max-image-preview), preserved `metadataBase`. Added 6 preconnect/dns-prefetch links (Google Fonts, api.qrserver, api.coingecko, flagcdn, supabase).
- `app/sitemap.ts` — added `/stories`, `/setup`, `/media` static pages + dynamic `/stories/[slug]` entries. Removed `/track` and `/downloads` (user-specific, gated). Still enumerates every product via `PRODUCTS` and every guide via `GUIDE_SLUGS`.
- `app/robots.ts` — disallow expanded per spec: `/api/`, `/admin/`, `/profile`, `/cart`, `/wishlist`, `/track`, `/auth/`, `/checkout`, `/dashboard`, `/download/`, `/downloads`, `/login`, `/forgot-password`, `/reset-password`, `/keeper`, `/ref/`. Added `host` field.

### Modified — pages
- `app/page.tsx` — replaced inline org JSON-LD with `organizationJsonLd()` helper call + added `websiteJsonLd()` (WebSite + SearchAction targeting `/products?q=`).
- `app/products/page.tsx` — upgraded metadata to full spec (title with dash pattern, keywords, canonical, OG with absolute image, Twitter summary_large_image). Added `BreadcrumbList` + `CollectionPage` JSON-LD scripts.
- `app/products/[slug]/page.tsx` — preserved recently-fixed metadata. Added `alternates.canonical`. Product JSON-LD now uses `getProductReviewCount()` (real per-product counts: 153, 198, 207, …) instead of static 847. Added `sku`, `url`, `bestRating`, `worstRating` fields. Added `BreadcrumbList` JSON-LD. Absolute-URL hardened via `SITE_URL` constant.
- `app/privacy/page.tsx` — full metadata (canonical, OG, Twitter). Typed as `Metadata`.
- `app/terms/page.tsx` — full metadata (canonical, OG, Twitter). Typed as `Metadata`.
- `app/stories/page.tsx` — upgraded metadata, added `BreadcrumbList` JSON-LD inline.
- `app/setup/page.tsx` — upgraded metadata, added `BreadcrumbList` JSON-LD inline.
- `app/media/page.tsx` — upgraded metadata, added `BreadcrumbList` JSON-LD inline.

### Modified — segment layouts
- `app/faq/layout.tsx` — full OG/Twitter/canonical metadata + `FAQPage` JSON-LD (9 distilled Q&A from page) + `BreadcrumbList`.
- `app/reviews/layout.tsx` — full metadata + Organization-level `AggregateRating` JSON-LD (4.9 / 862 reviews matching `getTotalReviewCount()`) + `BreadcrumbList`.
- `app/compare/layout.tsx` — full metadata + `BreadcrumbList`.
- `app/guides/layout.tsx` — full metadata + `BreadcrumbList` (parent). Slug-level metadata lives in the new `[slug]/layout.tsx`.
- `app/changelog/layout.tsx` — full metadata + `BreadcrumbList`.
- `app/status/layout.tsx` — full metadata + `BreadcrumbList`.
- `app/referrals/layout.tsx` — full metadata (OG + Twitter + canonical). `dynamic = "force-dynamic"` preserved.
- `app/track/layout.tsx` — canonical + `robots: noindex,nofollow`.
- `app/downloads/layout.tsx` — canonical + `robots: noindex,nofollow`.
- `app/checkout/layout.tsx` — canonical + `robots: noindex,nofollow`.
- `app/login/layout.tsx` — canonical + `robots: noindex,nofollow`.

## What got added, as a checklist

- [x] `metadataBase: https://www.lethalsolutions.me` — confirmed.
- [x] Title template `%s | Lethal Solutions` cascades from root.
- [x] Every indexable page has: title, description (140–160 chars), keywords, OG object with absolute image, Twitter `summary_large_image`, `alternates.canonical`.
- [x] `/images/banner.png` confirmed to exist at `public/images/banner.png` and is the default OG fallback.
- [x] All OG/Twitter image URLs are absolute (`https://www.lethalsolutions.me/...`), not relative — Discord/Telegram/LinkedIn safe.
- [x] `BreadcrumbList` JSON-LD on: home (implicit via org), products, products/[slug], reviews, faq, compare, guides, guides/[slug], changelog, status, stories, setup, media, apply.
- [x] `Product` JSON-LD with correct `AggregateOffer` + realistic per-product `AggregateRating`.
- [x] `FAQPage` JSON-LD on `/faq` with 9 top Q&A.
- [x] `AggregateRating` JSON-LD on `/reviews` (organization-scoped, 4.9 / 862).
- [x] `Article` JSON-LD on `/guides/[slug]`.
- [x] `Organization` + `WebSite` (with `SearchAction`) JSON-LD on home.
- [x] `CollectionPage` JSON-LD on `/products`.
- [x] Preconnect/dns-prefetch: Google Fonts, api.qrserver.com, api.coingecko.com, flagcdn.com, supabase.co.
- [x] Robots: `/api/`, `/admin/`, `/profile`, `/cart`, `/wishlist`, `/track`, `/auth/`, `/checkout`, `/dashboard`, `/download/`, `/downloads`, `/login`, `/forgot-password`, `/reset-password`, `/keeper`, `/ref/` all disallowed. Sitemap URL declared. `host` field set.
- [x] Sitemap includes: all static indexable pages (home, products, reviews, status, faq, guides, stories, setup, media, compare, changelog, referrals, apply, terms, privacy) + all PRODUCTS + 10 guide slugs + 3 story slugs.
- [x] TypeScript check passes (`npx tsc --noEmit --skipLibCheck` — exit 0).

## Title-tag pattern adopted

Stripe/Linear/Vercel-style: `Primary — Secondary` (em-dash), with optional `| Lethal Solutions` tacked on by the root `template`. Examples:
- `Products — DMA Cheats, Spoofers & Firmware | Lethal Solutions`
- `FAQ — Payments, Setup, Delivery & Safety | Lethal Solutions`
- `Reviews — Verified Customer Feedback | Lethal Solutions`
- `Changelog — Product Updates & Patches | Lethal Solutions`
- `System Status — Live Detection & Updates | Lethal Solutions`
- `Setup Guide — Install & Play in 5 Minutes | Lethal Solutions`
- `Success Stories — Real Players, Real Comebacks | Lethal Solutions`

## Keyword policy for adversarial niche

Root keywords deliberately avoid the word "undetected" as the primary lead (kept once in description for natural recall). Leans on product/hardware terms ("DMA cheats", "HWID spoofer", "custom firmware", "Captain DMA", "KMBox") which Google, Ahrefs and Bing index cleanly without triggering safe-search demotions. Per-page keyword arrays stay 4–9 entries; no stuffing.

## JSON-LD sanity

Every JSON-LD object validates as valid JSON (the codebase round-trips through `JSON.stringify`). Every `@type` used — Organization, WebSite, SearchAction, BreadcrumbList, ListItem, CollectionPage, Product, AggregateOffer, AggregateRating, Brand, FAQPage, Question, Answer, Article, ImageObject, ContactPoint — is a real schema.org type.

## Three quick-win manual follow-ups

1. **Google Search Console + Bing Webmaster Tools**
   - Add `https://www.lethalsolutions.me` as a Domain property in GSC (DNS TXT verification). Submit `https://www.lethalsolutions.me/sitemap.xml`. Enable Email alerts for Core Web Vitals and Security issues.
   - Mirror in Bing Webmaster Tools — same sitemap, take the CSV of Search Console queries after two weeks and dump it into Bing for double-indexing.
   - Worth it: ~30 minutes total, exposes crawl-error / AggregateRating-rejection / mobile-usability issues immediately.

2. **Render `og:image` variants that match each product's real artwork**
   - Right now every page outside `/products/[slug]` falls back to `/images/banner.png`. Consider generating an OG card for `/reviews`, `/faq`, `/compare`, `/stories` via Next.js `ImageResponse` at `app/{route}/opengraph-image.tsx`. 1200×630, under 300 KB. Discord/Twitter cache aggressively, so a distinct card per page tanks CTR losses from duplicate previews. The infra is free with Next 14+ (edge runtime). Start with `/reviews` (highest-intent social share).

3. **Lock down `robots.ts` + verify canonical conflicts with SSG**
   - Once deployed, hit each noindex page (e.g. `/profile`, `/cart`, `/checkout`, `/track`) and confirm the response headers include `X-Robots-Tag: noindex` or the page renders `<meta name="robots" content="noindex">`. Pages marked `dynamic = "force-dynamic"` render the robots meta correctly; statically prerendered ones need the metadata to cascade via the layout — that's why each of those segments has a layout.tsx with explicit `robots: { index: false, follow: false }`.
   - Also: crawl the live site with Screaming Frog (free 500-URL tier) and filter for "canonical-elsewhere" / "canonical-mismatch" to catch any case where a paginated or filtered URL slips through without a self-referential canonical.
