import { UserRound } from "lucide-react"

import { SectionShell, SectionEyebrow } from "@/components/heritage/heritage-section"
import { PillarMotif } from "@/components/heritage/heritage-motif"
import { SITE_CONTENT_CLASS } from "@/components/layout/storefront-shell"
import { cn } from "@/lib/utils"

const storyParagraphs = [
  "Thirteen decades ago, in the heart of Tirunelveli, a culinary journey began.",
  "Late Jagan Singh Lala, with a vision and a passion for crafting the finest sweets, laid the foundation of what would become a timeless tradition.",
  "Thus, Sri Lakshmivilas Purathana Lala Sweets began its journey in 1882 — and the name has stayed part of Tirunelveli's everyday life ever since.",
]

export function StorySection() {
  return (
    <SectionShell tone="ivory">
      <div className={cn(SITE_CONTENT_CLASS, "grid gap-10 py-16 sm:py-20 lg:grid-cols-[0.55fr_1fr_0.75fr] lg:items-start")}>
        <PillarMotif className="mx-auto hidden h-72 w-auto lg:mx-0 lg:block" />

        <div>
          <SectionEyebrow>Our Culinary Saga</SectionEyebrow>
          <h2 className="mt-4 font-heading text-4xl font-semibold leading-tight text-foreground sm:text-5xl">The Story</h2>
          <div className="mt-8 space-y-6">
            {storyParagraphs.map((paragraph, index) => (
              <p key={index} className="border-l-2 border-accent/50 pl-5 text-sm leading-7 text-muted-foreground sm:text-base">
                {paragraph}
              </p>
            ))}
          </div>
        </div>

        {/* No verified photograph of the founder exists in the project's
            assets - a clearly labelled placeholder is used instead of
            inventing a historical portrait. */}
        <div className="mx-auto flex aspect-[4/5] w-full max-w-[15rem] flex-col items-center justify-center gap-3 rounded-[63%_37%_54%_46%/43%_37%_63%_57%] border border-dashed border-primary/25 bg-primary/5 text-center">
          <UserRound className="size-10 text-primary/40" aria-hidden="true" />
          <p className="px-6 text-xs font-medium uppercase tracking-[0.18em] text-primary/50">
            Founder portrait
            <br />
            to be added
          </p>
        </div>
      </div>
    </SectionShell>
  )
}
