"use client"

import { use, useEffect, useState } from "react"

import { ProductForm } from "@/components/admin/products/product-form"
import { adminFetch } from "@/lib/admin-fetch"
import type { Product } from "@/types/catalogue"

export default function AdminProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    let cancelled = false

    async function loadProduct() {
      try {
        const response = await adminFetch(`/api/admin/products/${id}`, { cache: "no-store" })
        const payload = (await response.json()) as { product?: Product; error?: string }

        if (!response.ok || !payload.product) {
          throw new Error(payload.error ?? "Product not found.")
        }

        if (!cancelled) {
          setProduct(payload.product)
        }
      } catch (loadError) {
        if (!cancelled) {
          setError(loadError instanceof Error ? loadError.message : "Product not found.")
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    void loadProduct()

    return () => {
      cancelled = true
    }
  }, [id])

  return (
    <main className="w-full px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="font-heading text-3xl font-medium">Edit Product</h1>
      <p className="mt-2 text-sm text-muted-foreground">Product edits will not alter historical order snapshots.</p>
      <div className="mt-6">
        {loading ? (
          <p className="text-sm text-muted-foreground">Loading...</p>
        ) : error ? (
          <p className="text-sm text-destructive">{error}</p>
        ) : (
          <ProductForm product={product} />
        )}
      </div>
    </main>
  )
}
