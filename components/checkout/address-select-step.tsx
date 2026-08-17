"use client"

import { Home, MapPin, Plus } from "lucide-react"

import { StepShell } from "@/components/checkout/step-shell"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import type { Address } from "@/lib/address-types"
import { cn } from "@/lib/utils"

export function AddressSelectStep({
  addresses,
  isLoading,
  onSelect,
  onAddNew,
  onBack,
}: {
  addresses: Address[]
  isLoading: boolean
  onSelect: (address: Address) => void
  onAddNew: () => void
  onBack: () => void
}) {
  return (
    <StepShell title="Select Address" description="Choose where you'd like your order delivered." onBack={onBack}>
      {isLoading ? (
        <p className="text-center text-sm text-muted-foreground">Loading your saved addresses...</p>
      ) : addresses.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-border p-4 text-center text-sm text-muted-foreground">
          You don&apos;t have any saved addresses yet.
        </p>
      ) : (
        <div className="grid gap-3">
          {addresses.map((address) => (
            <button
              key={address.id}
              type="button"
              onClick={() => onSelect(address)}
              className={cn(
                "flex items-start gap-3 rounded-2xl border p-4 text-left transition",
                "border-border hover:border-primary/40 hover:bg-primary/5",
              )}
            >
              <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                <Home className="size-4" />
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="font-medium">{address.label}</p>
                  {address.isDefault ? (
                    <Badge variant="outline" className="text-[10px]">
                      Default
                    </Badge>
                  ) : null}
                </div>
                <p className="mt-0.5 text-sm text-foreground">{address.name}</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {address.line1}, {address.city} - {address.pincode}
                </p>
              </div>
            </button>
          ))}
        </div>
      )}

      <Button type="button" variant="outline" size="lg" className="w-full gap-2" onClick={onAddNew}>
        <Plus className="size-4" />
        Add New Address
      </Button>

      <p className="flex items-center justify-center gap-1.5 text-center text-xs text-muted-foreground">
        <MapPin className="size-3.5 shrink-0" />
        Delivery availability depends on your pincode
      </p>
    </StepShell>
  )
}
