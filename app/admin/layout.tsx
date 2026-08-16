import Link from "next/link"
import { ShieldAlert } from "lucide-react"

import { AppSidebar } from "@/components/app-sidebar"
import { Separator } from "@/components/ui/separator"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { TooltipProvider } from "@/components/ui/tooltip"
import { canPreviewAdmin } from "@/server/auth/admin"

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  if (!canPreviewAdmin()) {
    return (
      <div className="min-h-svh bg-background text-foreground">
        <div className="border-b border-border bg-card px-4 py-3">
          <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-2 text-sm text-muted-foreground">
            <ShieldAlert className="size-4" />
            <span>Admin preview is disabled.</span>
            <Link href="/" className="font-medium text-primary underline underline-offset-4">
              Back to storefront
            </Link>
          </div>
        </div>
        {children}
      </div>
    )
  }

  return (
    <TooltipProvider>
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <header className="sticky top-0 z-20 flex h-14 shrink-0 items-center gap-2 border-b bg-background/95 px-4 backdrop-blur">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 data-vertical:h-4" />
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold">Lala Sweets Admin</p>
              <p className="truncate text-xs text-muted-foreground">Backend operations dashboard</p>
            </div>
          </header>
          {children}
        </SidebarInset>
      </SidebarProvider>
    </TooltipProvider>
  )
}
