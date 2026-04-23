import { Spinner } from "@/components/ui/spinner"

export default function GuidesLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-transparent">
      <Spinner className="h-8 w-8 text-[#f97316]" />
    </div>
  )
}
