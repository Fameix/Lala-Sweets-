import { SectionShell, SectionEyebrow } from "@/components/heritage/heritage-section"
import { SITE_CONTENT_CLASS } from "@/components/layout/storefront-shell"
import { cn } from "@/lib/utils"

const foundingYear = 1882

// Rounded down to the nearest 10 so this stays accurate for a decade at a
// time (e.g. "140+" from 2022 through 2031) instead of needing a copy change
// every single year for a number nobody is counting precisely anyway.
function yearsOfTraditionLabel() {
  const years = new Date().getFullYear() - foundingYear
  const rounded = Math.floor(years / 10) * 10
  return `${rounded}+`
}

export function LegacySection() {
  return (
    <SectionShell tone="parchment">
      <div className={cn(SITE_CONTENT_CLASS, "py-16 sm:py-20")}>
        <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div>
            <SectionEyebrow>The Legacy Lives On</SectionEyebrow>
            <h2 className="mt-4 max-w-2xl font-heading text-4xl font-semibold leading-tight text-foreground sm:text-5xl">
              From 1882 to today, the journey continues.
            </h2>
            <p className="mt-6 max-w-2xl text-base leading-8 text-muted-foreground sm:text-lg">
              Generations have changed. Times have changed. But the love for authentic sweets remains.
            </p>
          </div>
          <div className="flex flex-col items-start gap-1 border-l-2 border-accent/60 pl-6 sm:items-center sm:border-l-0 sm:pl-0">
            <p className="font-heading text-6xl font-semibold leading-none text-primary sm:text-7xl">{yearsOfTraditionLabel()}</p>
            <p className="mt-2 text-xs font-semibold uppercase tracking-[0.3em] text-primary/70">Years of Tradition</p>
            <p className="mt-4 text-sm uppercase tracking-[0.24em] text-muted-foreground">Since 1882 &middot; Tirunelveli</p>
          </div>
        </div>
      </div>
    </SectionShell>
  )
}
