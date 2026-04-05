export function Logo({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <div className="flex items-center gap-0.5">
        <span className="text-2xl font-black text-primary">&lt;</span>
        <span className="text-2xl font-black text-accent">&gt;</span>
      </div>
      <span className="text-[17px] font-bold tracking-tight text-foreground">
        Lethal Solutions
      </span>
    </div>
  )
}
