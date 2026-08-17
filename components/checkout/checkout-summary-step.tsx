"use client"

import Image from "next/image"
import { Banknote, CreditCard, MapPin, ShieldCheck, Truck } from "lucide-react"

import { StepShell } from "@/components/checkout/step-shell"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import type { DeliveryType } from "@/lib/delivery-config"
import { cn } from "@/lib/utils"

export type SummaryLineItem = {
  id: string
  name: string
  size: string
  quantity: number
  unitPricePaise: number
  image?: { src: string; alt: string; className?: string }
}

export type PaymentMethod = "RAZORPAY" | "COD"

function formatPrice(paise: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(paise / 100)
}

export function CheckoutSummaryStep({
  deliveryDetails,
  onChangeAddress,
  deliveryType,
  deliveryChargePaise,
  items,
  subtotalPaise,
  discountPaise,
  grandTotalPaise,
  paymentMethod,
  onPaymentMethodChange,
  onPlaceOrder,
  isProcessing,
  error,
  onBack,
  couponCode,
  onCouponCodeChange,
  onApplyCoupon,
  onRemoveCoupon,
  couponError,
  applyingCoupon,
  appliedCouponCode,
}: {
  deliveryDetails: { name: string; line1: string; city: string; pincode: string }
  onChangeAddress: () => void
  deliveryType: DeliveryType | null
  deliveryChargePaise: number
  items: SummaryLineItem[]
  subtotalPaise: number
  discountPaise: number
  grandTotalPaise: number
  paymentMethod: PaymentMethod
  onPaymentMethodChange: (method: PaymentMethod) => void
  onPlaceOrder: () => void
  isProcessing: boolean
  error?: string
  onBack: () => void
  couponCode?: string
  onCouponCodeChange?: (value: string) => void
  onApplyCoupon?: () => void
  onRemoveCoupon?: () => void
  couponError?: string
  applyingCoupon?: boolean
  appliedCouponCode?: string | null
}) {
  const ctaLabel = isProcessing
    ? "Placing your order..."
    : paymentMethod === "RAZORPAY"
      ? `Pay ${formatPrice(grandTotalPaise)}`
      : `Place Order ${formatPrice(grandTotalPaise)}`

  return (
    <div className="mx-auto w-full max-w-md pb-24">
      <StepShell title="Checkout Summary" onBack={onBack}>
        <div className="grid gap-2">
          <div className="flex items-center justify-between">
            <p className="flex items-center gap-1.5 text-sm font-medium">
              <MapPin className="size-4 text-primary" />
              Delivery Details
            </p>
            <Button type="button" variant="ghost" size="sm" onClick={onChangeAddress}>
              Change
            </Button>
          </div>
          <div className="rounded-2xl border border-border bg-muted/40 p-3 text-sm">
            <p className="font-medium">{deliveryDetails.name}</p>
            <p className="mt-0.5 text-muted-foreground">
              {deliveryDetails.line1}, {deliveryDetails.city} - {deliveryDetails.pincode}
            </p>
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
                {deliveryType === "LOCAL" ? "Fast delivery within your city" : "Delivered through our trusted partners"}
              </p>
            </div>
            <Badge variant="outline" className="shrink-0">
              {formatPrice(deliveryChargePaise)}
            </Badge>
          </div>
        ) : null}
      </StepShell>

      <Card className="mt-4 border-primary/10">
        <CardHeader>
          <CardTitle>Order Summary</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 text-sm">
          <div className="grid gap-3">
            {items.map((item) => (
              <div key={item.id} className="flex items-center gap-3">
                {item.image ? (
                  <div className="relative size-14 shrink-0 overflow-hidden rounded-xl bg-muted">
                    <Image
                      src={item.image.src}
                      alt={item.image.alt}
                      fill
                      sizes="3.5rem"
                      className={cn("object-cover", item.image.className)}
                    />
                  </div>
                ) : null}
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium">{item.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {item.size} &middot; Qty {item.quantity}
                  </p>
                </div>
                <span className="shrink-0 font-medium">{formatPrice(item.unitPricePaise * item.quantity)}</span>
              </div>
            ))}
          </div>
          <Separator />
          {onApplyCoupon ? (
            <div className="grid gap-2">
              {appliedCouponCode ? (
                <div className="flex items-center justify-between gap-3 rounded-2xl border border-success/30 bg-success/10 px-3 py-2 text-sm">
                  <span className="font-medium">Coupon {appliedCouponCode} applied</span>
                  <button type="button" className="text-xs underline underline-offset-4" onClick={onRemoveCoupon}>
                    Remove
                  </button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <Input
                    placeholder="Coupon code"
                    value={couponCode ?? ""}
                    onChange={(event) => onCouponCodeChange?.(event.target.value.toUpperCase())}
                  />
                  <Button type="button" variant="outline" disabled={applyingCoupon} onClick={onApplyCoupon}>
                    {applyingCoupon ? "Applying..." : "Apply"}
                  </Button>
                </div>
              )}
              {couponError ? <p className="text-xs text-destructive">{couponError}</p> : null}
            </div>
          ) : null}
          <div className="flex justify-between gap-4">
            <span className="text-muted-foreground">Subtotal</span>
            <span className="font-medium">{formatPrice(subtotalPaise)}</span>
          </div>
          <div className="flex justify-between gap-4">
            <span className="text-muted-foreground">Delivery Fee</span>
            <span className="font-medium">{formatPrice(deliveryChargePaise)}</span>
          </div>
          {discountPaise > 0 ? (
            <div className="flex justify-between gap-4">
              <span className="text-muted-foreground">Discount</span>
              <span className="font-medium text-success">-{formatPrice(discountPaise)}</span>
            </div>
          ) : null}
          <Separator />
          <div className="flex items-baseline justify-between gap-4">
            <span className="font-heading text-base font-medium">Total</span>
            <span className="font-heading text-2xl font-semibold text-primary">{formatPrice(grandTotalPaise)}</span>
          </div>
        </CardContent>
      </Card>

      <Card className="mt-4 border-primary/10">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="size-4 text-primary" />
            Payment Method
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3">
          <button
            type="button"
            className={cn(
              "flex items-center gap-3 rounded-2xl border p-4 text-left transition",
              paymentMethod === "RAZORPAY" ? "border-primary bg-primary/5" : "border-border hover:bg-muted",
            )}
            onClick={() => onPaymentMethodChange("RAZORPAY")}
          >
            <span
              className={cn(
                "flex size-5 shrink-0 items-center justify-center rounded-full border-2",
                paymentMethod === "RAZORPAY" ? "border-primary" : "border-border",
              )}
              aria-hidden
            >
              {paymentMethod === "RAZORPAY" ? <span className="size-2.5 rounded-full bg-primary" /> : null}
            </span>
            <CreditCard className="size-5 shrink-0 text-primary" />
            <span className="min-w-0 flex-1">
              <span className="block font-medium">Online Payment</span>
              <span className="block text-xs text-muted-foreground">Pay securely via UPI, cards, netbanking</span>
            </span>
          </button>

          <button
            type="button"
            className={cn(
              "flex items-center gap-3 rounded-2xl border p-4 text-left transition",
              paymentMethod === "COD" ? "border-primary bg-primary/5" : "border-border hover:bg-muted",
            )}
            onClick={() => onPaymentMethodChange("COD")}
          >
            <span
              className={cn(
                "flex size-5 shrink-0 items-center justify-center rounded-full border-2",
                paymentMethod === "COD" ? "border-primary" : "border-border",
              )}
              aria-hidden
            >
              {paymentMethod === "COD" ? <span className="size-2.5 rounded-full bg-primary" /> : null}
            </span>
            <Banknote className="size-5 shrink-0 text-primary" />
            <span className="min-w-0 flex-1">
              <span className="block font-medium">Cash on Delivery</span>
              <span className="block text-xs text-muted-foreground">Pay when your order is delivered</span>
            </span>
          </button>

          <p className="flex items-center justify-center gap-1.5 text-center text-xs text-muted-foreground">
            <ShieldCheck className="size-3.5 shrink-0 text-primary" />
            Safe &amp; secure payments &middot; Fresh &amp; hygienic
          </p>
        </CardContent>
      </Card>

      {error ? <p className="mt-3 text-center text-sm font-medium text-destructive">{error}</p> : null}

      <Button
        type="button"
        size="lg"
        className="mt-4 hidden w-full gap-2 sm:inline-flex"
        onClick={onPlaceOrder}
        disabled={isProcessing}
      >
        {paymentMethod === "RAZORPAY" ? <CreditCard className="size-4" /> : <Banknote className="size-4" />}
        {ctaLabel}
      </Button>

      {/* Sticky mobile CTA */}
      <div className="fixed inset-x-0 bottom-16 z-40 border-t border-border bg-card/97 p-3 shadow-2xl backdrop-blur sm:hidden">
        <div className="flex items-center gap-3">
          <div className="min-w-0 flex-1">
            <p className="text-xs text-muted-foreground">Total payable</p>
            <p className="font-heading text-lg font-semibold text-primary">{formatPrice(grandTotalPaise)}</p>
          </div>
          <Button size="lg" className="gap-2 px-6" onClick={onPlaceOrder} disabled={isProcessing}>
            {paymentMethod === "RAZORPAY" ? <CreditCard className="size-4" /> : <Banknote className="size-4" />}
            {ctaLabel}
          </Button>
        </div>
      </div>
    </div>
  )
}
