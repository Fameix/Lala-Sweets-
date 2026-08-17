import { NextResponse } from "next/server"
import { z } from "zod"

import { requireAdminActor } from "@/lib/delivery-auth"
import { listCoupons, upsertCoupon } from "@/lib/coupons-server"

const couponSchema = z.object({
  code: z.string().min(1),
  discountType: z.enum(["PERCENT", "FLAT"]),
  discountValue: z.number().int().positive(),
  minOrderPaise: z.number().int().nonnegative().default(0),
  maxDiscountPaise: z.number().int().nonnegative().nullable().default(null),
  validFrom: z.string().nullable().default(null),
  validUntil: z.string().nullable().default(null),
  usageLimit: z.number().int().positive().nullable().default(null),
  active: z.boolean().default(true),
})

export async function GET(request: Request) {
  try {
    await requireAdminActor(request)
    const coupons = await listCoupons()
    return NextResponse.json({ coupons })
  } catch (error) {
    if (error instanceof Response) {
      return error
    }

    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to load coupons." },
      { status: 500 },
    )
  }
}

export async function POST(request: Request) {
  const parsed = couponSchema.safeParse(await request.json())

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid coupon details." }, { status: 400 })
  }

  try {
    await requireAdminActor(request)
    const coupon = await upsertCoupon(parsed.data)
    return NextResponse.json({ coupon })
  } catch (error) {
    if (error instanceof Response) {
      return error
    }

    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to save coupon." },
      { status: 500 },
    )
  }
}
