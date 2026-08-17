import { NextResponse } from "next/server"

import { requireAdminActor } from "@/lib/delivery-auth"
import { getSupportedOrderStatuses, listOrders } from "@/lib/orders-server"
import type { OrderStatusCode } from "@/lib/order-types"

export async function GET(request: Request) {
  try {
    await requireAdminActor(request)

    const url = new URL(request.url)
    const statusParam = url.searchParams.get("status")
    const status =
      statusParam && (getSupportedOrderStatuses() as string[]).includes(statusParam)
        ? (statusParam as OrderStatusCode)
        : undefined

    const orders = await listOrders({ status })
    return NextResponse.json({ orders })
  } catch (error) {
    if (error instanceof Response) {
      return error
    }

    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to load orders." },
      { status: 500 },
    )
  }
}
