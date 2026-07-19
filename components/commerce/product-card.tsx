import Image from "next/image"
import Link from "next/link"

import { FavouriteButton } from "@/components/commerce/favourite-button"
import { ProductQuickView } from "@/components/commerce/product-quick-view"
import { buttonVariants } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { formatProductPrice } from "@/lib/catalogue"
import { getProductImage } from "@/lib/product-images"
import { cn } from "@/lib/utils"
import type { Product } from "@/types/catalogue"

export function ProductCard({ product }: { product: Product }) {
  const image = getProductImage(product)
  const isCake = product.product_type === "cake"

  return (
    <Card className="relative h-full">
      {!isCake ? <ProductQuickView product={product} triggerMode="details" triggerClassName="z-10" /> : null}
      <CardHeader className="relative z-0">
        <div className="relative mb-4 aspect-[4/3] overflow-hidden rounded-xl bg-muted">
          <Image
            src={image.src}
            alt={image.alt}
            fill
            sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
            className={cn("object-cover", image.className)}
          />
        </div>
        <CardTitle className="mt-3 text-lg">{product.display_name}</CardTitle>
      </CardHeader>
      <CardContent className="relative z-0 flex flex-1 flex-col gap-3">
        <p className="text-sm leading-6 text-muted-foreground">{product.short_description}</p>
        {isCake ? (
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline">{product.subcategory}</Badge>
            <Badge variant="outline">Egg options pending</Badge>
            <Badge variant="outline">{product.available_weights?.length ?? 0} weights</Badge>
          </div>
        ) : null}
        <div>
          <p className="font-medium">{formatProductPrice(product)}</p>
          <p className="mt-1 text-xs text-muted-foreground">
            {isCake
              ? "Ordering opens after weight, egg option, image, branch, preparation time, and price approval."
              : "Ordering opens after price, branch, and availability approval."}
          </p>
        </div>
      </CardContent>
      <CardFooter className="relative z-20 gap-2">
        {isCake ? (
          <Link href={`/product/${product.slug}`} className={cn(buttonVariants({ variant: "outline" }), "flex-1")}>
            Choose Options
          </Link>
        ) : (
          <ProductQuickView product={product} triggerClassName="flex-1" />
        )}
        <FavouriteButton productId={product.id} />
      </CardFooter>
    </Card>
  )
}
