export function Logo({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <span className="text-2xl font-black text-primary tracking-tighter">&lt; &gt;</span>
      <span className="text-base font-semibold tracking-tight text-foreground">
        Lethal Solutions
      </span>
    </div>
  )
}
