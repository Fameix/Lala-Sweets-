"use client"

import { CheckCircle2, LocateFixed, MapPinOff } from "lucide-react"

import { StepShell } from "@/components/checkout/step-shell"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export type LiveLocationState = "prompt" | "locating" | "found" | "denied" | "unavailable" | "error"

export type DetectedLocation = {
  formattedAddress: string
  city: string
  pincode: string
}

export function LiveLocationStep({
  state,
  result,
  errorMessage,
  onRequestPermission,
  onUseThisAddress,
  onEnterManually,
  onBack,
}: {
  state: LiveLocationState
  result?: DetectedLocation | null
  errorMessage?: string
  onRequestPermission: () => void
  onUseThisAddress: () => void
  onEnterManually: () => void
  onBack: () => void
}) {
  if (state === "locating") {
    return (
      <StepShell title="Getting your location..." description="Please wait while we detect your address." onBack={onBack}>
        <div className="flex justify-center py-6">
          <span className="relative flex size-20 items-center justify-center">
            <span className="absolute inset-0 animate-ping rounded-full bg-primary/20" />
            <span className="absolute inset-2 animate-ping rounded-full bg-primary/30 [animation-delay:150ms]" />
            <span className="relative flex size-12 items-center justify-center rounded-full bg-primary text-primary-foreground">
              <LocateFixed className="size-6" />
            </span>
          </span>
        </div>
      </StepShell>
    )
  }

  if (state === "found" && result) {
    return (
      <StepShell title="Location Found" description="Address Captured" onBack={onBack}>
        <div className="flex items-start gap-3 rounded-2xl border border-success/30 bg-success/10 p-4">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-success text-success-foreground">
            <CheckCircle2 className="size-4" />
          </span>
          <div className="min-w-0 flex-1 text-sm">
            <p className="font-medium">{result.formattedAddress}</p>
            <p className="mt-1 text-muted-foreground">
              {result.city ? `${result.city}, ` : ""}Pincode {result.pincode || "—"}
            </p>
          </div>
        </div>

        <div className="grid gap-2">
          <Button type="button" size="lg" className="w-full" onClick={onUseThisAddress}>
            Use This Address
          </Button>
          <Button type="button" variant="outline" size="lg" className="w-full" onClick={onEnterManually}>
            Edit Address
          </Button>
        </div>
      </StepShell>
    )
  }

  if (state === "denied" || state === "unavailable" || state === "error") {
    return (
      <StepShell title="Location access needed" onBack={onBack}>
        <div className={cn("flex items-start gap-3 rounded-2xl border border-destructive/25 bg-destructive/5 p-4")}>
          <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-destructive/10 text-destructive">
            <MapPinOff className="size-4" />
          </span>
          <p className="text-sm text-muted-foreground">
            {errorMessage ??
              "Location access is required to automatically detect your address. You can still enter it manually."}
          </p>
        </div>

        <Button type="button" size="lg" className="w-full" onClick={onEnterManually}>
          Enter Address Manually
        </Button>
      </StepShell>
    )
  }

  return (
    <StepShell
      title="Use Live Location?"
      description="Allow us to access your location to fill the address automatically."
      onBack={onBack}
    >
      <div className="flex justify-center py-4">
        <span className="flex size-16 items-center justify-center rounded-full bg-primary/10 text-primary">
          <LocateFixed className="size-8" />
        </span>
      </div>

      <ul className="grid gap-1.5 text-sm text-muted-foreground">
        <li className="flex items-center gap-2">
          <CheckCircle2 className="size-3.5 shrink-0 text-success" />
          Accurate address detection
        </li>
        <li className="flex items-center gap-2">
          <CheckCircle2 className="size-3.5 shrink-0 text-success" />
          Saves time &amp; effort
        </li>
      </ul>

      <div className="grid gap-2">
        <Button type="button" size="lg" className="w-full" onClick={onRequestPermission}>
          Allow Location Access
        </Button>
        <Button type="button" variant="outline" size="lg" className="w-full" onClick={onEnterManually}>
          Enter Address Manually
        </Button>
      </div>
    </StepShell>
  )
}
