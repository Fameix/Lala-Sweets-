"use client"

import { useRef } from "react"
import { CheckCircle2 } from "lucide-react"

import { StepShell } from "@/components/checkout/step-shell"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const OTP_LENGTH = 6

export function OtpStep({
  phoneNumber,
  digits,
  onDigitsChange,
  onResend,
  resendSeconds,
  isVerifying,
  isVerified,
  error,
  onBack,
}: {
  phoneNumber: string
  digits: string[]
  onDigitsChange: (digits: string[]) => void
  onResend: () => void
  resendSeconds: number
  isVerifying: boolean
  isVerified: boolean
  error?: string
  onBack: () => void
}) {
  const inputRefs = useRef<Array<HTMLInputElement | null>>([])

  function handleChange(index: number, rawValue: string) {
    const value = rawValue.replace(/\D/g, "").slice(-1)
    const next = [...digits]
    next[index] = value
    onDigitsChange(next)

    if (value && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  function handleKeyDown(index: number, event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Backspace" && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
  }

  return (
    <StepShell
      title="Verify OTP"
      description={`Enter the 6-digit OTP sent to +91 ${phoneNumber}`}
      onBack={onBack}
    >
      <div className="flex justify-center gap-2">
        {Array.from({ length: OTP_LENGTH }).map((_, index) => (
          <input
            key={index}
            ref={(el) => {
              inputRefs.current[index] = el
            }}
            inputMode="numeric"
            maxLength={1}
            value={digits[index] ?? ""}
            onChange={(event) => handleChange(index, event.target.value)}
            onKeyDown={(event) => handleKeyDown(index, event)}
            disabled={isVerifying || isVerified}
            aria-invalid={Boolean(error)}
            className={cn(
              "size-11 rounded-2xl border border-input bg-input/30 text-center text-lg font-semibold outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/30",
              error && "border-destructive",
              isVerified && "border-success text-success",
            )}
          />
        ))}
      </div>

      {error ? <p className="text-center text-xs font-medium text-destructive">{error}</p> : null}

      {isVerified ? (
        <div className="flex items-center justify-center gap-2 rounded-2xl border border-success/30 bg-success/10 p-3 text-success">
          <CheckCircle2 className="size-4 shrink-0" />
          <div className="text-sm">
            <p className="font-medium">Mobile number verified</p>
            <p className="text-xs opacity-80">You can now continue</p>
          </div>
        </div>
      ) : (
        <div className="text-center text-sm text-muted-foreground">
          {isVerifying ? (
            "Verifying..."
          ) : resendSeconds > 0 ? (
            `Resend OTP in ${resendSeconds}s`
          ) : (
            <Button type="button" variant="link" size="sm" className="h-auto p-0" onClick={onResend}>
              Resend OTP
            </Button>
          )}
        </div>
      )}
    </StepShell>
  )
}
