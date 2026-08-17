import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function AdminCustomCakeDetailPage() {
  return (
    <main className="w-full px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="font-heading text-3xl font-medium">Custom Cake Detail</h1>
      <p className="mt-3 leading-7 text-muted-foreground">
        Quote details will include price, advance, balance, inclusions, exclusions, validity, lead time, and terms.
      </p>
      <Alert className="mt-6">
        <AlertTitle>AI-generated requirement summary - review before production.</AlertTitle>
        <AlertDescription>
          Staff must verify original customer inputs, uploaded references, missing information, warnings, quote history, and status timeline before accepting production.
        </AlertDescription>
      </Alert>
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Review sections</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-2 text-sm text-muted-foreground">
          <p>Original customer inputs</p>
          <p>Structured requirement brief</p>
          <p>Uploaded reference images</p>
          <p>Missing information and warnings</p>
          <p>Staff notes, quote history, and status timeline</p>
        </CardContent>
      </Card>
    </main>
  )
}
