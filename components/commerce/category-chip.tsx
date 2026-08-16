import Link from "next/link"

import { cn } from "@/lib/utils"

export function CategoryChip({
  href,
  label,
  active = false,
  className,
}: {
  href: string
  label: string
  active?: boolean
  className?: string
}) {
  return (
    <Link
      href={href}
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-4xl border px-4 py-2 text-sm font-medium whitespace-nowrap transition-colors",
        active
          ? "border-primary bg-primary text-primary-foreground"
          : "border-border bg-card text-foreground hover:border-primary/40 hover:bg-muted",
        className,
      )}
    >
      {label}
    </Link>
  )
}
