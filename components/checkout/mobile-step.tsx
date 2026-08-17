"use client"

import { ShieldCheck, Sparkles } from "lucide-react"

import { StepShell } from "@/components/checkout/step-shell"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export function MobileStep({
  phoneNumber,
  onPhoneNumberChange,
  onSendOtp,
  onContinueAsGuest,
  isSending,
  error,
}: {
  phoneNumber: string
  onPhoneNumberChange: (value: string) => void
  onSendOtp: () => void
  onContinueAsGuest: () => void
  isSending: boolean
  error?: string
}) {
  const isValid = /^\d{10}$/.test(phoneNumber)

  return (
    <StepShell title="Enter your mobile number" description="We'll send you a 6-digit OTP to verify it's you.">
      <div className="grid gap-1.5">
        <Label htmlFor="mobile-number">Mobile Number</Label>
        <div className="flex items-center gap-2">
          <span className="flex h-11 shrink-0 items-center rounded-3xl border border-transparent bg-input/50 px-3 text-sm font-medium">
            +91
          </span>
          <Input
            id="mobile-number"
            inputMode="numeric"
            maxLength={10}
            placeholder="Enter 10-digit mobile number"
            value={phoneNumber}
            onChange={(event) => onPhoneNumberChange(event.target.value.replace(/\D/g, "").slice(0, 10))}
            aria-invalid={Boolean(error)}
            className="h-11"
            autoFocus
          />
        </div>
        {error ? <p className="text-xs font-medium text-destructive">{error}</p> : null}
      </div>

      <Button
        type="button"
        size="lg"
        className="w-full"
        disabled={!isValid || isSending}
        onClick={onSendOtp}
      >
        {isSending ? "Sending OTP..." : "Send OTP"}
      </Button>

      <div className="flex items-center gap-3 text-xs text-muted-foreground">
        <span className="h-px flex-1 bg-border" />
        OR
        <span className="h-px flex-1 bg-border" />
      </div>

      <Button type="button" variant="outline" size="lg" className="w-full" onClick={onContinueAsGuest}>
        Continue as guest
      </Button>

      <div className="grid grid-cols-2 gap-3 text-xs text-muted-foreground">
        <div className="flex items-center gap-1.5">
          <ShieldCheck className="size-3.5 shrink-0 text-primary" />
          Secure &amp; trusted
        </div>
        <div className="flex items-center gap-1.5">
          <Sparkles className="size-3.5 shrink-0 text-primary" />
          Your data is safe
        </div>
      </div>

      <div id="recaptcha-container" />
    </StepShell>
  )
}
