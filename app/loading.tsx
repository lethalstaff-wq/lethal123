export default function Loading() {
  return (
    <div className="fixed inset-0 z-[9999] bg-black flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="relative w-12 h-12">
          <div className="absolute inset-0 rounded-full border-2 border-[#f97316]/20" />
          <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-[#f97316] animate-spin" />
        </div>
        <span className="text-sm text-white/55 font-medium tracking-[0.18em] uppercase">Loading</span>
      </div>
    </div>
  )
}
