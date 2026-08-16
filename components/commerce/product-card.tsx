"use client"

import Image from "next/image"
import Link from "next/link"
import { useMemo, useState } from "react"
import { Plus } from "lucide-react"

import { FavouriteButton } from "@/components/commerce/favourite-button"
import { ProductQuickView } from "@/components/commerce/product-quick-view"
import { Badge } from "@/components/ui/badge"
import { Button, buttonVariants } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { addCartItem } from "@/lib/cart-client"
import { formatProductPrice } from "@/lib/catalogue"
import { getProductImage } from "@/lib/product-images"
import { cn } from "@/lib/utils"
import type { Product } from "@/types/catalogue"

function formatPrice(paise: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(paise / 100)
}

export function ProductCard({ product }: { product: Product }) {
  const image = getProductImage(product)
  const sizes = useMemo(() => product.size_variants ?? [], [product.size_variants])
  const [selectedSize, setSelectedSize] = useState(sizes[0]?.label ?? "")
  const [added, setAdded] = useState(false)

  const selectedVariant = sizes.find((variant) => variant.label === selectedSize) ?? sizes[0]
  const isOutOfStock =
    (product.stock_status ?? product.availability_status) === "out-of-stock" || (sizes.length > 0 && !selectedVariant?.is_in_stock)

  function handleAdd() {
    if (isOutOfStock) {
      return
    }

    addCartItem({
      productId: product.id,
      productName: product.display_name,
      productSlug: product.slug,
      image: image.src,
      size: selectedVariant?.label ?? "250g",
      unitPricePaise: selectedVariant?.price_paise ?? product.price_paise ?? 0,
      quantity: 1,
    })
    setAdded(true)
    window.setTimeout(() => setAdded(false), 1500)
  }

  return (
    <Card className="relative h-full" size="sm">
      <ProductQuickView product={product} triggerMode="details" triggerClassName="z-10" />
      <CardHeader className="relative z-0">
        <div className="relative mb-3 aspect-[4/3] overflow-hidden rounded-lg bg-muted">
          <Image
            src={image.src}
            alt={image.alt}
            fill
            sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
            className={cn("object-cover", image.className)}
          />
        </div>
        <CardTitle className="mt-2 text-base">{product.display_name}</CardTitle>
      </CardHeader>
      <CardContent className="relative z-0 flex flex-1 flex-col gap-3">
        <p className="line-clamp-2 text-sm leading-5 text-muted-foreground">{product.short_description}</p>
        {product.is_featured ? <Badge variant="outline">Signature</Badge> : null}
        <div>
          <p className="font-medium">{formatProductPrice(product)}</p>
          <p className="mt-1 text-xs leading-5 text-muted-foreground">
            {isOutOfStock ? "Out of stock" : product.stock_status ?? product.availability_status}
          </p>
        </div>
        {sizes.length > 1 ? (
          <Select value={selectedSize} onValueChange={(value) => setSelectedSize(value ?? sizes[0].label)}>
            <SelectTrigger className="relative z-20 h-8 text-xs" size="sm">
              <SelectValue placeholder="Choose size" />
            </SelectTrigger>
            <SelectContent>
              {sizes.map((variant) => (
                <SelectItem key={variant.label} value={variant.label}>
                  {variant.label} - {formatPrice(variant.price_paise)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        ) : null}
      </CardContent>
      <CardFooter className="relative z-20 gap-2">
        <FavouriteButton productId={product.id} />
        <Link href={`/product/${product.slug}`} className={cn(buttonVariants({ variant: "outline", size: "sm" }), "flex-1")}>
          View
        </Link>
        <Button onClick={handleAdd} disabled={isOutOfStock} size="sm" className="flex-1 gap-1.5">
          <Plus className="size-3.5" />
          {added ? "Added" : "Add"}
        </Button>
      </CardFooter>
    </Card>
  )
}
