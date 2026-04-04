export function Logo({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className="flex items-center gap-0.5">
        <span className="text-xl font-black text-primary">&lt;</span>
        <span className="text-xl font-black text-accent">&gt;</span>
      </div>
      <span className="text-[15px] font-semibold tracking-tight text-foreground">
        Lethal Solutions
      </span>
    </div>
  )
}
