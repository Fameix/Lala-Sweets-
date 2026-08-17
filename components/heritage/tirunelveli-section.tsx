import { MapPin } from "lucide-react"

import { SectionShell, SectionEyebrow } from "@/components/heritage/heritage-section"
import { TempleMotif } from "@/components/heritage/heritage-motif"
import { OrganicImage } from "@/components/heritage/organic-image"
import { SITE_CONTENT_CLASS } from "@/components/layout/storefront-shell"
import { cn } from "@/lib/utils"

export function TirunelveliSection({
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
      <TempleMotif className="pointer-events-none absolute -right-10 -bottom-6 hidden h-56 w-auto text-primary/[0.06] lg:block" />
      <div className={cn(SITE_CONTENT_CLASS, "relative grid gap-12 py-16 sm:py-20 lg:grid-cols-[1.05fr_0.95fr] lg:items-center")}>
        <OrganicImage src={imageSrc} alt={imageAlt} shape="a" caption={imageCaption} className="mx-auto max-w-sm lg:order-1" />

        <div className="lg:order-2">
          <SectionEyebrow>The Taste of Tirunelveli</SectionEyebrow>
          <h2 className="mt-4 max-w-xl font-heading text-4xl font-semibold leading-tight text-foreground sm:text-5xl">
            A taste that belongs to this city as much as it belongs to us.
          </h2>
          <p className="mt-6 max-w-xl text-base leading-8 text-muted-foreground sm:text-lg">
            Our signature Tirunelveli ghee halwa — made with wheat, sugar and ghee, best served hot — remains one of
            the tastes most closely tied to the city&apos;s food identity, and to ours.
          </p>
          <div className="mt-8 flex items-center gap-3 text-sm uppercase tracking-[0.26em] text-primary/70">
            <MapPin className="size-4" />
            <span>Vannarpettai, Tirunelveli</span>
          </div>
        </div>
      </div>
    </SectionShell>
  )
}
