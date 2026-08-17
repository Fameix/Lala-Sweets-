import { z } from "zod"

import { pincodeSchema } from "@/lib/order-schema"

export const addressInputSchema = z.object({
  label: z.string().min(1).max(30).default("Home"),
  name: z.string().min(1),
  mobile: z.string().regex(/^\d{10}$/, "Enter a valid 10-digit mobile number."),
  line1: z.string().min(1),
  city: z.string().min(1),
  pincode: pincodeSchema,
  isDefault: z.boolean().optional().default(false),
})

export const addressUpdateSchema = addressInputSchema.partial()
