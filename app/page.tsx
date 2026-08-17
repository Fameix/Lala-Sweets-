import Image from "next/image"
import Link from "next/link"

import { Clock3, MapPin, ShieldCheck, Sparkles, Wheat } from "lucide-react"

import { CategoryChip } from "@/components/commerce/category-chip"
import { ProductCard } from "@/components/commerce/product-card"
import { StorefrontShell } from "@/components/layout/storefront-shell"
import { SITE_CONTENT_CLASS } from "@/components/layout/storefront-shell"
import { buttonVariants } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { getCategories, getProductBySlug, getProducts } from "@/lib/catalogue-server"
import { cn } from "@/lib/utils"

const whatsappHref = "https://wa.me/918220266077?text=Vanakkam%2C%20I%20would%20like%20to%20enquire%20about%20Lala%20Sweets."

const legacyPoints = [
  { icon: Clock3, title: "Since 1882", text: "A traditional sweet business founded by Late Jagan Singh Lala." },
  { icon: MapPin, title: "Tirunelveli Roots", text: "A long-standing connection with Tirunelveli and its halwa tradition." },
  { icon: ShieldCheck, title: "Generational Craft", text: "Recipes and sweet-making discipline passed through generations." },
]

export default async function HomePage() {
  const [products, categories, signatureHalwa] = await Promise.all([
    getProducts(),
    getCategories(),
    getProductBySlug("tirunelveli-ghee-halwa"),
  ])
  const featuredProducts = products.filter((product) => product.slug !== "tirunelveli-ghee-halwa").slice(0, 6)

  return (
    <StorefrontShell transparentHeader>
      <main>
        <section className="relative min-h-svh overflow-hidden border-b border-border bg-primary text-[#3a170a]">
          <Image
            src="/images/lala-sweets-storefront-banner.png"
            alt="Illustrated Sri Lakshmivilas Purathana Lala Sweets storefront"
            fill
            priority
            sizes="100vw"
            className="object-cover object-[70%_center] sm:object-[64%_center]"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#f8e1aa]/90 via-[#f4d99c]/52 to-transparent sm:from-[#f8e1aa]/78 sm:via-[#f4d99c]/28" />
          <div className={cn(SITE_CONTENT_CLASS, "relative flex min-h-svh items-center py-20")}>
            <div className="max-w-xl">
              <p className="font-heading text-[10px] font-bold uppercase tracking-[0.34em] text-[#a95c12] sm:text-xs">
                The First Halwa of Tirunelveli, Since 1882
              </p>
              <h1 className="mt-4 max-w-[12ch] font-heading text-4xl font-semibold leading-[1.08] text-[#331208] sm:max-w-xl sm:text-5xl lg:text-6xl">
                Sri Lakshmivilas Purathana Lala Sweets
              </h1>
              <p className="mt-4 max-w-md text-sm leading-6 text-[#4a2410] sm:text-base">
                Handcrafted traditional sweets, made the way they always have been — for every celebration and every
                day.
              </p>
              <Link href="/menu" className={cn(buttonVariants({ size: "lg" }), "mt-7 px-8 text-base font-semibold shadow-lg")}>
                Shop Now
              </Link>
            </div>
          </div>
        </section>

        {categories.length > 0 ? (
          <section className={cn(SITE_CONTENT_CLASS, "-mt-2 py-6 sm:py-8")}>
            <div className="flex gap-2.5 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {categories.map((category) => (
                <CategoryChip key={category.slug} href={`/category/${category.slug}`} label={category.name} />
              ))}
            </div>
          </section>
        ) : null}

        <section id="legacy" className={cn(SITE_CONTENT_CLASS, "py-10 sm:py-12")}>
          <div className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary">Our Legacy</p>
              <h2 className="mt-3 font-heading text-2xl font-semibold sm:text-3xl">Over a century of sweetness, tradition and craftsmanship.</h2>
            </div>
            <div className="grid gap-5">
              <p className="leading-7 text-muted-foreground">
                The story of Sri Lakshmivilas Purathana Lala Sweets traces back to 1882, when Late Jagan Singh Lala founded a traditional sweet business in Tirunelveli. Through generations, the brand has remained closely tied to authentic wheat halwa, time-honoured recipes and the taste memories of South India.
              </p>
              <Link href="/about" className={cn(buttonVariants({ variant: "outline" }), "w-fit")}>
                Discover Our Story
              </Link>
            </div>
          </div>
          <div className="mt-7 grid gap-4 md:grid-cols-3">
            {legacyPoints.map((point) => {
              const Icon = point.icon

              return (
                <Card key={point.title}>
                  <CardContent className="pt-5">
                    <Icon className="size-5 text-primary" />
                    <h3 className="mt-3 font-heading text-lg font-medium">{point.title}</h3>
                    <p className="mt-2 text-sm leading-6 text-muted-foreground">{point.text}</p>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </section>

        {signatureHalwa ? (
          <section className="border-y border-border bg-card">
            <div className={cn(SITE_CONTENT_CLASS, "grid gap-8 py-10 sm:py-12 lg:grid-cols-[0.7fr_1.3fr]")}>
              <div className="relative aspect-[4/3] overflow-hidden rounded-lg bg-muted sm:aspect-square lg:max-w-none">
                <Image src="/images/tirunelveli-ghee-halwa.png" alt="Tirunelveli ghee halwa served in a brass bowl" fill sizes="(min-width: 1024px) 40vw, 100vw" className="object-cover" />
              </div>
              <div className="flex flex-col justify-center">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary">Signature Product</p>
                <h2 className="mt-3 font-heading text-2xl font-semibold sm:text-3xl">Tirunelveli Ghee Halwa</h2>
                <p className="mt-4 leading-7 text-muted-foreground">
                  Also known as Nellai Ghee Halwa, this signature wheat halwa is central to the Lala Sweets identity. The verified ingredient list is wheat, sugar and ghee.
                </p>
                <div className="mt-5 grid gap-3 text-sm text-muted-foreground sm:grid-cols-2">
                  <div className="flex items-center gap-2"><Wheat className="size-4 text-primary" />Wheat, sugar and ghee</div>
                  <div className="flex items-center gap-2"><Sparkles className="size-4 text-primary" />Best served hot</div>
                  <div className="sm:col-span-2">No added artificial flavours, colourings, additives or preservatives, as stated on the public website.</div>
                </div>
                <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                  <Link href="/product/tirunelveli-ghee-halwa" className={cn(buttonVariants())}>
                    View Product
                  </Link>
                  <Link href={whatsappHref} className={cn(buttonVariants({ variant: "outline" }))}>
                    Enquire on WhatsApp
                  </Link>
                </div>
              </div>
            </div>
          </section>
        ) : null}

        <section className={cn(SITE_CONTENT_CLASS, "py-10 sm:py-12")}>
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary">Best Sellers</p>
              <h2 className="mt-3 font-heading text-2xl font-semibold sm:text-3xl">Traditional sweets and savouries</h2>
              <p className="mt-2 text-sm text-muted-foreground">Menu items are based on verified public Lala Sweets information.</p>
            </div>
            <Link href="/menu" className={cn(buttonVariants({ variant: "outline", size: "sm" }))}>
              Full Menu
            </Link>
          </div>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      </main>
    </StorefrontShell>
  )
}
