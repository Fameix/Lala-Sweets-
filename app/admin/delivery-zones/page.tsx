"use client"

import { useEffect, useState } from "react"
import { MapPinned } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { adminFetch } from "@/lib/admin-fetch"
import type { DeliveryZone } from "@/lib/delivery-zones-server"

const emptyForm = {
  zoneId: "",
  name: "",
  pincodes: "",
  deliveryType: "LOCAL" as "LOCAL" | "COURIER",
  chargePaise: "",
}

export default function AdminDeliveryZonesPage() {
  const [zones, setZones] = useState<DeliveryZone[]>([])
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")

  async function loadZones() {
    setLoading(true)

    try {
      const response = await adminFetch("/api/admin/delivery-zones", { cache: "no-store" })
      const payload = (await response.json()) as { zones?: DeliveryZone[] }
      setZones(payload.zones ?? [])
    } catch {
      setZones([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const timer = setTimeout(() => void loadZones(), 0)
    return () => clearTimeout(timer)
  }, [])

  async function createZone() {
    const pincodes = form.pincodes
      .split(",")
      .map((value) => value.trim())
      .filter(Boolean)

    if (!form.zoneId.trim() || !form.name.trim() || pincodes.length === 0 || !form.chargePaise) {
      setError("Fill in zone ID, name, at least one pincode, and delivery charge.")
      return
    }

    setSaving(true)
    setError("")

    try {
      const response = await adminFetch("/api/admin/delivery-zones", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          zoneId: form.zoneId,
          name: form.name,
          pincodes,
          deliveryType: form.deliveryType,
          chargePaise: Math.round(Number(form.chargePaise) * 100),
          active: true,
        }),
      })
      const payload = (await response.json()) as { error?: string }

      if (!response.ok) {
        throw new Error(payload.error ?? "Unable to save delivery zone.")
      }

      setForm(emptyForm)
      await loadZones()
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Unable to save delivery zone.")
    } finally {
      setSaving(false)
    }
  }

  async function deleteZone(zoneId: string) {
    const response = await adminFetch(`/api/admin/delivery-zones/${zoneId}`, { method: "DELETE" })

    if (response.ok) {
      void loadZones()
    }
  }

  return (
    <main className="w-full px-4 py-8 sm:px-6 lg:px-8">
      <div className="flex items-center gap-3">
        <MapPinned className="size-6 text-primary" />
        <h1 className="font-heading text-3xl font-medium">Delivery Zones</h1>
      </div>
      <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
        Pincode-to-delivery-type mapping used at checkout. Once at least one zone exists here, it takes over from the
        built-in default list for every new order.
      </p>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Add Zone</CardTitle>
          <CardDescription>Comma-separated 6-digit pincodes.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="grid gap-2">
            <Label htmlFor="zoneId">Zone ID</Label>
            <Input id="zoneId" placeholder="tirunelveli-local" value={form.zoneId} onChange={(event) => setForm((current) => ({ ...current, zoneId: event.target.value }))} />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="zoneName">Name</Label>
            <Input id="zoneName" value={form.name} onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))} />
          </div>
          <div className="grid gap-2 sm:col-span-2">
            <Label htmlFor="pincodes">Pincodes</Label>
            <Input id="pincodes" placeholder="627001, 627002, 627003" value={form.pincodes} onChange={(event) => setForm((current) => ({ ...current, pincodes: event.target.value }))} />
          </div>
          <div className="grid gap-2">
            <Label>Delivery type</Label>
            <Select value={form.deliveryType} onValueChange={(value) => setForm((current) => ({ ...current, deliveryType: value as "LOCAL" | "COURIER" }))}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="LOCAL">Local delivery</SelectItem>
                <SelectItem value="COURIER">Courier</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="chargePaise">Delivery charge (Rs.)</Label>
            <Input id="chargePaise" type="number" min={0} value={form.chargePaise} onChange={(event) => setForm((current) => ({ ...current, chargePaise: event.target.value }))} />
          </div>
          <div className="flex items-end sm:col-span-2">
            <Button onClick={createZone} disabled={saving}>
              {saving ? "Saving..." : "Add Zone"}
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
          <CardTitle>All Zones</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-hidden rounded-2xl border border-border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Charge</TableHead>
                  <TableHead>Pincodes</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="py-10 text-center text-muted-foreground">
                      Loading zones...
                    </TableCell>
                  </TableRow>
                ) : zones.length > 0 ? (
                  zones.map((zone) => (
                    <TableRow key={zone.zoneId}>
                      <TableCell className="font-medium">{zone.name}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{zone.deliveryType}</Badge>
                      </TableCell>
                      <TableCell>Rs. {(zone.chargePaise / 100).toFixed(0)}</TableCell>
                      <TableCell className="text-xs text-muted-foreground">{zone.pincodes.join(", ")}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="outline" size="sm" onClick={() => void deleteZone(zone.zoneId)}>
                          Delete
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="py-10 text-center text-muted-foreground">
                      No zones configured yet - checkout is using the built-in default list.
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
