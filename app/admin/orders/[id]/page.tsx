"use client"

import { use, useEffect, useState } from "react"
import Link from "next/link"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { orderStatusLabels } from "@/lib/order-status-labels"
import type { DeliveryPartner, OrderStatusCode, SavedOrder } from "@/lib/order-types"

function formatPrice(paise: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(paise / 100)
}

export default function AdminOrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: orderId } = use(params)

  const [order, setOrder] = useState<SavedOrder | null>(null)
  const [partners, setPartners] = useState<DeliveryPartner[]>([])
  const [selectedPartnerId, setSelectedPartnerId] = useState("")
  const [loading, setLoading] = useState(true)
  const [assigning, setAssigning] = useState(false)
  const [advancing, setAdvancing] = useState(false)
  const [error, setError] = useState("")

  async function loadOrder() {
    setLoading(true)
    setError("")

    try {
      const response = await fetch(`/api/orders/${orderId}`, { cache: "no-store" })
      const payload = (await response.json()) as { order?: SavedOrder; error?: string }

      if (!response.ok || !payload.order) {
        throw new Error(payload.error ?? "Order not found.")
      }

      setOrder(payload.order)
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Order not found.")
    } finally {
      setLoading(false)
    }
  }

  async function loadPartners() {
    try {
      const response = await fetch("/api/admin/delivery-partners", { cache: "no-store" })
      const payload = (await response.json()) as { partners?: DeliveryPartner[] }
      setPartners(payload.partners?.filter((partner) => partner.active) ?? [])
    } catch {
      setPartners([])
    }
  }

  useEffect(() => {
    const timer = setTimeout(() => {
      void loadOrder()
      void loadPartners()
    }, 0)
    return () => clearTimeout(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderId])

  async function assignPartner() {
    if (!selectedPartnerId) {
      setError("Choose a delivery partner first.")
      return
    }

    setAssigning(true)
    setError("")

    try {
      const response = await fetch(`/api/admin/orders/${orderId}/assign`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ partnerId: selectedPartnerId }),
      })
      const payload = (await response.json()) as { order?: SavedOrder; error?: string }

      if (!response.ok || !payload.order) {
        throw new Error(payload.error ?? "Unable to assign delivery partner.")
      }

      setOrder(payload.order)
    } catch (assignError) {
      setError(assignError instanceof Error ? assignError.message : "Unable to assign delivery partner.")
    } finally {
      setAssigning(false)
    }
  }

  async function advanceStatus(nextStatus: OrderStatusCode) {
    setAdvancing(true)
    setError("")

    try {
      const response = await fetch(`/api/admin/orders/${orderId}/status`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderStatus: nextStatus }),
      })
      const payload = (await response.json()) as { order?: SavedOrder; error?: string }

      if (!response.ok || !payload.order) {
        throw new Error(payload.error ?? "Unable to update order status.")
      }

      setOrder(payload.order)
    } catch (advanceError) {
      setError(advanceError instanceof Error ? advanceError.message : "Unable to update order status.")
    } finally {
      setAdvancing(false)
    }
  }

  if (loading) {
    return (
      <main className="mx-auto max-w-4xl px-4 py-8">
        <p className="text-sm text-muted-foreground">Loading order...</p>
      </main>
    )
  }

  if (!order) {
    return (
      <main className="mx-auto max-w-4xl px-4 py-8">
        <h1 className="font-heading text-3xl font-medium">Order Detail</h1>
        <p className="mt-3 text-sm text-destructive">{error || "Order not found."}</p>
        <Link href="/admin/orders" className="mt-4 inline-block text-sm text-primary underline underline-offset-4">
          Back to orders
        </Link>
      </main>
    )
  }

  const canAssign = order.deliveryType === "LOCAL" && order.orderStatus !== "DELIVERED" && order.orderStatus !== "CANCELLED"

  return (
    <main className="mx-auto max-w-4xl px-4 py-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-heading text-3xl font-medium">Order {order.orderId}</h1>
        <Badge variant="outline">{orderStatusLabels[order.orderStatus]}</Badge>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_20rem]">
        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Order Details</CardTitle>
              <CardDescription>Preserved snapshot from checkout.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-3 text-sm">
              <Row label="Customer" value={order.customer.name} />
              <Row label="Mobile" value={order.customer.mobile} />
              <Row label="Address" value={order.address} />
              <Row label="Pincode" value={order.pincode} />
              <Row label="Delivery type" value={order.deliveryType} />
              <Row label="Payment" value={`${order.payment.method} (${order.payment.status})`} />
              <Row label="Amount" value={formatPrice(order.amount)} />
              <Separator />
              <Row label="Delivery partner" value={order.deliveryPartner?.name ?? "Not assigned yet"} />
              <Row label="Partner phone" value={order.deliveryPartner?.phone ?? "-"} />
              <Row label="Vehicle number" value={order.deliveryPartner?.vehicleNumber ?? "-"} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Products</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-2 text-sm">
              {order.products.map((product) => (
                <div key={product.id} className="flex justify-between gap-4">
                  <span className="text-muted-foreground">
                    {product.productName} ({product.size}) x {product.quantity}
                  </span>
                  <span>{formatPrice(product.unitPricePaise * product.quantity)}</span>
                </div>
              ))}
              <Separator />
              <div className="flex justify-between gap-4">
                <span className="text-muted-foreground">Subtotal</span>
                <span>{formatPrice(order.totals.subtotalPaise)}</span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-muted-foreground">Delivery charge</span>
                <span>{formatPrice(order.totals.deliveryChargePaise)}</span>
              </div>
              <div className="flex justify-between gap-4 text-base font-semibold">
                <span>Grand total</span>
                <span>{formatPrice(order.totals.grandTotalPaise)}</span>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Order Progress</CardTitle>
              <CardDescription>Advance the order before assigning a delivery partner.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-3">
              {order.orderStatus === "CONFIRMED" ? (
                <Button onClick={() => void advanceStatus("PREPARING")} disabled={advancing}>
                  {advancing ? "Updating..." : "Mark Processing"}
                </Button>
              ) : null}
              {order.orderStatus === "PREPARING" ? (
                <Button onClick={() => void advanceStatus("READY")} disabled={advancing}>
                  {advancing ? "Updating..." : "Mark Ready"}
                </Button>
              ) : null}
              {order.orderStatus === "READY" ? (
                <p className="text-sm text-muted-foreground">
                  Order is packed and ready - assign a delivery partner below.
                </p>
              ) : null}
              {!["CONFIRMED", "PREPARING", "READY"].includes(order.orderStatus) ? (
                <p className="text-sm text-muted-foreground">
                  This order has moved past the processing stage.
                </p>
              ) : null}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Assign Delivery Partner</CardTitle>
              <CardDescription>
                {order.deliveryType === "LOCAL"
                  ? "Assigning a partner moves this order to ASSIGNED."
                  : "This order ships via courier, not local delivery."}
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-3">
              {canAssign ? (
              <>
                <Select value={selectedPartnerId} onValueChange={(value) => setSelectedPartnerId(value ?? "")}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose partner" />
                  </SelectTrigger>
                  <SelectContent>
                    {partners.map((partner) => (
                      <SelectItem key={partner.partnerId} value={partner.partnerId}>
                        {partner.name} ({partner.partnerId})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button onClick={assignPartner} disabled={assigning}>
                  {assigning ? "Assigning..." : "Assign Partner"}
                </Button>
                {partners.length === 0 ? (
                  <p className="text-xs text-muted-foreground">
                    No active partners yet.{" "}
                    <Link href="/admin/delivery-partners" className="text-primary underline underline-offset-4">
                      Create one
                    </Link>
                    .
                  </p>
                ) : null}
              </>
            ) : (
              <p className="text-sm text-muted-foreground">Assignment is not available for this order.</p>
            )}
            {error ? <p className="text-sm text-destructive">{error}</p> : null}
          </CardContent>
        </Card>
        </div>
      </div>
    </main>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-border pb-2 last:border-b-0">
      <span className="text-muted-foreground">{label}</span>
      <span className="max-w-[60%] text-right font-medium">{value}</span>
    </div>
  )
}
