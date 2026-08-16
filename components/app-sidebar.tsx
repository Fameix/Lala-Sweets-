"use client"

import * as React from "react"
import {
  BadgePercent,
  BarChart3,
  Boxes,
  ClipboardList,
  FolderTree,
  Package,
  Settings2,
  Truck,
  Users,
  WalletCards,
  Warehouse,
} from "lucide-react"

import { NavMain } from "@/components/nav-main"
import { NavProjects } from "@/components/nav-projects"
import { NavUser } from "@/components/nav-user"
import { TeamSwitcher } from "@/components/team-switcher"
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
  teams: [
    {
      name: "Sri Lakshmivilas",
      logo: "/images/lala-sweets-header-logo-transparent.png",
      plan: "Purathana Lala Sweets",
    },
  ],
  navMain: [
    {
      title: "Dashboard",
      url: "/admin",
      icon: <BarChart3 />,
      isActive: true,
      items: [
        { title: "Overview", url: "/admin" },
        { title: "Reports", url: "/admin/reports" },
      ],
    },
    {
      title: "Orders",
      url: "/admin/orders",
      icon: <ClipboardList />,
      items: [
        { title: "All Orders", url: "/admin/orders" },
        { title: "Delivery Slots", url: "/admin/delivery-slots" },
        { title: "Delivery Zones", url: "/admin/delivery-zones" },
      ],
    },
    {
      title: "Products",
      url: "/admin/products",
      icon: <Package />,
      items: [
        { title: "All Products", url: "/admin/products" },
        { title: "New Product", url: "/admin/products/new" },
        { title: "Catalogue Review", url: "/admin/catalogue-review" },
        { title: "Categories", url: "/admin/categories" },
      ],
    },
    {
      title: "Customers",
      url: "/admin/customers",
      icon: <Users />,
      items: [
        { title: "Customer List", url: "/admin/customers" },
        { title: "Reviews", url: "/admin/reviews" },
        { title: "Custom Cakes", url: "/admin/custom-cakes" },
      ],
    },
  ],
  projects: [
    { name: "Inventory", url: "/admin/inventory", icon: <Warehouse /> },
    { name: "Couriers", url: "/admin/delivery-slots", icon: <Boxes /> },
    { name: "Delivery Partners", url: "/admin/delivery-partners", icon: <Truck /> },
    { name: "Offers & Coupons", url: "/admin/coupons", icon: <BadgePercent /> },
    { name: "Payments", url: "/admin/settings", icon: <WalletCards /> },
    { name: "Settings", url: "/admin/settings", icon: <Settings2 /> },
    { name: "Categories", url: "/admin/categories", icon: <FolderTree /> },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="icon" variant="inset" {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={data.teams} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavProjects projects={data.projects} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
