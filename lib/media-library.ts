// Media library — drop entries here when the first videos are ready.
// Component handles the empty-state gracefully with an editorial "coming soon" frame.

export type MediaItem = {
  slug: string
  title: string
  description: string
  duration: string
  views: string
  uploaded: string
  src: string
  poster?: string
  accent?: [string, string]
}

export const MEDIA_LIBRARY: MediaItem[] = []

export function findMediaBySlug(slug: string | null | undefined): MediaItem | undefined {
  if (!slug) return undefined
  return MEDIA_LIBRARY.find((m) => m.slug === slug)
}
