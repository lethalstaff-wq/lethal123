import { Loader2 } from "lucide-react"

export default function DownloadsLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-transparent">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-[#f97316]" />
        <p className="text-sm text-white/55">Loading downloads...</p>
      </div>
    </div>
  )
}
