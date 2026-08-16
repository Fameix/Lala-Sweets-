"use client"

import { Suspense, useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { Phone, PartyPopper } from "lucide-react"

import { LiveDeliveryMap, type LatLng } from "@/components/tracking/live-delivery-map"
import { OrderTimeline } from "@/components/tracking/order-timeline"
import { RiderCard } from "@/components/tracking/rider-card"
import { buttonVariants } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { LiveBadge } from "@/components/ui/status-badge"
import { estimateDeliveryEta } from "@/lib/delivery-eta"
import { getFirebaseClientDatabase } from "@/lib/firebase-client"
import { orderStatusLabels, orderStatusMessages } from "@/lib/order-status-labels"
import type { DeliveryType, OrderStatusCode } from "@/lib/order-types"
import { cn } from "@/lib/utils"
import { onValue, ref } from "firebase/database"

const googleMapsApiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
const supportPhone = "+918220266077"

type TrackingPayload = {
  orderId: string
  orderStatus: OrderStatusCode
  deliveryType: DeliveryType
  deliveryPartner: {
    partnerId: string
    name: string
    phone: string
    vehicleNumber: string
    assignedAt: string
  } | null
  courierTracking: {
    courierName: string
    trackingId: string
  } | null
  address?: string
  liveLocation: {
    latitude: number
    longitude: number
    accuracy: number
    timestamp: number
    orderId: string
    partnerId?: string
    isOnline?: boolean
  } | null
}

type OrderResponse = {
  tracking?: TrackingPayload
  error?: string
}

export default function TrackOrderPage() {
  return (
    <Suspense fallback={<main className="mx-auto max-w-lg px-5 py-10 text-sm text-muted-foreground">Loading...</main>}>
      <TrackOrderContent />
    </Suspense>
  )
}

function TrackOrderContent() {
  const searchParams = useSearchParams()
  const orderId = searchParams.get("orderId")?.trim() ?? ""

  const [tracking, setTracking] = useState<TrackingPayload | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [destinationPosition, setDestinationPosition] = useState<LatLng | null>(null)

  useEffect(() => {
    const timer = setTimeout(() => setDestinationPosition(null), 0)
    return () => clearTimeout(timer)
  }, [orderId])

  useEffect(() => {
    if (!orderId) {
      return
    }

    let cancelled = false

    async function loadTracking() {
      setLoading(true)
      setError("")

      try {
        const response = await fetch(`/api/orders/${orderId}/status`, { cache: "no-store" })
        const payload = (await response.json()) as OrderResponse

        if (!response.ok || !payload.tracking) {
          throw new Error(payload.error ?? "Unable to load this order.")
        }

        if (!cancelled) {
          setTracking(payload.tracking)
        }
      } catch (loadError) {
        if (!cancelled) {
          setError(loadError instanceof Error ? loadError.message : "Unable to load this order.")
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    void loadTracking()

    return () => {
      cancelled = true
    }
  }, [orderId])

  useEffect(() => {
    if (!tracking || tracking.deliveryType !== "LOCAL") {
      return
    }

    let unsubscribed = false

    try {
      const database = getFirebaseClientDatabase()
      const liveLocationRef = ref(database, `liveTracking/${tracking.orderId}`)

      const unsubscribe = onValue(liveLocationRef, (snapshot) => {
        if (!snapshot.exists()) {
          return
        }

        const value = snapshot.val() as TrackingPayload["liveLocation"]
        if (!unsubscribed) {
          setTracking((current) => (current ? { ...current, liveLocation: value } : current))
        }
      })

      return () => {
        unsubscribed = true
        unsubscribe()
      }
    } catch {
      return
    }
  }, [tracking?.deliveryType, tracking?.orderId])

  const isLive = tracking?.liveLocation?.isOnline !== false && tracking?.liveLocation != null

  const riderPosition = tracking?.liveLocation
    ? { lat: tracking.liveLocation.latitude, lng: tracking.liveLocation.longitude }
    : null

  const eta = useMemo(() => {
    if (!tracking) {
      return null
    }

    return estimateDeliveryEta({ orderStatus: tracking.orderStatus, riderPosition, destinationPosition })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tracking?.orderStatus, riderPosition?.lat, riderPosition?.lng, destinationPosition])

  const showLiveTracking =
    tracking?.deliveryType === "LOCAL" && tracking.orderStatus !== "DELIVERED" && tracking.orderStatus !== "CANCELLED"
  const showRiderCard = tracking?.deliveryType === "LOCAL" && showLiveTracking

  if (!orderId) {
    return (
      <main className="mx-auto flex min-h-[60svh] max-w-md flex-col items-center justify-center gap-3 px-5 py-10 text-center">
        <h1 className="font-heading text-2xl font-medium">No order selected</h1>
        <p className="text-sm text-muted-foreground">
          Open this page from your order confirmation email or the Track Order button on your order details page.
        </p>
        <div className="mt-2 flex flex-wrap justify-center gap-3">
          <Link href="/account/orders" className={cn(buttonVariants())}>
            View My Orders
          </Link>
          <Link href="/menu" className={cn(buttonVariants({ variant: "outline" }))}>
            Browse Menu
          </Link>
        </div>
      </main>
    )
  }

  return (
    <main className="mx-auto flex min-h-[60svh] max-w-lg flex-col gap-4 px-4 py-6 sm:max-w-2xl sm:px-6 sm:py-10 lg:max-w-6xl">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary">Order Tracking</p>
        <h1 className="mt-1 font-heading text-2xl font-medium sm:text-3xl">Track Order</h1>
      </div>

      {loading && !tracking ? (
        <Card>
          <CardContent className="py-10 text-center text-sm text-muted-foreground">Loading your order...</CardContent>
        </Card>
      ) : null}

      {error ? (
        <Card>
          <CardContent className="py-10 text-center text-sm text-destructive">{error}</CardContent>
        </Card>
      ) : null}

      {tracking ? (
        <div className="grid gap-4 lg:grid-cols-[1.05fr_1.3fr] lg:items-start">
          {/* Hero: order id, headline status, ETA/LIVE */}
          <Card className={cn("order-1 border-primary/15 bg-card lg:order-none lg:col-start-1 lg:row-start-1")}>
            <CardContent className="grid gap-3 py-6">
              <div className="flex items-center justify-between gap-2">
                <p className="text-xs font-medium tracking-wide text-muted-foreground">ORDER #{tracking.orderId}</p>
                {tracking.deliveryType === "LOCAL" && tracking.orderStatus === "OUT_FOR_DELIVERY" ? (
                  <LiveBadge live={isLive} />
                ) : null}
              </div>
              <h2 className="font-heading text-2xl font-medium leading-snug sm:text-3xl">
                {orderStatusMessages[tracking.orderStatus]}
              </h2>
              <p className="text-sm text-muted-foreground">{orderStatusLabels[tracking.orderStatus]}</p>
            </CardContent>
          </Card>

          {/* Compact status timeline */}
          {tracking.orderStatus !== "CANCELLED" ? (
            <Card className="order-4 lg:order-none lg:col-start-1 lg:row-start-2">
              <CardContent className="py-5">
                <OrderTimeline currentStatus={tracking.orderStatus} variant="vertical" />
              </CardContent>
            </Card>
          ) : null}

          {/* Rider card (LOCAL) */}
          {showRiderCard ? (
            <RiderCard
              partner={tracking.deliveryPartner}
              className="order-2 lg:order-none lg:col-start-1 lg:row-start-3"
            />
          ) : null}

          {/* Large live map (LOCAL, main visual element) - nav-style route,
              rider heading, and the live ETA panel all live inside the map
              itself, so there's no separate ETA card duplicating it. */}
          {tracking.deliveryType === "LOCAL" && showLiveTracking ? (
            <LiveDeliveryMap
              key={tracking.orderId}
              apiKey={googleMapsApiKey}
              riderLocation={tracking.liveLocation}
              destinationAddress={tracking.address}
              isLive={isLive}
              statusLabel={orderStatusLabels[tracking.orderStatus]}
              riderName={tracking.deliveryPartner?.name}
              riderPhone={tracking.deliveryPartner?.phone}
              eta={eta}
              onDestinationResolved={setDestinationPosition}
              className="order-3 h-[26rem] w-full sm:h-[32rem] lg:sticky lg:top-20 lg:order-none lg:col-start-2 lg:row-span-3 lg:row-start-1 lg:h-[calc(100svh-7rem)] lg:max-h-[42rem]"
            />
          ) : tracking.deliveryType === "LOCAL" && tracking.orderStatus === "DELIVERED" ? (
            <Card className="order-3 lg:order-none lg:col-start-2 lg:row-span-3 lg:row-start-1">
              <CardContent className="flex flex-col items-center gap-3 py-12 text-center">
                <div className="flex size-14 items-center justify-center rounded-full bg-success/15 text-success">
                  <PartyPopper className="size-7" />
                </div>
                <div>
                  <h2 className="font-heading text-xl font-medium">Delivered</h2>
                  <p className="mt-1 text-sm text-muted-foreground">Your order has been delivered successfully.</p>
                </div>
              </CardContent>
            </Card>
          ) : tracking.deliveryType === "COURIER" ? (
            <Card className="order-3 lg:order-none lg:col-start-2 lg:row-span-3 lg:row-start-1">
              <CardContent className="grid gap-3 py-5 text-sm">
                <Row label="Courier" value={tracking.courierTracking?.courierName ?? "Courier pending"} />
                <Row label="Tracking ID" value={tracking.courierTracking?.trackingId ?? "-"} />
                <Row label="Status" value={orderStatusLabels[tracking.orderStatus]} />
              </CardContent>
            </Card>
          ) : null}

          {/* Support */}
          <a
            href={`tel:${supportPhone}`}
            className="order-5 flex items-center justify-between gap-3 rounded-2xl border border-border bg-muted/50 px-4 py-3 text-sm lg:order-none lg:col-start-1 lg:row-start-4"
          >
            <span className="text-muted-foreground">Need help with this order?</span>
            <span className="inline-flex items-center gap-1.5 font-medium text-primary">
              <Phone className="size-4" />
              Call us
            </span>
          </a>
        </div>
      ) : null}
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
