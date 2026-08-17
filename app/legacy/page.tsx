import Image from "next/image"
import Link from "next/link"

import { ArrowRight, Clock3, Wheat } from "lucide-react"

import { StorefrontShell, SITE_CONTENT_CLASS } from "@/components/layout/storefront-shell"
import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"

import { HeritageDivider } from "@/components/heritage/heritage-divider"
import { SectionShell, SectionEyebrow } from "@/components/heritage/heritage-section"
import { HeritageTimeline } from "@/components/heritage/heritage-timeline"
import { ImageStoryBlock } from "@/components/heritage/image-story-block"

const traditionPoints = [
  { title: "Traditional taste", text: "The same familiar flavour profile continues to define the brand's public identity." },
  { title: "Authentic flavours", text: "The legacy is tied to recognisable sweets and the taste people expect from the name." },
  { title: "Quality ingredients", text: "The verified signature halwa ingredients are wheat, sugar and ghee." },
  { title: "Craftsmanship", text: "Traditional preparation and careful handling remain central to the experience." },
]

const trustPoints = ["Celebrations", "Journeys", "Gifting", "Memories"]

const timelineEntries = [
  { year: "1882", title: "A Tradition Takes Root", text: "Late Jagan Singh Lala founds the business in Tirunelveli." },
  { year: "Generations", title: "Craft Carried Forward", text: "Recipes, values and quality are passed down and kept steady." },
  { year: "Today", title: "The Tradition Continues", text: "A dependable, recognisable Tirunelveli sweet house." },
]

export default function LegacyPage() {
  return (
    <StorefrontShell transparentHeader>
      <main className="bg-background text-foreground">
        {/* Hero - full-bleed banner matching the homepage hero */}
        <section className="relative min-h-svh overflow-hidden border-b border-border bg-primary text-[#3a170a]">
          <Image
            src="/images/our-legacy-banner.png"
            alt="Heritage storefront visual"
            fill
            priority
            sizes="100vw"
            className="object-cover object-[70%_center] sm:object-[64%_center]"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#f8e1aa]/90 via-[#f4d99c]/52 to-transparent sm:from-[#f8e1aa]/78 sm:via-[#f4d99c]/28" />
          <div className={cn(SITE_CONTENT_CLASS, "relative flex min-h-svh items-center py-20")}>
            <div className="max-w-xl">
              <p className="font-heading text-[10px] font-bold uppercase tracking-[0.34em] text-[#a95c12] sm:text-xs">Since 1882</p>
              <h1 className="mt-4 max-w-[12ch] font-heading text-4xl font-semibold leading-[1.05] text-[#331208] sm:max-w-xl sm:text-5xl lg:text-6xl">
                A Legacy Preserved Through Generations
              </h1>
              <p className="mt-4 max-w-md text-sm leading-6 text-[#4a2410] sm:text-base">
                Since 1882, Sri Lakshmivilas Purathana Lala Sweets has carried forward more than a recipe &mdash; it
                has preserved a tradition.
              </p>
            </div>
          </div>
        </section>

        {/* Tradition points */}
        <SectionShell tone="ivory">
          <div className={cn(SITE_CONTENT_CLASS, "py-16 sm:py-20")}>
            <SectionEyebrow>A Tradition Preserved</SectionEyebrow>
            <h2 className="mt-4 max-w-2xl font-heading text-4xl font-semibold leading-tight text-foreground sm:text-5xl">
              Taste, quality and craftsmanship kept steady across generations.
            </h2>
            <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {traditionPoints.map((point) => (
                <div key={point.title} className="border-l-2 border-accent/50 pl-4">
                  <h3 className="font-heading text-xl font-medium text-foreground">{point.title}</h3>
                  <p className="mt-2 text-sm leading-7 text-muted-foreground">{point.text}</p>
                </div>
              ))}
            </div>
          </div>
        </SectionShell>

        {/* Taste of Tirunelveli */}
        <SectionShell tone="parchment">
          <ImageStoryBlock
            reverse
            shape="c"
            imageSrc="/images/tirunelveli-ghee-halwa.png"
            imageAlt="Tirunelveli ghee halwa in a brass bowl"
            imageCaption="A familiar sweet, a familiar city"
            eyebrow="The Taste of Tirunelveli"
            heading="Tirunelveli Ghee Halwa remains central to the identity of Lala Sweets."
            paragraphs={[
              "Wheat, sugar and ghee sit at the heart of our signature halwa, best served hot &mdash; a taste deeply tied to Tirunelveli's traditional identity.",
            ]}
          >
            <div className="mt-8 flex items-center gap-3 text-sm uppercase tracking-[0.26em] text-primary/70">
              <Wheat className="size-4" />
              <span>Tirunelveli halwa identity</span>
            </div>
          </ImageStoryBlock>
        </SectionShell>

        {/* Craftsmanship */}
        <SectionShell tone="ivory">
          <ImageStoryBlock
            shape="b"
            imageSrc="/images/tirunelveli-ghee-halwa.png"
            imageAlt="Tirunelveli ghee halwa"
            imageCaption="The most enduring expression of our legacy"
            eyebrow="Craftsmanship That Endures"
            heading="A legacy is not only measured by years, but by what remains unchanged."
            paragraphs={[
              "Traditional preparation, careful ingredient selection, consistency and attention to detail keep the heritage recognizable today.",
            ]}
          />
        </SectionShell>

        {/* Trust */}
        <SectionShell tone="parchment">
          <div className={cn(SITE_CONTENT_CLASS, "py-16 sm:py-20")}>
            <div className="grid gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-start">
              <div>
                <SectionEyebrow>Built on Trust</SectionEyebrow>
                <h2 className="mt-4 max-w-2xl font-heading text-4xl font-semibold leading-tight text-foreground sm:text-5xl">
                  Part of celebrations, journeys, gifting and memories, across generations.
                </h2>
                <p className="mt-6 max-w-2xl text-base leading-8 text-muted-foreground sm:text-lg">
                  The long-standing reputation of the shop is part of the legacy itself. Trust grows when a name
                  remains familiar across many moments in people&apos;s lives.
                </p>
              </div>
              <div className="border-l-2 border-accent/60 pl-5">
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-primary/70">Trust markers</p>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  {trustPoints.map((point) => (
                    <div key={point} className="text-sm font-medium uppercase tracking-[0.18em] text-muted-foreground">
                      {point}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </SectionShell>

        {/* Timeline */}
        <SectionShell tone="ivory">
          <div className={cn(SITE_CONTENT_CLASS, "py-16 sm:py-20")}>
            <div className="text-center">
              <SectionEyebrow>1882 &rarr; Today</SectionEyebrow>
              <h2 className="mt-4 font-heading text-4xl font-semibold leading-tight text-foreground sm:text-5xl">
                What Our Legacy Means Today
              </h2>
            </div>
            <div className="mt-14">
              <HeritageTimeline entries={timelineEntries} />
            </div>
          </div>
        </SectionShell>

        {/* Closing CTA */}
        <SectionShell tone="parchment" className="border-b-0">
          <div className={cn(SITE_CONTENT_CLASS, "py-16 text-center sm:py-24")}>
            <p className="mx-auto max-w-2xl font-heading text-2xl leading-snug text-foreground sm:text-3xl">
              Our legacy is not simply the years behind us, but the tradition we continue to carry forward.
            </p>
            <HeritageDivider className="mx-auto mt-8 max-w-xs" />
            <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
              <Link href="/menu" className={cn(buttonVariants({ variant: "default" }), "px-6")}>
                Discover Our Sweets
                <ArrowRight className="size-4" />
              </Link>
              <Link href="/contact" className={cn(buttonVariants({ variant: "outline" }), "px-6")}>
                Enquire With Us
              </Link>
            </div>
            <div className="mt-10 flex items-center justify-center gap-3 text-sm uppercase tracking-[0.26em] text-primary/70">
              <Clock3 className="size-4" />
              <span>Since 1882</span>
              <span className="h-px w-10 bg-primary/30" />
              <span>Tirunelveli</span>
            </div>
          </div>
        </SectionShell>
      </main>
    </StorefrontShell>
  )
}
