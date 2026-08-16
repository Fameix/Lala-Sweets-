import Image from "next/image"
import Link from "next/link"

import { ArrowRight, ChevronDown, Clock3, Wheat } from "lucide-react"

import { StorefrontShell } from "@/components/layout/storefront-shell"
import { SITE_CONTENT_CLASS } from "@/components/layout/storefront-shell"
import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const traditionPoints = [
  {
    title: "Traditional taste",
    text: "The same familiar flavour profile continues to define the brand&apos;s public identity.",
  },
  {
    title: "Authentic flavours",
    text: "The legacy is tied to recognisable sweets and the taste people expect from the name.",
  },
  {
    title: "Quality ingredients",
    text: "The verified signature halwa ingredients are wheat, sugar and ghee.",
  },
  {
    title: "Craftsmanship",
    text: "Traditional preparation and careful handling remain central to the experience.",
  },
]

const trustPoints = [
  "Celebrations",
  "Journeys",
  "Gifting",
  "Memories",
]

export default function LegacyPage() {
  return (
    <StorefrontShell transparentHeader>
      <main className="bg-[#F3E0AE] text-[#3b2416]">
        <section className="relative overflow-hidden border-b border-[#310898]/12">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.6),transparent_34%),linear-gradient(180deg,rgba(255,255,255,0.14),transparent_34%)]" />
          <div className="absolute inset-0 opacity-10 [background-image:linear-gradient(rgba(49,8,152,0.12)_1px,transparent_1px),linear-gradient(90deg,rgba(49,8,152,0.12)_1px,transparent_1px)] [background-size:58px_58px]" />
          <div className={cn(SITE_CONTENT_CLASS, "relative grid gap-10 py-16 sm:py-20 lg:grid-cols-[1fr_1.02fr] lg:items-center lg:py-24")}>
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.38em] text-[#310898] sm:text-xs">Since 1882</p>
              <h1 className="mt-4 max-w-[12ch] font-heading text-5xl font-semibold leading-[0.95] text-[#2d1a11] sm:text-6xl lg:text-7xl">
                A Legacy Preserved Through Generations
              </h1>
              <p className="mt-6 max-w-2xl text-base leading-8 text-[#4d3425] sm:text-lg">
                Since 1882, Sri Lakshmivilas Purathana Lala Sweets has carried forward more than a recipe - it has preserved
                a tradition.
              </p>
            </div>

            <div className="relative">
              <div className="absolute -left-6 top-2 hidden text-[clamp(7rem,18vw,14rem)] font-heading font-semibold leading-none tracking-[-0.08em] text-[#310898]/12 lg:block">
                1882
              </div>
              <div className="relative overflow-hidden border border-[#310898]/12 bg-[#1f0b06] shadow-[0_28px_80px_rgba(61,35,19,0.16)]">
                <Image
                  src="/images/tirunelveli-ghee-halwa.png"
                  alt="Tirunelveli ghee halwa"
                  fill
                  priority
                  sizes="(min-width: 1024px) 48vw, 100vw"
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(31,11,6,0.06),rgba(31,11,6,0.18))]" />
                <div className="relative flex min-h-[26rem] items-end p-6 sm:min-h-[32rem] sm:p-8">
                  <div className="max-w-xs border-l-2 border-[#F3E0AE]/60 pl-4 text-[#fff7e9]">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.34em] text-[#F3E0AE]">Heritage Visual</p>
                    <p className="mt-2 text-sm leading-6 text-[#f7ead0]">
                      The signature sweet appears here as the most enduring expression of the legacy.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className={cn(SITE_CONTENT_CLASS, "py-16 sm:py-20")}>
          <div className="grid gap-10 lg:grid-cols-[0.92fr_1.08fr] lg:items-start">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.32em] text-[#310898]">A Tradition Preserved</p>
              <h2 className="mt-4 max-w-xl font-heading text-3xl font-semibold leading-tight text-[#2d1a11] sm:text-4xl">
                Traditional taste, authentic flavours, quality and craftsmanship kept steady across generations.
              </h2>
              <p className="mt-6 max-w-2xl text-base leading-8 text-[#4d3425] sm:text-lg">
                The legacy lives in the details that remain consistent: the same familiar sweetness, the same attention to
                quality and the same respect for traditional methods.
              </p>
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              {traditionPoints.map((point) => (
                <div key={point.title} className="border-l-2 border-[#310898]/18 pl-4">
                  <h3 className="font-heading text-xl font-medium text-[#2d1a11]">{point.title}</h3>
                  <p className="mt-2 text-sm leading-7 text-[#4d3425] sm:text-base">{point.text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="border-y border-[#310898]/12 bg-[rgba(255,248,230,0.44)]">
          <div className={cn(SITE_CONTENT_CLASS, "py-16 sm:py-20")}>
            <div className="grid gap-10 lg:grid-cols-[1fr_0.95fr] lg:items-center">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.32em] text-[#310898]">The Taste of Tirunelveli</p>
                <h2 className="mt-4 max-w-2xl font-heading text-3xl font-semibold leading-tight text-[#2d1a11] sm:text-4xl">
                  Tirunelveli Ghee Halwa remains central to the identity of Lala Sweets.
                </h2>
                <p className="mt-6 max-w-2xl text-base leading-8 text-[#4d3425] sm:text-lg">
                  The verified product details place wheat, sugar and ghee at the heart of the signature halwa, and the
                  public website notes that it tastes best when served hot. That taste is deeply associated with Tirunelveli&apos;s
                  traditional identity.
                </p>
                <div className="mt-8 flex items-center gap-3 text-sm uppercase tracking-[0.28em] text-[#310898]">
                  <Wheat className="size-4" />
                  <span>Tirunelveli halwa identity</span>
                </div>
              </div>

              <div className="relative overflow-hidden border border-[#310898]/12 bg-[#1f0b06] shadow-[0_22px_70px_rgba(61,35,19,0.18)]">
                <Image
                  src="/images/tirunelveli-ghee-halwa.png"
                  alt="Tirunelveli ghee halwa in a brass bowl"
                  fill
                  sizes="(min-width: 1024px) 45vw, 100vw"
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(243,224,174,0.08),rgba(49,8,152,0.08))]" />
                <div className="relative flex min-h-[24rem] items-end p-6 sm:min-h-[32rem] sm:p-8">
                  <div className="max-w-xs border-l-2 border-[#310898]/50 pl-4">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.34em] text-[#310898]">Heritage Sweet</p>
                    <p className="mt-2 text-sm leading-6 text-[#4d3425]">
                      A familiar sweet that keeps the city&apos;s identity present in every serving.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className={cn(SITE_CONTENT_CLASS, "py-16 sm:py-20")}>
          <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
            <div className="relative overflow-hidden border border-[#310898]/12 bg-[#f6e4b0] shadow-[0_18px_60px_rgba(61,35,19,0.12)]">
              <Image
                src="/images/lala-sweets-storefront-banner.png"
                alt="Heritage storefront visual"
                fill
                sizes="(min-width: 1024px) 45vw, 100vw"
                className="object-cover object-center"
              />
              <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(243,224,174,0.08),rgba(49,8,152,0.06))]" />
              <div className="relative min-h-[22rem] sm:min-h-[30rem]" />
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.32em] text-[#310898]">Craftsmanship That Endures</p>
              <h2 className="mt-4 max-w-2xl font-heading text-3xl font-semibold leading-tight text-[#2d1a11] sm:text-4xl">
                A legacy is not only measured by years, but by what remains unchanged.
              </h2>
              <p className="mt-6 max-w-2xl text-base leading-8 text-[#4d3425] sm:text-lg">
                Traditional preparation, careful ingredient selection, consistency and attention to detail keep the heritage
                recognizable today.
              </p>
              <div className="mt-7 grid gap-5 sm:grid-cols-2">
                {[
                  "Traditional preparation",
                  "Careful ingredients",
                  "Consistency",
                  "Attention to detail",
                ].map((item) => (
                  <div key={item} className="border-l-2 border-[#310898]/18 pl-4">
                    <p className="font-heading text-xl font-medium text-[#2d1a11]">{item}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="border-y border-[#310898]/12 bg-[rgba(255,248,230,0.4)]">
          <div className={cn(SITE_CONTENT_CLASS, "py-16 sm:py-20")}>
            <div className="grid gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-start">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.32em] text-[#310898]">Built on Trust</p>
                <h2 className="mt-4 max-w-2xl font-heading text-3xl font-semibold leading-tight text-[#2d1a11] sm:text-4xl">
                  Generations of customers have made the name part of their celebrations, journeys, gifting and memories.
                </h2>
                <p className="mt-6 max-w-2xl text-base leading-8 text-[#4d3425] sm:text-lg">
                  The long-standing reputation of the shop is part of the legacy itself. Trust grows when a name remains
                  familiar across many moments in people&apos;s lives.
                </p>
              </div>

              <div className="border-l-2 border-[#310898]/18 pl-5">
                <p className="text-[10px] font-semibold uppercase tracking-[0.34em] text-[#310898]">Trust markers</p>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  {trustPoints.map((point) => (
                    <div key={point} className="text-sm font-medium uppercase tracking-[0.18em] text-[#4d3425]">
                      {point}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className={cn(SITE_CONTENT_CLASS, "py-16 sm:py-20")}>
          <p className="text-xs font-semibold uppercase tracking-[0.32em] text-[#310898]">1882 &rarr; Today</p>
          <div className="mt-8 grid gap-5 md:grid-cols-3">
            <div className="border-l-2 border-[#310898]/18 pl-5">
              <div className="font-heading text-4xl font-semibold leading-none text-[#310898] sm:text-5xl">1882</div>
              <p className="mt-3 text-sm leading-7 text-[#4d3425] sm:text-base">A tradition takes root.</p>
            </div>
            <div className="flex items-center justify-center text-[#310898] md:pt-10">
              <ChevronDown className="size-6 rotate-90 md:rotate-0" />
            </div>
            <div className="border-l-2 border-[#310898]/18 pl-5 md:col-start-1">
              <div className="font-heading text-4xl font-semibold leading-none text-[#310898] sm:text-5xl">Generations</div>
              <p className="mt-3 text-sm leading-7 text-[#4d3425] sm:text-base">Craft and values are carried forward.</p>
            </div>
            <div className="flex items-center justify-center text-[#310898] md:pt-10">
              <ChevronDown className="size-6 rotate-90 md:rotate-0" />
            </div>
            <div className="border-l-2 border-[#310898]/18 pl-5 md:col-start-1">
              <div className="font-heading text-4xl font-semibold leading-none text-[#310898] sm:text-5xl">Today</div>
              <p className="mt-3 text-sm leading-7 text-[#4d3425] sm:text-base">The tradition continues.</p>
            </div>
          </div>
        </section>

        <section className="border-t border-[#310898]/12 bg-[#f1dca2]">
          <div className={cn(SITE_CONTENT_CLASS, "py-16 sm:py-20")}>
            <div className="max-w-4xl">
              <p className="text-xs font-semibold uppercase tracking-[0.32em] text-[#310898]">What Our Legacy Means Today</p>
              <h2 className="mt-4 font-heading text-4xl font-semibold leading-tight text-[#2d1a11] sm:text-5xl">
                It is not simply the years behind us, but the tradition, taste, craftsmanship and trust that continue today.
              </h2>
              <p className="mt-6 max-w-3xl text-base leading-8 text-[#4d3425] sm:text-lg">
                The legacy lives in the way the brand remains recognizable, dependable and rooted in Tirunelveli&apos;s sweet
                heritage.
              </p>
              <p className="mt-8 font-heading text-2xl leading-tight text-[#2d1a11] sm:text-3xl">
                Our legacy is not simply the years behind us, but the tradition we continue to carry forward.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  href="/menu"
                  className={cn(
                    buttonVariants({ variant: "default" }),
                    "border border-[#310898]/10 bg-[#310898] px-5 text-[#fbf2db] shadow-none hover:bg-[#29077a]",
                  )}
                >
                  Discover Our Sweets
                  <ArrowRight className="size-4" />
                </Link>
                <Link href="/contact" className={cn(buttonVariants({ variant: "outline" }), "border-[#310898]/18")}>
                  Enquire With Us
                </Link>
              </div>
              <div className="mt-10 flex items-center gap-3 text-sm uppercase tracking-[0.26em] text-[#310898]">
                <Clock3 className="size-4" />
                <span>Since 1882</span>
                <span className="h-px w-10 bg-[#310898]/35" />
                <span>Tirunelveli</span>
              </div>
            </div>
          </div>
        </section>
      </main>
    </StorefrontShell>
  )
}
