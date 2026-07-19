import { z } from "zod"

export const aiChatRequestSchema = z.object({
  message: z.string().trim().min(1).max(1000),
  language: z.enum(["en", "ta", "mixed"]).optional(),
})

export const voiceInterpretRequestSchema = z.object({
  transcript: z.string().trim().min(1).max(1000),
  language: z.enum(["en", "ta", "mixed"]).optional(),
})

export const customCakeSummaryRequestSchema = z.object({
  customerName: z.string().trim().max(120).optional(),
  mobileNumber: z.string().trim().max(30).optional(),
  email: z.string().trim().max(160).optional(),
  occasion: z.string().trim().max(120).optional(),
  requiredDate: z.string().trim().max(40).optional(),
  requiredTime: z.string().trim().max(40).optional(),
  guests: z.coerce.number().int().min(0).max(1000).optional(),
  recommendedWeight: z.string().trim().max(40).optional(),
  selectedWeight: z.string().trim().max(40).optional(),
  flavour: z.string().trim().max(120).optional(),
  eggPreference: z.string().trim().max(80).optional(),
  shape: z.string().trim().max(80).optional(),
  tierCount: z.coerce.number().int().min(1).max(10).optional(),
  theme: z.string().trim().max(160).optional(),
  colours: z.string().trim().max(160).optional(),
  displayName: z.string().trim().max(80).optional(),
  displayAge: z.string().trim().max(40).optional(),
  cakeMessage: z.string().trim().max(240).optional(),
  budget: z.string().trim().max(80).optional(),
  fulfilmentType: z.enum(["delivery", "pickup"]).optional(),
  preferredBranch: z.string().trim().max(120).optional(),
  deliveryAddress: z.string().trim().max(500).optional(),
  referenceImages: z.array(z.string().trim().max(200)).optional(),
  specialInstructions: z.string().trim().max(1000).optional(),
  language: z.enum(["en", "ta", "mixed"]).optional(),
})

export const structuredCakeSummarySchema = z.object({
  customerSummary: z.string(),
  productionBrief: z.object({
    occasion: z.string().nullable(),
    guest_count: z.number().nullable(),
    recommended_weight: z.string().nullable(),
    requested_weight: z.string().nullable(),
    flavour: z.string().nullable(),
    egg_preference: z.string().nullable(),
    shape: z.string().nullable(),
    tier_count: z.number().nullable(),
    theme: z.string().nullable(),
    colour_palette: z.string().nullable(),
    display_name: z.string().nullable(),
    display_age: z.string().nullable(),
    cake_message: z.string().nullable(),
    budget: z.string().nullable(),
    required_at: z.string().nullable(),
    fulfilment_type: z.string().nullable(),
    branch_id: z.string().nullable(),
    reference_image_ids: z.array(z.string()),
    special_instructions: z.string().nullable(),
  }),
  missingFields: z.array(z.string()),
  warnings: z.array(z.string()),
})

export type CustomCakeSummaryRequest = z.infer<typeof customCakeSummaryRequestSchema>

