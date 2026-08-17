import "server-only"

import { getFirebaseAdminDb } from "@/lib/firebase-admin"
import type { NewOrderAlertEvent } from "@/lib/order-alert-types"

type Listener = (event: NewOrderAlertEvent) => void

const MAX_BUFFER = 50
const WATCH_LIMIT = 25

const eventBuffer: NewOrderAlertEvent[] = []
const listeners = new Set<Listener>()

let listenerStarted = false
let seededInitialSnapshot = false

function toAlertEvent(data: FirebaseFirestore.DocumentData): NewOrderAlertEvent {
  return {
    orderId: String(data.orderId ?? ""),
    createdAt: String(data.createdAt ?? new Date().toISOString()),
    customerName: String(data.customer?.name ?? "Customer"),
    itemCount: Array.isArray(data.products)
      ? data.products.reduce((total: number, item: { quantity?: number }) => total + (item.quantity ?? 0), 0)
      : 0,
    amountPaise: Number(data.amount ?? 0),
    deliveryType: data.deliveryType === "LOCAL" ? "LOCAL" : "COURIER",
    paymentMethod: data.payment?.method === "COD" ? "COD" : "RAZORPAY",
    paymentStatus: data.paymentStatus === "PAID" ? "PAID" : "PENDING",
  }
}

function pushEvent(event: NewOrderAlertEvent) {
  eventBuffer.push(event)

  if (eventBuffer.length > MAX_BUFFER) {
    eventBuffer.shift()
  }

  for (const listener of listeners) {
    listener(event)
  }
}

/**
 * Real-time "new order" signal, sourced from a server-side Admin SDK
 * Firestore listener (browser clients cannot read Firestore directly under
 * firestore.rules). The first snapshot after start-up seeds the buffer
 * without alerting so a server restart doesn't replay existing orders.
 */
function startListener() {
  if (listenerStarted) {
    return
  }

  listenerStarted = true

  const db = getFirebaseAdminDb()

  db.collection("orders")
    .orderBy("createdAt", "desc")
    .limit(WATCH_LIMIT)
    .onSnapshot(
      (snapshot) => {
        if (!seededInitialSnapshot) {
          seededInitialSnapshot = true
          return
        }

        for (const change of snapshot.docChanges()) {
          if (change.type !== "added") {
            continue
          }

          pushEvent(toAlertEvent(change.doc.data()))
        }
      },
      (error) => {
        console.error("[order-alerts] Firestore listener error", error)
        listenerStarted = false
      },
    )
}

export function subscribeToNewOrders(listener: Listener) {
  startListener()
  listeners.add(listener)

  return () => {
    listeners.delete(listener)
  }
}

export function getBufferedEventsSince(sinceOrderId: string | null): NewOrderAlertEvent[] {
  startListener()

  if (!sinceOrderId) {
    return []
  }

  const index = eventBuffer.findIndex((event) => event.orderId === sinceOrderId)

  if (index === -1) {
    return [...eventBuffer]
  }

  return eventBuffer.slice(index + 1)
}
