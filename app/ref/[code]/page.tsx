"use client"

import { useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"

export default function ReferralRedirectPage() {
  const params = useParams()
  const router = useRouter()
  const code = params.code as string

  useEffect(() => {
    if (code) {
      // Store referral code in localStorage for checkout
      localStorage.setItem("referral_code", code)
      // Redirect to homepage
      router.replace("/")
    }
  }, [code, router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-black">
      <div className="text-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#f97316] mx-auto mb-4" />
        <p className="text-white/55">Applying referral code...</p>
      </div>
    </div>
  )
}
