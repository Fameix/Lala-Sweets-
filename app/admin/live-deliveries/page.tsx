"use client"

import { useEffect, useState } from "react"
import { Phone, Radio, Truck } from "lucide-react"

import { AdminLiveMap, type ActiveDelivery } from "@/components/admin/live-deliveries/admin-live-map"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { adminFetch, getAdminIdToken } from "@/lib/admin-fetch"
import type { SavedOrder } from "@/lib/order-types"
import { cn } from "@/lib/utils"

const googleMapsApiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY

type LiveLocation = { latitude: number; longitude: number; heading?: number; isOnline?: boolean }

export default function AdminLiveDeliveriesPage() {
  const [orders, setOrders] = useState<SavedOrder[]>([])
  const [locations, setLocations] = useState<Record<string, LiveLocation | null>>({})
  const [loading, setLoading] = useState(true)
  const [focusedOrderId, setFocusedOrderId] = useState<string | null>(null)

  async function loadActiveOrders() {
    setLoading(true)

    try {
      const response = await adminFetch("/api/admin/orders", { cache: "no-store" })
      const payload = (await response.json()) as { orders?: SavedOrder[] }
      const active = (payload.orders ?? []).filter(
        (order) =>
          order.deliveryType === "LOCAL" &&
          (order.orderStatus === "ASSIGNED" || order.orderStatus === "OUT_FOR_DELIVERY") &&
          order.deliveryPartner,
      )
      setOrders(active)
    } catch {
      setOrders([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const timer = setTimeout(() => void loadActiveOrders(), 0)
    const interval = setInterval(() => void loadActiveOrders(), 30_000)
    return () => {
      clearTimeout(timer)
      clearInterval(interval)
    }
  }, [])

  // Poll each active order's authoritative location on a shared interval -
  // an admin overview doesn't need the customer tracker's sub-second RTDB
  // listener, and polling avoids opening one socket per active rider.
  useEffect(() => {
    if (orders.length === 0) {
      return
    }

    let cancelled = false

    async function loadLocations() {
      const token = await getAdminIdToken().catch(() => null)
      if (!token || cancelled) {
        return
      }

      const entries = await Promise.all(
        orders.map(async (order) => {
          try {
            const response = await fetch(`/api/orders/${order.orderId}/location`, {
              headers: { Authorization: `Bearer ${token}` },
              cache: "no-store",
            })
            const payload = (await response.json()) as { liveLocation?: LiveLocation }
            return [order.orderId, response.ok ? (payload.liveLocation ?? null) : null] as const
          } catch {
            return [order.orderId, null] as const
          }
        }),
      )

      if (!cancelled) {
        setLocations(Object.fromEntries(entries))
      }
    }

    void loadLocations()
    const interval = setInterval(() => void loadLocations(), 10_000)

    return () => {
      cancelled = true
      clearInterval(interval)
    }
  }, [orders])

  const deliveries: ActiveDelivery[] = orders.map((order) => ({
    orderId: order.orderId,
    partnerName: order.deliveryPartner?.name ?? "Rider",
    customerName: order.customer.name,
    destinationAddress: order.address,
    location: locations[order.orderId]
      ? {
          latitude: locations[order.orderId]!.latitude,
          longitude: locations[order.orderId]!.longitude,
          heading: locations[order.orderId]!.heading,
          isOnline: locations[order.orderId]!.isOnline,
        }
      : null,
  }))

  return (
    <main className="w-full px-4 py-8 sm:px-6 lg:px-8">
      <div className="flex items-center gap-3">
        <Radio className="size-6 text-primary" />
        <h1 className="font-heading text-3xl font-medium">Live Deliveries</h1>
      </div>
      <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
        Real-time positions of riders currently out for delivery.
      </p>

      <div className="mt-6 grid gap-4 lg:grid-cols-[1fr_22rem]">
        <AdminLiveMap apiKey={googleMapsApiKey} deliveries={deliveries} focusedOrderId={focusedOrderId} className="min-h-[28rem]" />

        <Card className="max-h-[32rem] overflow-y-auto">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Truck className="size-4 text-primary" />
              Active Deliveries ({deliveries.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-2">
            {loading ? (
              <p className="py-6 text-center text-sm text-muted-foreground">Loading active deliveries...</p>
            ) : deliveries.length === 0 ? (
              <p className="py-6 text-center text-sm text-muted-foreground">No deliveries in progress right now.</p>
            ) : (
              orders.map((order) => {
                const location = locations[order.orderId]

                return (
                  <button
                    key={order.orderId}
                    type="button"
                    onClick={() => setFocusedOrderId(order.orderId === focusedOrderId ? null : order.orderId)}
                    className={cn(
                      "rounded-2xl border p-3 text-left transition",
                      order.orderId === focusedOrderId ? "border-primary bg-primary/5" : "border-border hover:bg-muted/60",
                    )}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-medium">{order.deliveryPartner?.name}</span>
                      {location ? (
                        <Badge className="bg-live text-live-foreground">Live</Badge>
                      ) : (
                        <Badge variant="secondary">No signal</Badge>
                      )}
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">
                      #{order.orderId} • {order.customer.name}
                    </p>
                    <div className="mt-2 flex items-center justify-between gap-2">
                      <Badge variant="outline">{order.orderStatus === "OUT_FOR_DELIVERY" ? "Out for delivery" : "Assigned"}</Badge>
                      {order.deliveryPartner?.phone ? (
                        <a
                          href={`tel:${order.deliveryPartner.phone}`}
                          onClick={(event) => event.stopPropagation()}
                          className="flex items-center gap-1 text-xs text-primary"
                        >
                          <Phone className="size-3" />
                          Call
                        </a>
                      ) : null}
                    </div>
                  </button>
                )
              })
            )}
          </CardContent>
        </Card>
      </div>
    </main>
  )
}
