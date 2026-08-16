import Link from "next/link"

import { StorefrontShell } from "@/components/layout/storefront-shell"
import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export function SimplePage({
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
    <StorefrontShell>
      <main className="mx-auto flex min-h-[55svh] max-w-3xl flex-col justify-center px-5 py-12 sm:px-10 lg:px-20">
        <h1 className="font-heading text-3xl font-medium leading-tight sm:text-4xl">{title}</h1>
        <p className="mt-4 max-w-2xl leading-7 text-muted-foreground sm:text-lg">{description}</p>
        <Link href={actionHref} className={cn(buttonVariants({ variant: "outline" }), "mt-7 w-fit")}>
          {actionLabel}
        </Link>
      </main>
    </StorefrontShell>
  )
}
