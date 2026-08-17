import Link from "next/link"
import { ArrowRight } from "lucide-react"

import { HeritageDivider } from "@/components/heritage/heritage-divider"
import { SectionShell } from "@/components/heritage/heritage-section"
import { SITE_CONTENT_CLASS } from "@/components/layout/storefront-shell"
import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export function HeritageCTA() {
  return (
    <SectionShell tone="maroon" className="border-b-0">
      <div className={cn(SITE_CONTENT_CLASS, "py-16 text-center sm:py-24")}>
        <p className="mx-auto max-w-xl font-heading text-2xl leading-snug text-primary-foreground sm:text-3xl">
          Some tastes are enjoyed.
          <br />
          Some are remembered.
        </p>
        <HeritageDivider className="mx-auto mt-8 max-w-xs text-accent/70" />
        <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/menu"
            className={cn(buttonVariants({ variant: "default" }), "bg-accent px-6 text-accent-foreground hover:bg-accent/85")}
          >
            Explore Our Sweets
            <ArrowRight className="size-4" />
          </Link>
          <Link
            href="/legacy"
            className={cn(
              buttonVariants({ variant: "outline" }),
              "border-primary-foreground/30 bg-transparent px-6 text-primary-foreground hover:bg-primary-foreground/10",
            )}
          >
            Our Story
          </Link>
        </div>
      </div>
    </SectionShell>
  )
}
