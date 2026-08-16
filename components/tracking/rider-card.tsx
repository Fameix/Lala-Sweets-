import { Phone, Truck, User } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

export type RiderCardPartner = {
  name: string
  phone: string
  vehicleNumber: string
}

export function RiderCard({ partner, className }: { partner: RiderCardPartner | null; className?: string }) {
  if (!partner) {
    return (
      <Card className={className}>
        <CardContent className="py-5 text-center text-sm text-muted-foreground">
          Your delivery partner will be assigned soon.
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={className}>
      <CardContent className="flex items-center gap-4 py-5">
        <div className="flex size-12 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
          <User className="size-6" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-xs text-muted-foreground">Your delivery partner</p>
          <p className="truncate font-heading text-base font-medium">{partner.name}</p>
          <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Truck className="size-3.5" />
            {partner.vehicleNumber}
          </p>
        </div>
        <a href={`tel:${partner.phone}`} className="shrink-0">
          <Button size="lg" className="gap-2">
            <Phone className="size-4" />
            Call Rider
          </Button>
        </a>
      </CardContent>
    </Card>
  )
}
