"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { Plus } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button, buttonVariants } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { adminFetch } from "@/lib/admin-fetch"
import { formatProductPrice } from "@/lib/catalogue"
import { cn } from "@/lib/utils"
import type { Product } from "@/types/catalogue"

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState("")

  async function loadProducts() {
    setLoading(true)

    try {
      const response = await adminFetch("/api/admin/products", { cache: "no-store" })
      const payload = (await response.json()) as { products?: Product[] }
      setProducts(payload.products ?? [])
    } catch {
      setProducts([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const timer = setTimeout(() => void loadProducts(), 0)
    return () => clearTimeout(timer)
  }, [])

  async function toggleActive(product: Product) {
    const response = await adminFetch(`/api/admin/products/${product.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        display_name: product.display_name,
        slug: product.slug,
        normalized_category: product.normalized_category,
        short_description: product.short_description,
        long_description: product.long_description,
        image: product.image ?? "",
        price_paise: product.price_paise,
        compare_at_price_paise: product.compare_at_price_paise,
        size_variants: product.size_variants ?? [],
        stock_status: product.stock_status ?? "in-stock",
        stock_quantity: product.stock_quantity ?? 0,
        is_active: !product.is_active,
        is_orderable: product.is_orderable,
        is_featured: product.is_featured,
      }),
    })

    if (response.ok) {
      void loadProducts()
    }
  }

  const filtered = products.filter((product) =>
    product.display_name.toLowerCase().includes(query.trim().toLowerCase()),
  )

  return (
    <main className="w-full px-4 py-8 sm:px-6 lg:px-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-heading text-3xl font-medium">Products</h1>
        <Link href="/admin/products/new" className={cn(buttonVariants(), "gap-2")}>
          <Plus className="size-4" />
          New Product
        </Link>
      </div>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>All Products</CardTitle>
          <Input
            placeholder="Search products..."
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            className="mt-2 max-w-sm"
          />
        </CardHeader>
        <CardContent>
          <div className="overflow-hidden rounded-2xl border border-border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Stock</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="py-10 text-center text-muted-foreground">
                      Loading products...
                    </TableCell>
                  </TableRow>
                ) : filtered.length > 0 ? (
                  filtered.map((product) => (
                    <TableRow key={product.id}>
                      <TableCell className="font-medium">{product.display_name}</TableCell>
                      <TableCell>{product.normalized_category}</TableCell>
                      <TableCell>{formatProductPrice(product)}</TableCell>
                      <TableCell>
                        <Badge variant={product.stock_status === "out-of-stock" ? "destructive" : "outline"}>
                          {product.stock_status ?? "in-stock"} ({product.stock_quantity ?? 0})
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={product.is_active ? "default" : "secondary"}>
                          {product.is_active ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell className="flex justify-end gap-2 text-right">
                        <Link href={`/admin/products/${product.id}`} className={cn(buttonVariants({ variant: "outline", size: "sm" }))}>
                          Edit
                        </Link>
                        <Button variant="outline" size="sm" onClick={() => void toggleActive(product)}>
                          {product.is_active ? "Deactivate" : "Activate"}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="py-10 text-center text-muted-foreground">
                      No products yet. Seed the catalogue or add one manually.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </main>
  )
}
