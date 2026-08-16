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
  paymentMethod: z.enum(["RAZORPAY", "COD"]),
  razorpay: z
    .object({
      razorpay_payment_id: z.string().optional(),
      razorpay_order_id: z.string().optional(),
      razorpay_signature: z.string().optional(),
    })
    .optional(),
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
    const order = await createOrderRecord(parsed.data)
    return NextResponse.json({ order })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to save order." },
      { status: 500 },
    )
  }
}
