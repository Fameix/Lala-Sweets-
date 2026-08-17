import { NextResponse } from "next/server"
import { z } from "zod"

import { cartLineItemSchema, checkoutCustomerSchema } from "@/lib/order-schema"
import { createOrderRecord } from "@/lib/orders-server"

const createOrderSchema = z.object({
  orderId: z.string().min(1).optional(),
  customer: checkoutCustomerSchema,
  products: z.array(cartLineItemSchema).min(1),
  deliveryType: z.enum(["LOCAL", "COURIER"]),
  subtotalPaise: z.number().int().nonnegative(),
  deliveryChargePaise: z.number().int().nonnegative(),
  // RAZORPAY orders are only ever created by the server-side-verified
  // /api/payments/razorpay/confirm route (real signature + captured-amount
  // check happens there). This endpoint must never mark an order PAID on
  // the client's say-so, so it only accepts COD.
  paymentMethod: z.literal("COD"),
  couponCode: z.string().min(1).optional(),
  courierTracking: z
    .object({
      courierName: z.string().min(1),
      trackingId: z.string().min(1),
    })
    .optional(),
})

export async function POST(request: Request) {
  const parsed = createOrderSchema.safeParse(await request.json())

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid order payload." }, { status: 400 })
  }

  try {
    // createOrderRecord recomputes product prices, delivery charge, and
    // discount server-side - the client-submitted values here are only used
    // as hints (e.g. deliveryType) where a canonical override isn't found.
    const order = await createOrderRecord(parsed.data)
    return NextResponse.json({ order })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to save order." },
      { status: 500 },
    )
  }
}
