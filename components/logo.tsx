import Image from "next/image"

export function Logo({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <Image
        src="/images/logo.png"
        alt="Lethal Solutions"
        width={32}
        height={32}
        className="h-8 w-8 object-contain"
        priority
      />
      <span className="text-[15px] font-semibold tracking-tight text-foreground">
        Lethal Solutions
      </span>
    </div>
  )
}
