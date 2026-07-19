import { getCakeProducts } from "@/lib/catalogue"
import type { Product } from "@/types/catalogue"
import { calculateCakeServingEstimate, roundCakeWeight } from "./estimate"
import type { CakeServingRules, DessertContext, PortionPreference } from "./rules"

export type CakeServingInput = {
  adults: number
  children: number
  portionPreference: PortionPreference
  dessertContext: DessertContext
  occasion?: string
  cakeType?: string
  tierPreference?: "single-tier" | "multi-tier"
  budgetPaise?: number | null
  requiredDate?: string
  preferredBranch?: string
}

export type CakeServingResult = {
  recommendedWeightGrams: number
  servingRange: string
  explanation: string
  rawRequirementGrams: number
  adjustedRequirementGrams: number
  suggestedProducts: Product[]
  budgetFriendlyProduct: Product | null
  largerSafeProduct: Product | null
  warnings: string[]
}

export { roundCakeWeight }

export function calculateCakeServing(input: CakeServingInput, rules: CakeServingRules): CakeServingResult {
  const estimate = calculateCakeServingEstimate(input, rules)
  const { adjustedRequirementGrams, rawRequirementGrams, recommendedWeightGrams, servingRange } = estimate
  const activeCakes = getCakeProducts().filter((cake) => cake.is_active)
  const orderableMatches = activeCakes.filter((cake) =>
    (cake.available_weights ?? []).some(
      (variant) =>
        variant.is_orderable &&
        variant.grams !== null &&
        variant.grams >= recommendedWeightGrams &&
        variant.price_paise !== null &&
        variant.availability_status === "available"
    )
  )
  const fallbackMatches = orderableMatches.length > 0 ? orderableMatches : activeCakes.slice(0, 3)
  const budgetFriendlyProduct =
    input.budgetPaise === null || input.budgetPaise === undefined
      ? null
      : orderableMatches.find((cake) =>
          (cake.available_weights ?? []).some((variant) => variant.price_paise !== null && variant.price_paise <= input.budgetPaise!)
        ) ?? null
  const largerSafeProduct = orderableMatches.find((cake) =>
    (cake.available_weights ?? []).some((variant) => variant.grams !== null && variant.grams > recommendedWeightGrams)
  ) ?? null
  const warnings = ["Serving estimates may vary depending on slice size and serving style."]

  if (input.tierPreference === "multi-tier" && recommendedWeightGrams < rules.multiTierMinimumWeightGrams) {
    warnings.push("Multi-tier cakes may require a larger minimum weight after bakery review.")
  }

  if (recommendedWeightGrams >= rules.maximumWeightGrams) {
    warnings.push("This request is near the maximum online estimate and should be reviewed by the bakery.")
  }

  if (orderableMatches.length === 0) {
    warnings.push("No orderable cake variants are approved yet, so suggestions are catalogue previews only.")
  }

  return {
    recommendedWeightGrams,
    servingRange,
    explanation: `Based on ${input.adults} adults, ${input.children} children and ${input.portionPreference} portions, ${(recommendedWeightGrams / 1000).toLocaleString("en-IN")} kg is the closest configured estimate.`,
    rawRequirementGrams,
    adjustedRequirementGrams,
    suggestedProducts: fallbackMatches.slice(0, 3),
    budgetFriendlyProduct,
    largerSafeProduct,
    warnings,
  }
}
