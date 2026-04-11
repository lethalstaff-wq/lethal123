import { Loader2 } from "lucide-react"

export default function DownloadsLoading() {
  return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">Loading downloads...</p>
      </div>
    </div>
  )
}
