"use client"

export type RouteLatLng = { lat: number; lng: number }

export type DrivingRoute = {
  path: RouteLatLng[]
  distanceMeters: number
  durationSeconds: number
}

type ComputeRoutesResponse = {
  routes?: Array<{
    duration?: string
    distanceMeters?: number
    polyline?: { encodedPolyline?: string }
  }>
}

/**
 * Real road-following route via the Google Maps Routes API (computeRoutes),
 * called directly from the browser with the existing public
 * NEXT_PUBLIC_GOOGLE_MAPS_API_KEY - same client-side API key architecture
 * already used for the Maps JS SDK/Geocoder, no server secret involved.
 * Requires the "geometry" Maps JS library (already loaded by
 * lib/google-maps-loader.ts) to decode the returned polyline.
 */
export async function fetchDrivingRoute({
  apiKey,
  origin,
  destination,
  signal,
}: {
  apiKey: string
  origin: RouteLatLng
  destination: RouteLatLng
  signal?: AbortSignal
}): Promise<DrivingRoute> {
  if (!window.google?.maps?.geometry?.encoding) {
    throw new Error("Google Maps geometry library is not loaded.")
  }

  const response = await fetch("https://routes.googleapis.com/directions/v2:computeRoutes", {
    method: "POST",
    signal,
    headers: {
      "Content-Type": "application/json",
      "X-Goog-Api-Key": apiKey,
      "X-Goog-FieldMask": "routes.duration,routes.distanceMeters,routes.polyline.encodedPolyline",
    },
    body: JSON.stringify({
      origin: { location: { latLng: { latitude: origin.lat, longitude: origin.lng } } },
      destination: { location: { latLng: { latitude: destination.lat, longitude: destination.lng } } },
      travelMode: "DRIVE",
      routingPreference: "TRAFFIC_AWARE",
      polylineQuality: "HIGH_QUALITY",
      computeAlternativeRoutes: false,
      units: "METRIC",
    }),
  })

  if (!response.ok) {
    const body = await response.text().catch(() => "")
    throw new Error(`Routes API request failed (${response.status}): ${body.slice(0, 300)}`)
  }

  const payload = (await response.json()) as ComputeRoutesResponse
  const route = payload.routes?.[0]
  const encodedPolyline = route?.polyline?.encodedPolyline

  if (!encodedPolyline || route.distanceMeters == null || !route.duration) {
    throw new Error("Routes API returned no usable route.")
  }

  const durationSeconds = Number(route.duration.replace(/s$/, ""))

  if (!Number.isFinite(durationSeconds)) {
    throw new Error("Routes API returned an invalid duration.")
  }

  const decodedPath = window.google.maps.geometry.encoding.decodePath(encodedPolyline)

  return {
    path: decodedPath.map((point) => ({ lat: point.lat(), lng: point.lng() })),
    distanceMeters: route.distanceMeters,
    durationSeconds,
  }
}
