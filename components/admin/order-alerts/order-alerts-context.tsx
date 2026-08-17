"use client"

import * as React from "react"
import { toast } from "sonner"

import { getAdminIdToken } from "@/lib/admin-fetch"
import { playOrderAlertChime, unlockOrderAlertAudio } from "@/lib/order-alert-sound"
import type { NewOrderAlertEvent } from "@/lib/order-alert-types"

import { NewOrderToast } from "./new-order-toast"

const LAST_SEEN_ORDER_ID_KEY = "lala-sweets-order-alerts-last-seen-id"
const NOTIFIED_ORDER_IDS_KEY = "lala-sweets-order-alerts-notified-ids"
const MUTED_KEY = "lala-sweets-order-alerts-muted"
const MAX_RECENT_ORDERS = 20
const MAX_NOTIFIED_IDS = 100

type OrderAlertsContextValue = {
  recentOrders: NewOrderAlertEvent[]
  unseenCount: number
  markAllSeen: () => void
  muted: boolean
  toggleMuted: () => void
  soundEnabled: boolean
  enableSound: () => Promise<void>
  connectionState: "connecting" | "open" | "closed"
}

const OrderAlertsContext = React.createContext<OrderAlertsContextValue | null>(null)

function readLocalStorage(key: string): string | null {
  if (typeof window === "undefined") {
    return null
  }

  try {
    return window.localStorage.getItem(key)
  } catch {
    return null
  }
}

function writeLocalStorage(key: string, value: string) {
  if (typeof window === "undefined") {
    return
  }

  try {
    window.localStorage.setItem(key, value)
  } catch {
    // storage unavailable (private mode, quota) — alerts still work in-memory
  }
}

function readNotifiedIds(): Set<string> {
  const raw = readLocalStorage(NOTIFIED_ORDER_IDS_KEY)

  if (!raw) {
    return new Set()
  }

  try {
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? new Set(parsed) : new Set()
  } catch {
    return new Set()
  }
}

function persistNotifiedIds(ids: Set<string>) {
  const trimmed = Array.from(ids).slice(-MAX_NOTIFIED_IDS)
  writeLocalStorage(NOTIFIED_ORDER_IDS_KEY, JSON.stringify(trimmed))
}

export function OrderAlertsProvider({ children }: { children: React.ReactNode }) {
  const [recentOrders, setRecentOrders] = React.useState<NewOrderAlertEvent[]>([])
  const [unseenCount, setUnseenCount] = React.useState(0)
  const [muted, setMuted] = React.useState(() => readLocalStorage(MUTED_KEY) === "1")
  const [soundEnabled, setSoundEnabled] = React.useState(false)
  const [connectionState, setConnectionState] = React.useState<"connecting" | "open" | "closed">("connecting")

  const notifiedIdsRef = React.useRef<Set<string>>(readNotifiedIds())
  const mutedRef = React.useRef(muted)
  const soundEnabledRef = React.useRef(false)

  const handleIncomingOrder = React.useCallback((event: NewOrderAlertEvent) => {
    if (notifiedIdsRef.current.has(event.orderId)) {
      return
    }

    notifiedIdsRef.current.add(event.orderId)
    persistNotifiedIds(notifiedIdsRef.current)
    writeLocalStorage(LAST_SEEN_ORDER_ID_KEY, event.orderId)

    setRecentOrders((previous) => [event, ...previous].slice(0, MAX_RECENT_ORDERS))
    setUnseenCount((previous) => previous + 1)

    toast.custom((toastId) => <NewOrderToast event={event} onDismiss={() => toast.dismiss(toastId)} />, {
      duration: 8000,
    })

    if (soundEnabledRef.current && !mutedRef.current) {
      playOrderAlertChime()
    }

    if (typeof window !== "undefined" && "Notification" in window && Notification.permission === "granted") {
      try {
        new Notification("New order received", {
          body: `#${event.orderId} • ${event.itemCount} item${event.itemCount === 1 ? "" : "s"} • ${event.customerName}`,
          tag: event.orderId,
        })
      } catch {
        // Notification constructor can throw on some mobile browsers — visual toast already covers it
      }
    }
  }, [])

  React.useEffect(() => {
    let cancelled = false
    let eventSource: EventSource | null = null

    async function connect() {
      // EventSource can't set an Authorization header, so the admin's ID
      // token travels as a query param instead - verified server-side in
      // requireAdminActorFromQueryToken.
      const token = await getAdminIdToken().catch(() => null)

      if (cancelled || !token) {
        return
      }

      const lastSeenOrderId = readLocalStorage(LAST_SEEN_ORDER_ID_KEY) ?? ""
      const params = new URLSearchParams({ token })

      if (lastSeenOrderId) {
        params.set("since", lastSeenOrderId)
      }

      eventSource = new EventSource(`/api/admin/orders/stream?${params.toString()}`)

      eventSource.addEventListener("open", () => setConnectionState("open"))
      eventSource.addEventListener("error", () => setConnectionState("closed"))

      eventSource.addEventListener("new-order", (message) => {
        try {
          const event = JSON.parse((message as MessageEvent).data) as NewOrderAlertEvent
          handleIncomingOrder(event)
        } catch {
          // malformed payload — ignore rather than crash the dashboard
        }
      })
    }

    void connect()

    return () => {
      cancelled = true
      eventSource?.close()
    }
  }, [handleIncomingOrder])

  const markAllSeen = React.useCallback(() => {
    setUnseenCount(0)
  }, [])

  const toggleMuted = React.useCallback(() => {
    setMuted((previous) => {
      const next = !previous
      mutedRef.current = next
      writeLocalStorage(MUTED_KEY, next ? "1" : "0")
      return next
    })
  }, [])

  const enableSound = React.useCallback(async () => {
    const unlocked = await unlockOrderAlertAudio()
    soundEnabledRef.current = unlocked
    setSoundEnabled(unlocked)

    if (typeof window !== "undefined" && "Notification" in window && Notification.permission === "default") {
      Notification.requestPermission().catch(() => undefined)
    }
  }, [])

  const value = React.useMemo<OrderAlertsContextValue>(
    () => ({
      recentOrders,
      unseenCount,
      markAllSeen,
      muted,
      toggleMuted,
      soundEnabled,
      enableSound,
      connectionState,
    }),
    [recentOrders, unseenCount, markAllSeen, muted, toggleMuted, soundEnabled, enableSound, connectionState],
  )

  return <OrderAlertsContext.Provider value={value}>{children}</OrderAlertsContext.Provider>
}

export function useOrderAlerts() {
  const context = React.useContext(OrderAlertsContext)

  if (!context) {
    throw new Error("useOrderAlerts must be used within an OrderAlertsProvider")
  }

  return context
}
