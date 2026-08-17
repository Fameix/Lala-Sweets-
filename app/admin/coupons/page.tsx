"use client"

import { useEffect, useState } from "react"
import { BadgePercent } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { adminFetch } from "@/lib/admin-fetch"
import type { Coupon } from "@/lib/coupons-server"

const emptyForm = {
  code: "",
  discountType: "PERCENT" as "PERCENT" | "FLAT",
  discountValue: "",
  minOrderPaise: "",
  maxDiscountPaise: "",
  usageLimit: "",
}

export default function AdminCouponsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([])
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")

  async function loadCoupons() {
    setLoading(true)

    try {
      const response = await adminFetch("/api/admin/coupons", { cache: "no-store" })
      const payload = (await response.json()) as { coupons?: Coupon[] }
      setCoupons(payload.coupons ?? [])
    } catch {
      setCoupons([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const timer = setTimeout(() => void loadCoupons(), 0)
    return () => clearTimeout(timer)
  }, [])

  async function createCoupon() {
    if (!form.code.trim() || !form.discountValue) {
      setError("Enter a coupon code and discount value.")
      return
    }

    setSaving(true)
    setError("")

    try {
      const response = await adminFetch("/api/admin/coupons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: form.code,
          discountType: form.discountType,
          discountValue: Number(form.discountValue),
          minOrderPaise: form.minOrderPaise ? Math.round(Number(form.minOrderPaise) * 100) : 0,
          maxDiscountPaise: form.maxDiscountPaise ? Math.round(Number(form.maxDiscountPaise) * 100) : null,
          usageLimit: form.usageLimit ? Number(form.usageLimit) : null,
          validFrom: null,
          validUntil: null,
          active: true,
        }),
      })
      const payload = (await response.json()) as { error?: string }

      if (!response.ok) {
        throw new Error(payload.error ?? "Unable to save coupon.")
      }

      setForm(emptyForm)
      await loadCoupons()
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Unable to save coupon.")
    } finally {
      setSaving(false)
    }
  }

  async function deleteCoupon(code: string) {
    const response = await adminFetch(`/api/admin/coupons/${code}`, { method: "DELETE" })

    if (response.ok) {
      void loadCoupons()
    }
  }

  return (
    <main className="w-full px-4 py-8 sm:px-6 lg:px-8">
      <div className="flex items-center gap-3">
        <BadgePercent className="size-6 text-primary" />
        <h1 className="font-heading text-3xl font-medium">Coupons</h1>
      </div>
      <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
        Discounts are validated and recomputed server-side at checkout - the amount shown here is what actually gets
        charged.
      </p>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Create Coupon</CardTitle>
          <CardDescription>Leave min order / max discount / usage limit blank for no limit.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-3">
          <div className="grid gap-2">
            <Label htmlFor="code">Code</Label>
            <Input
              id="code"
              placeholder="LALA10"
              value={form.code}
              onChange={(event) => setForm((current) => ({ ...current, code: event.target.value.toUpperCase() }))}
            />
          </div>
          <div className="grid gap-2">
            <Label>Type</Label>
            <Select value={form.discountType} onValueChange={(value) => setForm((current) => ({ ...current, discountType: value as "PERCENT" | "FLAT" }))}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="PERCENT">Percent off</SelectItem>
                <SelectItem value="FLAT">Flat amount off (Rs.)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="discountValue">{form.discountType === "PERCENT" ? "Percent" : "Amount (Rs.)"}</Label>
            <Input
              id="discountValue"
              type="number"
              min={1}
              value={form.discountValue}
              onChange={(event) => setForm((current) => ({ ...current, discountValue: event.target.value }))}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="minOrder">Min order (Rs.)</Label>
            <Input
              id="minOrder"
              type="number"
              min={0}
              value={form.minOrderPaise}
              onChange={(event) => setForm((current) => ({ ...current, minOrderPaise: event.target.value }))}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="maxDiscount">Max discount (Rs.)</Label>
            <Input
              id="maxDiscount"
              type="number"
              min={0}
              value={form.maxDiscountPaise}
              onChange={(event) => setForm((current) => ({ ...current, maxDiscountPaise: event.target.value }))}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="usageLimit">Usage limit</Label>
            <Input
              id="usageLimit"
              type="number"
              min={1}
              value={form.usageLimit}
              onChange={(event) => setForm((current) => ({ ...current, usageLimit: event.target.value }))}
            />
          </div>
          <div className="flex items-end sm:col-span-3">
            <Button onClick={createCoupon} disabled={saving}>
              {saving ? "Saving..." : "Create Coupon"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {error ? (
        <Card className="mt-4">
          <CardContent className="py-4 text-sm text-destructive">{error}</CardContent>
        </Card>
      ) : null}

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>All Coupons</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-hidden rounded-2xl border border-border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Code</TableHead>
                  <TableHead>Discount</TableHead>
                  <TableHead>Min order</TableHead>
                  <TableHead>Used</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="py-10 text-center text-muted-foreground">
                      Loading coupons...
                    </TableCell>
                  </TableRow>
                ) : coupons.length > 0 ? (
                  coupons.map((coupon) => (
                    <TableRow key={coupon.code}>
                      <TableCell className="font-medium">{coupon.code}</TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {coupon.discountType === "PERCENT" ? `${coupon.discountValue}%` : `Rs. ${coupon.discountValue}`}
                        </Badge>
                      </TableCell>
                      <TableCell>Rs. {(coupon.minOrderPaise / 100).toFixed(0)}</TableCell>
                      <TableCell>
                        {coupon.usedCount}
                        {coupon.usageLimit ? ` / ${coupon.usageLimit}` : ""}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="outline" size="sm" onClick={() => void deleteCoupon(coupon.code)}>
                          Delete
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="py-10 text-center text-muted-foreground">
                      No coupons yet.
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
