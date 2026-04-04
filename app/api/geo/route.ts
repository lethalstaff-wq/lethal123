import { NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  // Get IP from headers (Vercel provides these)
  const forwarded = request.headers.get("x-forwarded-for")
  const ip = forwarded ? forwarded.split(",")[0].trim() : request.headers.get("x-real-ip") || "unknown"
  
  // Get geo data from Vercel headers
  const country = request.headers.get("x-vercel-ip-country") || undefined
  const countryCode = request.headers.get("x-vercel-ip-country") || undefined
  const city = request.headers.get("x-vercel-ip-city") || undefined
  const region = request.headers.get("x-vercel-ip-country-region") || undefined
  
  // Decode city name if URL encoded
  const decodedCity = city ? decodeURIComponent(city) : undefined
  
  return NextResponse.json({
    ip,
    country,
    countryCode,
    city: decodedCity,
    region,
  })
}
