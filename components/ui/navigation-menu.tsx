"use client"

import { NavigationMenu as NavigationMenuPrimitive } from "@base-ui/react/navigation-menu"

import { cn } from "@/lib/utils"

function NavigationMenu({
  className,
  children,
  ...props
}: React.ComponentPropsWithRef<typeof NavigationMenuPrimitive.Root>) {
  return (
    <NavigationMenuPrimitive.Root
      data-slot="navigation-menu"
      className={cn("group/navigation-menu relative flex flex-1 items-center justify-center", className)}
      {...props}
    >
      {children}
    </NavigationMenuPrimitive.Root>
  )
}

function NavigationMenuList({
  className,
  ...props
}: React.ComponentPropsWithRef<typeof NavigationMenuPrimitive.List>) {
  return (
    <NavigationMenuPrimitive.List
      data-slot="navigation-menu-list"
      className={cn("flex flex-1 list-none items-center justify-center gap-1", className)}
      {...props}
    />
  )
}

function NavigationMenuItem({
  className,
  ...props
}: React.ComponentPropsWithRef<typeof NavigationMenuPrimitive.Item>) {
  return (
    <NavigationMenuPrimitive.Item
      data-slot="navigation-menu-item"
      className={cn("relative", className)}
      {...props}
    />
  )
}

function NavigationMenuLink({
  className,
  ...props
}: React.ComponentPropsWithRef<typeof NavigationMenuPrimitive.Link>) {
  return (
    <NavigationMenuPrimitive.Link
      data-slot="navigation-menu-link"
      className={cn(
        "inline-flex items-center rounded-full px-4 py-2 text-sm font-medium text-muted-foreground transition-colors outline-none hover:bg-muted hover:text-foreground focus:bg-muted focus:text-foreground focus-visible:ring-[3px] focus-visible:ring-ring/30",
        className,
      )}
      {...props}
    />
  )
}

export { NavigationMenu, NavigationMenuItem, NavigationMenuLink, NavigationMenuList }
