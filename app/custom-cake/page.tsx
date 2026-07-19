import { StorefrontShell } from "@/components/layout/storefront-shell"
import { Badge } from "@/components/ui/badge"
import { CustomCakeSummaryGenerator } from "@/features/custom-cake-summary/components/custom-cake-summary-generator"

export default function CustomCakePage() {
  return (
    <StorefrontShell>
      <main className="mx-auto max-w-6xl px-4 py-8">
        <div className="max-w-3xl">
          <Badge variant="secondary">Takes about 2 minutes</Badge>
          <h1 className="mt-3 font-heading text-3xl font-medium">Create Your Custom Cake</h1>
          <p className="mt-3 leading-7 text-muted-foreground">
            Tell us about your celebration and cake preferences. We will prepare a clear requirement summary for the bakery.
          </p>
        </div>
        <div className="mt-6">
          <CustomCakeSummaryGenerator />
        </div>
      </main>
    </StorefrontShell>
  )
}
