import Link from "next/link"
import { LockKeyhole } from "lucide-react"

import { buttonVariants } from "@/components/ui/button"
import { canPreviewAdmin } from "@/server/auth/admin"
import { cn } from "@/lib/utils"

const adminLinks = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/catalogue-review", label: "Catalogue Review" },
  { href: "/admin/products", label: "Products" },
  { href: "/admin/orders", label: "Orders" },
  { href: "/admin/settings", label: "Settings" },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  if (!canPreviewAdmin()) {
    return (
      <main className="flex min-h-svh items-center justify-center bg-background px-4 text-foreground">
        <div className="max-w-md rounded-2xl border border-border bg-card p-6 text-center">
          <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-muted">
            <LockKeyhole className="size-5" />
          </div>
          <h1 className="mt-5 font-heading text-2xl font-medium">Admin access is protected</h1>
          <p className="mt-3 text-sm leading-6 text-muted-foreground">
            Supabase role-based auth is not connected yet. Set ADMIN_PREVIEW_ENABLED=true only for local catalogue review.
          </p>
          <Link href="/" className={cn(buttonVariants({ variant: "outline" }), "mt-6")}>
            Back to storefront
          </Link>
        </div>
      </main>
    )
  }

  return (
    <div className="min-h-svh bg-background text-foreground">
      <aside className="fixed inset-y-0 left-0 hidden w-64 border-r border-border bg-card p-4 md:block">
        <Link href="/admin" className="font-heading text-lg font-medium">
          Master Bakery Admin
        </Link>
        <nav className="mt-6 grid gap-1">
          {adminLinks.map((link) => (
            <Link key={link.href} href={link.href} className={cn(buttonVariants({ variant: "ghost" }), "justify-start")}>
              {link.label}
            </Link>
          ))}
        </nav>
      </aside>
      <div className="md:pl-64">{children}</div>
    </div>
  )
}
