import { NextResponse } from "next/server"
import { z } from "zod"

import { requireAdminActor } from "@/lib/delivery-auth"
import { listDeliveryZones, upsertDeliveryZone } from "@/lib/delivery-zones-server"

const zoneSchema = z.object({
  zoneId: z.string().min(1),
  name: z.string().min(1),
  pincodes: z.array(z.string().regex(/^\d{6}$/)).min(1),
  deliveryType: z.enum(["LOCAL", "COURIER"]),
  chargePaise: z.number().int().nonnegative(),
  active: z.boolean(),
})

export async function GET(request: Request) {
  try {
    await requireAdminActor(request)
    const zones = await listDeliveryZones()
    return NextResponse.json({ zones })
  } catch (error) {
    if (error instanceof Response) {
      return error
    }

    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to load delivery zones." },
      { status: 500 },
    )
  }
}

export async function POST(request: Request) {
  const parsed = zoneSchema.safeParse(await request.json())

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid delivery zone details." }, { status: 400 })
  }

  try {
    await requireAdminActor(request)
    const zone = await upsertDeliveryZone(parsed.data)
    return NextResponse.json({ zone })
  } catch (error) {
    if (error instanceof Response) {
      return error
    }

    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to save delivery zone." },
      { status: 500 },
    )
  }
}
