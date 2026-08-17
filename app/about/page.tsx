import { StorefrontShell, SITE_CONTENT_CLASS } from "@/components/layout/storefront-shell"
import { cn } from "@/lib/utils"

import { CraftSection } from "@/components/heritage/craft-section"
import { HeritageCTA } from "@/components/heritage/heritage-cta"
import { HeritageHero } from "@/components/heritage/heritage-hero"
import { SectionShell, SectionEyebrow } from "@/components/heritage/heritage-section"
import { HeritageTimeline, type HeritageTimelineEntry } from "@/components/heritage/heritage-timeline"
import { HeritageSection as OurHeritageSection } from "@/components/heritage/our-heritage-section"
import { LegacySection } from "@/components/heritage/legacy-section"
import { StorySection } from "@/components/heritage/story-section"
import { TirunelveliSection } from "@/components/heritage/tirunelveli-section"

const timelineEntries: HeritageTimelineEntry[] = [
  { year: "1882", title: "The Beginning", text: "A humble beginning in Tirunelveli by Late Jagan Singh Lala." },
  { year: "", title: "The Early Years", text: "The tradition took root and the love for authentic sweets grew." },
  { year: "", title: "Generations of Craft", text: "Passed down with pride, strengthened by values and perfected with time." },
  { year: "", title: "A Legacy Continues", text: "Evolving with the times, while holding on to our timeless taste." },
  { year: "", title: "Today", text: "Still crafting happiness every day, rooted in Tirunelveli." },
]

export default function AboutPage() {
  return (
    <StorefrontShell transparentHeader>
      <main className="bg-background text-foreground">
        <HeritageHero
          imageSrc="/images/our-story-banner.png"
          imageAlt="Sri Lakshmivilas Purathana Lala Sweets storefront"
        />

        <StorySection />

        <OurHeritageSection
          imageSrc="/images/tirunelveli-ghee-halwa.png"
          imageAlt="Traditional sweets carrying the Lala Sweets heritage"
          imageCaption="Every creation carries our history"
        />

        <CraftSection
          imageSrc="/images/lala-sweets-storefront-banner.png"
          imageAlt="Traditional preparation behind Lala Sweets"
          imageCaption="Time-honoured methods, unchanged"
        />

        <SectionShell tone="parchment">
          <div className={cn(SITE_CONTENT_CLASS, "py-16 sm:py-20")}>
            <div className="text-center">
              <SectionEyebrow>1882 &rarr; Today</SectionEyebrow>
              <h2 className="mt-4 font-heading text-4xl font-semibold leading-tight text-foreground sm:text-5xl">
                Our Journey Through Time
              </h2>
            </div>
            <div className="mt-16">
              <HeritageTimeline entries={timelineEntries} />
            </div>
          </div>
        </SectionShell>

        <TirunelveliSection
          imageSrc="/images/tirunelveli-ghee-halwa.png"
          imageAlt="Tirunelveli ghee halwa, the signature sweet"
          imageCaption="Our signature halwa"
        />

        <LegacySection />

        <HeritageCTA />
      </main>
    </StorefrontShell>
  )
}
