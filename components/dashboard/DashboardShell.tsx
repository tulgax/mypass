"use client"

import { usePathname } from "next/navigation"
import {
  CalendarDays,
  LayoutGrid,
  Users,
  Settings,
  FolderOpen,
  Bell,
} from "lucide-react"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import { NavMain } from "@/components/nav-main"
import { NavUser } from "@/components/nav-user"
import { AppSidebar } from "@/components/app-sidebar"

interface DashboardShellProps {
  children: React.ReactNode
  hasStudio: boolean
  onSignOut: () => void
  user?: {
    name: string
    email: string
    avatar?: string
  }
}

export function DashboardShell({ children, hasStudio, onSignOut, user }: DashboardShellProps) {
  const pathname = usePathname()

  const defaultUser = {
    name: user?.name || "Studio Owner",
    email: user?.email || "owner@example.com",
    avatar: user?.avatar || "",
  }

  // Navigation items for MyPass dashboard
  const navItems = [
    {
      title: "Overview",
      url: "/dashboard",
      icon: LayoutGrid,
      isActive: pathname === "/dashboard",
    },
    {
      title: "Schedule",
      url: "/dashboard/schedule",
      icon: CalendarDays,
      isActive: pathname === "/dashboard/schedule",
    },
    {
      title: "Catalog",
      url: "/dashboard/classes",
      icon: FolderOpen,
      isActive: pathname?.startsWith("/dashboard/classes"),
      items: [
        {
          title: "Classes",
          url: "/dashboard/classes",
        },
      ],
    },
    {
      title: "Clients",
      url: "/dashboard/bookings",
      icon: Users,
      isActive: pathname === "/dashboard/bookings",
    },
    {
      title: "Settings",
      url: "#",
      icon: Settings,
      items: [
        {
          title: "Studio Settings",
          url: "/dashboard/studio/new",
        },
        {
          title: "Account",
          url: "#",
        },
      ],
    },
  ]

  return (
    <SidebarProvider>
      <AppSidebar navItems={navItems} user={defaultUser} onSignOut={onSignOut} />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator
              orientation="vertical"
              className="mr-2 data-[orientation=vertical]:h-4"
            />
            <div className="flex flex-col">
              <h1 className="text-lg font-semibold leading-none">
                {pathname === "/dashboard" && "Overview"}
                {pathname === "/dashboard/schedule" && "Schedule"}
                {pathname === "/dashboard/classes" && "Classes"}
                {pathname === "/dashboard/bookings" && "Clients"}
                {pathname?.startsWith("/dashboard/classes/new") && "Create Class"}
                {pathname?.startsWith("/dashboard/studio/new") && "Studio Settings"}
              </h1>
              {pathname !== "/dashboard" && (
                <span className="text-xs text-muted-foreground mt-1">
                  {pathname === "/dashboard/schedule" && "Manage your class schedule"}
                  {pathname === "/dashboard/classes" && "Manage your classes"}
                  {pathname === "/dashboard/bookings" && "View all bookings"}
                </span>
              )}
            </div>
          </div>
          <div className="ml-auto flex items-center gap-2 px-4">
            <Button variant="ghost" size="icon" className="h-8 w-8 relative">
              <Bell className="h-4 w-4" />
              <span className="sr-only">Notifications</span>
              <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-primary" />
            </Button>
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}