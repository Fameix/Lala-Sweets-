"use client"

import { useEffect, useState } from "react"
import { Warehouse } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { adminFetch } from "@/lib/admin-fetch"
import type { Product } from "@/types/catalogue"

export default function AdminInventoryPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [adjustments, setAdjustments] = useState<Record<string, string>>({})
  const [busyId, setBusyId] = useState<string | null>(null)
  const [error, setError] = useState("")

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

  async function applyAdjustment(product: Product, direction: 1 | -1) {
    const rawValue = Number(adjustments[product.id] ?? 0)

    if (!rawValue || rawValue <= 0) {
      setError("Enter a positive quantity to adjust.")
      return
    }

    setBusyId(product.id)
    setError("")

    try {
      const response = await adminFetch(`/api/admin/products/${product.id}/stock`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          delta: rawValue * direction,
          reason: direction === 1 ? "Manual restock" : "Manual deduction",
        }),
      })
      const payload = (await response.json()) as { error?: string }

      if (!response.ok) {
        throw new Error(payload.error ?? "Unable to adjust stock.")
      }

      setAdjustments((current) => ({ ...current, [product.id]: "" }))
      await loadProducts()
    } catch (adjustError) {
      setError(adjustError instanceof Error ? adjustError.message : "Unable to adjust stock.")
    } finally {
      setBusyId(null)
    }
  }

  return (
    <main className="w-full px-4 py-8 sm:px-6 lg:px-8">
      <div className="flex items-center gap-3">
        <Warehouse className="size-6 text-primary" />
        <h1 className="font-heading text-3xl font-medium">Inventory</h1>
      </div>
      <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
        Stock levels are tracked per product. Every adjustment is recorded with a reason for audit.
      </p>

      {error ? <p className="mt-4 text-sm text-destructive">{error}</p> : null}

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Stock Levels</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-hidden rounded-2xl border border-border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Quantity</TableHead>
                  <TableHead className="text-right">Adjust</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={4} className="py-10 text-center text-muted-foreground">
                      Loading inventory...
                    </TableCell>
                  </TableRow>
                ) : products.length > 0 ? (
                  products.map((product) => (
                    <TableRow key={product.id}>
                      <TableCell className="font-medium">{product.display_name}</TableCell>
                      <TableCell>
                        <Badge variant={product.stock_status === "out-of-stock" ? "destructive" : product.stock_status === "limited" ? "secondary" : "outline"}>
                          {product.stock_status ?? "in-stock"}
                        </Badge>
                      </TableCell>
                      <TableCell>{product.stock_quantity ?? 0}</TableCell>
                      <TableCell>
                        <div className="flex items-center justify-end gap-2">
                          <Input
                            type="number"
                            min={1}
                            className="w-20"
                            value={adjustments[product.id] ?? ""}
                            onChange={(event) =>
                              setAdjustments((current) => ({ ...current, [product.id]: event.target.value }))
                            }
                          />
                          <Button
                            size="sm"
                            variant="outline"
                            disabled={busyId === product.id}
                            onClick={() => void applyAdjustment(product, 1)}
                          >
                            Add
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            disabled={busyId === product.id}
                            onClick={() => void applyAdjustment(product, -1)}
                          >
                            Remove
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} className="py-10 text-center text-muted-foreground">
                      No products yet.
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
