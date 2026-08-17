import { Check } from "lucide-react"

import { SectionShell, SectionEyebrow } from "@/components/heritage/heritage-section"
import { OrganicImage } from "@/components/heritage/organic-image"
import { SITE_CONTENT_CLASS } from "@/components/layout/storefront-shell"
import { cn } from "@/lib/utils"

const craftPoints = [
  "Authentic Ingredients",
  "Traditional Craftsmanship",
  "Time-tested Recipes",
  "Consistency & Quality",
  "Love for the Craft",
]

export function CraftSection({
  imageSrc,
  imageAlt,
  imageCaption,
}: {
  imageSrc: string
  imageAlt: string
  imageCaption?: string
}) {
  return (
    <SectionShell tone="ivory">
      <div className={cn(SITE_CONTENT_CLASS, "grid gap-12 py-16 sm:py-20 lg:grid-cols-2 lg:items-center")}>
        <div>
          <SectionEyebrow>The Craft Behind the Taste</SectionEyebrow>
          <h2 className="mt-4 max-w-lg font-heading text-4xl font-semibold leading-tight text-foreground sm:text-5xl">
            Every sweet begins with carefully chosen ingredients and time-honoured methods.
          </h2>
          <p className="mt-6 max-w-lg text-base leading-8 text-muted-foreground sm:text-lg">
            The patience to get every detail right is what turns an ingredient list into a Lala Sweets creation.
          </p>
          <ul className="mt-8 grid max-w-md gap-3">
            {craftPoints.map((point) => (
              <li key={point} className="flex items-center gap-3 text-sm font-medium text-foreground sm:text-base">
                <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-accent/15 text-accent-foreground">
                  <Check className="size-3.5" />
                </span>
                {point}
              </li>
            ))}
          </ul>
        </div>

        <OrganicImage src={imageSrc} alt={imageAlt} shape="c" caption={imageCaption} className="mx-auto max-w-sm" />
      </div>
    </SectionShell>
  )
}
