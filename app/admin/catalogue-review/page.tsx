"use client"

import { useEffect, useState } from "react"

import { FoodTypeBadge } from "@/components/commerce/food-type-badge"
import { PriceStatusBadge } from "@/components/commerce/price-status-badge"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { adminFetch } from "@/lib/admin-fetch"
import { formatProductPrice, isCakeReadyToPublish } from "@/lib/catalogue"
import type { Product } from "@/types/catalogue"

export default function CatalogueReviewPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false

    async function loadProducts() {
      try {
        const response = await adminFetch("/api/admin/products", { cache: "no-store" })
        const payload = (await response.json()) as { products?: Product[] }

        if (!cancelled) {
          setProducts(payload.products ?? [])
        }
      } catch {
        if (!cancelled) {
          setProducts([])
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    void loadProducts()

    return () => {
      cancelled = true
    }
  }, [])

  return (
    <main className="w-full px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="font-heading text-3xl font-medium">Catalogue Review</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Review extracted products before enabling public ordering. Prices must be entered manually by authorized staff.
      </p>
      <div className="mt-6 overflow-hidden rounded-2xl border border-border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Product</TableHead>
              <TableHead>Source</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Food</TableHead>
              <TableHead>Cake Config</TableHead>
              <TableHead>Image</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={8} className="py-10 text-center text-muted-foreground">
                  Loading products...
                </TableCell>
              </TableRow>
            ) : products.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="py-10 text-center text-muted-foreground">
                  No products yet.
                </TableCell>
              </TableRow>
            ) : (
              products.map((product) => (
                <TableRow key={product.id}>
                  <TableCell className="font-medium">{product.display_name}</TableCell>
                  <TableCell>{product.source_name}</TableCell>
                  <TableCell>
                    <div>{product.normalized_category}</div>
                    <div className="text-xs text-muted-foreground">Source: {product.source_category}</div>
                  </TableCell>
                  <TableCell>
                    <div>{formatProductPrice(product)}</div>
                    <div className="mt-1"><PriceStatusBadge product={product} /></div>
                  </TableCell>
                  <TableCell><FoodTypeBadge foodType={product.food_type} /></TableCell>
                  <TableCell>
                    {product.product_type === "cake" ? (
                      <div className="grid gap-1 text-xs text-muted-foreground">
                        <span>{product.subcategory}</span>
                        <span>Flavour: {product.flavour}</span>
                        <span>Weights: {product.available_weights?.length ?? 0}</span>
                        <span>Egg options: {product.cake_type_options?.filter((option) => option.is_available).length ?? 0}</span>
                        <span>Prep: {product.preparation_minutes ?? "missing"}</span>
                      </div>
                    ) : (
                      <span className="text-xs text-muted-foreground">Not a cake</span>
                    )}
                  </TableCell>
                  <TableCell><Badge variant="outline">{product.image_status}</Badge></TableCell>
                  <TableCell>
                    <div className="grid gap-1">
                      <Badge variant={product.verification_status === "needs-review" ? "outline" : "secondary"}>
                        {product.verification_status}
                      </Badge>
                      {product.product_type === "cake" ? (
                        <Badge variant={isCakeReadyToPublish(product) ? "secondary" : "outline"}>
                          {isCakeReadyToPublish(product) ? "Ready to publish" : "Not orderable"}
                        </Badge>
                      ) : null}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </main>
  )
}
