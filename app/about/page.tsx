import Image from "next/image"
import Link from "next/link"

import { ArrowRight, MapPin, Sparkles } from "lucide-react"

import { StorefrontShell } from "@/components/layout/storefront-shell"
import { SITE_CONTENT_CLASS } from "@/components/layout/storefront-shell"
import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const storyMilestones = [
  {
    title: "A Tirunelveli beginning",
    text: "Late Jagan Singh Lala established the sweet business in Tirunelveli in 1882.",
  },
  {
    title: "A local rhythm",
    text: "The shop grew through careful preparation and the everyday trust of local customers.",
  },
  {
    title: "A recognizable name",
    text: "Sri Lakshmivilas Purathana Lala Sweets became tied to a familiar Tirunelveli food identity.",
  },
]

const identityNotes = [
  "Tirunelveli roots",
  "Traditional sweets",
  "Authentic halwa",
  "Local memory",
]

export default function AboutPage() {
  return (
    <StorefrontShell transparentHeader>
      <main className="bg-[#F3E0AE] text-[#3b2416]">
        <section className="relative overflow-hidden border-b border-[#310898]/12">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.58),transparent_34%),linear-gradient(180deg,rgba(255,255,255,0.16),transparent_32%)]" />
          <div className="absolute inset-0 opacity-10 [background-image:linear-gradient(rgba(49,8,152,0.12)_1px,transparent_1px),linear-gradient(90deg,rgba(49,8,152,0.12)_1px,transparent_1px)] [background-size:54px_54px]" />
          <div className={cn(SITE_CONTENT_CLASS, "relative grid gap-10 py-16 sm:py-20 lg:grid-cols-[1fr_0.95fr] lg:items-center lg:py-24")}>
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.38em] text-[#310898] sm:text-xs">Tirunelveli Roots</p>
              <h1 className="mt-4 max-w-[10ch] font-heading text-5xl font-semibold leading-[0.95] text-[#2d1a11] sm:text-6xl lg:text-7xl">
                Our Story
              </h1>
              <p className="mt-6 max-w-2xl text-base leading-8 text-[#4d3425] sm:text-lg">
                Sri Lakshmivilas Purathana Lala Sweets is a Tirunelveli sweet house with a long public history, shaped by the
                city around it and the people who continued to return to it.
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
                </Link>
                <Link
                  href="/contact"
                  className={cn(
                    buttonVariants({ variant: "outline" }),
                    "border-[#310898]/18 bg-transparent px-5 text-[#3b2416] shadow-none hover:bg-[#fff4d4]",
                  )}
                >
                  Visit the Shop
                </Link>
              </div>
            </div>

            <div className="relative">
              <div className="absolute -left-8 top-10 hidden text-[clamp(6rem,16vw,12rem)] font-heading font-semibold leading-none tracking-[-0.08em] text-[#310898]/10 lg:block">
                1882
              </div>
              <div className="relative overflow-hidden border border-[#310898]/12 bg-[#f6e4b0] shadow-[0_24px_70px_rgba(61,35,19,0.14)]">
                <Image
                  src="/images/lala-sweets-storefront-banner.png"
                  alt="Sri Lakshmivilas Purathana Lala Sweets storefront"
                  fill
                  priority
                  sizes="(min-width: 1024px) 45vw, 100vw"
                  className="object-cover object-center"
                />
                <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(243,224,174,0.75)_0%,rgba(243,224,174,0.35)_36%,rgba(243,224,174,0)_100%)]" />
                <div className="relative flex min-h-[26rem] items-end p-6 sm:min-h-[32rem] sm:p-8">
                  <div className="max-w-xs border-l-2 border-[#310898]/50 pl-4">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.34em] text-[#310898]">Shopfront</p>
                    <p className="mt-2 text-sm leading-6 text-[#4d3425]">
                      The storefront gives the story its visual anchor in Tirunelveli.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className={cn(SITE_CONTENT_CLASS, "py-16 sm:py-20")}>
          <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
            <div className="relative overflow-hidden border border-[#310898]/12 bg-[#f6e4b0] shadow-[0_18px_50px_rgba(61,35,19,0.12)]">
              <Image
                src="/images/lala-sweets-storefront-banner.png"
                alt="Lala Sweets storefront illustration"
                fill
                sizes="(min-width: 1024px) 42vw, 100vw"
                className="object-cover object-center"
              />
              <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(243,224,174,0.08),rgba(49,8,152,0.06))]" />
              <div className="relative min-h-[22rem] sm:min-h-[30rem]" />
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.32em] text-[#310898]">Where It Began</p>
              <h2 className="mt-4 max-w-2xl font-heading text-3xl font-semibold leading-tight text-[#2d1a11] sm:text-4xl">
                A sweet business formed in Tirunelveli and shaped by its local setting.
              </h2>
              <div className="mt-7 space-y-5 text-base leading-8 text-[#4d3425] sm:text-lg">
                <p>
                  The public brand story traces to 1882, when Late Jagan Singh Lala started the business in Tirunelveli.
                </p>
                <p>
                  From there, the shop became part of the city&apos;s daily landscape, carrying the same name through years of
                  ordinary visits, celebrations and gifting.
                </p>
              </div>
              <div className="mt-8 flex items-center gap-3 text-sm uppercase tracking-[0.28em] text-[#310898]">
                <MapPin className="size-4" />
                <span>Tirunelveli as home</span>
              </div>
            </div>
          </div>
        </section>

        <section className="border-y border-[#310898]/12 bg-[rgba(255,248,230,0.48)]">
          <div className={cn(SITE_CONTENT_CLASS, "py-16 sm:py-20")}>
            <p className="text-xs font-semibold uppercase tracking-[0.32em] text-[#310898]">The Journey</p>
            <h2 className="mt-4 max-w-2xl font-heading text-3xl font-semibold leading-tight text-[#2d1a11] sm:text-4xl">
              From a single shopfront to a familiar part of the city&apos;s food memory.
            </h2>
            <div className="mt-10 grid gap-6 md:grid-cols-3">
              {storyMilestones.map((point) => (
                <article key={point.title} className="border-l-2 border-[#310898]/18 pl-5">
                  <h3 className="font-heading text-2xl font-medium text-[#2d1a11]">{point.title}</h3>
                  <p className="mt-3 text-sm leading-7 text-[#4d3425] sm:text-base">{point.text}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className={cn(SITE_CONTENT_CLASS, "py-16 sm:py-20")}>
          <div className="grid gap-10 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.32em] text-[#310898]">How the Identity Took Shape</p>
              <h2 className="mt-4 max-w-2xl font-heading text-3xl font-semibold leading-tight text-[#2d1a11] sm:text-4xl">
                Halwa and sweets became the language people connected with the name.
              </h2>
              <p className="mt-6 max-w-2xl text-base leading-8 text-[#4d3425] sm:text-lg">
                The public menu and site materials place authentic wheat halwa at the center of the brand identity, while
                the wider sweets selection supports that familiar image.
              </p>
              <div className="mt-8 flex flex-wrap gap-2">
                {identityNotes.map((note) => (
                  <span
                    key={note}
                    className="border border-[#310898]/14 bg-[#fff7e3]/70 px-3 py-2 text-xs font-medium uppercase tracking-[0.18em] text-[#553725]"
                  >
                    {note}
                  </span>
                ))}
              </div>
            </div>

            <div className="relative overflow-hidden border border-[#310898]/12 bg-[#1f0b06] shadow-[0_22px_70px_rgba(61,35,19,0.18)]">
              <Image
                src="/images/tirunelveli-ghee-halwa.png"
                alt="Tirunelveli ghee halwa"
                fill
                sizes="(min-width: 1024px) 45vw, 100vw"
                className="object-cover"
              />
              <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(31,11,6,0.08),rgba(31,11,6,0.2))]" />
              <div className="relative flex min-h-[24rem] items-end p-6 sm:min-h-[32rem] sm:p-8">
                <div className="max-w-xs border-l-2 border-[#F3E0AE]/60 pl-4 text-[#fff7e9]">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.34em] text-[#F3E0AE]">Signature Sweet</p>
                  <p className="mt-2 text-sm leading-6 text-[#f7ead0]">
                    One of the tastes most closely associated with the shop&apos;s public identity.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="border-y border-[#310898]/12 bg-[rgba(255,248,230,0.4)]">
          <div className={cn(SITE_CONTENT_CLASS, "py-16 sm:py-20")}>
            <p className="text-xs font-semibold uppercase tracking-[0.32em] text-[#310898]">Our Story Today</p>
            <h2 className="mt-4 max-w-2xl font-heading text-3xl font-semibold leading-tight text-[#2d1a11] sm:text-4xl">
              A living shop with a remembered name and a familiar place in Tirunelveli.
            </h2>
            <div className="mt-7 grid gap-6 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
              <div className="space-y-5 text-base leading-8 text-[#4d3425] sm:text-lg">
                <p>
                  Today, the brand stands as a recognized sweet house whose story is still tied to the city that nurtured
                  it.
                </p>
                <p>
                  Its public presence continues to be shaped by customers who return for the same reason the name endured:
                  a dependable Tirunelveli sweet experience.
                </p>
              </div>
              <div className="border-l-2 border-[#310898]/18 pl-5">
                <p className="text-[10px] font-semibold uppercase tracking-[0.34em] text-[#310898]">In the present</p>
                <p className="mt-2 text-sm leading-7 text-[#4d3425] sm:text-base">
                  The story today is about a shop that still feels rooted in its city.
                </p>
              </div>
            </div>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/contact" className={cn(buttonVariants({ variant: "outline" }), "border-[#310898]/18")}>
                Enquire With Us
              </Link>
              <Link
                href="/legacy"
                className={cn(
                  buttonVariants({ variant: "default" }),
                  "border border-[#310898]/10 bg-[#310898] text-[#fbf2db] shadow-none hover:bg-[#29077a]",
                )}
              >
                Go to Our Legacy
                <ArrowRight className="size-4" />
              </Link>
            </div>
            <div className="mt-10 flex items-center gap-3 text-sm uppercase tracking-[0.26em] text-[#310898]">
              <Sparkles className="size-4" />
              <span>Origin, growth and place</span>
            </div>
          </div>
        </section>
      </main>
    </StorefrontShell>
  )
}
