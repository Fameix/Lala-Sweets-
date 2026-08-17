"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect, useMemo, useRef, useState } from "react"
import type { ConfirmationResult } from "firebase/auth"
import { PackageCheck } from "lucide-react"

import { AddressFormStep, type AddressFormErrors, type AddressFormValues } from "@/components/checkout/address-form-step"
import { AddressSelectStep } from "@/components/checkout/address-select-step"
import { CheckoutSummaryStep, type PaymentMethod, type SummaryLineItem } from "@/components/checkout/checkout-summary-step"
import { LiveLocationStep, type DetectedLocation, type LiveLocationState } from "@/components/checkout/live-location-step"
import { MobileStep } from "@/components/checkout/mobile-step"
import { OtpStep } from "@/components/checkout/otp-step"
import { buttonVariants } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { listSavedAddresses, saveNewAddress, upsertCustomerProfile } from "@/lib/address-client"
import type { Address } from "@/lib/address-types"
import { clearCart, getCartItems, subscribeToCart, type CartLineItem } from "@/lib/cart-client"
import { getDeliveryChargePaise, getDeliveryTypeForPincode, normalizePincode, type DeliveryType } from "@/lib/delivery-config"
import { mapFirebaseAuthError, sendOtp } from "@/lib/firebase-client-auth"
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

type CheckoutOrderPayload = {
  orderId: string
  customer: CheckoutCustomer
  products: CartLineItem[]
  deliveryType: DeliveryType
  subtotalPaise: number
  deliveryChargePaise: number
  couponCode?: string
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

type Step = "mobile" | "otp" | "select-address" | "new-address" | "locating" | "checkout"

const emptyAddressForm: AddressFormValues = { name: "", mobile: "", line1: "", city: "", pincode: "" }

export function CheckoutContent({ products }: { products: Product[] }) {
  const router = useRouter()
  const [cartItems, setCartItems] = useState<CartLineItem[]>([])
  const productMap = useMemo(() => new Map(products.map((product) => [product.id, product])), [products])

  const [step, setStep] = useState<Step>("mobile")

  // Mobile + OTP
  const [phoneNumber, setPhoneNumber] = useState("")
  const [isSendingOtp, setIsSendingOtp] = useState(false)
  const [otpSendError, setOtpSendError] = useState("")
  const [otpDigits, setOtpDigits] = useState<string[]>(Array(6).fill(""))
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null)
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false)
  const [otpVerified, setOtpVerified] = useState(false)
  const [otpError, setOtpError] = useState("")
  const [resendSeconds, setResendSeconds] = useState(30)
  const [verifiedUid, setVerifiedUid] = useState<string | null>(null)

  // Addresses
  const [addresses, setAddresses] = useState<Address[]>([])
  const [isLoadingAddresses, setIsLoadingAddresses] = useState(false)
  const [addressForm, setAddressForm] = useState<AddressFormValues>(emptyAddressForm)
  const [addressFormErrors, setAddressFormErrors] = useState<AddressFormErrors>({})
  const [isSavingAddress, setIsSavingAddress] = useState(false)
  const [selectedAddress, setSelectedAddress] = useState<AddressFormValues | null>(null)

  // Live location
  const [liveLocationState, setLiveLocationState] = useState<LiveLocationState>("prompt")
  const [liveLocationResult, setLiveLocationResult] = useState<DetectedLocation | null>(null)
  const [liveLocationError, setLiveLocationError] = useState<string>("")

  // Payment / order
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("RAZORPAY")
  const [isProcessingPayment, setIsProcessingPayment] = useState(false)
  const [error, setError] = useState("")
  const [checkoutOrderId] = useState(() => generateOrderId())
  const isSubmittingOrderRef = useRef(false)

  // Coupon
  const [couponInput, setCouponInput] = useState("")
  const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; discountPaise: number } | null>(null)
  const [couponError, setCouponError] = useState("")
  const [applyingCoupon, setApplyingCoupon] = useState(false)

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

  // OTP resend countdown - runs once per entry into the OTP step.
  useEffect(() => {
    if (step !== "otp") {
      return
    }

    const intervalId = window.setInterval(() => {
      setResendSeconds((seconds) => (seconds > 0 ? seconds - 1 : 0))
    }, 1000)

    return () => window.clearInterval(intervalId)
  }, [step])

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
  const normalizedPincode = normalizePincode(selectedAddress?.pincode ?? "")
  const deliveryType = getDeliveryTypeForPincode(normalizedPincode)
  const deliveryChargePaise = getDeliveryChargePaise(deliveryType)
  const discountPaise = appliedCoupon?.discountPaise ?? 0
  const grandTotalPaise = subtotalPaise + deliveryChargePaise - discountPaise

  async function applyCoupon() {
    if (!couponInput.trim()) {
      setCouponError("Enter a coupon code.")
      return
    }

    setApplyingCoupon(true)
    setCouponError("")

    try {
      const response = await fetch("/api/coupons/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: couponInput.trim(), subtotalPaise }),
      })
      const payload = (await response.json()) as { discountPaise?: number; code?: string; error?: string }

      if (!response.ok || payload.discountPaise === undefined || !payload.code) {
        throw new Error(payload.error ?? "This coupon code is not valid.")
      }

      setAppliedCoupon({ code: payload.code, discountPaise: payload.discountPaise })
    } catch (couponApplyError) {
      setAppliedCoupon(null)
      setCouponError(couponApplyError instanceof Error ? couponApplyError.message : "This coupon code is not valid.")
    } finally {
      setApplyingCoupon(false)
    }
  }

  function removeCoupon() {
    setAppliedCoupon(null)
    setCouponInput("")
    setCouponError("")
  }

  const summaryItems: SummaryLineItem[] = visibleCartItems.map(({ item, product }) => {
    const image = getProductImage(product)
    const unitPricePaise =
      item.unitPricePaise ||
      product.size_variants?.find((variant) => variant.label === item.size)?.price_paise ||
      product.price_paise ||
      0

    return {
      id: item.id,
      name: product.display_name,
      size: item.size,
      quantity: item.quantity,
      unitPricePaise,
      image,
    }
  })

  function goBack() {
    setError("")
    switch (step) {
      case "otp":
        setStep("mobile")
        break
      case "select-address":
        setStep("mobile")
        break
      case "new-address":
        setStep(verifiedUid && addresses.length > 0 ? "select-address" : "mobile")
        break
      case "locating":
        setStep("new-address")
        break
      case "checkout":
        setStep(verifiedUid && addresses.length > 0 ? "select-address" : "new-address")
        break
      default:
        break
    }
  }

  async function handleSendOtp() {
    if (!/^\d{10}$/.test(phoneNumber)) {
      setOtpSendError("Enter a valid 10-digit mobile number.")
      return
    }

    setIsSendingOtp(true)
    setOtpSendError("")

    try {
      const confirmation = await sendOtp(`+91${phoneNumber}`)
      setConfirmationResult(confirmation)
      setOtpDigits(Array(6).fill(""))
      setOtpVerified(false)
      setOtpError("")
      setResendSeconds(30)
      setStep("otp")
    } catch (sendError) {
      setOtpSendError(mapFirebaseAuthError(sendError))
    } finally {
      setIsSendingOtp(false)
    }
  }

  function handleContinueAsGuest() {
    setAddressForm({ ...emptyAddressForm, mobile: phoneNumber })
    setStep("new-address")
  }

  async function handleVerifyOtp(digitsOverride?: string[]) {
    if (!confirmationResult) {
      return
    }

    setIsVerifyingOtp(true)
    setOtpError("")

    try {
      const credential = await confirmationResult.confirm((digitsOverride ?? otpDigits).join(""))
      setVerifiedUid(credential.user.uid)
      setOtpVerified(true)

      try {
        await upsertCustomerProfile({ mobile: phoneNumber })
      } catch {
        // Non-fatal - the customer record can be created/updated later.
      }

      setIsLoadingAddresses(true)

      let savedAddresses: Address[] = []
      try {
        savedAddresses = await listSavedAddresses()
        setAddresses(savedAddresses)
      } catch {
        setAddresses([])
      } finally {
        setIsLoadingAddresses(false)
      }

      window.setTimeout(() => {
        if (savedAddresses.length > 0) {
          setStep("select-address")
        } else {
          setAddressForm({ ...emptyAddressForm, mobile: phoneNumber })
          setStep("new-address")
        }
      }, 900)
    } catch (verifyError) {
      setOtpError(mapFirebaseAuthError(verifyError))
    } finally {
      setIsVerifyingOtp(false)
    }
  }

  async function handleResendOtp() {
    if (resendSeconds > 0) {
      return
    }

    await handleSendOtp()
  }

  function handleOtpDigitsChange(digits: string[]) {
    setOtpDigits(digits)

    if (!otpVerified && !isVerifyingOtp && digits.every((digit) => digit)) {
      void handleVerifyOtp(digits)
    }
  }

  function handleSelectAddress(address: Address) {
    setSelectedAddress({
      name: address.name,
      mobile: address.mobile,
      line1: address.line1,
      city: address.city,
      pincode: address.pincode,
    })
    setError("")
    setStep("checkout")
  }

  function handleAddNewFromSelect() {
    setAddressForm({ ...emptyAddressForm, mobile: phoneNumber })
    setAddressFormErrors({})
    setStep("new-address")
  }

  function updateAddressForm(field: keyof AddressFormValues, value: string) {
    setAddressForm((current) => ({
      ...current,
      [field]: field === "pincode" ? normalizePincode(value) : value,
    }))
    setAddressFormErrors((current) => ({ ...current, [field]: undefined }))
  }

  function validateAddressForm(): AddressFormErrors {
    const errors: AddressFormErrors = {}

    if (!addressForm.name.trim()) {
      errors.name = "Enter your name."
    }

    if (!/^\d{10}$/.test(addressForm.mobile.trim())) {
      errors.mobile = "Enter a valid 10-digit mobile number."
    }

    if (!addressForm.line1.trim()) {
      errors.line1 = "Enter your delivery address."
    }

    if (!addressForm.city.trim()) {
      errors.city = "Enter your city."
    }

    if (!getDeliveryTypeForPincode(addressForm.pincode)) {
      errors.pincode = "Enter a valid 6-digit pincode."
    }

    return errors
  }

  async function handleSubmitAddressForm() {
    const errors = validateAddressForm()
    setAddressFormErrors(errors)

    if (Object.keys(errors).length > 0) {
      return
    }

    setIsSavingAddress(true)

    try {
      if (verifiedUid) {
        const saved = await saveNewAddress({
          label: addresses.length === 0 ? "Home" : "Address",
          name: addressForm.name,
          mobile: addressForm.mobile,
          line1: addressForm.line1,
          city: addressForm.city,
          pincode: addressForm.pincode,
          isDefault: addresses.length === 0,
        })
        setAddresses((current) => [saved, ...current])
      }

      setSelectedAddress({ ...addressForm })
      setStep("checkout")
    } catch (saveError) {
      setAddressFormErrors({
        line1: saveError instanceof Error ? saveError.message : "Unable to save address. Please try again.",
      })
    } finally {
      setIsSavingAddress(false)
    }
  }

  function handleUseLiveLocation() {
    setLiveLocationState("prompt")
    setLiveLocationResult(null)
    setLiveLocationError("")
    setStep("locating")
  }

  function handleRequestLocationPermission() {
    if (!navigator.geolocation) {
      setLiveLocationState("unavailable")
      setLiveLocationError("Your browser does not support location detection.")
      return
    }

    setLiveLocationState("locating")

    navigator.geolocation.getCurrentPosition(
      (position) => {
        void resolveDetectedLocation(position)
      },
      (geoError) => {
        if (geoError.code === geoError.PERMISSION_DENIED) {
          setLiveLocationState("denied")
          setLiveLocationError("Location access is required to automatically detect your address.")
        } else if (geoError.code === geoError.TIMEOUT) {
          setLiveLocationState("error")
          setLiveLocationError("Location request timed out. Please try again or enter your address manually.")
        } else {
          setLiveLocationState("unavailable")
          setLiveLocationError("Unable to detect your location. Please enter it manually.")
        }
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 60000 },
    )
  }

  async function resolveDetectedLocation(position: GeolocationPosition) {
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

      const city = findComponent("locality") || findComponent("administrative_area_level_2") || findComponent("sublocality")
      const pincode = findComponent("postal_code")

      setLiveLocationResult({
        formattedAddress: result.formatted_address || "",
        city,
        pincode: pincode ? normalizePincode(pincode) : "",
      })
      setLiveLocationState("found")
    } catch (geocodeError) {
      setLiveLocationState("error")
      setLiveLocationError(
        geocodeError instanceof Error ? geocodeError.message : "Unable to detect your location.",
      )
    }
  }

  function handleUseDetectedAddress() {
    if (!liveLocationResult) {
      return
    }

    setAddressForm((current) => ({
      ...current,
      line1: liveLocationResult.formattedAddress || current.line1,
      city: liveLocationResult.city || current.city,
      pincode: liveLocationResult.pincode || current.pincode,
    }))
    setAddressFormErrors((current) => ({ ...current, line1: undefined, city: undefined, pincode: undefined }))
    setStep("new-address")
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
    if (!selectedAddress) {
      throw new Error("Delivery address is missing.")
    }

    if (!deliveryType) {
      throw new Error("Delivery type is unavailable.")
    }

    const combinedAddress = [selectedAddress.line1.trim(), selectedAddress.city.trim()].filter(Boolean).join(", ")

    return {
      orderId: checkoutOrderId,
      customer: {
        name: selectedAddress.name,
        mobile: selectedAddress.mobile,
        email: "",
        address: combinedAddress,
        pincode: normalizedPincode,
      },
      products: buildOrderProducts(),
      deliveryType,
      subtotalPaise,
      deliveryChargePaise,
      couponCode: appliedCoupon?.code,
    }
  }

  async function completeCodOrder(checkoutOrder: CheckoutOrderPayload) {
    const order = await createCodOrder({
      orderId: checkoutOrder.orderId,
      customer: checkoutOrder.customer,
      products: checkoutOrder.products,
      deliveryType: checkoutOrder.deliveryType,
      couponCode: checkoutOrder.couponCode,
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

    if (!selectedAddress || !deliveryType) {
      setError("Please select a delivery address before placing your order.")
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
          orderId: checkoutOrder.orderId,
          products: checkoutOrder.products,
          pincode: checkoutOrder.customer.pincode,
          couponCode: checkoutOrder.couponCode,
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
        name: selectedAddress.name,
        email: "",
        contact: selectedAddress.mobile,
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

  return (
    <div className="pb-28 lg:pb-0">
      {step === "mobile" ? (
        <MobileStep
          phoneNumber={phoneNumber}
          onPhoneNumberChange={(value) => {
            setPhoneNumber(value)
            setOtpSendError("")
          }}
          onSendOtp={() => void handleSendOtp()}
          onContinueAsGuest={handleContinueAsGuest}
          isSending={isSendingOtp}
          error={otpSendError}
        />
      ) : null}

      {step === "otp" ? (
        <OtpStep
          phoneNumber={phoneNumber}
          digits={otpDigits}
          onDigitsChange={handleOtpDigitsChange}
          onResend={() => void handleResendOtp()}
          resendSeconds={resendSeconds}
          isVerifying={isVerifyingOtp}
          isVerified={otpVerified}
          error={otpError}
          onBack={goBack}
        />
      ) : null}

      {step === "select-address" ? (
        <AddressSelectStep
          addresses={addresses}
          isLoading={isLoadingAddresses}
          onSelect={handleSelectAddress}
          onAddNew={handleAddNewFromSelect}
          onBack={goBack}
        />
      ) : null}

      {step === "new-address" ? (
        <AddressFormStep
          values={addressForm}
          errors={addressFormErrors}
          onChange={updateAddressForm}
          onUseLiveLocation={handleUseLiveLocation}
          onSubmit={() => void handleSubmitAddressForm()}
          isSaving={isSavingAddress}
          onBack={goBack}
        />
      ) : null}

      {step === "locating" ? (
        <LiveLocationStep
          state={liveLocationState}
          result={liveLocationResult}
          errorMessage={liveLocationError}
          onRequestPermission={handleRequestLocationPermission}
          onUseThisAddress={handleUseDetectedAddress}
          onEnterManually={() => setStep("new-address")}
          onBack={goBack}
        />
      ) : null}

      {step === "checkout" && selectedAddress ? (
        <CheckoutSummaryStep
          deliveryDetails={selectedAddress}
          onChangeAddress={goBack}
          deliveryType={deliveryType}
          deliveryChargePaise={deliveryChargePaise}
          items={summaryItems}
          subtotalPaise={subtotalPaise}
          discountPaise={discountPaise}
          grandTotalPaise={grandTotalPaise}
          paymentMethod={paymentMethod}
          onPaymentMethodChange={setPaymentMethod}
          onPlaceOrder={() => void placeOrder()}
          isProcessing={isProcessingPayment}
          error={error}
          onBack={goBack}
          couponCode={couponInput}
          onCouponCodeChange={setCouponInput}
          onApplyCoupon={() => void applyCoupon()}
          onRemoveCoupon={removeCoupon}
          couponError={couponError}
          applyingCoupon={applyingCoupon}
          appliedCouponCode={appliedCoupon?.code ?? null}
        />
      ) : null}
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
