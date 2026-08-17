import { NextResponse } from "next/server"
import { z } from "zod"

import { requireAdminActor } from "@/lib/delivery-auth"
import { getStoreSettings, updateStoreSettings } from "@/lib/settings-server"

const storeSettingsSchema = z.object({
  name: z.string().min(1),
  address: z.string().min(1),
  phone: z.string().min(1),
  email: z.string().email(),
})

export async function GET(request: Request) {
  try {
    await requireAdminActor(request)
    const settings = await getStoreSettings()
    return NextResponse.json({ settings })
  } catch (error) {
    if (error instanceof Response) {
      return error
    }

    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to load store settings." },
      { status: 500 },
    )
  }
}

export async function PATCH(request: Request) {
  const parsed = storeSettingsSchema.safeParse(await request.json())

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid store settings." }, { status: 400 })
  }

  try {
    await requireAdminActor(request)
    const settings = await updateStoreSettings(parsed.data)
    return NextResponse.json({ settings })
  } catch (error) {
    if (error instanceof Response) {
      return error
    }

    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to update store settings." },
      { status: 500 },
    )
  }
}
