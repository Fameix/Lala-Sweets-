"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { setCartQuantity } from "@/lib/cart-client"

export function AIConfirmationCard({
  label,
  productId,
  quantity,
  onDone,
}: {
  label: string
  productId: string
  quantity: number
  onDone: (confirmed: boolean) => void
}) {
  return (
    <Card size="sm">
      <CardContent className="grid gap-3">
        <p className="text-sm font-medium">{label}?</p>
        <div className="flex gap-2">
          <Button
            type="button"
            size="sm"
            onClick={() => {
              setCartQuantity(productId, quantity)
              onDone(true)
            }}
          >
            Confirm
          </Button>
          <Button type="button" size="sm" variant="outline" onClick={() => onDone(false)}>
            Cancel
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

