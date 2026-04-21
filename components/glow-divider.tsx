"use client"

export function GlowDivider() {
  return (
    <div className="relative max-w-5xl mx-auto">
      <div className="h-px bg-gradient-to-r from-transparent via-white/[0.06] to-transparent relative overflow-hidden">
        <div className="absolute top-0 left-[-60%] w-[40%] h-full bg-gradient-to-r from-transparent via-[#f97316]/55 to-transparent" style={{ animation: "shimmerSlide 5s ease-in-out infinite" }} />
      </div>
      <style jsx>{`@keyframes shimmerSlide { 0%,100% { left: -40%; } 50% { left: 100%; } }`}</style>
    </div>
  )
}
