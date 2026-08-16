"use client"

import Image from "next/image"
import Link from "next/link"
import { useMemo, useState } from "react"
import { Minus, Plus, ShoppingCart } from "lucide-react"

import { FoodTypeBadge } from "@/components/commerce/food-type-badge"
import { PriceStatusBadge } from "@/components/commerce/price-status-badge"
import { Badge } from "@/components/ui/badge"
import { buttonVariants } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { addCartItem } from "@/lib/cart-client"
import { getProductImage } from "@/lib/product-images"
import { cn } from "@/lib/utils"
import type { Product, ProductSizeVariant } from "@/types/catalogue"

function formatPrice(paise: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(paise / 100)
}

export function ProductDetails({ product }: { product: Product }) {
  const image = getProductImage(product)
  const sizes = useMemo(() => product.size_variants ?? [], [product.size_variants])
  const [selectedSize, setSelectedSize] = useState<ProductSizeVariant["label"]>(sizes[0]?.label ?? "250g")
  const [quantity, setQuantity] = useState(1)

  const selectedVariant = useMemo(() => {
    return sizes.find((variant) => variant.label === selectedSize) ?? sizes[0]
  }, [selectedSize, sizes])

  const currentPrice = selectedVariant ? selectedVariant.price_paise * quantity : product.price_paise ?? 0
  const isOutOfStock = (product.stock_status ?? product.availability_status) === "out-of-stock" || !selectedVariant?.is_in_stock
  const [cartStatus, setCartStatus] = useState("Add to Cart")

  function handleAddToCart() {
    if (!selectedVariant) {
      return
    }

    addCartItem({
      productId: product.id,
      productName: product.display_name,
      productSlug: product.slug,
      image: image.src,
      size: selectedVariant.label,
      unitPricePaise: selectedVariant.price_paise,
      quantity,
    })
    setCartStatus("Added to Cart")
    window.setTimeout(() => setCartStatus("Add to Cart"), 1800)
  }

  return (
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
          <Badge variant="secondary">{image.status === "approved" ? "Product image" : "Product image pending"}</Badge>
        </div>
      </div>

      <section>
        <Link
          href={`/category/${product.normalized_category.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")}`}
          className="text-sm text-muted-foreground"
        >
          {product.normalized_category}
        </Link>
        <h1 className="mt-3 font-heading text-3xl font-medium">{product.display_name}</h1>
        <div className="mt-4 flex flex-wrap gap-2">
          <FoodTypeBadge foodType={product.food_type} />
          <PriceStatusBadge product={product} />
          {product.is_featured ? <Badge variant="outline">Signature</Badge> : null}
          {product.verification_status === "needs-review" ? <Badge variant="outline">Needs review</Badge> : null}
        </div>
        <p className="mt-6 text-xl font-medium">{formatPrice(currentPrice)}</p>
        <p className="mt-3 leading-7 text-muted-foreground">{product.long_description}</p>

        <div className="mt-6 grid gap-3 rounded-2xl border border-border bg-card p-4 text-sm">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary">Available sizes</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {sizes.map((variant) => {
                const active = variant.label === selectedSize

                return (
                  <button
                    key={variant.label}
                    type="button"
                    disabled={isOutOfStock}
                    onClick={() => setSelectedSize(variant.label)}
                    className={cn(
                      buttonVariants({ variant: active ? "default" : "outline", size: "sm" }),
                      "rounded-full",
                    )}
                  >
                    {variant.label}
                  </button>
                )
              })}
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary">Stock status</p>
              <p className="mt-1 text-muted-foreground">{product.stock_status ?? product.availability_status}</p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary">Selected size</p>
              <p className="mt-1 text-muted-foreground">{selectedVariant?.label ?? "250g"}</p>
            </div>
          </div>
        </div>

        <div className="mt-6 grid gap-3 rounded-2xl border border-border bg-card p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary">Quantity</p>
          <div className="inline-flex w-fit items-center rounded-full border border-border bg-background">
            <button
              type="button"
              className="inline-flex size-10 items-center justify-center text-foreground transition hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
              onClick={() => setQuantity((value) => Math.max(1, value - 1))}
              disabled={isOutOfStock || quantity <= 1}
              aria-label="Decrease quantity"
            >
              <Minus className="size-4" />
            </button>
            <span className="min-w-12 px-4 text-center text-sm font-medium">{quantity}</span>
            <button
              type="button"
              className="inline-flex size-10 items-center justify-center text-foreground transition hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
              onClick={() => setQuantity((value) => value + 1)}
              disabled={isOutOfStock}
              aria-label="Increase quantity"
            >
              <Plus className="size-4" />
            </button>
          </div>
        </div>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <button
            className={cn(buttonVariants({ size: "lg" }), "gap-2")}
            type="button"
            disabled={isOutOfStock}
            onClick={handleAddToCart}
          >
            <ShoppingCart className="size-4" />
            {cartStatus}
          </button>
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
  )
}
