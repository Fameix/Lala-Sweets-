import Image from "next/image"

import { SidebarMenu, SidebarMenuItem } from "@/components/ui/sidebar"

export function SidebarBrand() {
  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <div className="flex items-center gap-2 px-2 py-1.5">
          <div className="flex aspect-square size-8 shrink-0 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
            <Image
              src="/images/lala-sweets-header-logo-transparent.png"
              alt=""
              width={28}
              height={28}
              className="size-7 object-contain"
            />
          </div>
          <div className="grid flex-1 text-left leading-tight">
            <span className="truncate font-heading text-sm font-semibold tracking-wide">Lala Sweets</span>
            <span className="truncate text-xs text-muted-foreground">Admin Dashboard</span>
          </div>
        </div>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
