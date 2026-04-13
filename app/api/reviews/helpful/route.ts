// Feature reverted — user requested reviews system be left as-is.
// This route is kept as a harmless 404 stub; safe to delete the folder.
import { NextResponse } from "next/server"
export async function POST() {
  return NextResponse.json({ error: "Not available" }, { status: 404 })
}
