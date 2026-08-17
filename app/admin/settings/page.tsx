"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { CheckCircle2, Settings2, XCircle } from "lucide-react"

import { useOrderAlerts } from "@/components/admin/order-alerts/order-alerts-context"
import { Badge } from "@/components/ui/badge"
import { Button, buttonVariants } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { adminFetch } from "@/lib/admin-fetch"
import type { StoreSettings } from "@/lib/settings-server"
import { cn } from "@/lib/utils"

type AdminUser = { uid: string; email: string | null; createdAt: string }

export default function AdminSettingsPage() {
  return (
    <main className="w-full px-4 py-8 sm:px-6 lg:px-8">
      <div className="flex items-center gap-3">
        <Settings2 className="size-6 text-primary" />
        <h1 className="font-heading text-3xl font-medium">Settings</h1>
      </div>

      <Tabs defaultValue="store" className="mt-6">
        <TabsList>
          <TabsTrigger value="store">Store</TabsTrigger>
          <TabsTrigger value="delivery">Delivery</TabsTrigger>
          <TabsTrigger value="payment">Payment</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="admins">Admin Users</TabsTrigger>
        </TabsList>

        <TabsContent value="store" className="mt-4">
          <StoreSettingsForm />
        </TabsContent>
        <TabsContent value="delivery" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Delivery Settings</CardTitle>
              <CardDescription>Pincodes, delivery types, and fees are managed on the Delivery Zones page.</CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/admin/delivery-zones" className={cn(buttonVariants({ variant: "outline" }), "gap-2")}>
                Open Delivery Zones
              </Link>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="payment" className="mt-4">
          <PaymentSettingsStatus />
        </TabsContent>
        <TabsContent value="notifications" className="mt-4">
          <NotificationSettings />
        </TabsContent>
        <TabsContent value="admins" className="mt-4">
          <AdminUsersList />
        </TabsContent>
      </Tabs>
    </main>
  )
}

function StoreSettingsForm() {
  const [settings, setSettings] = useState<StoreSettings | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => {
      void (async () => {
        try {
          const response = await adminFetch("/api/admin/settings/store", { cache: "no-store" })
          const payload = (await response.json()) as { settings?: StoreSettings }
          setSettings(payload.settings ?? null)
        } catch {
          setSettings(null)
        } finally {
          setLoading(false)
        }
      })()
    }, 0)
    return () => clearTimeout(timer)
  }, [])

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    if (!settings) {
      return
    }

    setSaving(true)
    setError("")
    setSaved(false)

    try {
      const response = await adminFetch("/api/admin/settings/store", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: settings.name,
          address: settings.address,
          phone: settings.phone,
          email: settings.email,
        }),
      })
      const payload = (await response.json()) as { settings?: StoreSettings; error?: string }

      if (!response.ok || !payload.settings) {
        throw new Error(payload.error ?? "Unable to save store settings.")
      }

      setSettings(payload.settings)
      setSaved(true)
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Unable to save store settings.")
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <p className="text-sm text-muted-foreground">Loading...</p>
  }

  if (!settings) {
    return <p className="text-sm text-destructive">Unable to load store settings.</p>
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Store Settings</CardTitle>
        <CardDescription>Shown across the storefront (contact page, footer).</CardDescription>
      </CardHeader>
      <CardContent>
        <form className="grid gap-4" onSubmit={handleSubmit}>
          <div className="grid gap-2">
            <Label htmlFor="store-name">Store name</Label>
            <Input id="store-name" value={settings.name} onChange={(event) => setSettings({ ...settings, name: event.target.value })} />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="store-address">Address</Label>
            <Input id="store-address" value={settings.address} onChange={(event) => setSettings({ ...settings, address: event.target.value })} />
          </div>
          <div className="grid gap-2 sm:grid-cols-2 sm:gap-4">
            <div className="grid gap-2">
              <Label htmlFor="store-phone">Phone</Label>
              <Input id="store-phone" value={settings.phone} onChange={(event) => setSettings({ ...settings, phone: event.target.value })} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="store-email">Email</Label>
              <Input id="store-email" type="email" value={settings.email} onChange={(event) => setSettings({ ...settings, email: event.target.value })} />
            </div>
          </div>
          {error ? <p className="text-sm text-destructive">{error}</p> : null}
          {saved ? <p className="text-sm text-success">Saved.</p> : null}
          <Button type="submit" disabled={saving} className="w-fit">
            {saving ? "Saving..." : "Save Changes"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}

function PaymentSettingsStatus() {
  const [status, setStatus] = useState<{ razorpayConfigured: boolean; codEnabled: boolean } | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      void (async () => {
        try {
          const response = await adminFetch("/api/admin/settings/payment-status", { cache: "no-store" })
          setStatus(await response.json())
        } catch {
          setStatus(null)
        } finally {
          setLoading(false)
        }
      })()
    }, 0)
    return () => clearTimeout(timer)
  }, [])

  return (
    <Card>
      <CardHeader>
        <CardTitle>Payment Settings</CardTitle>
        <CardDescription>Read-only status - keys and secrets are never sent to the browser.</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-3">
        {loading ? (
          <p className="text-sm text-muted-foreground">Loading...</p>
        ) : status ? (
          <>
            <StatusRow label="Razorpay" configured={status.razorpayConfigured} />
            <StatusRow label="Cash on Delivery" configured={status.codEnabled} />
          </>
        ) : (
          <p className="text-sm text-destructive">Unable to load payment status.</p>
        )}
      </CardContent>
    </Card>
  )
}

function StatusRow({ label, configured }: { label: string; configured: boolean }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-2xl border border-border p-3">
      <span className="font-medium">{label}</span>
      <Badge variant={configured ? "default" : "secondary"} className="gap-1">
        {configured ? <CheckCircle2 className="size-3.5" /> : <XCircle className="size-3.5" />}
        {configured ? "Configured" : "Not configured"}
      </Badge>
    </div>
  )
}

function NotificationSettings() {
  const { muted, toggleMuted, soundEnabled, enableSound } = useOrderAlerts()

  return (
    <Card>
      <CardHeader>
        <CardTitle>Notification Settings</CardTitle>
        <CardDescription>Controls the new-order alert bell across the admin dashboard.</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-3">
        <div className="flex items-center justify-between gap-3 rounded-2xl border border-border p-3">
          <div>
            <p className="font-medium">Order alert sound</p>
            <p className="text-xs text-muted-foreground">{soundEnabled ? "Enabled for this browser" : "Not enabled yet"}</p>
          </div>
          {!soundEnabled ? (
            <Button size="sm" onClick={() => void enableSound()}>
              Enable
            </Button>
          ) : (
            <Badge>Enabled</Badge>
          )}
        </div>
        <div className="flex items-center justify-between gap-3 rounded-2xl border border-border p-3">
          <div>
            <p className="font-medium">Mute alerts</p>
            <p className="text-xs text-muted-foreground">{muted ? "Alerts are muted" : "Alerts are audible"}</p>
          </div>
          <Button size="sm" variant="outline" onClick={toggleMuted}>
            {muted ? "Unmute" : "Mute"}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

function AdminUsersList() {
  const [admins, setAdmins] = useState<AdminUser[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      void (async () => {
        try {
          const response = await adminFetch("/api/admin/settings/admins", { cache: "no-store" })
          const payload = (await response.json()) as { admins?: AdminUser[] }
          setAdmins(payload.admins ?? [])
        } catch {
          setAdmins([])
        } finally {
          setLoading(false)
        }
      })()
    }, 0)
    return () => clearTimeout(timer)
  }, [])

  return (
    <Card>
      <CardHeader>
        <CardTitle>Admin Users</CardTitle>
        <CardDescription>Firebase accounts with the admin claim. Grant access via `pnpm bootstrap:admin`.</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-2">
        {loading ? (
          <p className="text-sm text-muted-foreground">Loading...</p>
        ) : admins.length > 0 ? (
          admins.map((admin) => (
            <div key={admin.uid} className="flex items-center justify-between gap-3 rounded-2xl border border-border p-3">
              <span className="font-medium">{admin.email ?? admin.uid}</span>
              <span className="text-xs text-muted-foreground">
                Since {new Intl.DateTimeFormat("en-IN", { dateStyle: "medium" }).format(new Date(admin.createdAt))}
              </span>
            </div>
          ))
        ) : (
          <p className="text-sm text-muted-foreground">No admin users found.</p>
        )}
      </CardContent>
    </Card>
  )
}
