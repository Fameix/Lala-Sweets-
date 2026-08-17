import { NextResponse } from "next/server"

import { requireAdminActor } from "@/lib/delivery-auth"
import { listCustomerSummaries } from "@/lib/customers-server"

export async function GET(request: Request) {
  try {
    await requireAdminActor(request)
    const customers = await listCustomerSummaries()
    return NextResponse.json({ customers })
  } catch (error) {
    if (error instanceof Response) {
      return error
    }

    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to load customers." },
      { status: 500 },
    )
  }
}
