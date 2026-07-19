"use client"

import Link from "next/link"
import { useMemo, useState } from "react"
import { Calculator, ExternalLink } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { buttonVariants } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { calculateCakeServing, type CakeServingResult } from "@/features/serving-calculator/calculate"
import { getActiveCakeServingRules } from "@/features/serving-calculator/rules"
import { cn } from "@/lib/utils"
import type { Product } from "@/types/catalogue"

type FormState = {
  adults: string
  children: string
  portionPreference: "small" | "standard" | "generous"
  dessertContext: "main-dessert" | "several-desserts"
  occasion: string
  cakeType: string
  tierPreference: "single-tier" | "multi-tier"
  budget: string
  requiredDate: string
  preferredBranch: string
}

const initialState: FormState = {
  adults: "10",
  children: "0",
  portionPreference: "standard",
  dessertContext: "main-dessert",
  occasion: "",
  cakeType: "",
  tierPreference: "single-tier",
  budget: "",
  requiredDate: "",
  preferredBranch: "",
}

export function CakeServingCalculator({ compact = false }: { compact?: boolean }) {
  const [form, setForm] = useState<FormState>(initialState)
  const [result, setResult] = useState<CakeServingResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const rules = useMemo(() => getActiveCakeServingRules(), [])

  const update = (key: keyof FormState, value: string) => setForm((current) => ({ ...current, [key]: value }))

  const calculate = () => {
    try {
      const next = calculateCakeServing(
        {
          adults: Number(form.adults),
          children: Number(form.children),
          portionPreference: form.portionPreference,
          dessertContext: form.dessertContext,
          occasion: form.occasion,
          cakeType: form.cakeType,
          tierPreference: form.tierPreference,
          budgetPaise: form.budget ? Number(form.budget) * 100 : null,
          requiredDate: form.requiredDate,
          preferredBranch: form.preferredBranch,
        },
        rules
      )
      setResult(next)
      setError(null)
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Unable to calculate serving estimate.")
      setResult(null)
    }
  }

  return (
    <div className="grid gap-4 lg:grid-cols-[0.95fr_1.05fr]">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="size-4" />
            How Much Cake Do I Need?
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Adults">
              <Input type="number" min={0} value={form.adults} onChange={(event) => update("adults", event.target.value)} />
            </Field>
            <Field label="Children">
              <Input type="number" min={0} value={form.children} onChange={(event) => update("children", event.target.value)} />
            </Field>
            <Field label="Portion preference">
              <select className="h-9 rounded-md border border-input bg-background px-3 text-sm" value={form.portionPreference} onChange={(event) => update("portionPreference", event.target.value)}>
                <option value="small">Small portions</option>
                <option value="standard">Standard portions</option>
                <option value="generous">Generous portions</option>
              </select>
            </Field>
            <Field label="Dessert context">
              <select className="h-9 rounded-md border border-input bg-background px-3 text-sm" value={form.dessertContext} onChange={(event) => update("dessertContext", event.target.value)}>
                <option value="main-dessert">Cake is the main dessert</option>
                <option value="several-desserts">Cake is one of several desserts</option>
              </select>
            </Field>
            {!compact ? (
              <>
                <Field label="Occasion">
                  <Input value={form.occasion} onChange={(event) => update("occasion", event.target.value)} placeholder="Birthday, anniversary..." />
                </Field>
                <Field label="Cake type">
                  <Input value={form.cakeType} onChange={(event) => update("cakeType", event.target.value)} placeholder="Chocolate, eggless..." />
                </Field>
                <Field label="Tier preference">
                  <select className="h-9 rounded-md border border-input bg-background px-3 text-sm" value={form.tierPreference} onChange={(event) => update("tierPreference", event.target.value)}>
                    <option value="single-tier">Single-tier</option>
                    <option value="multi-tier">Multi-tier</option>
                  </select>
                </Field>
                <Field label="Budget">
                  <Input type="number" min={0} value={form.budget} onChange={(event) => update("budget", event.target.value)} placeholder="Optional" />
                </Field>
                <Field label="Required date">
                  <Input type="date" value={form.requiredDate} onChange={(event) => update("requiredDate", event.target.value)} />
                </Field>
                <Field label="Preferred branch">
                  <Input value={form.preferredBranch} onChange={(event) => update("preferredBranch", event.target.value)} placeholder="Optional" />
                </Field>
              </>
            ) : null}
          </div>
          <Button type="button" onClick={calculate}>Calculate Cake Size</Button>
          {error ? (
            <Alert variant="destructive">
              <AlertTitle>Check the guest count</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          ) : null}
        </CardContent>
      </Card>
      <CakeServingResultView result={result} />
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <Label className="grid gap-2 text-sm font-medium">
      {label}
      {children}
    </Label>
  )
}

export function CakeServingResultView({ result }: { result: CakeServingResult | null }) {
  if (!result) {
    return (
      <Card>
        <CardContent className="grid min-h-64 place-items-center text-center">
          <div>
            <p className="font-heading text-xl font-medium">Your recommendation will appear here</p>
            <p className="mt-2 text-sm text-muted-foreground">The calculation uses configured bakery serving rules, not AI guesses.</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recommended size: {(result.recommendedWeightGrams / 1000).toLocaleString("en-IN")} kg</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-4">
        <div className="flex flex-wrap gap-2">
          <Badge variant="secondary">Approximately {result.servingRange} portions</Badge>
          <Badge variant="outline">{Math.round(result.adjustedRequirementGrams)} g adjusted estimate</Badge>
        </div>
        <p className="text-sm leading-6 text-muted-foreground">{result.explanation}</p>
        <div className="grid gap-2">
          {result.warnings.map((warning) => (
            <Alert key={warning}>
              <AlertDescription>{warning}</AlertDescription>
            </Alert>
          ))}
        </div>
        <div className="grid gap-3">
          <h3 className="font-heading text-lg font-medium">Suggested cake products</h3>
          {result.suggestedProducts.map((product) => (
            <CakeRecommendationCard key={product.id} product={product} />
          ))}
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Link href="/custom-cake" className={cn(buttonVariants({ variant: "outline" }))}>
            Start Custom Cake Request
          </Link>
          <Link href="/cakes" className={cn(buttonVariants())}>
            View Cakes
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}

function CakeRecommendationCard({ product }: { product: Product }) {
  return (
    <div className="grid gap-3 rounded-lg border border-border p-3 sm:grid-cols-[1fr_auto] sm:items-center">
      <div>
        <p className="font-medium">{product.display_name}</p>
        <p className="mt-1 text-xs text-muted-foreground">{product.short_description}</p>
      </div>
      <Link href={`/product/${product.slug}`} className="inline-flex items-center gap-1 text-sm font-medium underline-offset-4 hover:underline">
        View Product
        <ExternalLink className="size-3" />
      </Link>
    </div>
  )
}
