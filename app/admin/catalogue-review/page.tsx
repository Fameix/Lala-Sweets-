import { FoodTypeBadge } from "@/components/commerce/food-type-badge"
import { PriceStatusBadge } from "@/components/commerce/price-status-badge"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { formatProductPrice, getProducts, isCakeReadyToPublish } from "@/lib/catalogue"

export default function CatalogueReviewPage() {
  const products = getProducts()

  return (
    <main className="mx-auto max-w-7xl px-4 py-8">
      <h1 className="font-heading text-3xl font-medium">Catalogue Review</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Review extracted products before enabling public ordering. Prices must be entered manually by authorized staff.
      </p>
      <div className="mt-6 overflow-hidden rounded-2xl border border-border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Product</TableHead>
              <TableHead>Source</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Food</TableHead>
              <TableHead>Cake Config</TableHead>
              <TableHead>Image</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.map((product) => (
              <TableRow key={product.id}>
                <TableCell className="font-medium">{product.display_name}</TableCell>
                <TableCell>{product.source_name}</TableCell>
                <TableCell>
                  <div>{product.normalized_category}</div>
                  <div className="text-xs text-muted-foreground">Source: {product.source_category}</div>
                </TableCell>
                <TableCell>
                  <div>{formatProductPrice(product)}</div>
                  <div className="mt-1"><PriceStatusBadge product={product} /></div>
                </TableCell>
                <TableCell><FoodTypeBadge foodType={product.food_type} /></TableCell>
                <TableCell>
                  {product.product_type === "cake" ? (
                    <div className="grid gap-1 text-xs text-muted-foreground">
                      <span>{product.subcategory}</span>
                      <span>Flavour: {product.flavour}</span>
                      <span>Weights: {product.available_weights?.length ?? 0}</span>
                      <span>Egg options: {product.cake_type_options?.filter((option) => option.is_available).length ?? 0}</span>
                      <span>Prep: {product.preparation_minutes ?? "missing"}</span>
                    </div>
                  ) : (
                    <span className="text-xs text-muted-foreground">Not a cake</span>
                  )}
                </TableCell>
                <TableCell><Badge variant="outline">{product.image_status}</Badge></TableCell>
                <TableCell>
                  <div className="grid gap-1">
                    <Badge variant={product.verification_status === "needs-review" ? "outline" : "secondary"}>
                      {product.verification_status}
                    </Badge>
                    {product.product_type === "cake" ? (
                      <Badge variant={isCakeReadyToPublish(product) ? "secondary" : "outline"}>
                        {isCakeReadyToPublish(product) ? "Ready to publish" : "Not orderable"}
                      </Badge>
                    ) : null}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </main>
  )
}
