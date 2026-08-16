import { Minus, Plus } from "lucide-react"

import { cn } from "@/lib/utils"

export function QuantitySelector({
  quantity,
  onDecrease,
  onIncrease,
  label,
  className,
}: {
  quantity: number
  onDecrease: () => void
  onIncrease: () => void
  label: string
  className?: string
}) {
  return (
    <div
      className={cn(
        "inline-flex h-10 min-w-36 items-center justify-between rounded-full bg-chart-1 text-sm font-medium text-foreground",
        className,
      )}
    >
      <button
        type="button"
        className="inline-flex h-full w-11 items-center justify-center rounded-l-full transition hover:bg-black/5 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
        onClick={onDecrease}
        aria-label={`Decrease ${label} quantity`}
      >
        <Minus className="size-4" />
      </button>
      <span>{quantity}</span>
      <button
        type="button"
        className="inline-flex h-full w-11 items-center justify-center rounded-r-full transition hover:bg-black/5 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
        onClick={onIncrease}
        aria-label={`Increase ${label} quantity`}
      >
        <Plus className="size-4" />
      </button>
    </div>
  )
}
