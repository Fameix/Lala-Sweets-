import Link from "next/link"

import { OrderDetailsContent } from "@/components/commerce/order-details-content"
import { StorefrontShell } from "@/components/layout/storefront-shell"
import { getOrderRecordByOrderId } from "@/lib/orders-server"

export default async function AccountOrderDetailPage(props: PageProps<"/account/orders/[orderNumber]">) {
  const { orderNumber } = await props.params
  const order = await getOrderRecordByOrderId(orderNumber)

  return (
    <StorefrontShell>
      <main className="mx-auto max-w-5xl px-4 py-8">
        <h1 className="font-heading text-3xl font-medium">Order Details</h1>
        {order ? (
          <div className="mt-6">
            <OrderDetailsContent order={order} />
          </div>
        ) : (
          <div className="mt-6 grid gap-3">
            <p className="text-sm text-muted-foreground">
              We couldn&apos;t find an order with ID {orderNumber}.
            </p>
            <Link href="/menu" className="text-sm text-primary underline underline-offset-4">
              Browse Menu
            </Link>
          </div>
        )}
      </main>
    </StorefrontShell>
  )
}
