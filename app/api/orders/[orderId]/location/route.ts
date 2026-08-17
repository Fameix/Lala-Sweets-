import { NextResponse } from "next/server"
import { z } from "zod"

import { requireAdminActor, requirePartnerActor } from "@/lib/delivery-auth"
import { getLiveLocation, getLiveLocationForCustomer, updateLiveLocation } from "@/lib/orders-server"

const liveLocationSchema = z.object({
  partnerId: z.string().min(1),
  latitude: z.number(),
  longitude: z.number(),
  accuracy: z.number().nonnegative(),
  timestamp: z.number().int().positive(),
  isOnline: z.boolean().optional(),
  heading: z.number().min(0).max(360).optional(),
})

export async function GET(request: Request, context: { params: Promise<{ orderId: string }> }) {
  const { orderId } = await context.params

  try {
    // Admins can read any order's live location (needed for the Live
    // Deliveries dashboard); everyone else still needs the checkout phone
    // number to match, same as before.
    const isAdmin = await requireAdminActor(request)
      .then(() => true)
      .catch(() => false)

    const liveLocation = isAdmin
      ? await getLiveLocation(orderId)
      : await getLiveLocationForCustomer(orderId, new URL(request.url).searchParams.get("mobile") ?? "")

    if (!liveLocation) {
      return NextResponse.json({ error: "Location not found." }, { status: 404 })
    }

    return NextResponse.json({ liveLocation })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to load live location." },
      { status: 500 },
    )
  }
}

export async function POST(request: Request, context: { params: Promise<{ orderId: string }> }) {
  const { orderId } = await context.params
  const parsed = liveLocationSchema.safeParse(await request.json())

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid live location payload." }, { status: 400 })
  }

  try {
    await requirePartnerActor(request, parsed.data.partnerId)
    const liveLocation = await updateLiveLocation(orderId, parsed.data)

    if (!liveLocation) {
      return NextResponse.json({ error: "Order not found or live tracking not enabled." }, { status: 404 })
    }

    return NextResponse.json({ liveLocation })
  } catch (error) {
    if (error instanceof Response) {
      return error
    }

    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to update live location." },
      { status: 500 },
    )
  }
}
