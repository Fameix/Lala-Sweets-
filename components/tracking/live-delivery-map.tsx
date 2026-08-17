"use client"

import { useEffect, useRef, useState } from "react"
import { LocateFixed, Phone } from "lucide-react"

import { Button } from "@/components/ui/button"
import { LiveBadge, type LiveTrackingStatus } from "@/components/ui/status-badge"
import { formatRouteEta, type EtaResult } from "@/lib/delivery-eta"
import { fetchDrivingRoute } from "@/lib/google-routes"
import { loadGoogleMaps } from "@/lib/google-maps-loader"
import { cn } from "@/lib/utils"

export type LatLng = { lat: number; lng: number }

type RiderLocation = {
  latitude: number
  longitude: number
  accuracy: number
  timestamp: number
  isOnline?: boolean
  heading?: number
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

// Route recalculation is throttled on two axes, not just distance, per the
// "10-20s maximum" requirement: a big jump (new road, wrong turn) recalculates
// immediately, but a slow-moving rider still gets a periodic refresh rather
// than being stuck on an increasingly stale route.
const routeMoveThresholdMeters = 40
const routeMinIntervalMs = 15_000
const routeMinMovementForIntervalRefreshMeters = 8
// If the rider's GPS position drifts this far from the last computed route,
// treat it as a deviation (wrong turn, road closure) and recalculate right
// away regardless of the throttle above.
const routeDeviationThresholdMeters = 60
const animationDurationMs = 900
// Deep maroon/oxblood - the same brand primary used for the Razorpay
// checkout theme - instead of the previous straight brown line.
const remainingRouteColor = "#5c1a14"
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

/** Index of, and distance (metres) to, the path vertex closest to `point`. */
/**
 * "updating" status copy - GPS is momentarily stale but the tracking session
 * is still active (not offline). Mirrors the phrasing called for explicitly:
 * a short freeze right after going stale, then an increasingly specific
 * "last updated" readout the longer it's been.
 */
function formatUpdatingLabel(lastUpdateMs: number | undefined, now: number) {
  if (!lastUpdateMs) {
    return "Waiting for latest location..."
  }

  const secondsAgo = Math.max(0, Math.round((now - lastUpdateMs) / 1000))

  if (secondsAgo < 10) {
    return "Location updating..."
  }

  if (secondsAgo < 60) {
    return `Last updated ${secondsAgo} sec ago`
  }

  const minutesAgo = Math.round(secondsAgo / 60)
  return `Last location updated ${minutesAgo} min ago`
}

function findClosestPointOnPath(point: LatLng, path: LatLng[]) {
  let closestIndex = 0
  let closestDistanceMeters = Infinity

  for (let i = 0; i < path.length; i += 1) {
    const distance = window.google.maps.geometry.spherical.computeDistanceBetween(
      new window.google.maps.LatLng(path[i]),
      new window.google.maps.LatLng(point),
    )

    if (distance < closestDistanceMeters) {
      closestDistanceMeters = distance
      closestIndex = i
    }
  }

  return { closestIndex, closestDistanceMeters }
}

export function LiveDeliveryMap({
  apiKey,
  riderLocation,
  destinationAddress,
  liveStatus,
  now,
  statusLabel,
  riderName,
  riderPhone,
  className,
}: {
  apiKey?: string
  riderLocation: RiderLocation | null
  destinationAddress?: string
  liveStatus: LiveTrackingStatus
  /** Caller's ticking clock (ms since epoch), used to render "last updated X ago" without a duplicate timer. */
  now: number
  statusLabel?: string
  riderName?: string
  riderPhone?: string
  className?: string
}) {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const mapRef = useRef<google.maps.Map | null>(null)
  const riderMarkerRef = useRef<google.maps.Marker | null>(null)
  const riderRotationRef = useRef(0)
  const destinationMarkerRef = useRef<google.maps.Marker | null>(null)
  const traveledPolylineRef = useRef<google.maps.Polyline | null>(null)
  const remainingGlowPolylineRef = useRef<google.maps.Polyline | null>(null)
  const remainingPolylineRef = useRef<google.maps.Polyline | null>(null)
  const overviewPathRef = useRef<LatLng[]>([])
  const destinationPositionRef = useRef<LatLng | null>(null)
  const currentRiderPositionRef = useRef<LatLng | null>(null)
  const lastRoutePositionRef = useRef<LatLng | null>(null)
  const lastRouteRequestAtRef = useRef(0)
  const routeAbortControllerRef = useRef<AbortController | null>(null)
  const hasFittedRef = useRef(false)
  const animationFrameRef = useRef<number | null>(null)
  const geocodedAddressRef = useRef<string | null>(null)
  const followingRef = useRef(true)

  const [scriptError, setScriptError] = useState("")
  const [mapReady, setMapReady] = useState(false)
  const [following, setFollowing] = useState(true)
  const [routeEta, setRouteEta] = useState<EtaResult>(null)
  const [routeStatus, setRouteStatus] = useState<"idle" | "ok" | "error">("idle")

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
        void requestRoute(true)
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
   * Splits the known road-following route into a "traveled" segment (muted
   * gray, behind the rider) and a "remaining" segment (brand maroon, ahead of
   * the rider, with a soft translucent glow underneath for a premium
   * delivery-app look) by finding the closest route vertex to the rider's
   * current position - the nav-app-style progress line. No-ops until a real
   * route has been fetched; there is no straight-line fallback to draw.
   */
  function renderProgressPolylines() {
    const map = mapRef.current
    const rider = currentRiderPositionRef.current
    const path = overviewPathRef.current

    if (!map || !rider || path.length < 2) {
      return
    }

    const { closestIndex } = findClosestPointOnPath(rider, path)
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

    // Wider, translucent line underneath the solid one - a cheap "glow" that
    // reads as a rounded, premium route line instead of a plain stroke.
    if (!remainingGlowPolylineRef.current) {
      remainingGlowPolylineRef.current = new window.google.maps.Polyline({
        map,
        path: remainingPath,
        strokeColor: remainingRouteColor,
        strokeOpacity: 0.18,
        strokeWeight: 8,
        zIndex: 2,
      })
    } else {
      remainingGlowPolylineRef.current.setPath(remainingPath)
    }

    if (!remainingPolylineRef.current) {
      remainingPolylineRef.current = new window.google.maps.Polyline({
        map,
        path: remainingPath,
        strokeColor: remainingRouteColor,
        strokeOpacity: 0.95,
        strokeWeight: 6,
        zIndex: 3,
      })
    } else {
      remainingPolylineRef.current.setPath(remainingPath)
    }
  }

  /**
   * Fetches (or refreshes) the road-following route via the Routes API. Never
   * draws a straight line - on failure it leaves whatever polylines are
   * already on the map untouched (the last known good route) and surfaces
   * routeStatus "error" so the UI can show "ETA temporarily unavailable"
   * instead of a fabricated number.
   *
   * Throttled on three axes:
   * - `force` (destination just resolved, or the rider has clearly gone off
   *   the current route) always refetches immediately.
   * - a meaningful GPS move (>= routeMoveThresholdMeters) refetches.
   * - otherwise, at most once every routeMinIntervalMs while still moving at
   *   all, so a slow-moving rider's route doesn't go stale for minutes, but a
   *   parked rider doesn't spam the API either.
   */
  async function requestRoute(force = false) {
    const map = mapRef.current
    const rider = currentRiderPositionRef.current
    const destination = destinationPositionRef.current

    if (!map || !rider || !destination || !apiKey || !window.google?.maps?.geometry?.encoding) {
      return
    }

    let shouldFetch = force

    if (!shouldFetch && overviewPathRef.current.length > 1) {
      const { closestDistanceMeters } = findClosestPointOnPath(rider, overviewPathRef.current)
      if (closestDistanceMeters > routeDeviationThresholdMeters) {
        shouldFetch = true
      }
    }

    if (!shouldFetch && !lastRoutePositionRef.current) {
      shouldFetch = true
    }

    if (!shouldFetch && lastRoutePositionRef.current) {
      const moved = window.google.maps.geometry.spherical.computeDistanceBetween(
        new window.google.maps.LatLng(lastRoutePositionRef.current),
        new window.google.maps.LatLng(rider),
      )
      const elapsedMs = Date.now() - lastRouteRequestAtRef.current

      if (moved >= routeMoveThresholdMeters) {
        shouldFetch = true
      } else if (elapsedMs >= routeMinIntervalMs && moved >= routeMinMovementForIntervalRefreshMeters) {
        shouldFetch = true
      }
    }

    if (!shouldFetch) {
      return
    }

    lastRoutePositionRef.current = rider
    lastRouteRequestAtRef.current = Date.now()

    routeAbortControllerRef.current?.abort()
    const controller = new AbortController()
    routeAbortControllerRef.current = controller

    try {
      const route = await fetchDrivingRoute({ apiKey, origin: rider, destination, signal: controller.signal })

      if (controller.signal.aborted) {
        return
      }

      overviewPathRef.current = route.path
      renderProgressPolylines()
      setRouteEta(formatRouteEta({ distanceMeters: route.distanceMeters, durationSeconds: route.durationSeconds }))
      setRouteStatus("ok")
    } catch (error) {
      if (controller.signal.aborted) {
        return
      }

      console.error("[live-delivery-map] route request failed", error)
      // Deliberately do NOT clear overviewPathRef/polylines here - the last
      // known good route stays on the map. Only the ETA panel reflects the
      // failure, via routeStatus.
      setRouteStatus("error")
    }
  }

  function animateRiderMarker(from: LatLng | null, to: LatLng, deviceHeading?: number) {
    const map = mapRef.current
    if (!map) {
      return
    }

    // Prefer the partner device's compass heading when available - it's
    // accurate even while the partner is stationary (e.g. waiting at a
    // signal), unlike the GPS-derived bearing below which needs real
    // movement between two points and can't say anything while parked.
    let bearing: number | null = null

    if (typeof deviceHeading === "number" && Number.isFinite(deviceHeading)) {
      bearing = ((deviceHeading % 360) + 360) % 360
    } else if (from) {
      const distanceMoved = window.google.maps.geometry.spherical.computeDistanceBetween(
        new window.google.maps.LatLng(from),
        new window.google.maps.LatLng(to),
      )

      // Ignore GPS jitter for heading purposes - a stationary rider shouldn't
      // have their marker spin to a noisy bearing.
      if (distanceMoved > 3) {
        bearing = computeBearing(from, to)
      }
    }

    if (bearing !== null) {
      const bucketed = Math.round(bearing / 10) * 10
      const normalized = bucketed >= 360 ? 0 : bucketed

      if (normalized !== riderRotationRef.current) {
        riderRotationRef.current = normalized
        riderMarkerRef.current?.setIcon({
          url: toIconUrl(buildRiderIconSvg(normalized)),
          scaledSize: new window.google.maps.Size(48, 48),
          anchor: new window.google.maps.Point(24, 24),
        })
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

    animateRiderMarker(previousPosition, nextPosition, riderLocation.heading)
    currentRiderPositionRef.current = nextPosition

    maybeFitBounds()
    renderProgressPolylines()
    void requestRoute()

    if (followingRef.current && mapRef.current) {
      mapRef.current.panTo(nextPosition)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mapReady, riderLocation?.latitude, riderLocation?.longitude, riderLocation?.timestamp, riderLocation?.heading])

  useEffect(() => {
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
      routeAbortControllerRef.current?.abort()
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
        <LiveBadge status={liveStatus} />
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
              {routeStatus === "ok" && routeEta ? (
                <>
                  <div className="shrink-0">
                    <p className="font-heading text-2xl font-semibold leading-none text-primary">{routeEta.minutes}</p>
                    <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">min</p>
                  </div>
                  <div className="min-w-0 flex-1 border-l border-border pl-3">
                    <p className="truncate text-sm font-medium text-foreground">{routeEta.distanceKm} km away</p>
                    <p className="truncate text-xs text-muted-foreground">Arriving {routeEta.clockLabel}</p>
                  </div>
                </>
              ) : routeStatus === "error" ? (
                <p className="flex-1 text-sm text-muted-foreground">ETA temporarily unavailable</p>
              ) : riderLocation ? (
                <p className="flex-1 text-sm text-muted-foreground">Calculating live ETA...</p>
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
                <p className="truncate text-xs text-muted-foreground">
                  {liveStatus === "live"
                    ? `${riderName} is on the way with your order`
                    : liveStatus === "updating"
                      ? formatUpdatingLabel(riderLocation?.timestamp, now)
                      : "Tracking session ended"}
                </p>
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
