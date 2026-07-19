import type { CakeServingRules, DessertContext, PortionPreference } from "./rules"

export type CakeServingEstimateInput = {
  adults: number
  children: number
  portionPreference: PortionPreference
  dessertContext: DessertContext
}

export type CakeServingEstimate = {
  recommendedWeightGrams: number
  servingRange: string
  rawRequirementGrams: number
  adjustedRequirementGrams: number
}

function gramsForAdult(rules: CakeServingRules, preference: PortionPreference) {
  if (preference === "small") return rules.gramsPerAdultSmall
  if (preference === "generous") return rules.gramsPerAdultGenerous
  return rules.gramsPerAdultStandard
}

function gramsForChild(rules: CakeServingRules, preference: PortionPreference) {
  if (preference === "small") return rules.gramsPerChildSmall
  if (preference === "generous") return rules.gramsPerChildGenerous
  return rules.gramsPerChildStandard
}

export function roundCakeWeight(grams: number, rules: CakeServingRules) {
  const rounded = Math.ceil(grams / rules.roundingIncrementGrams) * rules.roundingIncrementGrams
  return Math.min(Math.max(rounded, rules.minimumWeightGrams), rules.maximumWeightGrams)
}

export function calculateCakeServingEstimate(input: CakeServingEstimateInput, rules: CakeServingRules): CakeServingEstimate {
  if (!Number.isInteger(input.adults) || input.adults < 0) {
    throw new Error("Adult count must be a positive whole number or zero.")
  }

  if (!Number.isInteger(input.children) || input.children < 0) {
    throw new Error("Children count must be a positive whole number or zero.")
  }

  if (input.adults + input.children <= 0) {
    throw new Error("Enter at least one guest.")
  }

  const adultRequirement = input.adults * gramsForAdult(rules, input.portionPreference)
  const childRequirement = input.children * gramsForChild(rules, input.portionPreference)
  const rawRequirementGrams = adultRequirement + childRequirement
  const dessertMultiplier = input.dessertContext === "several-desserts" ? 1 - rules.dessertReductionPercentage / 100 : 1
  const withDessertAdjustment = rawRequirementGrams * dessertMultiplier
  const adjustedRequirementGrams = withDessertAdjustment * (1 + rules.bufferPercentage / 100)
  const recommendedWeightGrams = roundCakeWeight(adjustedRequirementGrams, rules)
  const portionSize = gramsForAdult(rules, input.portionPreference)
  const lowServings = Math.max(1, Math.floor((recommendedWeightGrams / portionSize) * 0.9))
  const highServings = Math.max(lowServings, Math.ceil((recommendedWeightGrams / portionSize) * 1.15))

  return {
    recommendedWeightGrams,
    servingRange: `${lowServings}-${highServings}`,
    rawRequirementGrams,
    adjustedRequirementGrams,
  }
}

