"use client"

import { useEffect, useState } from "react"
import { Star, StarOff } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { adminFetch } from "@/lib/admin-fetch"
import type { Review } from "@/lib/reviews-server"

function formatDate(iso: string) {
  return new Intl.DateTimeFormat("en-IN", { dateStyle: "medium" }).format(new Date(iso))
}

function Stars({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5 text-warning">
      {Array.from({ length: 5 }).map((_, index) => (
        <Star key={index} className={index < rating ? "size-3.5 fill-current" : "size-3.5 text-muted-foreground"} />
      ))}
    </div>
  )
}

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)

  async function loadReviews() {
    setLoading(true)

    try {
      const response = await adminFetch("/api/admin/reviews", { cache: "no-store" })
      const payload = (await response.json()) as { reviews?: Review[] }
      setReviews(payload.reviews ?? [])
    } catch {
      setReviews([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const timer = setTimeout(() => void loadReviews(), 0)
    return () => clearTimeout(timer)
  }, [])

  async function toggleVisibility(review: Review) {
    await adminFetch(`/api/admin/reviews/${review.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ hidden: !review.hidden }),
    })
    await loadReviews()
  }

  return (
    <main className="w-full px-4 py-8 sm:px-6 lg:px-8">
      <div className="flex items-center gap-3">
        <Star className="size-6 text-primary" />
        <h1 className="font-heading text-3xl font-medium">Reviews</h1>
      </div>
      <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
        Customer reviews submitted for products. Hidden reviews are not shown on the storefront.
      </p>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>All Reviews</CardTitle>
          <CardDescription>
            {loading || reviews.length > 0
              ? "Newest first."
              : "No reviews have been submitted yet — they'll appear here once customers leave one."}
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Customer</TableHead>
                  <TableHead>Rating</TableHead>
                  <TableHead>Review</TableHead>
                  <TableHead>Product</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="py-10 text-center text-muted-foreground">
                      Loading reviews...
                    </TableCell>
                  </TableRow>
                ) : reviews.length > 0 ? (
                  reviews.map((review) => (
                    <TableRow key={review.id}>
                      <TableCell className="font-medium">{review.customerName}</TableCell>
                      <TableCell>
                        <Stars rating={review.rating} />
                      </TableCell>
                      <TableCell className="max-w-sm truncate text-muted-foreground">{review.comment}</TableCell>
                      <TableCell>{review.productName ?? "—"}</TableCell>
                      <TableCell className="text-muted-foreground">{formatDate(review.createdAt)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Badge variant={review.hidden ? "secondary" : "default"}>
                            {review.hidden ? "Hidden" : "Visible"}
                          </Badge>
                          <Button variant="outline" size="sm" onClick={() => void toggleVisibility(review)}>
                            {review.hidden ? <Star className="size-3.5" /> : <StarOff className="size-3.5" />}
                            {review.hidden ? "Show" : "Hide"}
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="py-10 text-center text-muted-foreground">
                      No reviews yet.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </main>
  )
}
