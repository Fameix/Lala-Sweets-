import Image from "next/image"
import Link from "next/link"

import { SITE_CONTENT_CLASS } from "@/components/layout/storefront-shell"
import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"

// Full-bleed banner treatment matching the homepage hero (app/page.tsx) -
// same min-height, gradient-over-photo, and content column, so "Our Story"
// opens with the same visual weight as the homepage.
export function HeritageHero({ imageSrc, imageAlt }: { imageSrc: string; imageAlt: string }) {
  return (
    <section className="relative min-h-svh overflow-hidden border-b border-border bg-primary text-[#3a170a]">
      <Image src={imageSrc} alt={imageAlt} fill priority sizes="100vw" className="object-cover object-[70%_center] sm:object-[64%_center]" />
      <div className="absolute inset-0 bg-gradient-to-r from-[#f8e1aa]/90 via-[#f4d99c]/52 to-transparent sm:from-[#f8e1aa]/78 sm:via-[#f4d99c]/28" />
      <div className={cn(SITE_CONTENT_CLASS, "relative flex min-h-svh items-center py-20")}>
        <div className="max-w-xl">
          <p className="font-heading text-[10px] font-bold uppercase tracking-[0.34em] text-[#a95c12] sm:text-xs">Since 1882</p>
          <h1 className="mt-4 max-w-[12ch] font-heading text-4xl font-semibold uppercase leading-[1.05] text-[#331208] sm:max-w-xl sm:text-5xl lg:text-6xl">
            Discover the Taste of Time
          </h1>
          <p className="mt-4 max-w-md text-sm leading-6 text-[#4a2410] sm:text-base">
            A legacy of sweetness, crafted through generations.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Link href="/menu" className={cn(buttonVariants({ size: "lg" }), "px-8 text-base font-semibold shadow-lg")}>
              Discover Our Sweets
            </Link>
            <Link href="/contact" className={cn(buttonVariants({ variant: "outline", size: "lg" }), "px-8 text-base font-semibold")}>
              Visit the Shop
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
