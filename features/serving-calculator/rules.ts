export type PortionPreference = "small" | "standard" | "generous"

export type DessertContext = "main-dessert" | "several-desserts"

export type CakeServingRules = {
  id: string
  branchId: string | null
  gramsPerAdultSmall: number
  gramsPerAdultStandard: number
  gramsPerAdultGenerous: number
  gramsPerChildSmall: number
  gramsPerChildStandard: number
  gramsPerChildGenerous: number
  dessertReductionPercentage: number
  bufferPercentage: number
  roundingIncrementGrams: number
  minimumWeightGrams: number
  maximumWeightGrams: number
  multiTierMinimumWeightGrams: number
}

export const defaultCakeServingRules: CakeServingRules = {
  id: "default",
  branchId: null,
  gramsPerAdultSmall: 75,
  gramsPerAdultStandard: 100,
  gramsPerAdultGenerous: 125,
  gramsPerChildSmall: 45,
  gramsPerChildStandard: 60,
  gramsPerChildGenerous: 80,
  dessertReductionPercentage: 20,
  bufferPercentage: 10,
  roundingIncrementGrams: 500,
  minimumWeightGrams: 500,
  maximumWeightGrams: 5000,
  multiTierMinimumWeightGrams: 2000,
}

export function getActiveCakeServingRules() {
  return defaultCakeServingRules
}

