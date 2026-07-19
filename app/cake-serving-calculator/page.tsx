import { CakeServingCalculator } from "@/features/serving-calculator/components/cake-serving-calculator"
import { StorefrontShell } from "@/components/layout/storefront-shell"

export default function CakeServingCalculatorPage() {
  return (
    <StorefrontShell>
      <main className="mx-auto max-w-6xl px-4 py-8">
        <div className="max-w-3xl">
          <h1 className="font-heading text-3xl font-medium">Cake Serving Calculator</h1>
          <p className="mt-3 leading-7 text-muted-foreground">
            Estimate cake weight from configured bakery serving rules. The final serving count may vary by slice size and serving style.
          </p>
        </div>
        <div className="mt-6">
          <CakeServingCalculator />
        </div>
      </main>
    </StorefrontShell>
  )
}

