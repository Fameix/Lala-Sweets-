import { describe, expect, it } from "vitest"

import {
  calculateCakeItemPrice,
  formatProductPrice,
  getCakeProducts,
  getMissingPriceProducts,
  getNeedsReviewProducts,
  getProducts,
  isCakeReadyToPublish,
  searchProducts,
  validateCakeMessage,
} from "@/lib/catalogue"

describe("catalogue rules", () => {
  it("does not expose zero or fake pricing for missing prices", () => {
    const product = getProducts()[0]

    expect(product.price_paise).toBeNull()
    expect(formatProductPrice(product)).toBe("Price will be updated soon")
  })

  it("keeps all extracted products non-orderable until review is complete", () => {
    expect(getProducts().every((product) => product.is_orderable === false)).toBe(true)
  })

  it("tracks missing prices and review-required products", () => {
    expect(getMissingPriceProducts().length).toBe(getProducts().length)
    expect(getNeedsReviewProducts().map((product) => product.slug)).toEqual(
      expect.arrayContaining(["sugar-cane", "tea-and-milk", "gobi-65"])
    )
  })

  it("searches product names and categories", () => {
    expect(searchProducts("milkshake").length).toBeGreaterThan(0)
    expect(searchProducts("gobi").map((product) => product.slug)).toContain("gobi-65")
  })

  it("adds proposed cakes without making them orderable", () => {
    const cakes = getCakeProducts()

    expect(cakes.length).toBe(36)
    expect(cakes.every((cake) => cake.price_paise === null)).toBe(true)
    expect(cakes.every((cake) => cake.is_orderable === false)).toBe(true)
    expect(cakes.every((cake) => isCakeReadyToPublish(cake) === false)).toBe(true)
  })

  it("searches cakes by flavour, subcategory, and aliases", () => {
    expect(searchProducts("Black Forest").map((product) => product.slug)).toContain("black-forest-cake")
    expect(searchProducts("Birthday Cake").some((product) => product.product_type === "cake")).toBe(true)
    expect(searchProducts("Eggless Cake").map((product) => product.slug)).toContain("eggless-cake")
  })

  it("calculates cake item prices in paise only when a variant price exists", () => {
    expect(calculateCakeItemPrice({ variantPricePaise: null })).toBeNull()
    expect(
      calculateCakeItemPrice({
        variantPricePaise: 100000,
        cakeTypeAdditionalPricePaise: 15000,
        addons: [{ pricePaise: 5000, quantity: 2 }],
        quantity: 2,
      })
    ).toBe(250000)
  })

  it("validates cake message length", () => {
    expect(validateCakeMessage("Happy Birthday", 40)).toBe(true)
    expect(validateCakeMessage("A".repeat(41), 40)).toBe(false)
  })
})
