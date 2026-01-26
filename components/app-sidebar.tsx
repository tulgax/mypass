"use client"

import * as React from "react"
import { Link } from "@/i18n/routing"
import type { LucideIcon } from "lucide-react"
import type { Locale } from "@/i18n/routing"

import { NavMain } from "@/components/nav-main"
import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar"

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  locale: Locale
  navItems?: {
    title: string
    url: string
    icon?: LucideIcon
    isActive?: boolean
    items?: {
      title: string
      url: string
    }[]
  }[]
  user: {
    name: string
    email: string
    avatar?: string
  }
  studioName?: string | null
  onSignOut?: () => void
}

/**
 * App Sidebar Component
 * 
 * Main sidebar navigation for the dashboard application.
 * Uses locale-aware Link component from next-intl.
 */
export function AppSidebar({
  locale,
  navItems = [],
  user,
  studioName,
  onSignOut,
  ...props
}: AppSidebarProps) {
  return (
    <Sidebar variant="inset" collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link href="/studio/overview">
                <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                  <span className="text-lg font-bold">M</span>
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">
                    {studioName || "MyPass"}
                  </span>
                  <span className="truncate text-xs">Studio Dashboard</span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={navItems} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={{ ...user, avatar: user.avatar ?? "" }} onSignOut={onSignOut} />
      </SidebarFooter>
      {/* <SidebarRail /> */}
    </Sidebar>
  )
}
