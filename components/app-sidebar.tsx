"use client"

import * as React from "react"
import {
  BadgePercent,
  Bell,
  BarChart3,
  ClipboardList,
  FolderTree,
  LineChart,
  MapPinned,
  Package,
  Radio,
  Settings2,
  Star,
  Truck,
  Users,
  Warehouse,
  WalletCards,
} from "lucide-react"

import { NavGroup } from "@/components/nav-group"
import { NavUser } from "@/components/nav-user"
import { SidebarBrand } from "@/components/sidebar-brand"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar"

const data = {
  user: {
    name: "Admin",
    email: "Super Admin",
    avatar: "/images/lala-sweets-header-logo-transparent.png",
  },
  groups: [
    {
      title: "Main",
      items: [
        { title: "Dashboard", url: "/admin", icon: <BarChart3 /> },
        { title: "Orders", url: "/admin/orders", icon: <ClipboardList /> },
      ],
    },
    {
      title: "Catalog",
      items: [
        { title: "Products", url: "/admin/products", icon: <Package /> },
        { title: "Categories", url: "/admin/categories", icon: <FolderTree /> },
        { title: "Inventory", url: "/admin/inventory", icon: <Warehouse /> },
        { title: "Offers & Coupons", url: "/admin/coupons", icon: <BadgePercent /> },
      ],
    },
    {
      title: "Delivery",
      items: [
        { title: "Delivery Partners", url: "/admin/delivery-partners", icon: <Truck /> },
        { title: "Live Deliveries", url: "/admin/live-deliveries", icon: <Radio /> },
        { title: "Delivery Zones", url: "/admin/delivery-zones", icon: <MapPinned /> },
      ],
    },
    {
      title: "Customers",
      items: [
        { title: "Customers", url: "/admin/customers", icon: <Users /> },
        { title: "Reviews", url: "/admin/reviews", icon: <Star /> },
      ],
    },
    {
      title: "Payments",
      items: [{ title: "Payments", url: "/admin/payments", icon: <WalletCards /> }],
    },
    {
      title: "Insights",
      items: [{ title: "Analytics", url: "/admin/analytics", icon: <LineChart /> }],
    },
    {
      title: "System",
      items: [
        { title: "Notifications", url: "/admin/notifications", icon: <Bell /> },
        { title: "Settings", url: "/admin/settings", icon: <Settings2 /> },
      ],
    },
  ],
}

export function AppSidebar({
  adminEmail,
  ...props
}: React.ComponentProps<typeof Sidebar> & { adminEmail?: string }) {
  return (
    <Sidebar collapsible="icon" variant="inset" {...props}>
      <SidebarHeader>
        <SidebarBrand />
      </SidebarHeader>
      <SidebarContent>
        {data.groups.map((group) => (
          <NavGroup key={group.title} title={group.title} items={group.items} />
        ))}
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={{ ...data.user, email: adminEmail || data.user.email }} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
