import { AdminPlaceholder } from "@/components/layout/admin-placeholder"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { getActiveCakeServingRules } from "@/features/serving-calculator/rules"

export default function AdminCakeServingRulesPage() {
  const rules = getActiveCakeServingRules()

  return (
    <main className="mx-auto max-w-4xl px-4 py-8">
      <AdminPlaceholder title="Cake Serving Rules" description="Admin-editable serving rules are ready for Supabase persistence. Current local fallback rules are shown below." />
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Active fallback rules</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-2 text-sm">
          {Object.entries(rules).map(([key, value]) => (
            <div key={key} className="flex justify-between gap-4 border-b border-border py-2 last:border-b-0">
              <span className="text-muted-foreground">{key}</span>
              <span>{String(value)}</span>
            </div>
          ))}
        </CardContent>
      </Card>
    </main>
  )
}

