"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { adminFetch } from "@/lib/admin-fetch"
import type { ProductWriteInput } from "@/lib/products-schema"
import type { Product } from "@/types/catalogue"

const sizeLabels = ["250g", "500g", "1kg"] as const

function toWriteInput(product?: Product | null): ProductWriteInput {
  return {
    display_name: product?.display_name ?? "",
    slug: product?.slug ?? "",
    normalized_category: product?.normalized_category ?? "",
    short_description: product?.short_description ?? "",
    long_description: product?.long_description ?? "",
    image: product?.image ?? "",
    price_paise: product?.price_paise ?? null,
    compare_at_price_paise: product?.compare_at_price_paise ?? null,
    size_variants:
      product?.size_variants ??
      sizeLabels.map((label) => ({
        label,
        grams: label === "250g" ? 250 : label === "500g" ? 500 : 1000,
        price_paise: 0,
        availability_status: "available" as const,
        is_in_stock: true,
      })),
    stock_status: product?.stock_status ?? "in-stock",
    stock_quantity: product?.stock_quantity ?? 0,
    is_active: product?.is_active ?? true,
    is_orderable: product?.is_orderable ?? true,
    is_featured: product?.is_featured ?? false,
  }
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
}

export function ProductForm({ product }: { product?: Product | null }) {
  const router = useRouter()
  const isEditing = Boolean(product)
  const [form, setForm] = useState<ProductWriteInput>(() => toWriteInput(product))
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")

  function updateVariantPrice(label: string, priceRupees: string) {
    const priceValue = priceRupees ? Math.round(Number(priceRupees) * 100) : 0
    setForm((current) => ({
      ...current,
      size_variants: current.size_variants.map((variant) =>
        variant.label === label ? { ...variant, price_paise: priceValue } : variant,
      ),
    }))
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    setSaving(true)
    setError("")

    try {
      const url = isEditing ? `/api/admin/products/${product!.id}` : "/api/admin/products"
      const response = await adminFetch(url, {
        method: isEditing ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          price_paise: form.size_variants[0]?.price_paise ?? form.price_paise,
        }),
      })
      const payload = (await response.json()) as { product?: Product; error?: string }

      if (!response.ok || !payload.product) {
        throw new Error(payload.error ?? "Unable to save product.")
      }

      router.push("/admin/products")
      router.refresh()
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Unable to save product.")
    } finally {
      setSaving(false)
    }
  }

  return (
    <form className="grid gap-6" onSubmit={handleSubmit}>
      <Card>
        <CardHeader>
          <CardTitle>Basics</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="grid gap-2">
            <Label htmlFor="display_name">Name</Label>
            <Input
              id="display_name"
              required
              value={form.display_name}
              onChange={(event) => {
                const displayName = event.target.value
                setForm((current) => ({
                  ...current,
                  display_name: displayName,
                  slug: isEditing ? current.slug : slugify(displayName),
                }))
              }}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="slug">Slug</Label>
            <Input
              id="slug"
              required
              disabled={isEditing}
              value={form.slug}
              onChange={(event) => setForm((current) => ({ ...current, slug: slugify(event.target.value) }))}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="category">Category</Label>
            <Input
              id="category"
              required
              value={form.normalized_category}
              onChange={(event) => setForm((current) => ({ ...current, normalized_category: event.target.value }))}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="image">Image URL</Label>
            <Input
              id="image"
              value={form.image}
              onChange={(event) => setForm((current) => ({ ...current, image: event.target.value }))}
            />
          </div>
          <div className="grid gap-2 sm:col-span-2">
            <Label htmlFor="short_description">Short description</Label>
            <Input
              id="short_description"
              value={form.short_description}
              onChange={(event) => setForm((current) => ({ ...current, short_description: event.target.value }))}
            />
          </div>
          <div className="grid gap-2 sm:col-span-2">
            <Label htmlFor="long_description">Full description</Label>
            <Textarea
              id="long_description"
              rows={4}
              value={form.long_description}
              onChange={(event) => setForm((current) => ({ ...current, long_description: event.target.value }))}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Pricing by size</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-3">
          {form.size_variants.map((variant) => (
            <div key={variant.label} className="grid gap-2">
              <Label htmlFor={`price-${variant.label}`}>{variant.label} (Rs.)</Label>
              <Input
                id={`price-${variant.label}`}
                type="number"
                min={0}
                step="0.01"
                value={variant.price_paise / 100}
                onChange={(event) => updateVariantPrice(variant.label, event.target.value)}
              />
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Stock &amp; status</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="grid gap-2">
            <Label htmlFor="stock_quantity">Stock quantity</Label>
            <Input
              id="stock_quantity"
              type="number"
              min={0}
              value={form.stock_quantity}
              onChange={(event) =>
                setForm((current) => ({ ...current, stock_quantity: Math.max(0, Number(event.target.value)) }))
              }
            />
          </div>
          <div className="grid gap-2">
            <Label>Stock status</Label>
            <Select
              value={form.stock_status}
              onValueChange={(value) => setForm((current) => ({ ...current, stock_status: value as ProductWriteInput["stock_status"] }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="in-stock">In stock</SelectItem>
                <SelectItem value="limited">Limited</SelectItem>
                <SelectItem value="out-of-stock">Out of stock</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center justify-between rounded-2xl border border-border p-3">
            <Label htmlFor="is_active">Active (visible on storefront)</Label>
            <Switch
              id="is_active"
              checked={form.is_active}
              onCheckedChange={(checked) => setForm((current) => ({ ...current, is_active: checked === true }))}
            />
          </div>
          <div className="flex items-center justify-between rounded-2xl border border-border p-3">
            <Label htmlFor="is_orderable">Orderable</Label>
            <Switch
              id="is_orderable"
              checked={form.is_orderable}
              onCheckedChange={(checked) => setForm((current) => ({ ...current, is_orderable: checked === true }))}
            />
          </div>
          <div className="flex items-center justify-between rounded-2xl border border-border p-3">
            <Label htmlFor="is_featured">Featured</Label>
            <Switch
              id="is_featured"
              checked={form.is_featured}
              onCheckedChange={(checked) => setForm((current) => ({ ...current, is_featured: checked === true }))}
            />
          </div>
        </CardContent>
      </Card>

      {error ? <p className="text-sm text-destructive">{error}</p> : null}

      <div className="flex gap-3">
        <Button type="submit" disabled={saving}>
          {saving ? "Saving..." : isEditing ? "Save changes" : "Create product"}
        </Button>
      </div>
    </form>
  )
}
