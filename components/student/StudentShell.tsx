"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { CalendarDaysIcon, CompassIcon, LayoutDashboardIcon } from "lucide-react"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarSeparator,
} from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"

interface StudentShellProps {
  children: React.ReactNode
  onSignOut: () => void
}

const items = [
  {
    title: "Overview",
    href: "/student",
    icon: LayoutDashboardIcon,
  },
  {
    title: "Explore Studios",
    href: "/student/explore",
    icon: CompassIcon,
  },
  {
    title: "My Bookings",
    href: "/student/bookings",
    icon: CalendarDaysIcon,
  },
]

export function StudentShell({ children, onSignOut }: StudentShellProps) {
  const pathname = usePathname()

  return (
    <SidebarProvider defaultOpen>
      <Sidebar variant="sidebar" collapsible="none">
        <SidebarHeader>
          <div className="flex items-center justify-between px-2 py-1">
            <div>
              <p className="text-sm font-semibold">MyPass</p>
              <p className="text-xs text-muted-foreground">Student Dashboard</p>
            </div>
          </div>
        </SidebarHeader>
        <SidebarSeparator />
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>Menu</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {items.map((item) => (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton asChild isActive={pathname === item.href}>
                      <Link href={item.href}>
                        <item.icon />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
        <SidebarSeparator />
        <SidebarFooter>
          <form action={onSignOut}>
            <Button variant="outline" className="w-full justify-start">
              Sign Out
            </Button>
          </form>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <header className="flex h-14 items-center border-b bg-background px-4">
          <p className="text-sm text-muted-foreground">Student</p>
        </header>
        <div className="flex-1 p-6">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  )
}
