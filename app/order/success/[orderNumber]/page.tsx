import { OrderSuccessContent } from "@/components/commerce/order-success-content"
import { StorefrontShell } from "@/components/layout/storefront-shell"
import { getOrderRecordByOrderId } from "@/lib/orders-server"

export default async function OrderSuccessPage(props: PageProps<"/order/success/[orderNumber]">) {
  const { orderNumber } = await props.params

  let order = null
  let loadError: string | null = null

  try {
    order = await getOrderRecordByOrderId(orderNumber)
  } catch (error) {
    loadError = error instanceof Error ? error.message : "Unable to load this order right now."
  }

  return (
    <StorefrontShell>
      <main className="mx-auto max-w-3xl px-4 py-8">
        <OrderSuccessContent order={order} orderId={orderNumber} loadError={loadError} />
      </main>
    </StorefrontShell>
  )
}
