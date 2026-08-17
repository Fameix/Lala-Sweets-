"use client"

import { LocateFixed, Truck } from "lucide-react"

import { StepShell } from "@/components/checkout/step-shell"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { getDeliveryChargePaise, getDeliveryTypeForPincode } from "@/lib/delivery-config"
import { cn } from "@/lib/utils"

export type AddressFormValues = {
  name: string
  mobile: string
  line1: string
  city: string
  pincode: string
}

export type AddressFormErrors = Partial<Record<keyof AddressFormValues, string>>

function formatPrice(paise: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(paise / 100)
}

export function AddressFormStep({
  values,
  errors,
  onChange,
  onUseLiveLocation,
  onSubmit,
  isSaving,
  onBack,
}: {
  values: AddressFormValues
  errors: AddressFormErrors
  onChange: (field: keyof AddressFormValues, value: string) => void
  onUseLiveLocation: () => void
  onSubmit: () => void
  isSaving: boolean
  onBack: () => void
}) {
  const deliveryType = getDeliveryTypeForPincode(values.pincode)
  const deliveryChargePaise = getDeliveryChargePaise(deliveryType)

  return (
    <StepShell title="Add New Address" description="Tell us where to deliver your order." onBack={onBack}>
      <button
        type="button"
        onClick={onUseLiveLocation}
        className="flex items-center gap-3 rounded-2xl border border-dashed border-primary/30 bg-primary/5 p-3 text-left transition hover:bg-primary/10"
      >
        <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
          <LocateFixed className="size-4" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium">Use My Live Location</p>
          <p className="text-xs text-muted-foreground">Auto-fill address, city and pincode</p>
        </div>
      </button>

      <div className="grid gap-1.5">
        <Label htmlFor="address-name">Full Name</Label>
        <Input
          id="address-name"
          placeholder="Enter your name"
          value={values.name}
          onChange={(event) => onChange("name", event.target.value)}
          aria-invalid={Boolean(errors.name)}
          className="h-11"
        />
        {errors.name ? <p className="text-xs font-medium text-destructive">{errors.name}</p> : null}
      </div>

      <div className="grid gap-1.5">
        <Label htmlFor="address-mobile">Mobile Number</Label>
        <Input
          id="address-mobile"
          inputMode="numeric"
          maxLength={10}
          placeholder="Enter 10-digit mobile number"
          value={values.mobile}
          onChange={(event) => onChange("mobile", event.target.value.replace(/\D/g, "").slice(0, 10))}
          aria-invalid={Boolean(errors.mobile)}
          className="h-11"
        />
        {errors.mobile ? <p className="text-xs font-medium text-destructive">{errors.mobile}</p> : null}
      </div>

      <div className="grid gap-1.5">
        <Label htmlFor="address-line1">House / Street / Area</Label>
        <Textarea
          id="address-line1"
          placeholder="House no, street, area"
          value={values.line1}
          onChange={(event) => onChange("line1", event.target.value)}
          aria-invalid={Boolean(errors.line1)}
          className="min-h-20"
        />
        {errors.line1 ? <p className="text-xs font-medium text-destructive">{errors.line1}</p> : null}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="grid gap-1.5">
          <Label htmlFor="address-city">City / Town</Label>
          <Input
            id="address-city"
            placeholder="City"
            value={values.city}
            onChange={(event) => onChange("city", event.target.value)}
            aria-invalid={Boolean(errors.city)}
            className="h-11"
          />
          {errors.city ? <p className="text-xs font-medium text-destructive">{errors.city}</p> : null}
        </div>
        <div className="grid gap-1.5">
          <Label htmlFor="address-pincode">Pincode</Label>
          <Input
            id="address-pincode"
            inputMode="numeric"
            maxLength={6}
            placeholder="6-digit pincode"
            value={values.pincode}
            onChange={(event) => onChange("pincode", event.target.value.replace(/\D/g, "").slice(0, 6))}
            aria-invalid={Boolean(errors.pincode)}
            className="h-11"
          />
          {errors.pincode ? <p className="text-xs font-medium text-destructive">{errors.pincode}</p> : null}
        </div>
      </div>

      {deliveryType ? (
        <div className="flex items-center gap-3 rounded-2xl border border-primary/20 bg-primary/5 p-3">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
            <Truck className="size-4" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium">{deliveryType === "LOCAL" ? "Local Delivery" : "Courier Delivery"}</p>
            <p className="text-xs text-muted-foreground">
              {deliveryType === "LOCAL" ? "Fast delivery within your city" : "Delivered through our trusted partners"}{" "}
              &middot; {formatPrice(deliveryChargePaise)}
            </p>
          </div>
        </div>
      ) : null}

      <Button
        type="button"
        size="lg"
        className={cn("w-full")}
        disabled={isSaving}
        onClick={onSubmit}
      >
        {isSaving ? "Saving..." : "Save Address"}
      </Button>
    </StepShell>
  )
}
