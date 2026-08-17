"use client"

import { useEffect, useState } from "react"
import { FolderTree } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { adminFetch } from "@/lib/admin-fetch"
import type { CategorySummary } from "@/types/catalogue"

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
}

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<CategorySummary[]>([])
  const [loading, setLoading] = useState(true)
  const [name, setName] = useState("")
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")

  async function loadCategories() {
    setLoading(true)

    try {
      const response = await adminFetch("/api/admin/categories", { cache: "no-store" })
      const payload = (await response.json()) as { categories?: CategorySummary[] }
      setCategories(payload.categories ?? [])
    } catch {
      setCategories([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const timer = setTimeout(() => void loadCategories(), 0)
    return () => clearTimeout(timer)
  }, [])

  async function createCategory() {
    if (!name.trim()) {
      setError("Enter a category name.")
      return
    }

    setSaving(true)
    setError("")

    try {
      const response = await adminFetch("/api/admin/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug: slugify(name), name: name.trim() }),
      })
      const payload = (await response.json()) as { error?: string }

      if (!response.ok) {
        throw new Error(payload.error ?? "Unable to save category.")
      }

      setName("")
      await loadCategories()
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Unable to save category.")
    } finally {
      setSaving(false)
    }
  }

  async function deleteCategory(slug: string) {
    const response = await adminFetch(`/api/admin/categories/${slug}`, { method: "DELETE" })

    if (response.ok) {
      void loadCategories()
    }
  }

  return (
    <main className="w-full px-4 py-8 sm:px-6 lg:px-8">
      <div className="flex items-center gap-3">
        <FolderTree className="size-6 text-primary" />
        <h1 className="font-heading text-3xl font-medium">Categories</h1>
      </div>
      <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
        Categories shown here appear in the storefront navigation once at least one active product uses them.
      </p>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Add Category</CardTitle>
          <CardDescription>Product counts update automatically based on assigned products.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap items-end gap-3">
          <div className="grid gap-2">
            <Label htmlFor="category-name">Name</Label>
            <Input id="category-name" value={name} onChange={(event) => setName(event.target.value)} />
          </div>
          <Button onClick={createCategory} disabled={saving}>
            {saving ? "Saving..." : "Add Category"}
          </Button>
        </CardContent>
      </Card>

      {error ? (
        <Card className="mt-4">
          <CardContent className="py-4 text-sm text-destructive">{error}</CardContent>
        </Card>
      ) : null}

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>All Categories</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-hidden rounded-2xl border border-border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Slug</TableHead>
                  <TableHead>Products</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={4} className="py-10 text-center text-muted-foreground">
                      Loading categories...
                    </TableCell>
                  </TableRow>
                ) : categories.length > 0 ? (
                  categories.map((category) => (
                    <TableRow key={category.slug}>
                      <TableCell className="font-medium">{category.name}</TableCell>
                      <TableCell className="text-muted-foreground">{category.slug}</TableCell>
                      <TableCell>{category.productCount}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="outline" size="sm" onClick={() => void deleteCategory(category.slug)}>
                          Delete
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} className="py-10 text-center text-muted-foreground">
                      No categories yet.
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
