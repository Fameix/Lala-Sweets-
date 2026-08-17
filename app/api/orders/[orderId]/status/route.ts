import { NextResponse } from "next/server"

import { getCustomerTrackingRecord } from "@/lib/orders-server"

export async function GET(request: Request, context: { params: Promise<{ orderId: string }> }) {
  const { orderId } = await context.params
  const mobile = new URL(request.url).searchParams.get("mobile") ?? ""

  try {
    // Requiring the checkout phone number alongside the order ID stops
    // anyone who merely guesses/observes an order ID from reading another
    // customer's name, address, or live delivery-partner GPS.
    const status = await getCustomerTrackingRecord(orderId, mobile)

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
