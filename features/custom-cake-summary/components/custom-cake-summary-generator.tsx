"use client"

import Image from "next/image"
import Link from "next/link"
import { useMemo, useState } from "react"
import { Bot, CalendarDays, ChevronDown, ImagePlus, Save, Trash2, Wand2 } from "lucide-react"
import type { z } from "zod"

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Button, buttonVariants } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import type { structuredCakeSummarySchema } from "@/features/ai/validations/schemas"
import { calculateCakeServingEstimate } from "@/features/serving-calculator/estimate"
import { defaultCakeServingRules } from "@/features/serving-calculator/rules"
import { cn } from "@/lib/utils"

type Summary = z.infer<typeof structuredCakeSummarySchema>
type LocalRecommendation = {
  recommendedWeightGrams: number
  servingRange: string
}

type FormState = {
  occasion: string
  requiredDate: string
  requiredTime: string
  guests: string
  flavour: string
  eggPreference: string
  selectedWeight: string
  shape: string
  theme: string
  cakeMessage: string
  budget: string
  customerName: string
  mobileNumber: string
  email: string
  fulfilmentType: "pickup" | "delivery"
  deliveryAddress: string
  tierCount: string
  colours: string
  customShape: string
  decorationDetails: string
  specialInstructions: string
}

const initialState: FormState = {
  occasion: "",
  requiredDate: "",
  requiredTime: "",
  guests: "",
  flavour: "",
  eggPreference: "",
  selectedWeight: "",
  shape: "",
  theme: "",
  cakeMessage: "",
  budget: "",
  customerName: "",
  mobileNumber: "",
  email: "",
  fulfilmentType: "pickup",
  deliveryAddress: "",
  tierCount: "1",
  colours: "",
  customShape: "",
  decorationDetails: "",
  specialInstructions: "",
}

const steps = ["Celebration", "Cake Preferences", "Personalize and Submit"]
const occasions = ["Birthday", "Anniversary", "Wedding", "Baby Celebration", "Congratulations", "Corporate Event", "Other"]
const timeSlots = ["10:00 AM", "12:00 PM", "2:00 PM", "4:00 PM", "6:00 PM", "8:00 PM"]
const flavours = ["Vanilla", "Chocolate", "Black Forest", "Butterscotch", "Strawberry", "Pineapple", "Red Velvet", "Custom"]
const weights = ["500 g", "1 kg", "1.5 kg", "2 kg", "Custom"]
const shapes = ["Round", "Square", "Heart", "Rectangle", "Custom"]
const budgets = ["Not sure yet", "Under ₹1,500", "₹1,500 - ₹3,000", "₹3,000 - ₹5,000", "Above ₹5,000"]

export function CustomCakeSummaryGenerator() {
  const [step, setStep] = useState(0)
  const [form, setForm] = useState<FormState>(initialState)
  const [summary, setSummary] = useState<Summary | null>(null)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [requestError, setRequestError] = useState<string | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [imageName, setImageName] = useState<string | null>(null)

  const recommendation = useMemo(() => {
    const guests = Number(form.guests)
    if (!Number.isInteger(guests) || guests <= 0) return null

    return calculateCakeServingEstimate(
      {
        adults: guests,
        children: 0,
        portionPreference: "standard",
        dessertContext: "main-dessert",
      },
      defaultCakeServingRules
    )
  }, [form.guests])

  const recommendedWeightLabel = recommendation ? `${recommendation.recommendedWeightGrams / 1000} kg` : ""
  const summaryGrid = summary ? "mx-auto grid max-w-6xl gap-5 px-4 lg:grid-cols-[minmax(0,0.62fr)_minmax(18rem,0.38fr)]" : "mx-auto max-w-[52rem] px-4"

  const update = (key: keyof FormState, value: string) => {
    setForm((current) => ({ ...current, [key]: value }))
    setErrors((current) => {
      const next = { ...current }
      delete next[key]
      return next
    })
  }

  const validateStep = (targetStep = step) => {
    const nextErrors: Record<string, string> = {}

    if (targetStep === 0) {
      if (!form.occasion) nextErrors.occasion = "Choose an occasion."
      if (!form.requiredDate) nextErrors.requiredDate = "Choose a required date."
      if (!form.requiredTime) nextErrors.requiredTime = "Choose a required time."
      if (!Number.isInteger(Number(form.guests)) || Number(form.guests) <= 0) nextErrors.guests = "Enter a guest count greater than zero."
    }

    if (targetStep === 1) {
      if (!form.flavour) nextErrors.flavour = "Choose a flavour."
      if (!form.eggPreference) nextErrors.eggPreference = "Choose With Egg or Eggless."
      if (!form.selectedWeight) nextErrors.selectedWeight = "Choose a cake weight."
      if (!form.shape) nextErrors.shape = "Choose a shape."
    }

    if (targetStep === 2) {
      if (!form.theme.trim() && !imagePreview) nextErrors.theme = "Add a theme description or reference image."
      if (!form.customerName.trim()) nextErrors.customerName = "Enter customer name."
      if (!/^[6-9]\d{9}$/.test(form.mobileNumber.trim())) nextErrors.mobileNumber = "Enter a valid 10-digit Indian mobile number."
      if (form.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) nextErrors.email = "Enter a valid email or leave it blank."
    }

    setErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  const continueStep = () => {
    if (validateStep()) {
      setStep((current) => Math.min(current + 1, steps.length - 1))
    }
  }

  const generate = async () => {
    if (!validateStep(2)) return

    setRequestError(null)
    const response = await fetch("/api/ai/custom-cake-summary", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        customerName: form.customerName,
        mobileNumber: form.mobileNumber,
        email: form.email || undefined,
        occasion: form.occasion,
        requiredDate: form.requiredDate,
        requiredTime: form.requiredTime,
        guests: Number(form.guests),
        recommendedWeight: recommendedWeightLabel || undefined,
        selectedWeight: form.selectedWeight,
        flavour: form.flavour,
        eggPreference: form.eggPreference,
        shape: form.shape === "Custom" ? form.customShape || "Custom" : form.shape,
        tierCount: Number(form.tierCount || 1),
        theme: form.theme,
        colours: form.colours,
        displayName: form.cakeMessage,
        cakeMessage: form.cakeMessage,
        budget: form.budget,
        fulfilmentType: form.fulfilmentType,
        deliveryAddress: form.deliveryAddress || undefined,
        referenceImages: imageName ? [imageName] : [],
        specialInstructions: [form.decorationDetails, form.specialInstructions].filter(Boolean).join("\n"),
      }),
    })

    if (!response.ok) {
      setRequestError("Summary generation failed. You can continue entering details manually.")
      return
    }

    setSummary((await response.json()) as Summary)
  }

  const handleImage = (file: File | null) => {
    if (!file) return
    if (!file.type.startsWith("image/") || file.size > 5 * 1024 * 1024) {
      setErrors((current) => ({ ...current, referenceImage: "Upload an image under 5 MB." }))
      return
    }

    setImagePreview(URL.createObjectURL(file))
    setImageName(file.name)
    setErrors((current) => {
      const next = { ...current }
      delete next.referenceImage
      delete next.theme
      return next
    })
  }

  return (
    <div className={summaryGrid}>
      <Card className="min-w-0">
        <CardHeader className="gap-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <Badge variant="secondary">Step {step + 1} of 3</Badge>
              <CardTitle className="mt-3">{steps[step]}</CardTitle>
            </div>
            <Link href="/ai-assistant?context=custom-cake" className={cn(buttonVariants({ variant: "outline", size: "sm" }))}>
              <Bot className="size-4" />
              Need help? Ask AI to guide me
            </Link>
          </div>
          <div aria-label={`Step ${step + 1} of 3`} className="h-2 overflow-hidden rounded-full bg-muted">
            <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${((step + 1) / steps.length) * 100}%` }} />
          </div>
        </CardHeader>
        <CardContent className="grid gap-5 pb-24 md:pb-6">
          {step === 0 ? (
            <CelebrationStep form={form} errors={errors} update={update} recommendation={recommendation} recommendedWeightLabel={recommendedWeightLabel} />
          ) : null}
          {step === 1 ? (
            <CakePreferencesStep form={form} errors={errors} update={update} recommendedWeightLabel={recommendedWeightLabel} />
          ) : null}
          {step === 2 ? (
            <PersonalizeStep
              form={form}
              errors={errors}
              update={update}
              imagePreview={imagePreview}
              imageName={imageName}
              handleImage={handleImage}
              removeImage={() => {
                setImagePreview(null)
                setImageName(null)
              }}
            />
          ) : null}
          {requestError ? (
            <Alert variant="destructive">
              <AlertTitle>Fallback available</AlertTitle>
              <AlertDescription>{requestError}</AlertDescription>
            </Alert>
          ) : null}
          <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background p-3 md:static md:border-t-0 md:bg-transparent md:p-0">
            <div className="mx-auto flex max-w-[52rem] gap-2 md:mx-0">
              <button
                type="button"
                className={cn(buttonVariants({ variant: "outline" }), "flex-1")}
                disabled={step === 0}
                onClick={() => setStep((current) => Math.max(0, current - 1))}
              >
                Back
              </button>
              {step < 2 ? (
                <button type="button" className={cn(buttonVariants(), "flex-1")} onClick={continueStep}>
                  Continue to {steps[step + 1]}
                </button>
              ) : (
                <button type="button" className={cn(buttonVariants(), "flex-1")} onClick={generate}>
                  <Wand2 className="size-4" />
                  Generate Requirement Summary
                </button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
      {summary ? <CustomCakeSummaryReview summary={summary} onEdit={() => setStep(0)} onRegenerate={generate} /> : null}
    </div>
  )
}

function CelebrationStep({
  form,
  errors,
  update,
  recommendation,
  recommendedWeightLabel,
}: {
  form: FormState
  errors: Record<string, string>
  update: (key: keyof FormState, value: string) => void
  recommendation: LocalRecommendation | null
  recommendedWeightLabel: string
}) {
  return (
    <div className="grid gap-4">
      <Field label="Occasion" error={errors.occasion}>
        <select className="h-11 rounded-md border border-input bg-background px-3 text-sm" value={form.occasion} onChange={(event) => update("occasion", event.target.value)}>
          <option value="">Select occasion</option>
          {occasions.map((occasion) => (
            <option key={occasion} value={occasion}>{occasion}</option>
          ))}
        </select>
      </Field>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Required date" error={errors.requiredDate}>
          <div className="relative">
            <CalendarDays className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input className="h-11 pl-9" type="date" value={form.requiredDate} onChange={(event) => update("requiredDate", event.target.value)} />
          </div>
        </Field>
        <Field label="Required time" error={errors.requiredTime}>
          <select className="h-11 rounded-md border border-input bg-background px-3 text-sm" value={form.requiredTime} onChange={(event) => update("requiredTime", event.target.value)}>
            <option value="">Select time</option>
            {timeSlots.map((slot) => (
              <option key={slot} value={slot}>{slot}</option>
            ))}
          </select>
        </Field>
      </div>
      <Field label="Number of guests" error={errors.guests}>
        <Input className="h-11" type="number" min={1} value={form.guests} onChange={(event) => update("guests", event.target.value)} />
      </Field>
      {recommendation ? (
        <div className="rounded-lg border border-border bg-muted/40 p-4">
          <p className="text-sm text-muted-foreground">Recommended cake size</p>
          <p className="mt-1 font-heading text-2xl font-medium">{recommendedWeightLabel}</p>
          <p className="mt-2 text-sm text-muted-foreground">
            Suitable for approximately {recommendation.servingRange} standard portions.
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <Button type="button" size="sm" onClick={() => update("selectedWeight", recommendedWeightLabel)}>
              Use Recommended Size
            </Button>
            <Button type="button" size="sm" variant="outline" onClick={() => update("selectedWeight", "")}>
              Choose Another Size
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  )
}

function CakePreferencesStep({
  form,
  errors,
  update,
  recommendedWeightLabel,
}: {
  form: FormState
  errors: Record<string, string>
  update: (key: keyof FormState, value: string) => void
  recommendedWeightLabel: string
}) {
  const availableWeights = Array.from(new Set([recommendedWeightLabel, ...weights].filter(Boolean)))

  return (
    <div className="grid gap-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Flavour" error={errors.flavour}>
          <select className="h-11 rounded-md border border-input bg-background px-3 text-sm" value={form.flavour} onChange={(event) => update("flavour", event.target.value)}>
            <option value="">Select flavour</option>
            {flavours.map((flavour) => (
              <option key={flavour} value={flavour}>{flavour}</option>
            ))}
          </select>
        </Field>
        <Field label="Egg preference" error={errors.eggPreference}>
          <div className="grid grid-cols-2 gap-2" role="radiogroup" aria-label="Egg preference">
            {["With Egg", "Eggless"].map((option) => (
              <label key={option} className="flex min-h-11 cursor-pointer items-center gap-2 rounded-md border border-input px-3 text-sm has-[:checked]:border-primary has-[:checked]:bg-muted">
                <input type="radio" name="eggPreference" value={option} checked={form.eggPreference === option} onChange={(event) => update("eggPreference", event.target.value)} />
                {option}
              </label>
            ))}
          </div>
        </Field>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Cake weight" error={errors.selectedWeight}>
          <select className="h-11 rounded-md border border-input bg-background px-3 text-sm" value={form.selectedWeight} onChange={(event) => update("selectedWeight", event.target.value)}>
            <option value="">Select weight</option>
            {availableWeights.map((weight) => (
              <option key={weight} value={weight}>{weight}</option>
            ))}
          </select>
        </Field>
        <Field label="Shape" error={errors.shape}>
          <select className="h-11 rounded-md border border-input bg-background px-3 text-sm" value={form.shape} onChange={(event) => update("shape", event.target.value)}>
            <option value="">Select shape</option>
            {shapes.map((shape) => (
              <option key={shape} value={shape}>{shape}</option>
            ))}
          </select>
        </Field>
      </div>
    </div>
  )
}

function PersonalizeStep({
  form,
  errors,
  update,
  imagePreview,
  imageName,
  handleImage,
  removeImage,
}: {
  form: FormState
  errors: Record<string, string>
  update: (key: keyof FormState, value: string) => void
  imagePreview: string | null
  imageName: string | null
  handleImage: (file: File | null) => void
  removeImage: () => void
}) {
  return (
    <div className="grid gap-4">
      <Field label="Theme or design description" error={errors.theme}>
        <Textarea value={form.theme} onChange={(event) => update("theme", event.target.value)} placeholder="Blue and gold superhero birthday theme" />
      </Field>
      <div className="grid gap-2">
        <p className="text-sm font-medium">Reference image</p>
        <label className="grid min-h-36 cursor-pointer place-items-center rounded-lg border border-dashed border-border bg-muted/30 p-4 text-center transition hover:bg-muted/50">
          <input className="sr-only" type="file" accept="image/png,image/jpeg,image/webp" onChange={(event) => handleImage(event.target.files?.[0] ?? null)} />
          {imagePreview ? (
            <span className="grid gap-3">
              <span className="relative mx-auto block aspect-[4/3] w-40 overflow-hidden rounded-lg bg-muted">
                <Image src={imagePreview} alt={imageName ?? "Reference preview"} fill sizes="10rem" className="object-cover" unoptimized />
              </span>
              <span className="text-sm text-muted-foreground">{imageName}</span>
            </span>
          ) : (
            <span className="grid gap-2">
              <ImagePlus className="mx-auto size-6 text-muted-foreground" />
              <span className="text-sm font-medium">Drag and drop or browse</span>
              <span className="text-xs text-muted-foreground">PNG, JPG, or WebP under 5 MB</span>
            </span>
          )}
        </label>
        {errors.referenceImage ? <p className="text-sm text-destructive">{errors.referenceImage}</p> : null}
        {imagePreview ? (
          <Button type="button" size="sm" variant="outline" className="w-fit" onClick={removeImage}>
            <Trash2 className="size-4" />
            Remove image
          </Button>
        ) : null}
      </div>
      <Field label="Cake message or name">
        <Input className="h-11" value={form.cakeMessage} onChange={(event) => update("cakeMessage", event.target.value)} placeholder="Happy Birthday Arjun" />
      </Field>
      <Field label="Budget">
        <select className="h-11 rounded-md border border-input bg-background px-3 text-sm" value={form.budget} onChange={(event) => update("budget", event.target.value)}>
          <option value="">Select budget</option>
          {budgets.map((budget) => (
            <option key={budget} value={budget}>{budget}</option>
          ))}
        </select>
      </Field>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Customer name" error={errors.customerName}>
          <Input className="h-11" value={form.customerName} onChange={(event) => update("customerName", event.target.value)} />
        </Field>
        <Field label="Mobile number" error={errors.mobileNumber}>
          <Input className="h-11" inputMode="numeric" value={form.mobileNumber} onChange={(event) => update("mobileNumber", event.target.value)} placeholder="9876543210" />
        </Field>
      </div>
      <Field label="Email - optional" error={errors.email}>
        <Input className="h-11" type="email" value={form.email} onChange={(event) => update("email", event.target.value)} />
      </Field>
      <details className="group rounded-lg border border-border p-4">
        <summary className="flex cursor-pointer list-none items-center justify-between gap-3 text-sm font-medium">
          Advanced customization - optional
          <ChevronDown className="size-4 transition group-open:rotate-180" />
        </summary>
        <div className="mt-4 grid gap-4">
          <Field label="Number of tiers">
            <Input className="h-11" type="number" min={1} value={form.tierCount} onChange={(event) => update("tierCount", event.target.value)} />
          </Field>
          <Field label="Main colours">
            <Input className="h-11" value={form.colours} onChange={(event) => update("colours", event.target.value)} placeholder="Blue, gold" />
          </Field>
          <Field label="Custom shape">
            <Input className="h-11" value={form.customShape} onChange={(event) => update("customShape", event.target.value)} />
          </Field>
          <Field label="Decoration details">
            <Textarea value={form.decorationDetails} onChange={(event) => update("decorationDetails", event.target.value)} />
          </Field>
          <Field label="Additional instructions">
            <Textarea value={form.specialInstructions} onChange={(event) => update("specialInstructions", event.target.value)} />
          </Field>
        </div>
      </details>
      <p className="text-sm text-muted-foreground">தேவைகளின் சுருக்கத்தை உருவாக்கு</p>
    </div>
  )
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <Label className="grid items-start gap-2 text-sm font-medium">
      {label}
      {children}
      {error ? <span className="text-sm font-normal text-destructive" role="alert">{error}</span> : null}
    </Label>
  )
}

function CustomCakeSummaryReview({
  summary,
  onEdit,
  onRegenerate,
}: {
  summary: Summary
  onEdit: () => void
  onRegenerate: () => void
}) {
  return (
    <Card className="h-fit min-w-0 lg:sticky lg:top-24" aria-live="polite">
      <CardHeader>
        <CardTitle>Review Summary</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-4">
        <Alert>
          <AlertTitle>AI-generated requirement summary - review before production.</AlertTitle>
          <AlertDescription>No request is submitted until you confirm.</AlertDescription>
        </Alert>
        <Textarea value={summary.customerSummary} readOnly />
        <div className="grid gap-2 rounded-lg border border-border p-3 text-sm">
          {[
            ["Occasion", summary.productionBrief.occasion],
            ["Date and time", summary.productionBrief.required_at],
            ["Guest count", summary.productionBrief.guest_count],
            ["Recommended weight", summary.productionBrief.recommended_weight],
            ["Selected weight", summary.productionBrief.requested_weight],
            ["Flavour", summary.productionBrief.flavour],
            ["Egg preference", summary.productionBrief.egg_preference],
            ["Shape", summary.productionBrief.shape],
            ["Theme", summary.productionBrief.theme],
            ["Cake message", summary.productionBrief.cake_message],
            ["Budget", summary.productionBrief.budget],
            ["Reference images", summary.productionBrief.reference_image_ids.join(", ") || null],
          ].map(([label, value]) => (
            <div key={String(label)} className="flex justify-between gap-4">
              <span className="text-muted-foreground">{label}</span>
              <span className="text-right">{value ?? "Not provided"}</span>
            </div>
          ))}
        </div>
        {summary.missingFields.length > 0 ? (
          <Alert>
            <AlertTitle>Missing information</AlertTitle>
            <AlertDescription>
              <ul className="list-inside list-disc">
                {summary.missingFields.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </AlertDescription>
          </Alert>
        ) : null}
        {summary.warnings.map((warning) => (
          <Alert key={warning}>
            <AlertDescription>{warning}</AlertDescription>
          </Alert>
        ))}
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-1">
          <Button type="button" variant="outline" onClick={onEdit}>Edit Details</Button>
          <Button type="button" variant="outline" onClick={onRegenerate}>Regenerate</Button>
          <Button type="button" variant="outline">
            <Save className="size-4" />
            Save as Draft
          </Button>
          <Button type="button">Confirm and Submit Request</Button>
        </div>
      </CardContent>
    </Card>
  )
}
