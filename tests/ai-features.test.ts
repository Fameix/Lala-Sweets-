import { describe, expect, it } from "vitest"

import { calculateCakeServing, roundCakeWeight } from "@/features/serving-calculator/calculate"
import { defaultCakeServingRules } from "@/features/serving-calculator/rules"
import { createDeterministicCustomCakeSummary } from "@/features/custom-cake-summary/summary"

describe("cake serving calculator", () => {
  it("calculates adult and child portions with buffer and rounding", () => {
    const result = calculateCakeServing(
      {
        adults: 15,
        children: 6,
        portionPreference: "standard",
        dessertContext: "main-dessert",
      },
      defaultCakeServingRules
    )

    expect(result.recommendedWeightGrams).toBe(2500)
    expect(result.explanation).toContain("15 adults")
  })

  it("applies dessert reduction for several desserts", () => {
    const mainDessert = calculateCakeServing({ adults: 10, children: 0, portionPreference: "standard", dessertContext: "main-dessert" }, defaultCakeServingRules)
    const severalDesserts = calculateCakeServing({ adults: 10, children: 0, portionPreference: "standard", dessertContext: "several-desserts" }, defaultCakeServingRules)

    expect(severalDesserts.adjustedRequirementGrams).toBeLessThan(mainDessert.adjustedRequirementGrams)
  })

  it("rounds to configured increments within limits", () => {
    expect(roundCakeWeight(1260, defaultCakeServingRules)).toBe(1500)
    expect(roundCakeWeight(100, defaultCakeServingRules)).toBe(500)
  })
})

describe("custom cake summary", () => {
  it("identifies missing fields and creates a structured brief", () => {
    const summary = createDeterministicCustomCakeSummary({
      occasion: "Birthday",
      guests: 20,
      flavour: "Chocolate",
      fulfilmentType: "delivery",
    })

    expect(summary.customerSummary).toContain("20 guest")
    expect(summary.productionBrief.flavour).toBe("Chocolate")
    expect(summary.missingFields).toContain("Delivery address incomplete")
    expect(summary.warnings).toContain("AI-generated requirement summary - review before production.")
  })
})

