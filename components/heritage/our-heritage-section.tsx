import { SectionShell } from "@/components/heritage/heritage-section"
import { HeritageDivider } from "@/components/heritage/heritage-divider"
import { OrganicImage } from "@/components/heritage/organic-image"
import { SITE_CONTENT_CLASS } from "@/components/layout/storefront-shell"
import { cn } from "@/lib/utils"

export function HeritageSection({
  imageSrc,
  imageAlt,
  imageCaption,
}: {
  imageSrc: string
  imageAlt: string
  imageCaption?: string
}) {
  return (
    <SectionShell tone="maroon">
      <div className={cn(SITE_CONTENT_CLASS, "grid gap-12 py-16 sm:py-20 lg:grid-cols-2 lg:items-center")}>
        <OrganicImage src={imageSrc} alt={imageAlt} shape="b" tone="dark" caption={imageCaption} className="mx-auto max-w-sm" />

        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.34em] text-accent">Our Heritage</p>
          <h2 className="mt-4 max-w-xl font-heading text-4xl font-semibold leading-tight text-primary-foreground sm:text-5xl">
            More than a sweet, every creation carries a piece of our history.
          </h2>
          <HeritageDivider className="mt-8 max-w-xs text-accent/70" />
          <div className="mt-8 max-w-xl space-y-4 text-base leading-8 text-primary-foreground/80 sm:text-lg">
            <p>
              The craft, the recipes and the dedication behind them have been carried through generations, kept
              close to how they began.
            </p>
            <p>
              It is this continuity — not just the years — that gives every box from Lala Sweets its familiar,
              trusted taste.
            </p>
          </div>
        </div>
      </div>
    </SectionShell>
  )
}
