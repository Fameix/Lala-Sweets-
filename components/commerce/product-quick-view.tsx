"use client"

import Image from "next/image"
import Link from "next/link"
import { useState } from "react"
import { CheckCircle2, MessageCircle, Phone, Star } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { buttonVariants } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { formatProductPrice } from "@/lib/catalogue"
import { getProductImage } from "@/lib/product-images"
import { cn } from "@/lib/utils"
import type { Product } from "@/types/catalogue"

export function ProductQuickView({
  product,
  triggerClassName,
  triggerMode = "cart",
}: {
  product: Product
  triggerClassName?: string
  triggerMode?: "cart" | "details"
}) {
  const [open, setOpen] = useState(false)
  const image = getProductImage(product)
  const imageBadge = image.status === "missing" ? "Product image pending" : "Product image"
  const whatsappHref = `https://wa.me/918220266077?text=${encodeURIComponent(`Vanakkam, I would like to enquire about ${product.display_name}.`)}`

  return (
    <>
      {triggerMode === "details" ? (
        <button
          type="button"
          className={cn("absolute inset-0 rounded-2xl focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50", triggerClassName)}
          onClick={() => setOpen(true)}
          aria-label={`View details for ${product.display_name}`}
        >
          <span className="sr-only">View details for {product.display_name}</span>
        </button>
      ) : (
        <button
          type="button"
          className={cn(buttonVariants({ variant: "outline" }), triggerClassName)}
          onClick={() => setOpen(true)}
          aria-label={`View ${product.display_name}`}
        >
          View
        </button>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent
          className="max-h-[calc(100svh-2rem)] max-w-[min(55rem,calc(100%-1rem))] gap-0 overflow-hidden rounded-4xl p-0 sm:max-w-[55rem]"
          showCloseButton={false}
        >
          <DialogHeader className="sr-only">
            <DialogTitle>{product.display_name}</DialogTitle>
            <DialogDescription>Product quick view</DialogDescription>
          </DialogHeader>

          <div className="grid max-h-[calc(100svh-2rem)] min-h-[34rem] lg:grid-cols-[0.92fr_1fr]">
            <div className="flex min-h-0 flex-col border-border lg:border-r">
              <div className="relative aspect-[1.08/1] min-h-72 bg-muted lg:aspect-auto lg:h-[25.5rem]">
                <Image
                  src={image.src}
                  alt={image.alt}
                  fill
                  sizes="(min-width: 1024px) 27rem, 100vw"
                  className={cn("object-cover", image.className)}
                  priority={open}
                />
                <div className="absolute left-4 top-4">
                  <Badge variant="secondary">{imageBadge}</Badge>
                </div>
              </div>

              <div className="flex flex-1 flex-col bg-popover">
                <div className="space-y-4 p-4 sm:p-5">
                  <div className="flex items-start gap-3">
                    <span className="mt-1 flex size-4 shrink-0 items-center justify-center rounded-[calc(var(--radius-sm)/2)] border border-primary text-primary">
                      <span className="size-2 rounded-full bg-primary" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="mb-2 flex flex-wrap gap-2">
                        <Badge variant="outline">{product.normalized_category}</Badge>
                        {product.verification_status === "needs-review" ? (
                          <Badge variant="outline">Needs review</Badge>
                        ) : null}
                      </div>
                      <h2 className="line-clamp-2 font-heading text-xl font-medium leading-7">
                        {product.display_name}
                      </h2>
                      <p className="mt-1 text-lg font-semibold">{formatProductPrice(product)}</p>
                      <div className="mt-2 flex items-center gap-1 text-sm">
                        <Star className="size-4 fill-primary text-primary" />
                        <span className="font-medium">Catalogue review</span>
                      <span className="text-muted-foreground">({product.normalized_category})</span>
                      </div>
                    </div>
                  </div>

                  <p className="line-clamp-4 text-sm leading-6 text-muted-foreground">
                    {product.long_description}
                  </p>

                  <div className="grid gap-2 rounded-2xl bg-muted p-3 text-sm">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="size-4 text-primary" />
                      <span>{product.food_type}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="size-4 text-primary" />
                      <span>Availability: {product.stock_status ?? product.availability_status}</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <CheckCircle2 className="size-4" />
                      <span>Sizes: {(product.availableSizes ?? []).join(", ")}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-auto border-t border-border bg-popover p-4 sm:p-5">
                  <div className="grid grid-cols-[1fr_auto] items-center gap-4 overflow-hidden rounded-[calc(var(--radius)+4px)] bg-primary text-primary-foreground">
                    <div className="min-w-0 px-4 py-3">
                      <p className="text-lg font-semibold leading-none">{formatProductPrice(product)}</p>
                    </div>
                    <Link href={whatsappHref} className="inline-flex h-full min-w-32 items-center justify-center gap-2 px-4 py-3 text-sm font-semibold transition hover:bg-primary-foreground/10 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50">
                      <MessageCircle className="size-4" />
                      Enquire
                    </Link>
                  </div>
                </div>
              </div>
            </div>

            <div className="relative flex min-h-0 flex-col bg-popover">
              <button
                type="button"
                aria-label="Close product quick view"
                className="absolute right-4 top-4 inline-flex size-9 items-center justify-center rounded-full bg-background/90 text-foreground shadow-sm ring-1 ring-border backdrop-blur transition hover:bg-background focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
                onClick={() => setOpen(false)}
              >
                <span className="text-xl leading-none">x</span>
              </button>

              <div className="min-h-0 flex-1 overflow-y-auto p-4 pr-3 sm:p-5 sm:pr-4">
                <div className="space-y-6 pr-1">
                  <section className="space-y-4">
                    <h3 className="font-heading text-xl font-medium">Enquire Directly</h3>
                    <p className="text-sm leading-6 text-muted-foreground">
                      Online checkout is intentionally inactive until the business confirms current prices, pack sizes and fulfilment details.
                    </p>
                    <div className="grid gap-3">
                      <Link href={whatsappHref} className={cn(buttonVariants())}>
                        <MessageCircle className="size-4" />
                        Enquire on WhatsApp
                      </Link>
                      <Link href="tel:+918220266077" className={cn(buttonVariants({ variant: "outline" }))}>
                        <Phone className="size-4" />
                        Call +91 82202 66077
                      </Link>
                    </div>
                  </section>
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
