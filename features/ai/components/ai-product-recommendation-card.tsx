"use client"

import Image from "next/image"
import Link from "next/link"

import { Button, buttonVariants } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { formatProductPrice } from "@/lib/catalogue"
import { getProductImage } from "@/lib/product-images"
import { cn } from "@/lib/utils"
import type { Product } from "@/types/catalogue"

export function AIProductRecommendationCard({ product, onSelect }: { product: Product; onSelect?: () => void }) {
  const image = getProductImage(product)

  return (
    <Card size="sm">
      <CardContent className="grid gap-3 p-0">
        <div className="relative aspect-[4/3] overflow-hidden rounded-xl bg-muted">
          <Image src={image.src} alt={image.alt} fill sizes="18rem" className="object-cover" />
        </div>
        <div className="grid gap-2 px-1">
          <div>
            <p className="font-medium">{product.display_name}</p>
            <p className="mt-1 text-xs text-muted-foreground">{formatProductPrice(product)}</p>
          </div>
          <div className="flex gap-2">
            <Link href={`/product/${product.slug}`} className={cn(buttonVariants({ size: "sm", variant: "outline" }))}>
              View Product
            </Link>
            {onSelect ? (
              <Button type="button" size="sm" onClick={onSelect}>
                Select
              </Button>
            ) : null}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
