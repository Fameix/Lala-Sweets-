import { cn } from "@/lib/utils"

export function HeritageDivider({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center gap-3 text-primary/50", className)} aria-hidden="true">
      <span className="h-px flex-1 max-w-16 bg-current/40" />
      <svg width="22" height="14" viewBox="0 0 22 14" fill="none" className="shrink-0">
        <path d="M11 1L13.5 6.5L19.5 7L13.5 7.5L11 13L8.5 7.5L2.5 7L8.5 6.5L11 1Z" fill="currentColor" fillOpacity="0.7" />
        <circle cx="2" cy="7" r="1" fill="currentColor" fillOpacity="0.5" />
        <circle cx="20" cy="7" r="1" fill="currentColor" fillOpacity="0.5" />
      </svg>
      <span className="h-px flex-1 max-w-16 bg-current/40" />
    </div>
  )
}
