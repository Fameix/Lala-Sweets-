"use client"

import { useEffect, useRef, useState } from "react"
import { LocateFixed, Phone } from "lucide-react"

import { Button } from "@/components/ui/button"
import { LiveBadge } from "@/components/ui/status-badge"
import type { EtaResult } from "@/lib/delivery-eta"
import { loadGoogleMaps } from "@/lib/google-maps-loader"
import { cn } from "@/lib/utils"

export type LatLng = { lat: number; lng: number }

type RiderLocation = {
  latitude: number
  longitude: number
  accuracy: number
  timestamp: number
  isOnline?: boolean
}

// Rotation is baked into the SVG (only the vehicle glyph rotates, the ground
// shadow stays put) since google.maps.Marker only supports `rotation` for
// vector Symbol icons, not custom image icons - regenerating the data URL is
// the simplest way to get a heading-aware "nav puck" without migrating off
// Marker. Bucketed to the nearest 10deg so we're not rebuilding the icon on
// every sub-degree GPS jitter.
function buildRiderIconSvg(rotationDeg: number) {
  return `
<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 48 48">
  <ellipse cx="24" cy="41" rx="10" ry="3" fill="#000000" opacity="0.18" />
  <g transform="rotate(${rotationDeg} 24 22)">
    <circle cx="24" cy="22" r="19" fill="#0f172a" stroke="#f97316" stroke-width="3"/>
    <path d="M24 5.5 L28.5 14 L24 11.2 L19.5 14 Z" fill="#f97316" />
    <g fill="none" stroke="#ffffff" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="17" cy="28" r="4" />
      <circle cx="31" cy="28" r="4" />
      <path d="M17 28l4-10h6l4 6h4" />
      <path d="M21 18h5" />
    </g>
  </g>
</svg>
`.trim()
}

const destinationIconSvg = `
<svg xmlns="http://www.w3.org/2000/svg" width="36" height="46" viewBox="0 0 36 46">
  <ellipse cx="18" cy="43" rx="6" ry="2" fill="#000000" opacity="0.18" />
  <path d="M18 0C8 0 0 8 0 18c0 14 18 26 18 26s18-12 18-26C36 8 28 0 18 0z" fill="#16a34a" stroke="#ffffff" stroke-width="1.5"/>
  <path d="M18 9l9 7v11h-6v-7h-6v7H9V16z" fill="#ffffff"/>
</svg>
`.trim()

function toIconUrl(svg: string) {
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`
}

// Nav-app-style map skin: muted base map, road labels kept (no highway
// shield icons) so street names stay legible under the route line.
const mapStyles: google.maps.MapTypeStyle[] = [
  { featureType: "poi", stylers: [{ visibility: "off" }] },
  { featureType: "transit", stylers: [{ visibility: "off" }] },
  { featureType: "road", elementType: "labels.icon", stylers: [{ visibility: "off" }] },
  { featureType: "road", elementType: "geometry", stylers: [{ saturation: -10 }] },
]

const routeMoveThresholdMeters = 40
const animationDurationMs = 900
const remainingRouteColor = "#7c2d12"
const traveledRouteColor = "#9ca3af"

function easeInOutQuad(t: number) {
  return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2
}

function toRadians(value: number) {
  return (value * Math.PI) / 180
}

function toDegrees(value: number) {
  return (value * 180) / Math.PI
}

/** Compass bearing in degrees (0 = north) from one point to another. */
function computeBearing(from: LatLng, to: LatLng) {
  const dLng = toRadians(to.lng - from.lng)
  const lat1 = toRadians(from.lat)
  const lat2 = toRadians(to.lat)

  const y = Math.sin(dLng) * Math.cos(lat2)
  const x = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLng)

  return (toDegrees(Math.atan2(y, x)) + 360) % 360
}

export function LiveDeliveryMap({
  apiKey,
  riderLocation,
  destinationAddress,
  isLive,
  statusLabel,
  riderName,
  riderPhone,
  eta,
  onDestinationResolved,
  className,
}: {
  apiKey?: string
  riderLocation: RiderLocation | null
  destinationAddress?: string
  isLive: boolean
  statusLabel?: string
  riderName?: string
  riderPhone?: string
  eta?: EtaResult
  onDestinationResolved?: (position: LatLng) => void
  className?: string
}) {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const mapRef = useRef<google.maps.Map | null>(null)
  const riderMarkerRef = useRef<google.maps.Marker | null>(null)
  const riderRotationRef = useRef(0)
  const destinationMarkerRef = useRef<google.maps.Marker | null>(null)
  const directionsRendererRef = useRef<google.maps.DirectionsRenderer | null>(null)
  const fallbackPolylineRef = useRef<google.maps.Polyline | null>(null)
  const traveledPolylineRef = useRef<google.maps.Polyline | null>(null)
  const remainingPolylineRef = useRef<google.maps.Polyline | null>(null)
  const overviewPathRef = useRef<LatLng[]>([])
  const destinationPositionRef = useRef<LatLng | null>(null)
  const currentRiderPositionRef = useRef<LatLng | null>(null)
  const lastRoutePositionRef = useRef<LatLng | null>(null)
  const directionsUnavailableRef = useRef(false)
  const hasFittedRef = useRef(false)
  const animationFrameRef = useRef<number | null>(null)
  const geocodedAddressRef = useRef<string | null>(null)
  const followingRef = useRef(true)

  const [scriptError, setScriptError] = useState("")
  const [mapReady, setMapReady] = useState(false)
  const [following, setFollowing] = useState(true)

  useEffect(() => {
    followingRef.current = following
  }, [following])

  // Load the Google Maps JS SDK (existing NEXT_PUBLIC_GOOGLE_MAPS_API_KEY only).
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
      .catch(() => {
        if (!cancelled) {
          setScriptError("Unable to load the live map.")
        }
      })

    return () => {
      cancelled = true
    }
  }, [apiKey])

  // Create the map instance exactly once when the SDK is ready. Must NOT depend on
  // riderLocation (a new object reference on every GPS update) - that previously
  // caused the map to be torn down and recreated on every location update, which
  // orphaned the markers (created once via a ref guard) on the discarded map while
  // the route line kept re-rendering on the fresh map, making markers invisible.
  const initialRiderLocationRef = useRef(riderLocation)
  useEffect(() => {
    if (!mapReady || !containerRef.current || mapRef.current || !window.google?.maps) {
      return
    }

    const initial = initialRiderLocationRef.current
    const initialCenter = initial ? { lat: initial.latitude, lng: initial.longitude } : { lat: 8.7139, lng: 77.7567 }

    const map = new window.google.maps.Map(containerRef.current, {
      center: initialCenter,
      zoom: 16,
      tilt: 0,
      disableDefaultUI: true,
      zoomControl: true,
      gestureHandling: "greedy",
      clickableIcons: false,
      styles: mapStyles,
    })

    map.addListener("dragstart", () => {
      followingRef.current = false
      setFollowing(false)
    })

    mapRef.current = map

    return () => {
      window.google?.maps.event.clearInstanceListeners(map)
      mapRef.current = null
    }
  }, [mapReady])

  // Geocode the destination address once per address (existing Maps API key, no new key).
  useEffect(() => {
    if (!mapReady || !destinationAddress || !window.google?.maps) {
      return
    }

    if (geocodedAddressRef.current === destinationAddress) {
      return
    }

    geocodedAddressRef.current = destinationAddress

    const geocoder = new window.google.maps.Geocoder()
    geocoder.geocode({ address: destinationAddress }, (results, status) => {
      if (status === "OK" && results?.[0]?.geometry?.location) {
        const location = results[0].geometry.location
        destinationPositionRef.current = { lat: location.lat(), lng: location.lng() }
        renderDestinationMarker()
        maybeFitBounds()
        void maybeUpdateRoute(true)
        onDestinationResolved?.(destinationPositionRef.current)
      }
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mapReady, destinationAddress])

  function renderDestinationMarker() {
    const map = mapRef.current
    const position = destinationPositionRef.current
    if (!map || !position) {
      return
    }

    if (!destinationMarkerRef.current) {
      destinationMarkerRef.current = new window.google.maps.Marker({
        map,
        position,
        icon: {
          url: toIconUrl(destinationIconSvg),
          scaledSize: new window.google.maps.Size(36, 46),
          anchor: new window.google.maps.Point(18, 46),
        },
        title: "Delivery address",
        zIndex: 5,
      })
    } else {
      destinationMarkerRef.current.setPosition(position)
    }
  }

  function maybeFitBounds() {
    const map = mapRef.current
    const rider = currentRiderPositionRef.current
    const destination = destinationPositionRef.current

    if (!map || hasFittedRef.current || !rider || !destination) {
      return
    }

    const bounds = new window.google.maps.LatLngBounds()
    bounds.extend(rider)
    bounds.extend(destination)
    map.fitBounds(bounds, 64)
    hasFittedRef.current = true
  }

  /**
   * Splits the known route into a "traveled" segment (muted gray, behind the
   * rider) and a "remaining" segment (bold, ahead of the rider) by finding
   * the closest route vertex to the rider's current position - the
   * nav-app-style progress line. Only meaningful once a real road-following
   * route exists; the straight-line fallback has no useful notion of
   * "progress" so it's left as a single line.
   */
  function renderProgressPolylines() {
    const map = mapRef.current
    const rider = currentRiderPositionRef.current
    const path = overviewPathRef.current

    if (!map || !rider || path.length < 2) {
      return
    }

    let closestIndex = 0
    let closestDistance = Infinity

    for (let i = 0; i < path.length; i += 1) {
      const distance = window.google.maps.geometry.spherical.computeDistanceBetween(
        new window.google.maps.LatLng(path[i]),
        new window.google.maps.LatLng(rider),
      )

      if (distance < closestDistance) {
        closestDistance = distance
        closestIndex = i
      }
    }

    const traveledPath = [...path.slice(0, closestIndex + 1), rider]
    const remainingPath = [rider, ...path.slice(closestIndex + 1)]

    if (!traveledPolylineRef.current) {
      traveledPolylineRef.current = new window.google.maps.Polyline({
        map,
        path: traveledPath,
        strokeColor: traveledRouteColor,
        strokeOpacity: 0.85,
        strokeWeight: 5,
        zIndex: 1,
      })
    } else {
      traveledPolylineRef.current.setPath(traveledPath)
    }

    if (!remainingPolylineRef.current) {
      remainingPolylineRef.current = new window.google.maps.Polyline({
        map,
        path: remainingPath,
        strokeColor: remainingRouteColor,
        strokeOpacity: 0.95,
        strokeWeight: 6,
        zIndex: 2,
      })
    } else {
      remainingPolylineRef.current.setPath(remainingPath)
    }
  }

  function clearProgressPolylines() {
    traveledPolylineRef.current?.setMap(null)
    traveledPolylineRef.current = null
    remainingPolylineRef.current?.setMap(null)
    remainingPolylineRef.current = null
  }

  async function maybeUpdateRoute(force = false) {
    const map = mapRef.current
    const rider = currentRiderPositionRef.current
    const destination = destinationPositionRef.current

    if (!map || !rider || !destination) {
      return
    }

    if (!force && lastRoutePositionRef.current) {
      const moved = window.google.maps.geometry.spherical.computeDistanceBetween(
        new window.google.maps.LatLng(lastRoutePositionRef.current),
        new window.google.maps.LatLng(rider),
      )

      if (moved < routeMoveThresholdMeters) {
        return
      }
    }

    lastRoutePositionRef.current = rider

    if (directionsUnavailableRef.current) {
      clearProgressPolylines()
      drawFallbackPolyline(map, rider, destination)
      return
    }

    try {
      const directionsService = new window.google.maps.DirectionsService()
      const result = await directionsService.route({
        origin: rider,
        destination,
        travelMode: window.google.maps.TravelMode.DRIVING,
      })

      if (fallbackPolylineRef.current) {
        fallbackPolylineRef.current.setMap(null)
        fallbackPolylineRef.current = null
      }

      if (!directionsRendererRef.current) {
        directionsRendererRef.current = new window.google.maps.DirectionsRenderer({
          map,
          suppressMarkers: true,
          preserveViewport: true,
          // The route line itself is drawn manually (renderProgressPolylines)
          // so it can be split into traveled/remaining colors - the renderer
          // is only used to fetch/hold the road-following path.
          polylineOptions: { strokeOpacity: 0, strokeWeight: 0 },
        })
      }

      directionsRendererRef.current.setDirections(result)
      overviewPathRef.current = (result.routes[0]?.overview_path ?? []).map((point) => ({
        lat: point.lat(),
        lng: point.lng(),
      }))
      renderProgressPolylines()
    } catch (error) {
      // Directions API unavailable for this key/project - stop retrying it and
      // fall back to a direct line for the rest of this session.
      if (error instanceof Error && /REQUEST_DENIED|not enabled|legacy API/i.test(error.message)) {
        directionsUnavailableRef.current = true
      }

      if (directionsRendererRef.current) {
        directionsRendererRef.current.setMap(null)
        directionsRendererRef.current = null
      }

      overviewPathRef.current = []
      clearProgressPolylines()
      drawFallbackPolyline(map, rider, destination)
    }
  }

  function drawFallbackPolyline(map: google.maps.Map, rider: LatLng, destination: LatLng) {
    if (!fallbackPolylineRef.current) {
      fallbackPolylineRef.current = new window.google.maps.Polyline({
        map,
        path: [rider, destination],
        strokeColor: remainingRouteColor,
        strokeOpacity: 0.85,
        strokeWeight: 5,
        icons: [{ icon: { path: "M 0,-1 0,1", strokeOpacity: 1, scale: 3 }, offset: "0", repeat: "14px" }],
      })
    } else {
      fallbackPolylineRef.current.setPath([rider, destination])
    }
  }

  function animateRiderMarker(from: LatLng | null, to: LatLng) {
    const map = mapRef.current
    if (!map) {
      return
    }

    if (from) {
      const distanceMoved = window.google.maps.geometry.spherical.computeDistanceBetween(
        new window.google.maps.LatLng(from),
        new window.google.maps.LatLng(to),
      )

      // Ignore GPS jitter for heading purposes - a stationary rider shouldn't
      // have their marker spin to a noisy bearing.
      if (distanceMoved > 3) {
        const bearing = computeBearing(from, to)
        const bucketed = Math.round(bearing / 10) * 10

        if (bucketed !== riderRotationRef.current) {
          riderRotationRef.current = bucketed
          riderMarkerRef.current?.setIcon({
            url: toIconUrl(buildRiderIconSvg(bucketed)),
            scaledSize: new window.google.maps.Size(48, 48),
            anchor: new window.google.maps.Point(24, 24),
          })
        }
      }
    }

    if (!riderMarkerRef.current) {
      riderMarkerRef.current = new window.google.maps.Marker({
        map,
        position: to,
        icon: {
          url: toIconUrl(buildRiderIconSvg(riderRotationRef.current)),
          scaledSize: new window.google.maps.Size(48, 48),
          anchor: new window.google.maps.Point(24, 24),
        },
        title: "Delivery partner",
        zIndex: 10,
      })
      return
    }

    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current)
      animationFrameRef.current = null
    }

    if (!from) {
      riderMarkerRef.current.setPosition(to)
      return
    }

    const startTime = performance.now()

    function step(now: number) {
      const elapsed = now - startTime
      const t = Math.min(1, elapsed / animationDurationMs)
      const eased = easeInOutQuad(t)

      const lat = from!.lat + (to.lat - from!.lat) * eased
      const lng = from!.lng + (to.lng - from!.lng) * eased

      riderMarkerRef.current?.setPosition({ lat, lng })
      renderProgressPolylines()

      if (t < 1) {
        animationFrameRef.current = requestAnimationFrame(step)
      } else {
        animationFrameRef.current = null
      }
    }

    animationFrameRef.current = requestAnimationFrame(step)
  }

  // React to realtime rider location changes from the existing liveTracking/{orderId} listener.
  useEffect(() => {
    if (!mapReady || !riderLocation || !window.google?.maps) {
      return
    }

    const nextPosition: LatLng = { lat: riderLocation.latitude, lng: riderLocation.longitude }
    const previousPosition = currentRiderPositionRef.current

    animateRiderMarker(previousPosition, nextPosition)
    currentRiderPositionRef.current = nextPosition

    maybeFitBounds()
    renderProgressPolylines()
    void maybeUpdateRoute()

    if (followingRef.current && mapRef.current) {
      mapRef.current.panTo(nextPosition)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mapReady, riderLocation?.latitude, riderLocation?.longitude, riderLocation?.timestamp])

  useEffect(() => {
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [])

  function handleFollowRider() {
    followingRef.current = true
    setFollowing(true)

    const map = mapRef.current
    const rider = currentRiderPositionRef.current
    if (map && rider) {
      map.panTo(rider)
      if (map.getZoom() && map.getZoom()! < 16) {
        map.setZoom(16)
      }
    }
  }

  if (!apiKey) {
    return (
      <div className={cn("flex h-full min-h-[20rem] items-center justify-center rounded-3xl border border-border bg-muted text-sm text-muted-foreground", className)}>
        Live map is not configured.
      </div>
    )
  }

  return (
    <div className={cn("relative overflow-hidden rounded-3xl border border-border shadow-lg", className)}>
      <div ref={containerRef} className="h-full min-h-[20rem] w-full" />

      {scriptError ? (
        <div className="absolute inset-0 flex items-center justify-center bg-background/90 text-sm text-destructive">
          {scriptError}
        </div>
      ) : null}

      {!mapReady && !scriptError ? (
        <div className="absolute inset-0 flex items-center justify-center bg-muted text-sm text-muted-foreground">
          Loading live map...
        </div>
      ) : null}

      <div className="pointer-events-none absolute left-3 top-3">
        <LiveBadge live={isLive} />
      </div>

      {mapReady ? (
        <div className={cn("absolute right-3", riderName ? "bottom-[7.5rem] sm:bottom-28" : "bottom-3")}>
          <Button
            size="sm"
            variant={following ? "secondary" : "default"}
            className="gap-1.5 shadow-md"
            onClick={handleFollowRider}
            disabled={!riderLocation}
          >
            <LocateFixed className="size-4" />
            Follow Rider
          </Button>
        </div>
      ) : null}

      {riderName ? (
        <div className="absolute inset-x-0 bottom-0 p-2.5">
          <div className="rounded-3xl border bg-card/97 shadow-xl backdrop-blur">
            <div className="mx-auto mt-2 h-1 w-9 rounded-full bg-border" />

            <div className="flex items-center gap-3 px-4 pb-1.5 pt-2.5">
              {eta ? (
                <>
                  <div className="shrink-0">
                    <p className="font-heading text-2xl font-semibold leading-none text-primary">{eta.minutes}</p>
                    <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">min</p>
                  </div>
                  <div className="min-w-0 flex-1 border-l border-border pl-3">
                    <p className="truncate text-sm font-medium text-foreground">{eta.distanceKm} km away</p>
                    <p className="truncate text-xs text-muted-foreground">Arriving {eta.clockLabel}</p>
                  </div>
                </>
              ) : (
                <p className="flex-1 text-sm text-muted-foreground">
                  Estimated arrival will update once your order is out for delivery.
                </p>
              )}
            </div>

            <div className="flex items-center gap-3 border-t border-border px-4 py-3">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
                {riderName.charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                {statusLabel ? <p className="truncate text-sm font-semibold text-foreground">{statusLabel}</p> : null}
                <p className="truncate text-xs text-muted-foreground">{riderName} is on the way with your order</p>
              </div>
              {riderPhone ? (
                <a href={`tel:${riderPhone}`} className="shrink-0">
                  <Button size="icon" className="rounded-full shadow-md">
                    <Phone className="size-4" />
                  </Button>
                </a>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}
