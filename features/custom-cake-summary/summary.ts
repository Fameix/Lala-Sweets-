import type { CustomCakeSummaryRequest } from "@/features/ai/validations/schemas"
import { structuredCakeSummarySchema } from "@/features/ai/validations/schemas"

const requiredFields: [keyof CustomCakeSummaryRequest, string][] = [
  ["occasion", "Occasion missing"],
  ["requiredDate", "Required date missing"],
  ["guests", "Guest count missing"],
  ["selectedWeight", "Weight not selected"],
  ["flavour", "Flavour not selected"],
  ["eggPreference", "Egg preference missing"],
  ["preferredBranch", "Branch missing"],
  ["budget", "Budget missing"],
]

export function createDeterministicCustomCakeSummary(input: CustomCakeSummaryRequest) {
  const missingFields = requiredFields
    .filter(([key]) => {
      const value = input[key]
      return value === undefined || value === null || value === ""
    })
    .map(([, label]) => label)
  const warnings: string[] = ["AI-generated requirement summary - review before production."]

  if (input.fulfilmentType === "delivery" && !input.deliveryAddress) {
    missingFields.push("Delivery address incomplete")
  }

  if ((input.theme?.toLowerCase().includes("photo") || input.specialInstructions?.toLowerCase().includes("photo")) && (input.referenceImages?.length ?? 0) === 0) {
    warnings.push("Photo cake requested without a reference image.")
  }

  if ((input.tierCount ?? 1) > 1 && !input.selectedWeight) {
    warnings.push("Multi-tier cake requested; confirm minimum configured weight.")
  }

  const requiredAt = [input.requiredDate, input.requiredTime].filter(Boolean).join(" ") || null
  const customerSummary = [
    input.guests ? `${input.guests} guest custom cake` : "Custom cake request",
    input.occasion ? `for ${input.occasion}` : null,
    input.flavour ? `${input.flavour} flavour` : null,
    input.eggPreference ? `${input.eggPreference} preference` : null,
    input.theme ? `${input.theme} theme` : null,
    requiredAt ? `required at ${requiredAt}` : null,
  ]
    .filter(Boolean)
    .join(", ")

  return structuredCakeSummarySchema.parse({
    customerSummary,
    productionBrief: {
      occasion: input.occasion || null,
      guest_count: input.guests ?? null,
      recommended_weight: input.recommendedWeight || null,
      requested_weight: input.selectedWeight || null,
      flavour: input.flavour || null,
      egg_preference: input.eggPreference || null,
      shape: input.shape || null,
      tier_count: input.tierCount ?? null,
      theme: input.theme || null,
      colour_palette: input.colours || null,
      display_name: input.displayName || null,
      display_age: input.displayAge || null,
      cake_message: input.cakeMessage || null,
      budget: input.budget || null,
      required_at: requiredAt,
      fulfilment_type: input.fulfilmentType || null,
      branch_id: input.preferredBranch || null,
      reference_image_ids: input.referenceImages ?? [],
      special_instructions: input.specialInstructions || null,
    },
    missingFields,
    warnings,
  })
}

