import type { DeliveryType, OrderStatusCode } from "@/lib/order-types"

export type EtaResult = {
  /** Minutes remaining, rounded to the nearest 5. */
  minutes: number
  /** "Arriving in 18 min" */
  relativeLabel: string
  /** "Today, 7:45 PM" */
  clockLabel: string
  /** Straight-line distance to the destination, in kilometres (1 decimal). */
  distanceKm: number
} | null

const averageLocalDeliverySpeedKmh = 20
const handoffBufferMinutes = 3
const minEtaMinutes = 5
const maxReliableEtaMinutes = 90

function toRadians(value: number) {
  return (value * Math.PI) / 180
}

/** Great-circle distance in kilometres (Haversine formula). */
function distanceKm(a: { lat: number; lng: number }, b: { lat: number; lng: number }) {
  const earthRadiusKm = 6371
  const dLat = toRadians(b.lat - a.lat)
  const dLng = toRadians(b.lng - a.lng)
  const lat1 = toRadians(a.lat)
  const lat2 = toRadians(b.lat)

  const h = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2
  return 2 * earthRadiusKm * Math.asin(Math.sqrt(h))
}

function formatClockLabel(target: Date) {
  const now = new Date()
  const isToday = target.toDateString() === now.toDateString()
  const time = target.toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit" })
  return isToday ? `Today, ${time}` : `${target.toLocaleDateString("en-IN", { weekday: "short" })}, ${time}`
}

/**
 * Estimates delivery arrival for a LOCAL order that is OUT_FOR_DELIVERY,
 * using the rider's real current GPS position and the customer's real
 * geocoded destination - straight-line distance at an assumed average local
 * delivery speed, plus a small handoff buffer. Returns null (no ETA shown)
 * whenever real location/destination data isn't available yet, or the
 * order hasn't reached OUT_FOR_DELIVERY - callers should show a neutral
 * fallback message instead of inventing a number.
 */
export function estimateDeliveryEta({
  orderStatus,
  riderPosition,
  destinationPosition,
}: {
  orderStatus: OrderStatusCode
  riderPosition: { lat: number; lng: number } | null
  destinationPosition: { lat: number; lng: number } | null
}): EtaResult {
  if (orderStatus !== "OUT_FOR_DELIVERY" || !riderPosition || !destinationPosition) {
    return null
  }

  const distance = distanceKm(riderPosition, destinationPosition)
  const travelMinutes = (distance / averageLocalDeliverySpeedKmh) * 60
  const rawMinutes = Math.round(travelMinutes + handoffBufferMinutes)

  if (rawMinutes > maxReliableEtaMinutes) {
    return null
  }

  const minutes = Math.max(minEtaMinutes, Math.round(rawMinutes / 5) * 5)
  const arrival = new Date(Date.now() + minutes * 60 * 1000)

  return {
    minutes,
    relativeLabel: `Arriving in ${minutes} min`,
    clockLabel: formatClockLabel(arrival),
    distanceKm: Math.round(distance * 10) / 10,
  }
}

const localPrepMinutes = 45
const localWindowSpanMinutes = 30
const courierPrepMinutes = 24 * 60

function formatTimeRange(start: Date, end: Date) {
  const now = new Date()
  const isToday = start.toDateString() === now.toDateString()
  const dayLabel = isToday ? "Today" : start.toLocaleDateString("en-IN", { weekday: "short" })
  const startTime = start.toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit" })
  const endTime = end.toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit" })
  return `${dayLabel}, ${startTime} - ${endTime}`
}

/**
 * Pre-dispatch delivery window shown on Order Success, before there is a
 * rider location to compute a real ETA from. A fixed SLA buffer added to the
 * order's real createdAt timestamp - not a placeholder, but not live GPS
 * either; Track Order switches to estimateDeliveryEta() once a rider is en
 * route.
 */
export function estimateOrderWindow(createdAt: string, deliveryType: DeliveryType) {
  const createdDate = new Date(createdAt)

  if (Number.isNaN(createdDate.getTime())) {
    return null
  }

  if (deliveryType === "COURIER") {
    const arrival = new Date(createdDate.getTime() + courierPrepMinutes * 60 * 1000)
    return `Dispatched within 1-2 business days, arriving by ${arrival.toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" })}`
  }

  const start = new Date(createdDate.getTime() + localPrepMinutes * 60 * 1000)
  const end = new Date(start.getTime() + localWindowSpanMinutes * 60 * 1000)
  return formatTimeRange(start, end)
}
