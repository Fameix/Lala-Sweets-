import Link from "next/link"
import { SearchX } from "lucide-react"

import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export function EmptyState({
  title,
  description,
  actionHref = "/menu",
  actionLabel = "Browse menu",
}: {
  title: string
  description: string
  actionHref?: string
  actionLabel?: string
}) {
  return (
    <div className="flex min-h-72 flex-col items-center justify-center rounded-2xl border border-border bg-card px-6 py-10 text-center">
      <div className="flex size-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
        <SearchX className="size-5" />
      </div>
      <h2 className="mt-5 font-heading text-xl font-medium">{title}</h2>
      <p className="mt-2 max-w-md text-sm leading-6 text-muted-foreground">{description}</p>
      <Link href={actionHref} className={cn(buttonVariants({ variant: "outline" }), "mt-6")}>
        {actionLabel}
      </Link>
    </div>
  )
}
