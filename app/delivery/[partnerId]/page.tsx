"use client"

import { use, useCallback, useEffect, useRef, useState } from "react"
import { AlertTriangle, KeyRound, MapPin, Navigation, Navigation2, PackageCheck, Wifi } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import type { SavedOrder } from "@/lib/order-types"

const accessKeyStorageKey = "lala-sweets-partner-access-key"
// The very first request after the dev server (re)starts pays a one-time
// Firebase Admin SDK cold-start cost that can take well over 15s; a short
// timeout here made sign-in look broken (button just times out silently)
// even though the request would have succeeded a few seconds later.
const requestTimeoutMs = 30000

type ActiveWatch = { orderId: string; watchId: number }
type GpsReportStatus = { lastSentAt: number | null; lastError: string | null }

async function fetchWithTimeout(input: string, init: RequestInit = {}, timeoutMs = requestTimeoutMs): Promise<Response> {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeoutMs)

  try {
    return await fetch(input, { ...init, signal: controller.signal })
  } catch (fetchError) {
    if (fetchError instanceof DOMException && fetchError.name === "AbortError") {
      throw new Error("Request timed out. Check that your phone and laptop are on the same network and try again.")
    }

    throw new Error("Network error. Make sure your phone and laptop are on the same Wi-Fi network.")
  } finally {
    clearTimeout(timer)
  }
}

export default function DeliveryPartnerPage({ params }: { params: Promise<{ partnerId: string }> }) {
  const { partnerId } = use(params)

  const [accessKey, setAccessKey] = useState<string | null>(null)
  const [keyInput, setKeyInput] = useState("")
  const [orders, setOrders] = useState<SavedOrder[]>([])
  const [loading, setLoading] = useState(false)
  const [verifying, setVerifying] = useState(false)
  const [error, setError] = useState("")
  const [activeWatch, setActiveWatch] = useState<ActiveWatch | null>(null)
  const activeWatchRef = useRef<ActiveWatch | null>(null)
  const [gpsStatus, setGpsStatus] = useState<Record<string, GpsReportStatus>>({})

  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        const stored = window.sessionStorage.getItem(accessKeyStorageKey)
        if (stored) {
          setAccessKey(stored)
        }
      } catch {
        // Ignore storage access failures - user will be prompted to sign in again.
      }
    }, 0)
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    activeWatchRef.current = activeWatch
  }, [activeWatch])

  useEffect(() => {
    return () => {
      if (activeWatchRef.current) {
        navigator.geolocation.clearWatch(activeWatchRef.current.watchId)
      }
    }
  }, [])

  const authHeaders = useCallback(
    (key: string): HeadersInit => ({
      "Content-Type": "application/json",
      "x-delivery-api-key": key,
    }),
    [],
  )

  const loadOrders = useCallback(
    async (key: string) => {
      setLoading(true)
      setError("")

      try {
        const response = await fetchWithTimeout(`/api/delivery/partners/${partnerId}/orders`, {
          headers: authHeaders(key),
          cache: "no-store",
        })
        const payload = (await response.json()) as { orders?: SavedOrder[]; error?: string }

        if (!response.ok || !payload.orders) {
          if (response.status === 401 || response.status === 403) {
            throw new Error("Access key is invalid or expired. Please sign in again.")
          }

          throw new Error(payload.error ?? "Unable to load assigned orders.")
        }

        setOrders(payload.orders)
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : "Unable to load assigned orders.")
      } finally {
        setLoading(false)
      }
    },
    [authHeaders, partnerId],
  )

  useEffect(() => {
    if (!accessKey) {
      return
    }

    const timer = setTimeout(() => void loadOrders(accessKey), 0)
    return () => clearTimeout(timer)
  }, [accessKey, loadOrders])

  async function submitAccessKey() {
    const trimmed = keyInput.trim()
    if (!trimmed) {
      setError("Enter the partner access key.")
      return
    }

    setVerifying(true)
    setError("")

    try {
      const response = await fetchWithTimeout(`/api/delivery/partners/${partnerId}/orders`, {
        headers: authHeaders(trimmed),
        cache: "no-store",
      })
      const payload = (await response.json()) as { orders?: SavedOrder[]; error?: string }

      if (!response.ok || !payload.orders) {
        if (response.status === 401 || response.status === 403) {
          throw new Error("Incorrect access key. Please check the key and try again.")
        }

        throw new Error(payload.error ?? "Unable to verify access key.")
      }

      try {
        window.sessionStorage.setItem(accessKeyStorageKey, trimmed)
      } catch {
        // Ignore storage failures (e.g. private browsing) - key stays in memory for this session.
      }

      setOrders(payload.orders)
      setAccessKey(trimmed)
    } catch (verifyError) {
      setError(verifyError instanceof Error ? verifyError.message : "Unable to verify access key.")
    } finally {
      setVerifying(false)
    }
  }

  // Starts (or restarts) the browser's GPS watch for an order and streams
  // positions to the location API. Split out from startDelivery so a
  // connection that already reached OUT_FOR_DELIVERY - e.g. because the
  // start-delivery call succeeded but the geolocation prompt then failed
  // (insecure origin, permission denied, tab reload) - can be retried
  // without re-calling start-delivery or losing the order's current status.
  function beginWatchingPosition(order: SavedOrder) {
    if (!accessKey || !navigator.geolocation) {
      setError("This browser does not support GPS location.")
      return
    }

    if (activeWatchRef.current) {
      navigator.geolocation.clearWatch(activeWatchRef.current.watchId)
    }

    setError("")
    setGpsStatus((current) => ({ ...current, [order.orderId]: { lastSentAt: null, lastError: null } }))

    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        void fetchWithTimeout(`/api/orders/${order.orderId}/location`, {
          method: "POST",
          headers: authHeaders(accessKey),
          body: JSON.stringify({
            partnerId,
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            timestamp: position.timestamp,
            isOnline: true,
          }),
        })
          .then(async (response) => {
            if (!response.ok) {
              const payload = (await response.json().catch(() => null)) as { error?: string } | null
              throw new Error(payload?.error ?? `Server rejected the location update (${response.status}).`)
            }

            setGpsStatus((current) => ({
              ...current,
              [order.orderId]: { lastSentAt: Date.now(), lastError: null },
            }))
          })
          .catch((locationError: unknown) => {
            setGpsStatus((current) => ({
              ...current,
              [order.orderId]: {
                lastSentAt: current[order.orderId]?.lastSentAt ?? null,
                lastError: locationError instanceof Error ? locationError.message : "Unable to send location.",
              },
            }))
          })
      },
      (geoError) => {
        setError(`GPS error: ${geoError.message}`)
      },
      { enableHighAccuracy: true, maximumAge: 5000, timeout: 15000 },
    )

    setActiveWatch({ orderId: order.orderId, watchId })
  }

  async function startDelivery(order: SavedOrder) {
    if (!accessKey) {
      return
    }

    if (!navigator.geolocation) {
      setError("This browser does not support GPS location.")
      return
    }

    setError("")

    try {
      const response = await fetchWithTimeout(`/api/orders/${order.orderId}/start-delivery`, {
        method: "POST",
        headers: authHeaders(accessKey),
        body: JSON.stringify({ partnerId }),
      })
      const payload = (await response.json()) as { order?: SavedOrder; error?: string }

      if (!response.ok || !payload.order) {
        throw new Error(payload.error ?? "Unable to start delivery.")
      }

      setOrders((current) => current.map((existing) => (existing.orderId === order.orderId ? payload.order! : existing)))
      beginWatchingPosition(payload.order)
    } catch (startError) {
      setError(startError instanceof Error ? startError.message : "Unable to start delivery.")
    }
  }

  async function completeDelivery(order: SavedOrder) {
    if (!accessKey) {
      return
    }

    setError("")

    if (activeWatchRef.current && activeWatchRef.current.orderId === order.orderId) {
      navigator.geolocation.clearWatch(activeWatchRef.current.watchId)
      setActiveWatch(null)
    }

    setGpsStatus((current) => {
      const next = { ...current }
      delete next[order.orderId]
      return next
    })

    try {
      const response = await fetchWithTimeout(`/api/orders/${order.orderId}/complete-delivery`, {
        method: "POST",
        headers: authHeaders(accessKey),
        body: JSON.stringify({ partnerId }),
      })
      const payload = (await response.json()) as { order?: SavedOrder; error?: string }

      if (!response.ok || !payload.order) {
        throw new Error(payload.error ?? "Unable to complete delivery.")
      }

      setOrders((current) => current.map((existing) => (existing.orderId === order.orderId ? payload.order! : existing)))
    } catch (completeError) {
      setError(completeError instanceof Error ? completeError.message : "Unable to complete delivery.")
    }
  }

  if (!accessKey) {
    return (
      <main className="mx-auto flex min-h-[70svh] max-w-sm flex-col justify-center gap-4 px-5 py-10">
        <div className="flex items-center gap-2">
          <KeyRound className="size-5 text-primary" />
          <h1 className="font-heading text-2xl font-medium">Partner Sign-In</h1>
        </div>
        <p className="text-sm text-muted-foreground">
          Partner ID <span className="font-medium text-foreground">{partnerId}</span>. Enter the access key given by
          the store to view your assigned orders.
        </p>
        <Input
          type="password"
          placeholder="Access key"
          value={keyInput}
          disabled={verifying}
          onKeyDown={(event) => {
            if (event.key === "Enter" && !verifying) {
              void submitAccessKey()
            }
          }}
          onChange={(event) => setKeyInput(event.target.value)}
        />
        <Button onClick={() => void submitAccessKey()} disabled={verifying}>
          {verifying ? "Verifying..." : "Continue"}
        </Button>
        {verifying ? (
          <p className="text-xs text-muted-foreground">
            The first sign-in after the server starts can take up to 30 seconds - please wait.
          </p>
        ) : null}
        {error ? <p className="text-sm text-destructive">{error}</p> : null}
      </main>
    )
  }

  const activeOrders = orders.filter((order) => order.orderStatus === "ASSIGNED" || order.orderStatus === "OUT_FOR_DELIVERY")
  const pastOrders = orders.filter((order) => order.orderStatus === "DELIVERED")

  return (
    <main className="mx-auto max-w-2xl px-4 py-8">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="font-heading text-2xl font-medium">My Deliveries</h1>
          <p className="text-sm text-muted-foreground">Partner {partnerId}</p>
        </div>
        <Button variant="outline" size="sm" onClick={() => void loadOrders(accessKey)} disabled={loading}>
          Refresh
        </Button>
      </div>

      {error ? <p className="mt-3 text-sm text-destructive">{error}</p> : null}

      <div className="mt-6 grid gap-4">
        {loading ? (
          <p className="text-sm text-muted-foreground">Loading assigned orders...</p>
        ) : activeOrders.length > 0 ? (
          activeOrders.map((order) => (
            <Card key={order.orderId}>
              <CardHeader>
                <div className="flex items-center justify-between gap-3">
                  <CardTitle className="text-lg">{order.orderId}</CardTitle>
                  <Badge variant={order.orderStatus === "OUT_FOR_DELIVERY" ? "default" : "outline"}>
                    {order.orderStatus}
                  </Badge>
                </div>
                <CardDescription>{order.customer.name}</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-3 text-sm">
                <div className="flex items-start gap-2">
                  <MapPin className="mt-0.5 size-4 shrink-0 text-primary" />
                  <span>{order.address}</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Navigation2 className="size-4" />
                  {order.customer.mobile}
                </div>

                {activeWatch?.orderId === order.orderId ? <GpsStatusLine status={gpsStatus[order.orderId]} /> : null}

                <a
                  href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(order.address)}`}
                  target="_blank"
                  rel="noreferrer"
                  className="w-fit"
                >
                  <Button variant="outline" size="sm" className="gap-2">
                    <Navigation className="size-4" />
                    Navigate
                  </Button>
                </a>

                {order.orderStatus === "ASSIGNED" ? (
                  <div className="mt-2 flex flex-wrap gap-2">
                    <Button onClick={() => void startDelivery(order)} className="gap-2">
                      <Navigation2 className="size-4" />
                      Start Delivery
                    </Button>
                  </div>
                ) : (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {activeWatch?.orderId !== order.orderId ? (
                      <Button
                        onClick={() => beginWatchingPosition(order)}
                        className="gap-2"
                        variant={gpsStatus[order.orderId]?.lastError ? "default" : "outline"}
                      >
                        <Navigation2 className="size-4" />
                        {gpsStatus[order.orderId] ? "Resume GPS Tracking" : "Start GPS Tracking"}
                      </Button>
                    ) : null}
                    <Button onClick={() => void completeDelivery(order)} className="gap-2" variant="secondary">
                      <PackageCheck className="size-4" />
                      Complete Delivery
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        ) : (
          <Card>
            <CardContent className="py-8 text-center text-sm text-muted-foreground">
              No active deliveries assigned right now.
            </CardContent>
          </Card>
        )}

        {pastOrders.length > 0 ? (
          <div className="mt-4">
            <h2 className="text-sm font-medium text-muted-foreground">Delivered</h2>
            <div className="mt-2 grid gap-2">
              {pastOrders.map((order) => (
                <div key={order.orderId} className="rounded-xl border border-border px-4 py-3 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{order.orderId}</span>
                    <Badge variant="secondary">Delivered</Badge>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : null}
      </div>
    </main>
  )
}

function GpsStatusLine({ status }: { status: GpsReportStatus | undefined }) {
  const [, forceTick] = useState(0)

  useEffect(() => {
    const interval = window.setInterval(() => forceTick((tick) => tick + 1), 1000)
    return () => window.clearInterval(interval)
  }, [])

  if (!status || (!status.lastSentAt && !status.lastError)) {
    return (
      <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <Wifi className="size-3.5 animate-pulse" />
        Waiting for first GPS fix...
      </p>
    )
  }

  if (status.lastError) {
    return (
      <p className="flex items-center gap-1.5 text-xs font-medium text-destructive">
        <AlertTriangle className="size-3.5" />
        GPS not reaching server: {status.lastError}
      </p>
    )
  }

  const secondsAgo = status.lastSentAt ? Math.max(0, Math.round((Date.now() - status.lastSentAt) / 1000)) : null
  const isStale = secondsAgo !== null && secondsAgo > 30

  return (
    <p className={cn("flex items-center gap-1.5 text-xs", isStale ? "font-medium text-destructive" : "text-muted-foreground")}>
      {isStale ? <AlertTriangle className="size-3.5" /> : <Wifi className="size-3.5" />}
      {isStale
        ? `No location sent in ${secondsAgo}s - check your connection`
        : `Sending location - last update ${secondsAgo}s ago`}
    </p>
  )
}
