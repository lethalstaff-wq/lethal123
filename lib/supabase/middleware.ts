import { createServerClient } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

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
