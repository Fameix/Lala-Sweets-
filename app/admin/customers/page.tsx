"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { Users } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { adminFetch } from "@/lib/admin-fetch"
import type { CustomerSummary } from "@/lib/customers-server"

function formatPrice(paise: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(paise / 100)
}

function formatDate(iso: string) {
  return new Intl.DateTimeFormat("en-IN", { dateStyle: "medium" }).format(new Date(iso))
}

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState<CustomerSummary[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")

  useEffect(() => {
    const timer = setTimeout(() => {
      void (async () => {
        try {
          const response = await adminFetch("/api/admin/customers", { cache: "no-store" })
          const payload = (await response.json()) as { customers?: CustomerSummary[] }
          setCustomers(payload.customers ?? [])
        } catch {
          setCustomers([])
        } finally {
          setLoading(false)
        }
      })()
    }, 0)
    return () => clearTimeout(timer)
  }, [])

  const filtered = customers.filter(
    (customer) =>
      customer.name.toLowerCase().includes(search.trim().toLowerCase()) ||
      customer.mobile.includes(search.trim()),
  )

  return (
    <main className="w-full px-4 py-8 sm:px-6 lg:px-8">
      <div className="flex items-center gap-3">
        <Users className="size-6 text-primary" />
        <h1 className="font-heading text-3xl font-medium">Customers</h1>
      </div>
      <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
        Aggregated from order history — grouped by phone number, since checkout is guest-first.
      </p>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>All Customers</CardTitle>
          <Input placeholder="Search by name or phone" value={search} onChange={(event) => setSearch(event.target.value)} className="mt-2 max-w-sm" />
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Customer</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Total Orders</TableHead>
                  <TableHead>Total Spent</TableHead>
                  <TableHead>Last Order</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="py-10 text-center text-muted-foreground">
                      Loading customers...
                    </TableCell>
                  </TableRow>
                ) : filtered.length > 0 ? (
                  filtered.map((customer) => (
                    <TableRow key={customer.mobile}>
                      <TableCell className="font-medium">
                        <Link href={`/admin/customers/${encodeURIComponent(customer.mobile)}`} className="hover:underline">
                          {customer.name}
                        </Link>
                      </TableCell>
                      <TableCell>{customer.mobile}</TableCell>
                      <TableCell>{customer.totalOrders}</TableCell>
                      <TableCell>{formatPrice(customer.totalSpentPaise)}</TableCell>
                      <TableCell className="text-muted-foreground">{formatDate(customer.lastOrderAt)}</TableCell>
                      <TableCell>
                        <Badge variant={customer.status === "Active" ? "default" : "secondary"}>{customer.status}</Badge>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="py-10 text-center text-muted-foreground">
                      No customers yet.
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
