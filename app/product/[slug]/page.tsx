import Link from "next/link"
import Image from "next/image"
import { notFound } from "next/navigation"
import { AlertCircle, ShoppingBag } from "lucide-react"

import { FoodTypeBadge } from "@/components/commerce/food-type-badge"
import { PriceStatusBadge } from "@/components/commerce/price-status-badge"
import { StorefrontShell } from "@/components/layout/storefront-shell"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { buttonVariants } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { getProductBySlug, getProducts, formatProductPrice } from "@/lib/catalogue"
import { getProductImage } from "@/lib/product-images"
import { cn } from "@/lib/utils"

export function generateStaticParams() {
  return getProducts().map((product) => ({ slug: product.slug }))
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const product = getProductBySlug(slug)

  if (!product) {
    notFound()
  }

  const image = getProductImage(product)
  const isCake = product.product_type === "cake"
  const imageBadge = image.status === "missing" ? "Product image pending" : image.sourceUrl.startsWith("/") ? "Client-provided image" : "Temporary Pexels photo"

  return (
    <StorefrontShell>
      <main className="mx-auto grid max-w-6xl gap-8 px-4 py-8 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="relative aspect-square overflow-hidden rounded-2xl border border-border bg-muted">
          <Image
            src={image.src}
            alt={image.alt}
            fill
            priority
            sizes="(min-width: 1024px) 45vw, 100vw"
            className={cn("object-cover", image.className)}
          />
          <div className="absolute left-4 top-4">
            <Badge variant="secondary">{imageBadge}</Badge>
          </div>
        </div>
        <section>
          <Link href={`/category/${product.normalized_category.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")}`} className="text-sm text-muted-foreground">
            {product.normalized_category}
          </Link>
          <h1 className="mt-3 font-heading text-3xl font-medium">{product.display_name}</h1>
          <div className="mt-4 flex flex-wrap gap-2">
            <FoodTypeBadge foodType={product.food_type} />
            <PriceStatusBadge product={product} />
            {isCake && product.subcategory ? <Badge variant="outline">{product.subcategory}</Badge> : null}
            {product.verification_status === "needs-review" ? <Badge variant="outline">Needs review</Badge> : null}
          </div>
          <p className="mt-6 text-xl font-medium">{formatProductPrice(product)}</p>
          <p className="mt-3 leading-7 text-muted-foreground">{product.long_description}</p>
          <Alert className="mt-6">
            <AlertCircle className="size-4" />
            <AlertTitle>Ordering is disabled for this product</AlertTitle>
            <AlertDescription>
              {isCake
                ? "Admin approval is required for price, available weights, egg options, preparation time, product image, branch assignment, and cake options."
                : "Admin approval is required for price, availability, branch assignment, variants, and food classification."}
            </AlertDescription>
          </Alert>
          {isCake ? (
            <Card className="mt-6">
              <CardContent className="grid gap-5 pt-0">
                <div>
                  <h2 className="font-heading text-xl font-medium">Cake Options</h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    These controls activate after admin configures valid weights, egg options, prices, and lead time.
                  </p>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="grid gap-2 text-sm font-medium">
                    Weight
                    <select disabled className="h-10 rounded-md border border-input bg-background px-3 text-sm text-muted-foreground">
                      <option>No approved weights yet</option>
                    </select>
                  </label>
                  <label className="grid gap-2 text-sm font-medium">
                    Cake Type
                    <select disabled className="h-10 rounded-md border border-input bg-background px-3 text-sm text-muted-foreground">
                      <option>Egg options pending</option>
                    </select>
                  </label>
                  <label className="grid gap-2 text-sm font-medium">
                    Shape
                    <select disabled className="h-10 rounded-md border border-input bg-background px-3 text-sm text-muted-foreground">
                      <option>Shapes pending</option>
                    </select>
                  </label>
                  <label className="grid gap-2 text-sm font-medium">
                    Required Date
                    <Input disabled type="date" />
                  </label>
                </div>
                <label className="grid gap-2 text-sm font-medium">
                  Cake Message
                  <Input disabled maxLength={product.cake_message_max_length ?? 40} placeholder="Enabled after admin review" />
                </label>
                {product.supports_photo_upload ? (
                  <label className="grid gap-2 text-sm font-medium">
                    Photo Upload
                    <Input disabled type="file" accept="image/jpeg,image/png,image/webp" />
                  </label>
                ) : null}
                <label className="grid gap-2 text-sm font-medium">
                  Special Instructions
                  <Textarea disabled placeholder="Enabled when this cake becomes orderable" />
                </label>
              </CardContent>
            </Card>
          ) : null}
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <button type="button" disabled className={cn(buttonVariants({ size: "lg" }), "gap-2")}>
              <ShoppingBag className="size-4" />
              Add to Cart
            </button>
            <Link href="/custom-cake" className={cn(buttonVariants({ variant: "outline", size: "lg" }))}>
              Ask about customization
            </Link>
            {isCake ? (
              <Link href="/cake-serving-calculator" className={cn(buttonVariants({ variant: "outline", size: "lg" }))}>
                How Much Cake Do I Need?
              </Link>
            ) : null}
          </div>
          <Card className="mt-8">
            <CardContent className="grid gap-3 pt-0 text-sm">
              <div className="flex justify-between gap-4">
                <span className="text-muted-foreground">Source category</span>
                <span>{product.source_category}</span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-muted-foreground">Image status</span>
                <span>{image.status}</span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-muted-foreground">Image credit</span>
                <Link href={image.sourceUrl} className="text-right underline-offset-4 hover:underline">
                  {image.credit}
                </Link>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-muted-foreground">Availability</span>
                <span>{product.availability_status}</span>
              </div>
            </CardContent>
          </Card>
        </section>
      </main>
    </StorefrontShell>
  )
}
