"use client"

import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect, useMemo, useRef, useState } from "react"
import { Banknote, CreditCard, LocateFixed, PackageCheck, ShieldCheck, Truck, User } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button, buttonVariants } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Textarea } from "@/components/ui/textarea"
import { clearCart, getCartItems, subscribeToCart, type CartLineItem } from "@/lib/cart-client"
import { getDeliveryChargePaise, getDeliveryTypeForPincode, normalizePincode, type DeliveryType } from "@/lib/delivery-config"
import { loadGoogleMaps } from "@/lib/google-maps-loader"
import { createCodOrder, type CheckoutCustomer } from "@/lib/order-client"
import { generateOrderId } from "@/lib/order-id"
import { getProductImage } from "@/lib/product-images"
import { cn } from "@/lib/utils"
import type { Product } from "@/types/catalogue"

const googleMapsApiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY

type RazorpayResponse = {
  razorpay_payment_id?: string
  razorpay_order_id?: string
  razorpay_signature?: string
}

type RazorpayPaymentFailedResponse = {
  error?: {
    code?: string
    description?: string
    reason?: string
  }
}

type RazorpayOptions = {
  key: string
  amount: number
  currency: "INR"
  order_id: string
  name: string
  description: string
  handler: (response: RazorpayResponse) => void
  prefill: {
    name: string
    email: string
    contact: string
  }
  notes: {
    delivery_type: string
    pincode: string
  }
  modal?: {
    ondismiss?: () => void
  }
  theme: {
    color: string
  }
}

type PaymentMethod = "RAZORPAY" | "COD"

type CheckoutOrderPayload = {
  orderId: string
  customer: CheckoutCustomer
  products: CartLineItem[]
  deliveryType: DeliveryType
  subtotalPaise: number
  deliveryChargePaise: number
}

type RazorpayCreateOrderResponse = {
  keyId?: string
  razorpayOrderId?: string
  amountPaise?: number
  currency?: "INR"
  error?: string
}

type RazorpayConfirmResponse = {
  verified?: boolean
  order?: { orderId: string }
  error?: string
}

type RazorpayConstructor = new (options: RazorpayOptions) => {
  open: () => void
  on: (event: "payment.failed", handler: (response: RazorpayPaymentFailedResponse) => void) => void
}

let razorpayScriptPromise: Promise<void> | null = null

async function readJsonResponse<T>(response: Response): Promise<T | null> {
  const contentType = response.headers.get("content-type") ?? ""

  if (!contentType.includes("application/json")) {
    return null
  }

  try {
    return (await response.json()) as T
  } catch {
    return null
  }
}

declare global {
  interface Window {
    Razorpay?: RazorpayConstructor
  }
}

// Email is intentionally not collected at checkout - kept as a fixed empty
// string so the CheckoutCustomer shape (and every API that consumes it)
// stays unchanged. lib/order-schema.ts makes email optional server-side.
const initialCustomer: CheckoutCustomer = {
  name: "",
  mobile: "",
  email: "",
  address: "",
  pincode: "",
}

type DeliveryFieldName = "name" | "mobile" | "address" | "city" | "pincode"
type FieldErrors = Partial<Record<DeliveryFieldName, string>>

function formatPrice(paise: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(paise / 100)
}

export function CheckoutContent({ products }: { products: Product[] }) {
  const router = useRouter()
  const [cartItems, setCartItems] = useState<CartLineItem[]>([])
  const [customer, setCustomer] = useState(initialCustomer)
  const [city, setCity] = useState("")
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("RAZORPAY")
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})
  const [locationState, setLocationState] = useState<"idle" | "locating" | "success" | "error">("idle")
  const [locationMessage, setLocationMessage] = useState("")
  const [isProcessingPayment, setIsProcessingPayment] = useState(false)
  const [error, setError] = useState("")
  const [checkoutOrderId] = useState(() => generateOrderId())
  const isSubmittingOrderRef = useRef(false)
  const productMap = useMemo(() => new Map(products.map((product) => [product.id, product])), [products])

  useEffect(() => {
    const sync = () => setCartItems(getCartItems())

    sync()
    return subscribeToCart(sync)
  }, [])

  useEffect(() => {
    const preloadTimer = window.setTimeout(() => {
      void ensureRazorpayScript().catch(() => {
        // Keep checkout usable even if the warm-up request fails.
      })
    }, 750)

    return () => window.clearTimeout(preloadTimer)
  }, [])

  const visibleCartItems = cartItems
    .map((item) => ({
      item,
      product: productMap.get(item.productId),
    }))
    .filter((entry): entry is { item: CartLineItem; product: Product } => Boolean(entry.product))

  const subtotalPaise = visibleCartItems.reduce((total, { item, product }) => {
    const unitPricePaise =
      item.unitPricePaise ||
      product.size_variants?.find((variant) => variant.label === item.size)?.price_paise ||
      product.price_paise ||
      0

    return total + unitPricePaise * item.quantity
  }, 0)
  const normalizedPincode = normalizePincode(customer.pincode)
  const deliveryType = getDeliveryTypeForPincode(normalizedPincode)
  const deliveryChargePaise = getDeliveryChargePaise(deliveryType)
  const discountPaise = 0
  const grandTotalPaise = subtotalPaise + deliveryChargePaise - discountPaise

  function updateCustomer(field: keyof CheckoutCustomer, value: string) {
    setCustomer((current) => ({
      ...current,
      [field]: field === "pincode" ? normalizePincode(value) : value,
    }))
    setFieldErrors((current) => ({ ...current, [field]: undefined }))
    setError("")
  }

  function updateCity(value: string) {
    setCity(value)
    setFieldErrors((current) => ({ ...current, city: undefined }))
    setError("")
  }

  // Reverse-geocodes the browser's GPS position (via the same Google Maps
  // key/loader used by live tracking) to auto-fill Address/City/Pincode.
  // Purely a convenience prefill - the user can still edit every field, and
  // nothing here touches order creation, payment, or the delivery-type calc.
  function detectLocation() {
    if (!navigator.geolocation) {
      setLocationState("error")
      setLocationMessage("Your browser does not support location detection.")
      return
    }

    setLocationState("locating")
    setLocationMessage("")

    navigator.geolocation.getCurrentPosition(
      (position) => {
        void (async () => {
          try {
            if (!googleMapsApiKey) {
              throw new Error("Location lookup is not configured.")
            }

            await loadGoogleMaps(googleMapsApiKey)
            const geocoder = new window.google.maps.Geocoder()
            const { results } = await geocoder.geocode({
              location: { lat: position.coords.latitude, lng: position.coords.longitude },
            })

            const result = results?.[0]

            if (!result) {
              throw new Error("Could not detect your address. Please enter it manually.")
            }

            const components = result.address_components ?? []
            const findComponent = (type: string) =>
              components.find((component) => component.types.includes(type))?.long_name ?? ""

            const detectedCity =
              findComponent("locality") || findComponent("administrative_area_level_2") || findComponent("sublocality")
            const detectedPincode = findComponent("postal_code")

            setCustomer((current) => ({
              ...current,
              address: result.formatted_address || current.address,
              pincode: detectedPincode ? normalizePincode(detectedPincode) : current.pincode,
            }))

            if (detectedCity) {
              setCity(detectedCity)
            }

            setFieldErrors((current) => ({ ...current, address: undefined, city: undefined, pincode: undefined }))
            setLocationState("success")
            setLocationMessage("Location detected - review the details below before placing your order.")
          } catch (geocodeError) {
            setLocationState("error")
            setLocationMessage(
              geocodeError instanceof Error ? geocodeError.message : "Unable to detect your location.",
            )
          }
        })()
      },
      (geoError) => {
        setLocationState("error")
        setLocationMessage(
          geoError.code === geoError.PERMISSION_DENIED
            ? "Location access denied. Please enable it or enter your address manually."
            : "Unable to detect your location. Please enter it manually.",
        )
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 60000 },
    )
  }

  function validateCheckout(): FieldErrors {
    const errors: FieldErrors = {}

    if (!customer.name.trim()) {
      errors.name = "Enter your name."
    }

    if (!/^\d{10}$/.test(customer.mobile.trim())) {
      errors.mobile = "Enter a valid 10-digit mobile number."
    }

    if (!customer.address.trim()) {
      errors.address = "Enter your delivery address."
    }

    if (!city.trim()) {
      errors.city = "Enter your city."
    }

    if (!deliveryType) {
      errors.pincode = "Enter a valid 6-digit pincode."
    }

    return errors
  }

  function buildOrderProducts() {
    return visibleCartItems.map(({ item, product }) => ({
      ...item,
      productName: item.productName ?? product.display_name,
      productSlug: item.productSlug ?? product.slug,
      unitPricePaise:
        item.unitPricePaise ||
        product.size_variants?.find((variant) => variant.label === item.size)?.price_paise ||
        product.price_paise ||
        0,
    }))
  }

  function buildCheckoutOrderPayload(): CheckoutOrderPayload {
    if (!deliveryType) {
      throw new Error("Delivery type is unavailable.")
    }

    const combinedAddress = [customer.address.trim(), city.trim()].filter(Boolean).join(", ")

    return {
      orderId: checkoutOrderId,
      customer: {
        ...customer,
        address: combinedAddress,
        pincode: normalizedPincode,
      },
      products: buildOrderProducts(),
      deliveryType,
      subtotalPaise,
      deliveryChargePaise,
    }
  }

  async function completeCodOrder(checkoutOrder: CheckoutOrderPayload) {
    const order = await createCodOrder({
      orderId: checkoutOrder.orderId,
      customer: checkoutOrder.customer,
      products: checkoutOrder.products,
      deliveryType: checkoutOrder.deliveryType,
      subtotalPaise: checkoutOrder.subtotalPaise,
      deliveryChargePaise: checkoutOrder.deliveryChargePaise,
    })

    clearCart()
    router.push(`/order/success/${order.orderId}`)
  }

  async function placeOrder() {
    if (isSubmittingOrderRef.current) {
      return
    }

    if (visibleCartItems.length === 0) {
      setError("Your cart is empty.")
      return
    }

    const validationErrors = validateCheckout()
    setFieldErrors(validationErrors)

    if (Object.keys(validationErrors).length > 0 || !deliveryType) {
      setError("Please fix the highlighted fields before placing your order.")
      return
    }

    setError("")
    isSubmittingOrderRef.current = true

    const checkoutOrder = buildCheckoutOrderPayload()

    if (paymentMethod === "COD") {
      setIsProcessingPayment(true)

      try {
        await completeCodOrder(checkoutOrder)
      } catch (codError) {
        setIsProcessingPayment(false)
        isSubmittingOrderRef.current = false
        setError(codError instanceof Error ? codError.message : "Unable to save COD order.")
      }
      return
    }

    setIsProcessingPayment(true)

    try {
      await ensureRazorpayScript()
    } catch {
      setIsProcessingPayment(false)
      isSubmittingOrderRef.current = false
      setError("Razorpay Checkout could not load. Please check your connection and try again.")
      return
    }

    const Razorpay = window.Razorpay

    if (!Razorpay) {
      setIsProcessingPayment(false)
      isSubmittingOrderRef.current = false
      setError("Razorpay Checkout is unavailable right now. Please try again.")
      return
    }

    let razorpayOrder: RazorpayCreateOrderResponse | null = null

    try {
      const createOrderResponse = await fetch("/api/payments/razorpay/create-order", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amountPaise: grandTotalPaise,
          orderId: checkoutOrder.orderId,
        }),
      })
      razorpayOrder = await readJsonResponse<RazorpayCreateOrderResponse>(createOrderResponse)

      if (!createOrderResponse.ok || !razorpayOrder?.keyId || !razorpayOrder.razorpayOrderId) {
        setIsProcessingPayment(false)
        isSubmittingOrderRef.current = false
        setError(razorpayOrder?.error ?? "Unable to start Razorpay payment.")
        return
      }
    } catch {
      setIsProcessingPayment(false)
      isSubmittingOrderRef.current = false
      setError("Unable to start Razorpay payment. Please try again.")
      return
    }

    const razorpay = new Razorpay({
      key: razorpayOrder.keyId,
      amount: razorpayOrder.amountPaise ?? grandTotalPaise,
      currency: "INR",
      order_id: razorpayOrder.razorpayOrderId,
      name: "Lala Sweets",
      description: "Lala Sweets order payment",
      modal: {
        ondismiss: () => {
          setIsProcessingPayment(false)
          isSubmittingOrderRef.current = false
          setError("Payment was closed before completion. Please try again.")
        },
      },
      handler: async (response) => {
        try {
          if (!response.razorpay_order_id || !response.razorpay_payment_id || !response.razorpay_signature) {
            throw new Error("Incomplete Razorpay payment response.")
          }

          const confirmResponse = await fetch("/api/payments/razorpay/confirm", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              ...checkoutOrder,
              amountPaise: grandTotalPaise,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            }),
          })
          const result = await readJsonResponse<RazorpayConfirmResponse>(confirmResponse)

          if (!confirmResponse.ok || !result?.verified || !result.order) {
            throw new Error(result?.error ?? "Payment verification failed.")
          }

          clearCart()
          isSubmittingOrderRef.current = false
          router.push(`/order/success/${result.order.orderId}`)
        } catch (verificationError) {
          setIsProcessingPayment(false)
          isSubmittingOrderRef.current = false
          setError(verificationError instanceof Error ? verificationError.message : "Payment verification failed.")
        }
      },
      prefill: {
        name: customer.name,
        email: customer.email,
        contact: customer.mobile,
      },
      notes: {
        delivery_type: deliveryType,
        pincode: normalizedPincode,
      },
      theme: {
        color: "#5c1a14",
      },
    })

    razorpay.on("payment.failed", (response) => {
      setIsProcessingPayment(false)
      isSubmittingOrderRef.current = false
      setError(response.error?.description || "Payment failed. Please try again.")
    })

    razorpay.open()
  }

  if (visibleCartItems.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center gap-4 py-12 text-center">
          <PackageCheck className="size-10 text-muted-foreground" />
          <div>
            <h2 className="font-heading text-xl font-medium">Your cart is empty</h2>
            <p className="mt-2 text-sm text-muted-foreground">Add sweets to your cart before checkout.</p>
          </div>
          <Link href="/menu" className={cn(buttonVariants())}>
            Browse Menu
          </Link>
        </CardContent>
      </Card>
    )
  }

  const ctaLabel = isProcessingPayment
    ? "Processing..."
    : paymentMethod === "RAZORPAY"
      ? `Pay ${formatPrice(grandTotalPaise)}`
      : "Place Order"

  return (
    <div className="pb-28 lg:pb-0">
      <div className="grid gap-4 lg:grid-cols-[1fr_22rem] lg:items-start lg:gap-6">
        {/* Delivery Details */}
        <Card className="order-1 lg:order-none lg:col-start-1 lg:row-start-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="size-4 text-primary" />
              Delivery Details
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="flex items-center gap-3 rounded-2xl border border-dashed border-primary/30 bg-primary/5 p-3">
              <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
                <LocateFixed className={cn("size-4", locationState === "locating" && "animate-pulse")} />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium">Use my current location</p>
                <p
                  className={cn(
                    "text-xs",
                    locationState === "error" ? "text-destructive" : "text-muted-foreground",
                  )}
                >
                  {locationState === "locating"
                    ? "Detecting your location..."
                    : locationMessage || "Auto-fill address, city and pincode"}
                </p>
              </div>
              <Button
                type="button"
                size="sm"
                variant="outline"
                className="shrink-0"
                onClick={detectLocation}
                disabled={locationState === "locating"}
              >
                {locationState === "locating" ? "Detecting..." : "Detect"}
              </Button>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="customer-name">Full Name</Label>
              <Input
                id="customer-name"
                placeholder="Enter your name"
                value={customer.name}
                onChange={(event) => updateCustomer("name", event.target.value)}
                aria-invalid={Boolean(fieldErrors.name)}
                className="h-11"
              />
              {fieldErrors.name ? <p className="text-xs font-medium text-destructive">{fieldErrors.name}</p> : null}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="customer-mobile">Mobile Number</Label>
              <Input
                id="customer-mobile"
                inputMode="tel"
                maxLength={10}
                placeholder="Enter 10-digit mobile number"
                value={customer.mobile}
                onChange={(event) => updateCustomer("mobile", event.target.value.replace(/\D/g, ""))}
                aria-invalid={Boolean(fieldErrors.mobile)}
                className="h-11"
              />
              {fieldErrors.mobile ? <p className="text-xs font-medium text-destructive">{fieldErrors.mobile}</p> : null}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="delivery-address">Address</Label>
              <Textarea
                id="delivery-address"
                placeholder="House / Street / Area"
                value={customer.address}
                onChange={(event) => updateCustomer("address", event.target.value)}
                aria-invalid={Boolean(fieldErrors.address)}
                className="min-h-20"
              />
              {fieldErrors.address ? <p className="text-xs font-medium text-destructive">{fieldErrors.address}</p> : null}
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="delivery-city">City</Label>
                <Input
                  id="delivery-city"
                  placeholder="Enter your city"
                  value={city}
                  onChange={(event) => updateCity(event.target.value)}
                  aria-invalid={Boolean(fieldErrors.city)}
                  className="h-11"
                />
                {fieldErrors.city ? <p className="text-xs font-medium text-destructive">{fieldErrors.city}</p> : null}
              </div>
              <div className="grid gap-2">
                <Label htmlFor="delivery-pincode">Pincode</Label>
                <Input
                  id="delivery-pincode"
                  inputMode="numeric"
                  maxLength={6}
                  placeholder="6-digit pincode"
                  value={customer.pincode}
                  onChange={(event) => updateCustomer("pincode", event.target.value)}
                  aria-invalid={Boolean(fieldErrors.pincode)}
                  className="h-11"
                />
                {fieldErrors.pincode ? <p className="text-xs font-medium text-destructive">{fieldErrors.pincode}</p> : null}
              </div>
            </div>

            {/* Delivery type - auto-derived from pincode via the existing
                lib/delivery-config logic, shown as a read-only status card. */}
            {deliveryType ? (
              <div className="flex items-center gap-3 rounded-2xl border border-primary/20 bg-primary/5 p-4">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
                  <Truck className="size-5" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="font-heading text-sm font-semibold">
                    {deliveryType === "LOCAL" ? "Local Delivery" : "Courier Delivery"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {deliveryType === "LOCAL" ? "Fast local delivery" : "Delivery through courier"} &middot;{" "}
                    {formatPrice(deliveryChargePaise)}
                  </p>
                </div>
                <Badge variant="outline" className="shrink-0">
                  {deliveryType}
                </Badge>
              </div>
            ) : (
              <p className="rounded-2xl border border-dashed border-border p-4 text-sm text-muted-foreground">
                Enter your pincode to see delivery type and charges.
              </p>
            )}
          </CardContent>
        </Card>

        {/* Order Summary */}
        <Card className="order-2 lg:order-none lg:col-start-2 lg:row-start-1 lg:row-span-2">
          <CardHeader>
            <CardTitle>Order Summary</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3 text-sm">
            <div className="grid gap-3">
              {visibleCartItems.map(({ item, product }) => {
                const image = getProductImage(product)
                const unitPricePaise =
                  item.unitPricePaise ||
                  product.size_variants?.find((variant) => variant.label === item.size)?.price_paise ||
                  product.price_paise ||
                  0

                return (
                  <div key={item.id} className="flex items-center gap-3">
                    <div className="relative size-14 shrink-0 overflow-hidden rounded-xl bg-muted">
                      <Image src={image.src} alt={image.alt} fill sizes="3.5rem" className={cn("object-cover", image.className)} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium">{product.display_name}</p>
                      <p className="text-xs text-muted-foreground">
                        {item.size} &middot; Qty {item.quantity}
                      </p>
                    </div>
                    <span className="shrink-0 font-medium">{formatPrice(unitPricePaise * item.quantity)}</span>
                  </div>
                )
              })}
            </div>
            <Separator />
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

            {error ? <p className="text-sm font-medium text-destructive">{error}</p> : null}

            <Button
              size="lg"
              className="mt-1 hidden w-full gap-2 lg:inline-flex"
              onClick={() => void placeOrder()}
              disabled={isProcessingPayment}
            >
              {paymentMethod === "RAZORPAY" ? <CreditCard className="size-4" /> : <Banknote className="size-4" />}
              {ctaLabel}
            </Button>
            <p className="hidden text-center text-xs text-muted-foreground lg:block">
              <ShieldCheck className="mr-1 inline size-3.5 text-primary" />
              Secure checkout &middot; Cash on Delivery available
            </p>
          </CardContent>
        </Card>

        {/* Payment Method */}
        <Card className="order-3 lg:order-none lg:col-start-1 lg:row-start-2">
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
              onClick={() => {
                setPaymentMethod("RAZORPAY")
                setError("")
              }}
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
                <span className="block text-xs text-muted-foreground">UPI, cards, net banking, and wallets</span>
              </span>
            </button>

            <button
              type="button"
              className={cn(
                "flex items-center gap-3 rounded-2xl border p-4 text-left transition",
                paymentMethod === "COD" ? "border-primary bg-primary/5" : "border-border hover:bg-muted",
              )}
              onClick={() => {
                setPaymentMethod("COD")
                setError("")
              }}
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
          </CardContent>
        </Card>
      </div>

      {/* Sticky mobile CTA - desktop uses the button inside Order Summary instead */}
      <div className="fixed inset-x-0 bottom-16 z-40 border-t border-border bg-card/97 p-3 shadow-2xl backdrop-blur lg:hidden">
        <div className="flex items-center gap-3">
          <div className="min-w-0 flex-1">
            <p className="text-xs text-muted-foreground">Total payable</p>
            <p className="font-heading text-lg font-semibold text-primary">{formatPrice(grandTotalPaise)}</p>
          </div>
          <Button size="lg" className="gap-2 px-6" onClick={() => void placeOrder()} disabled={isProcessingPayment}>
            {paymentMethod === "RAZORPAY" ? <CreditCard className="size-4" /> : <Banknote className="size-4" />}
            {ctaLabel}
          </Button>
        </div>
        {error ? <p className="mt-2 text-xs font-medium text-destructive">{error}</p> : null}
      </div>
    </div>
  )
}

function ensureRazorpayScript() {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("Razorpay can only load in the browser."))
  }

  if (window.Razorpay) {
    return Promise.resolve()
  }

  if (razorpayScriptPromise) {
    return razorpayScriptPromise
  }

  razorpayScriptPromise = new Promise<void>((resolve, reject) => {
    const scriptId = "razorpay-checkout-script"

    const finishWhenReady = () => {
      if (window.Razorpay) {
        window.clearInterval(pollingId)
        window.clearTimeout(timeoutId)
        resolve()
      }
    }

    const pollingId = window.setInterval(finishWhenReady, 50)
    const timeoutId = window.setTimeout(() => {
      window.clearInterval(pollingId)
      reject(new Error("Failed to load Razorpay checkout."))
    }, 45000)

    const existingScript = document.getElementById(scriptId) as HTMLScriptElement | null

    if (existingScript) {
      finishWhenReady()
      existingScript.addEventListener("load", finishWhenReady, { once: true })
      existingScript.addEventListener(
        "error",
        () => {
          window.clearInterval(pollingId)
          window.clearTimeout(timeoutId)
          reject(new Error("Failed to load Razorpay checkout."))
        },
        { once: true },
      )
      return
    }

    const script = document.createElement("script")
    script.id = scriptId
    script.src = "https://checkout.razorpay.com/v1/checkout.js"
    script.async = true
    script.onload = finishWhenReady
    script.onerror = () => {
      window.clearInterval(pollingId)
      window.clearTimeout(timeoutId)
      reject(new Error("Failed to load Razorpay checkout."))
    }
    document.body.appendChild(script)
  }).finally(() => {
    if (!window.Razorpay) {
      razorpayScriptPromise = null
    }
  })

  return razorpayScriptPromise
}
