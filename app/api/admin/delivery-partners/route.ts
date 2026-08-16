import { NextResponse } from "next/server"
import { z } from "zod"

import { requireAdminPreview } from "@/lib/delivery-auth"
import { listDeliveryPartners, upsertDeliveryPartner } from "@/lib/orders-server"

const upsertPartnerSchema = z.object({
  partnerId: z.string().min(1),
  name: z.string().min(1),
  phone: z.string().min(1),
  vehicleNumber: z.string().min(1),
  active: z.boolean(),
})

export async function GET() {
  try {
    requireAdminPreview()
    const partners = await listDeliveryPartners()
    return NextResponse.json({ partners })
  } catch (error) {
    if (error instanceof Response) {
      return error
    }

    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to load delivery partners." },
      { status: 500 },
    )
  }
}

export async function POST(request: Request) {
  const parsed = upsertPartnerSchema.safeParse(await request.json())

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid delivery partner details." }, { status: 400 })
  }

  try {
    requireAdminPreview()
    const partner = await upsertDeliveryPartner(parsed.data)
    return NextResponse.json({ partner })
  } catch (error) {
    if (error instanceof Response) {
      return error
    }

    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to save delivery partner." },
      { status: 500 },
    )
  }
}
