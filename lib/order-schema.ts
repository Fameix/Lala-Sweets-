import { z } from "zod"

export const pincodeSchema = z.string().regex(/^\d{6}$/, "Enter a valid 6 digit pincode.")

export const checkoutCustomerSchema = z.object({
  name: z.string().min(1),
  mobile: z.string().min(1),
  // Email is no longer collected at checkout - kept optional (default "")
  // rather than removed so CheckoutCustomer / order records don't need a
  // breaking shape change, and so Firestore never sees `undefined`.
  email: z.string().optional().default(""),
  address: z.string().min(1),
  pincode: pincodeSchema,
})

export const cartLineItemSchema = z.object({
  id: z.string().min(1),
  productId: z.string().min(1),
  productName: z.string().optional(),
  productSlug: z.string().optional(),
  image: z.string().optional(),
  size: z.string().min(1),
  unitPricePaise: z.number().int().nonnegative(),
  quantity: z.number().int().positive(),
  selectedOptions: z.record(z.string(), z.array(z.string())),
})
