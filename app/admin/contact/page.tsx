"use client"

import { useEffect, useState } from "react"
import { Mail } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { adminFetch } from "@/lib/admin-fetch"
import type { ContactInquiry } from "@/lib/contact-server"

function formatDate(iso: string) {
  return new Intl.DateTimeFormat("en-IN", { dateStyle: "medium", timeStyle: "short" }).format(new Date(iso))
}

export default function AdminContactPage() {
  const [inquiries, setInquiries] = useState<ContactInquiry[]>([])
  const [loading, setLoading] = useState(true)

  async function loadInquiries() {
    setLoading(true)

    try {
      const response = await adminFetch("/api/admin/contact", { cache: "no-store" })
      const payload = (await response.json()) as { inquiries?: ContactInquiry[] }
      setInquiries(payload.inquiries ?? [])
    } catch {
      setInquiries([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const timer = setTimeout(() => void loadInquiries(), 0)
    return () => clearTimeout(timer)
  }, [])

  async function markRead(id: string) {
    await adminFetch(`/api/admin/contact/${id}`, { method: "PATCH" })
    void loadInquiries()
  }

  return (
    <main className="w-full px-4 py-8 sm:px-6 lg:px-8">
      <div className="flex items-center gap-3">
        <Mail className="size-6 text-primary" />
        <h1 className="font-heading text-3xl font-medium">Contact Messages</h1>
      </div>
      <p className="mt-2 max-w-2xl text-sm text-muted-foreground">Submissions from the storefront contact form.</p>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>All Messages</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-hidden rounded-2xl border border-border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>From</TableHead>
                  <TableHead>Message</TableHead>
                  <TableHead>Received</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={4} className="py-10 text-center text-muted-foreground">
                      Loading messages...
                    </TableCell>
                  </TableRow>
                ) : inquiries.length > 0 ? (
                  inquiries.map((inquiry) => (
                    <TableRow key={inquiry.id} className={inquiry.status === "NEW" ? "bg-primary/5" : undefined} onClick={() => inquiry.status === "NEW" && void markRead(inquiry.id)}>
                      <TableCell>
                        <div className="font-medium">{inquiry.name}</div>
                        <div className="text-xs text-muted-foreground">{inquiry.phone}</div>
                      </TableCell>
                      <TableCell className="max-w-sm truncate">{inquiry.message}</TableCell>
                      <TableCell className="text-muted-foreground">{formatDate(inquiry.createdAt)}</TableCell>
                      <TableCell>
                        <Badge variant={inquiry.status === "NEW" ? "default" : "secondary"}>{inquiry.status}</Badge>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} className="py-10 text-center text-muted-foreground">
                      No messages yet.
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
