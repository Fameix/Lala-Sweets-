import "server-only"

import type { NextRequest } from "next/server"

import { requireAdminActorFromQueryToken } from "@/lib/delivery-auth"
import { getBufferedEventsSince, subscribeToNewOrders } from "@/lib/order-alerts-server"
import type { NewOrderAlertEvent } from "@/lib/order-alert-types"

export const dynamic = "force-dynamic"
export const runtime = "nodejs"

const HEARTBEAT_INTERVAL_MS = 25_000

function encodeSseMessage(eventName: string, payload: unknown) {
  return `event: ${eventName}\ndata: ${JSON.stringify(payload)}\n\n`
}

export async function GET(request: NextRequest) {
  try {
    await requireAdminActorFromQueryToken(request)
  } catch (error) {
    if (error instanceof Response) {
      return error
    }

    return new Response("Unauthorized", { status: 401 })
  }

  const since = request.nextUrl.searchParams.get("since")
  const encoder = new TextEncoder()

  const stream = new ReadableStream({
    start(controller) {
      let closed = false

      const send = (chunk: string) => {
        if (closed) {
          return
        }

        try {
          controller.enqueue(encoder.encode(chunk))
        } catch {
          closed = true
        }
      }

      send(encodeSseMessage("ready", { ok: true }))

      for (const missedEvent of getBufferedEventsSince(since)) {
        send(encodeSseMessage("new-order", missedEvent))
      }

      const unsubscribe = subscribeToNewOrders((event: NewOrderAlertEvent) => {
        send(encodeSseMessage("new-order", event))
      })

      const heartbeat = setInterval(() => {
        send(`: ping\n\n`)
      }, HEARTBEAT_INTERVAL_MS)

      const close = () => {
        if (closed) {
          return
        }

        closed = true
        clearInterval(heartbeat)
        unsubscribe()

        try {
          controller.close()
        } catch {
          // already closed
        }
      }

      request.signal.addEventListener("abort", close)
    },
  })

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    },
  })
}
