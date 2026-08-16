"use client"

import { useEffect, useState } from "react"
import { Truck } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import type { DeliveryPartner } from "@/lib/order-types"

const emptyForm = { partnerId: "", name: "", phone: "", vehicleNumber: "", active: true }

export default function AdminDeliveryPartnersPage() {
  const [partners, setPartners] = useState<DeliveryPartner[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")
  const [form, setForm] = useState(emptyForm)

  async function loadPartners() {
    setLoading(true)
    setError("")

    try {
      const response = await fetch("/api/admin/delivery-partners", { cache: "no-store" })
      const payload = (await response.json()) as { partners?: DeliveryPartner[]; error?: string }

      if (!response.ok || !payload.partners) {
        throw new Error(payload.error ?? "Unable to load delivery partners.")
      }

      setPartners(payload.partners)
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Unable to load delivery partners.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const timer = setTimeout(() => void loadPartners(), 0)
    return () => clearTimeout(timer)
  }, [])

  async function submitPartner() {
    if (!form.partnerId.trim() || !form.name.trim() || !form.phone.trim() || !form.vehicleNumber.trim()) {
      setError("Fill in partner ID, name, phone, and vehicle number.")
      return
    }

    setSaving(true)
    setError("")

    try {
      const response = await fetch("/api/admin/delivery-partners", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      })
      const payload = (await response.json()) as { partner?: DeliveryPartner; error?: string }

      if (!response.ok || !payload.partner) {
        throw new Error(payload.error ?? "Unable to save delivery partner.")
      }

      setForm(emptyForm)
      await loadPartners()
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Unable to save delivery partner.")
    } finally {
      setSaving(false)
    }
  }

  return (
    <main className="mx-auto max-w-5xl px-4 py-8">
      <div className="flex items-center gap-3">
        <Truck className="size-6 text-primary" />
        <h1 className="font-heading text-3xl font-medium">Delivery Partners</h1>
      </div>
      <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
        Create and manage local delivery partners. Assign them to LOCAL orders from the order detail page.
      </p>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Add / Update Partner</CardTitle>
          <CardDescription>Use an existing partner ID to update their details.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="grid gap-2">
            <Label htmlFor="partnerId">Partner ID</Label>
            <Input
              id="partnerId"
              placeholder="DP001"
              value={form.partnerId}
              onChange={(event) => setForm((current) => ({ ...current, partnerId: event.target.value }))}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              placeholder="Mani"
              value={form.name}
              onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="phone">Phone</Label>
            <Input
              id="phone"
              placeholder="9876543210"
              value={form.phone}
              onChange={(event) => setForm((current) => ({ ...current, phone: event.target.value }))}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="vehicleNumber">Vehicle Number</Label>
            <Input
              id="vehicleNumber"
              placeholder="TN72 AB 1234"
              value={form.vehicleNumber}
              onChange={(event) => setForm((current) => ({ ...current, vehicleNumber: event.target.value }))}
            />
          </div>
          <div className="grid gap-2">
            <Label>Status</Label>
            <Select
              value={form.active ? "active" : "inactive"}
              onValueChange={(value) => setForm((current) => ({ ...current, active: value === "active" }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-end">
            <Button onClick={submitPartner} disabled={saving} className="w-full sm:w-auto">
              {saving ? "Saving..." : "Save Partner"}
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
          <CardTitle>All Partners</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-hidden rounded-2xl border border-border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Partner ID</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Vehicle</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="py-10 text-center text-muted-foreground">
                      Loading partners...
                    </TableCell>
                  </TableRow>
                ) : partners.length > 0 ? (
                  partners.map((partner) => (
                    <TableRow key={partner.partnerId}>
                      <TableCell className="font-medium">{partner.partnerId}</TableCell>
                      <TableCell>{partner.name}</TableCell>
                      <TableCell>{partner.phone}</TableCell>
                      <TableCell>{partner.vehicleNumber}</TableCell>
                      <TableCell>
                        <Badge variant={partner.active ? "default" : "secondary"}>
                          {partner.active ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="py-10 text-center text-muted-foreground">
                      No delivery partners yet.
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
