import { NextResponse } from "next/server"

import { getCustomerTrackingRecord } from "@/lib/orders-server"

export async function GET(_request: Request, context: { params: Promise<{ orderId: string }> }) {
  const { orderId } = await context.params

  try {
    const status = await getCustomerTrackingRecord(orderId)

    if (!status) {
      return NextResponse.json({ error: "Order not found." }, { status: 404 })
    }

    return NextResponse.json({ tracking: status })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to load order status." },
      { status: 500 },
    )
  }
}
