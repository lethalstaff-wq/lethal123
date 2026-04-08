import type { NextRequest } from "next/server"
import { updateSession } from "@/lib/supabase/middleware"

export async function proxy(request: NextRequest) {
  return await updateSession(request)
}

export const config = {
  // Skip Next internals, static assets, AND the Telegram bot API routes —
  // the bot webhook has its own secret-token check and has no Supabase
  // session to maintain, so running the Supabase middleware on it just
  // adds failure modes (e.g. 500s when Supabase env vars are missing in a
  // preview environment).
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|api/telegram|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
}
