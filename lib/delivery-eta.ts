import type { DeliveryType } from "@/lib/order-types"

export type EtaResult = {
  /** Minutes remaining, rounded to the nearest whole minute. */
  minutes: number
  /** "Arriving in 18 min" */
  relativeLabel: string
  /** "Today, 7:45 PM" */
  clockLabel: string
  /** Straight-line distance to the destination, in kilometres (1 decimal). */
  distanceKm: number
} | null

const minEtaMinutes = 1

function formatClockLabel(target: Date) {
  const now = new Date()
  const isToday = target.toDateString() === now.toDateString()
  const time = target.toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit" })
  return isToday ? `Today, ${time}` : `${target.toLocaleDateString("en-IN", { weekday: "short" })}, ${time}`
}

/**
 * Formats a real road-following route's distance/duration (from the Google
 * Maps Routes API) into the ETA display shape. Unlike a straight-line
 * estimate, this is only ever built from an actual route response - callers
 * should show "ETA temporarily unavailable" instead of calling this when the
 * route request fails, rather than falling back to a guessed number.
 */
export function formatRouteEta({
  distanceMeters,
  durationSeconds,
}: {
  distanceMeters: number
  durationSeconds: number
}): EtaResult {
  if (!Number.isFinite(distanceMeters) || !Number.isFinite(durationSeconds) || durationSeconds <= 0) {
    return null
  }

  const minutes = Math.max(minEtaMinutes, Math.round(durationSeconds / 60))
  const arrival = new Date(Date.now() + durationSeconds * 1000)

  return {
    minutes,
    relativeLabel: `Arriving in ${minutes} min`,
    clockLabel: formatClockLabel(arrival),
    distanceKm: Math.round((distanceMeters / 1000) * 10) / 10,
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
