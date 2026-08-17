import { NextResponse } from "next/server"

import { requireAdminActor } from "@/lib/delivery-auth"
import { getEnv } from "@/lib/env"

export async function GET(request: Request) {
  try {
    await requireAdminActor(request)

    const env = getEnv()
    // Booleans only - never return the actual key/secret values to the browser.
    return NextResponse.json({
      razorpayConfigured: Boolean(env.RAZORPAY_KEY_ID && env.RAZORPAY_KEY_SECRET),
      codEnabled: true,
    })
  } catch (error) {
    if (error instanceof Response) {
      return error
    }

    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to load payment status." },
      { status: 500 },
    )
  }
}
