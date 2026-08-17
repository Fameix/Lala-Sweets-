import { z } from "zod"

// Admin-facing subset of types/catalogue.ts's Product - deliberately smaller
// than the full extraction-pipeline shape (verification_status, source_*,
// extraction_notes, etc. are populated with sane defaults server-side since
// they only matter for the original menu-import workflow, not new
// admin-authored products).
export const productSizeVariantSchema = z.object({
  label: z.enum(["250g", "500g", "1kg"]),
  grams: z.number().int().positive(),
  price_paise: z.number().int().nonnegative(),
  availability_status: z.enum(["unconfirmed", "available", "unavailable"]),
  is_in_stock: z.boolean(),
})

export const productWriteSchema = z.object({
  display_name: z.string().min(1),
  slug: z
    .string()
    .min(1)
    .regex(/^[a-z0-9-]+$/, "Slug must be lowercase letters, numbers, and hyphens only."),
  normalized_category: z.string().min(1),
  short_description: z.string().default(""),
  long_description: z.string().default(""),
  image: z.string().default(""),
  price_paise: z.number().int().nonnegative().nullable(),
  compare_at_price_paise: z.number().int().nonnegative().nullable().default(null),
  size_variants: z.array(productSizeVariantSchema).default([]),
  stock_status: z.enum(["in-stock", "limited", "out-of-stock"]).default("in-stock"),
  stock_quantity: z.number().int().nonnegative().default(0),
  is_active: z.boolean().default(true),
  is_orderable: z.boolean().default(true),
  is_featured: z.boolean().default(false),
})

export type ProductWriteInput = z.infer<typeof productWriteSchema>
