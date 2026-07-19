import { AlertCircle, CakeSlice, IndianRupee, ListChecks } from "lucide-react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { getMissingPriceProducts, getNeedsReviewProducts, getProducts } from "@/lib/catalogue"

export default function AdminDashboardPage() {
  const products = getProducts()
  const missingPrices = getMissingPriceProducts()
  const reviewItems = getNeedsReviewProducts()

  return (
    <main className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="font-heading text-3xl font-medium">Admin Dashboard</h1>
      <p className="mt-2 text-sm text-muted-foreground">Operational metrics will show only real order and payment data after backend setup.</p>
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { title: "Products", value: products.length, icon: CakeSlice },
          { title: "Missing prices", value: missingPrices.length, icon: IndianRupee },
          { title: "Needs review", value: reviewItems.length, icon: AlertCircle },
          { title: "Orderable", value: products.filter((item) => item.is_orderable).length, icon: ListChecks },
        ].map((item) => {
          const Icon = item.icon

          return (
            <Card key={item.title}>
              <CardHeader>
                <CardTitle className="flex items-center justify-between gap-3">
                  {item.title}
                  <Icon className="size-4 text-muted-foreground" />
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-medium">{item.value}</p>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </main>
  )
}
