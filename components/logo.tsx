import Image from "next/image"

export function Logo({ className = "" }: { className?: string }) {
  return (
    <div className={`group/logo flex items-center gap-2.5 ${className}`}>
      <div className="relative">
        {/* Orange glow pulse on hover */}
        <span
          aria-hidden="true"
          className="absolute inset-0 rounded-full opacity-0 group-hover/logo:opacity-100 transition-opacity duration-500"
          style={{
            background: "radial-gradient(circle, rgba(249,115,22,0.35), transparent 70%)",
            filter: "blur(10px)",
          }}
        />
        <Image
          src="/images/logo.png"
          alt="Lethal Solutions"
          width={32}
          height={32}
          className="relative h-8 w-8 object-contain transition-transform duration-500 group-hover/logo:rotate-[-6deg] group-hover/logo:scale-105"
          priority
        />
      </div>
      <span className="font-display text-[15px] font-bold tracking-tight text-white transition-colors duration-300 group-hover/logo:text-[#f97316]">
        Lethal Solutions
      </span>
    </div>
  )
}
