"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { ShieldAlert } from "lucide-react"

import { AppSidebar } from "@/components/app-sidebar"
import { OrderAlertsBell } from "@/components/admin/order-alerts/order-alerts-bell"
import { OrderAlertsProvider } from "@/components/admin/order-alerts/order-alerts-context"
import { Separator } from "@/components/ui/separator"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { Skeleton } from "@/components/ui/skeleton"
import { Toaster } from "@/components/ui/sonner"
import { TooltipProvider } from "@/components/ui/tooltip"
import { AdminAuthProvider, useAdminAuth } from "@/lib/admin-auth-client"

function AdminGate({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const { user, isAdmin, loading } = useAdminAuth()

  // The login page renders its own layout - it must never be wrapped in the
  // sidebar shell, and it must render even while the auth state settles.
  if (pathname === "/admin/login") {
    return <>{children}</>
  }

  if (loading) {
    return (
      <div className="mx-auto flex min-h-svh max-w-6xl flex-col gap-4 px-4 py-8">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-64 w-full" />
      </div>
    )
  }

  if (!user || !isAdmin) {
    return (
      <div className="min-h-svh bg-background text-foreground">
        <div className="border-b border-border bg-card px-4 py-3">
          <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-2 text-sm text-muted-foreground">
            <ShieldAlert className="size-4" />
            <span>Admin sign-in required.</span>
            <Link href="/admin/login" className="font-medium text-primary underline underline-offset-4">
              Sign in
            </Link>
            <Link href="/" className="font-medium text-primary underline underline-offset-4">
              Back to storefront
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <TooltipProvider>
      <OrderAlertsProvider>
        <SidebarProvider>
          <AppSidebar adminEmail={user.email ?? ""} />
          <SidebarInset>
            <header className="flex h-14 shrink-0 items-center gap-2 border-b bg-background/95 px-4 backdrop-blur">
              <SidebarTrigger className="-ml-1" />
              <Separator orientation="vertical" className="mr-2 data-vertical:h-4" />
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold">Lala Sweets Admin</p>
                <p className="truncate text-xs text-muted-foreground">Backend operations dashboard</p>
              </div>
              <OrderAlertsBell />
            </header>
            {children}
          </SidebarInset>
        </SidebarProvider>
        <Toaster />
      </OrderAlertsProvider>
    </TooltipProvider>
  )
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AdminAuthProvider>
      <AdminGate>{children}</AdminGate>
    </AdminAuthProvider>
  )
}
