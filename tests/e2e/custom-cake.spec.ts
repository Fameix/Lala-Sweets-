import { expect, test } from "@playwright/test"

test("custom cake request uses simplified three-step flow", async ({ page }) => {
  await page.goto("/custom-cake")

  await expect(page.getByRole("heading", { name: "Create Your Custom Cake" })).toBeVisible()
  await expect(page.getByText("Step 1 of 3")).toBeVisible()
  await expect(page.getByRole("button", { name: /Ask Master AI/ })).toHaveCount(0)
  await expect(page.getByText("Review Summary")).toHaveCount(0)

  await page.getByRole("button", { name: /Continue to Cake Preferences/ }).click()
  await expect(page.getByText("Choose an occasion.")).toBeVisible()

  await page.getByLabel("Occasion").selectOption("Birthday")
  await page.getByLabel("Required date").fill("2026-08-10")
  await page.getByLabel("Required time").selectOption("6:00 PM")
  await page.getByLabel("Number of guests").fill("20")
  await expect(page.getByText("Recommended cake size")).toBeVisible()
  await page.getByRole("button", { name: "Use Recommended Size" }).click()
  await page.getByRole("button", { name: /Continue to Cake Preferences/ }).click()

  await expect(page.getByText("Step 2 of 3")).toBeVisible()
  await page.getByLabel("Flavour").selectOption("Chocolate")
  await page.getByRole("radio", { name: "Eggless" }).check()
  await expect(page.getByLabel("Cake weight")).toHaveValue("2.5 kg")
  await page.getByLabel("Shape").selectOption("Round")
  await page.getByRole("button", { name: /Continue to Personalize and Submit/ }).click()

  await expect(page.getByText("Step 3 of 3")).toBeVisible()
  await expect(page.getByText("Advanced customization - optional")).toBeVisible()
  await expect(page.getByLabel("Main colours")).toBeHidden()
  await page.getByLabel("Theme or design description").fill("Blue and gold superhero birthday theme")
  await page.getByLabel("Cake message or name").fill("Happy Birthday Arjun")
  await page.getByLabel("Customer name").fill("Arjun Kumar")
  await page.getByLabel("Mobile number").fill("9876543210")
  await page.getByRole("button", { name: /Generate Requirement Summary/ }).click()

  await expect(page.getByText("Review Summary")).toBeVisible()
  await expect(page.getByText("Confirm and Submit Request")).toBeVisible()
})
