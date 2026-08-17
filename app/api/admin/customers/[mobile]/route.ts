import { NextResponse } from "next/server"

import { requireAdminActor } from "@/lib/delivery-auth"
import { getCustomerOrderHistory } from "@/lib/customers-server"

export async function GET(request: Request, context: { params: Promise<{ mobile: string }> }) {
  const { mobile } = await context.params

  try {
    await requireAdminActor(request)
    const orders = await getCustomerOrderHistory(mobile)

    if (orders.length === 0) {
      return NextResponse.json({ error: "No orders found for this customer." }, { status: 404 })
    }

    return NextResponse.json({ orders })
  } catch (error) {
    if (error instanceof Response) {
      return error
    }

    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to load customer history." },
      { status: 500 },
    )
  }
}
