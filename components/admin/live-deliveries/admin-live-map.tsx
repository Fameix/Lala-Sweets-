"use client"

import { useEffect, useRef, useState } from "react"

import { formatRouteEta, type EtaResult } from "@/lib/delivery-eta"
import { loadGoogleMaps } from "@/lib/google-maps-loader"
import { fetchDrivingRoute } from "@/lib/google-routes"
import { cn } from "@/lib/utils"

export type ActiveDelivery = {
  orderId: string
  partnerName: string
  customerName: string
  destinationAddress: string
  location: { latitude: number; longitude: number; heading?: number; isOnline?: boolean } | null
}

const riderIconSvg = `
<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40">
  <ellipse cx="20" cy="35" rx="8" ry="2.5" fill="#000000" opacity="0.18" />
  <circle cx="20" cy="18" r="16" fill="#5c1a14" stroke="#f4c95d" stroke-width="2.5"/>
  <g fill="none" stroke="#ffffff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <circle cx="14" cy="23" r="3.2" />
    <circle cx="26" cy="23" r="3.2" />
    <path d="M14 23l3-8h5l3 5h3" />
  </g>
</svg>
`.trim()

function toIconUrl(svg: string) {
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`
}

const mapStyles: google.maps.MapTypeStyle[] = [
  { featureType: "poi", stylers: [{ visibility: "off" }] },
  { featureType: "transit", stylers: [{ visibility: "off" }] },
]

export function AdminLiveMap({
  apiKey,
  deliveries,
  focusedOrderId,
  className,
}: {
  apiKey?: string
  deliveries: ActiveDelivery[]
  focusedOrderId: string | null
  className?: string
}) {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const mapRef = useRef<google.maps.Map | null>(null)
  const markersRef = useRef<Map<string, google.maps.Marker>>(new Map())
  const routePolylineRef = useRef<google.maps.Polyline | null>(null)
  const focusedDestinationRef = useRef<string | null>(null)

  const [mapReady, setMapReady] = useState(false)
  const [routeEta, setRouteEta] = useState<EtaResult>(null)

  useEffect(() => {
    if (!apiKey) {
      return
    }

    let cancelled = false

    loadGoogleMaps(apiKey)
      .then(() => {
        if (!cancelled) {
          setMapReady(true)
        }
      })
      .catch(() => undefined)

    return () => {
      cancelled = true
    }
  }, [apiKey])

  useEffect(() => {
    if (!mapReady || !containerRef.current || mapRef.current || !window.google?.maps) {
      return
    }

    mapRef.current = new window.google.maps.Map(containerRef.current, {
      center: { lat: 8.7139, lng: 77.7567 },
      zoom: 13,
      disableDefaultUI: true,
      zoomControl: true,
      gestureHandling: "greedy",
      clickableIcons: false,
      styles: mapStyles,
    })
  }, [mapReady])

  // Sync one marker per active delivery that has a live location.
  useEffect(() => {
    const map = mapRef.current
    if (!map || !window.google?.maps) {
      return
    }

    const seenOrderIds = new Set<string>()
    const bounds = new window.google.maps.LatLngBounds()
    let hasBoundsPoint = false

    for (const delivery of deliveries) {
      if (!delivery.location) {
        continue
      }

      seenOrderIds.add(delivery.orderId)
      const position = { lat: delivery.location.latitude, lng: delivery.location.longitude }
      bounds.extend(position)
      hasBoundsPoint = true

      const existing = markersRef.current.get(delivery.orderId)
      if (existing) {
        existing.setPosition(position)
      } else {
        const marker = new window.google.maps.Marker({
          map,
          position,
          icon: {
            url: toIconUrl(riderIconSvg),
            scaledSize: new window.google.maps.Size(40, 40),
            anchor: new window.google.maps.Point(20, 20),
          },
          title: `${delivery.partnerName} — ${delivery.orderId}`,
          zIndex: delivery.orderId === focusedOrderId ? 20 : 10,
        })
        markersRef.current.set(delivery.orderId, marker)
      }
    }

    for (const [orderId, marker] of markersRef.current.entries()) {
      if (!seenOrderIds.has(orderId)) {
        marker.setMap(null)
        markersRef.current.delete(orderId)
      }
    }

    if (!focusedOrderId && hasBoundsPoint && seenOrderIds.size > 0) {
      if (seenOrderIds.size === 1) {
        map.setCenter(bounds.getCenter())
        map.setZoom(15)
      } else {
        map.fitBounds(bounds, 64)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [deliveries, mapReady])

  // When a delivery is focused, pan to it and fetch a route/ETA on demand
  // (not continuously - this is an overview map, not the customer tracker).
  useEffect(() => {
    const map = mapRef.current
    if (!map || !focusedOrderId || !window.google?.maps) {
      routePolylineRef.current?.setMap(null)
      setRouteEta(null)
      return
    }

    const focused = deliveries.find((delivery) => delivery.orderId === focusedOrderId)
    const marker = markersRef.current.get(focusedOrderId)

    if (!focused || !marker) {
      return
    }

    map.panTo(marker.getPosition()!)
    map.setZoom(16)

    if (!apiKey || !focused.location || focusedDestinationRef.current === focusedOrderId) {
      return
    }

    focusedDestinationRef.current = focusedOrderId

    const geocoder = new window.google.maps.Geocoder()
    geocoder.geocode({ address: focused.destinationAddress }, (results, status) => {
      if (status !== "OK" || !results?.[0]?.geometry?.location) {
        return
      }

      const destination = { lat: results[0].geometry.location.lat(), lng: results[0].geometry.location.lng() }
      const origin = { lat: focused.location!.latitude, lng: focused.location!.longitude }

      fetchDrivingRoute({ apiKey, origin, destination })
        .then((route) => {
          routePolylineRef.current?.setMap(null)
          routePolylineRef.current = new window.google.maps.Polyline({
            map,
            path: route.path,
            strokeColor: "#5c1a14",
            strokeOpacity: 0.9,
            strokeWeight: 5,
          })
          setRouteEta(formatRouteEta({ distanceMeters: route.distanceMeters, durationSeconds: route.durationSeconds }))
        })
        .catch(() => setRouteEta(null))
    })
  }, [focusedOrderId, deliveries, apiKey])

  useEffect(() => {
    if (!focusedOrderId) {
      focusedDestinationRef.current = null
    }
  }, [focusedOrderId])

  if (!apiKey) {
    return (
      <div className={cn("flex h-full min-h-[24rem] items-center justify-center rounded-3xl border border-border bg-muted text-sm text-muted-foreground", className)}>
        Live map is not configured.
      </div>
    )
  }

  return (
    <div className={cn("relative overflow-hidden rounded-3xl border border-border shadow-lg", className)}>
      <div ref={containerRef} className="h-full min-h-[24rem] w-full" />

      {!mapReady ? (
        <div className="absolute inset-0 flex items-center justify-center bg-muted text-sm text-muted-foreground">
          Loading live map...
        </div>
      ) : null}

      {focusedOrderId && routeEta ? (
        <div className="absolute bottom-3 left-3 rounded-2xl border border-border bg-card/95 px-4 py-2.5 shadow-lg backdrop-blur">
          <p className="font-heading text-lg font-semibold text-primary">{routeEta.minutes} min</p>
          <p className="text-xs text-muted-foreground">{routeEta.distanceKm} km away</p>
        </div>
      ) : null}
    </div>
  )
}
