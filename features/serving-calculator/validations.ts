import { z } from "zod"

export const cakeServingInputSchema = z.object({
  adults: z.coerce.number().int().min(0).max(500),
  children: z.coerce.number().int().min(0).max(500),
  portionPreference: z.enum(["small", "standard", "generous"]),
  dessertContext: z.enum(["main-dessert", "several-desserts"]),
  occasion: z.string().trim().max(80).optional(),
  cakeType: z.string().trim().max(80).optional(),
  tierPreference: z.enum(["single-tier", "multi-tier"]).optional(),
  budgetPaise: z.coerce.number().int().min(0).max(100000000).nullable().optional(),
  requiredDate: z.string().trim().max(40).optional(),
  preferredBranch: z.string().trim().max(80).optional(),
})

export type CakeServingInputValues = z.infer<typeof cakeServingInputSchema>

