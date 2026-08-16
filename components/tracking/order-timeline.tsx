import { Check } from "lucide-react"

import { orderTimelineSteps } from "@/lib/order-status-labels"
import type { OrderStatusCode } from "@/lib/order-types"
import { cn } from "@/lib/utils"

export function OrderTimeline({
  currentStatus,
  variant = "vertical",
  className,
}: {
  currentStatus: OrderStatusCode
  variant?: "vertical" | "horizontal"
  className?: string
}) {
  const currentIndex = orderTimelineSteps.findIndex((step) => step.status === currentStatus)

  if (variant === "horizontal") {
    return (
      <ol className={cn("flex items-start gap-1 sm:gap-2", className)}>
        {orderTimelineSteps.map((step, index) => {
          const isComplete = currentIndex >= 0 && index <= currentIndex
          const isActive = index === currentIndex
          const isLast = index === orderTimelineSteps.length - 1

          return (
            <li key={step.status} className="flex flex-1 flex-col items-center gap-2">
              <div className="flex w-full items-center">
                <StepDot isComplete={isComplete} isActive={isActive} />
                {!isLast ? (
                  <span className={cn("mx-1 h-0.5 flex-1 rounded-full", isComplete ? "bg-primary" : "bg-border")} />
                ) : null}
              </div>
              <span
                className={cn(
                  "text-center text-[11px] leading-tight sm:text-xs",
                  isComplete ? "font-medium text-foreground" : "text-muted-foreground",
                )}
              >
                {step.label}
              </span>
            </li>
          )
        })}
      </ol>
    )
  }

  return (
    <ol className={cn("grid gap-3", className)}>
      {orderTimelineSteps.map((step, index) => {
        const isComplete = currentIndex >= 0 && index < currentIndex
        const isActive = index === currentIndex
        const isPending = currentIndex >= 0 && index > currentIndex

        return (
          <li key={step.status} className="flex items-center gap-3">
            <StepDot isComplete={isComplete} isActive={isActive} />
            <span
              className={cn(
                "text-sm",
                isComplete && "text-foreground",
                isActive && "font-semibold text-foreground",
                isPending && "text-muted-foreground",
              )}
            >
              {step.label}
            </span>
          </li>
        )
      })}
    </ol>
  )
}

function StepDot({ isComplete, isActive }: { isComplete: boolean; isActive: boolean }) {
  return (
    <span
      className={cn(
        "flex size-4 shrink-0 items-center justify-center rounded-full border",
        isComplete && "border-primary bg-primary text-primary-foreground",
        isActive && "border-primary bg-primary/20",
        !isComplete && !isActive && "border-border bg-background",
      )}
    >
      {isComplete ? <Check className="size-2.5" /> : isActive ? <span className="size-1.5 rounded-full bg-primary" /> : null}
    </span>
  )
}
