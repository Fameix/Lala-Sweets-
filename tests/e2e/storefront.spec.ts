import { expect, test } from "@playwright/test"

test("menu page shows safe missing-price state", async ({ page }) => {
  await page.goto("/menu")

  await expect(page.getByRole("heading", { name: "Menu" })).toBeVisible()
  await expect(page.getByText("Price will be updated soon").first()).toBeVisible()
})
