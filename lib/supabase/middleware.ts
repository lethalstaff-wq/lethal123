import { createServerClient } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"

import { notifyVisitor } from "@/lib/telegram/notify"

const VISITOR_COOKIE = "ls_visitor"
const VISITOR_COOKIE_MAX_AGE = 60 * 60 * 24 * 30 // 30 days

// Decide whether the request should generate a visitor notification.
// Skip API calls, sub-resources, and known bot user agents — we only care
// about real human page visits to top-level pages.
function shouldNotifyVisitor(request: NextRequest): boolean {
  const path = request.nextUrl.pathname
  if (path.startsWith("/api/")) return false
  if (path.startsWith("/_next/")) return false
  if (path.startsWith("/admin")) return false // admin areas are us
  // Static-looking extensions
  if (/\.(svg|png|jpg|jpeg|gif|webp|ico|css|js|woff2?|ttf|map|json|xml|txt)$/i.test(path)) {
    return false
  }
  const ua = request.headers.get("user-agent") || ""
  if (!ua) return false
  if (/bot|crawler|spider|preview|headless|monitor|fetch|axios|curl|wget/i.test(ua)) {
    return false
  }
  return true
}

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  // Fire a one-shot Telegram notification per browser session, before
  // any auth/redirect logic so we still capture visitors who get bounced.
  if (shouldNotifyVisitor(request) && !request.cookies.get(VISITOR_COOKIE)) {
    notifyVisitor({
      path: request.nextUrl.pathname + (request.nextUrl.search || ""),
      ipAddress:
        request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
        request.headers.get("x-real-ip") ||
        undefined,
      country: request.headers.get("x-vercel-ip-country") || undefined,
      countryCode: request.headers.get("x-vercel-ip-country") || undefined,
      city: request.headers.get("x-vercel-ip-city") || undefined,
      region: request.headers.get("x-vercel-ip-country-region") || undefined,
      userAgent: request.headers.get("user-agent") || undefined,
      referrer: request.headers.get("referer") || undefined,
    }).catch((e) => console.error("[telegram/notify] visitor failed:", e))

    supabaseResponse.cookies.set(VISITOR_COOKIE, "1", {
      maxAge: VISITOR_COOKIE_MAX_AGE,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      httpOnly: true,
      path: "/",
    })
  }

  // Preview deployments may not have Supabase env vars configured; in that
  // case just pass the request through untouched rather than crashing the
  // whole middleware with 'Your project URL and API key are required'.
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!supabaseUrl || !supabaseAnonKey) {
    return supabaseResponse
  }

  const supabase = createServerClient(
    supabaseUrl,
    supabaseAnonKey,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, {
              ...options,
              maxAge: 60 * 60 * 24 * 365, // 1 year cookie lifetime
              sameSite: "lax",
              secure: process.env.NODE_ENV === "production",
            }),
          )
        },
      },
    },
  )

  // IMPORTANT: We call getUser() to refresh the JWT token automatically.
  // If the access token expired, supabase-ssr will use the refresh token
  // to get a new one and call setAll() to update the cookies.
  // We wrap in try-catch so network failures don't kill the session.
  let user = null
  try {
    const { data, error } = await supabase.auth.getUser()
    if (!error && data?.user) {
      user = data.user
    }
  } catch {
    // Network failure - try reading from cookie as fallback
    // This means the session might be stale but user isn't kicked
    try {
      const { data: { session } } = await supabase.auth.getSession()
      user = session?.user ?? null
    } catch {
      // Total auth failure - still don't kick on public routes
    }
  }

  const pathname = request.nextUrl.pathname
  const isAdminLogin = pathname === "/admin/login"
  const isAdmin = pathname.startsWith("/admin") && !isAdminLogin
  const isDashboard = pathname.startsWith("/dashboard")

  // Only redirect on protected routes when definitely no session
  if ((isDashboard || isAdmin) && !user) {
    const url = request.nextUrl.clone()
    url.pathname = isAdmin ? "/admin/login" : "/login"
    return NextResponse.redirect(url)
  }

  // Already logged-in admin visiting /admin/login -> send to dashboard
  if (isAdminLogin && user) {
    const adminEmail = process.env.ADMIN_EMAIL
    if (adminEmail && user.email === adminEmail) {
      const url = request.nextUrl.clone()
      url.pathname = "/admin"
      return NextResponse.redirect(url)
    }
  }

  // Non-admin on admin routes -> redirect home
  if (isAdmin && user) {
    const adminEmail = process.env.ADMIN_EMAIL
    if (adminEmail && user.email !== adminEmail) {
      const url = request.nextUrl.clone()
      url.pathname = "/"
      return NextResponse.redirect(url)
    }
  }

  return supabaseResponse
}
