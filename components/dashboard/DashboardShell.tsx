"use client"

import * as React from "react"
import { usePathname } from "@/i18n/routing"
import { Link } from "@/i18n/routing"
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
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { AppSidebar } from "@/components/app-sidebar"
import type { Locale } from "@/i18n/routing"

interface DashboardShellProps {
  children: React.ReactNode
  locale: Locale
  studioName?: string | null
  onSignOut: () => void
  user: {
    name: string
    email: string
    avatar?: string
  }
}

/**
 * Page titles and descriptions mapping
 */
const pageMetadata: Record<string, { title: string; description?: string }> = {
  "/studio/overview": { title: "Overview" },
  "/studio/schedule": {
    title: "Schedule",
    description: "Manage your class schedule",
  },
  "/studio/catalog/classes": {
    title: "Classes",
    description: "Manage your classes",
  },
  "/studio/catalog/plans": {
    title: "Plans",
    description: "Manage your subscription plans",
  },
  "/studio/catalog/coupons": {
    title: "Coupons",
    description: "Manage your discount coupons",
  },
  "/studio/catalog/orders": {
    title: "Orders",
    description: "View and manage all orders",
  },
  "/studio/catalog/classes/new": { title: "Create Class" },
  "/studio/clients": {
    title: "Clients",
    description: "View all bookings",
  },
  "/studio/settings/studio": { title: "Studio Settings" },
  "/studio/settings/account": { title: "Account" },
  "/studio/settings/payments": { title: "Payments" },
  "/studio/settings/policies": { title: "Policies" },
  "/studio/settings/availability": { title: "Availability" },
  "/studio/settings/billing": { title: "Plan & Billing" },
  "/studio/settings/team": { title: "Team" },
  "/studio/settings/integrations": { title: "Integrations" },
}

/**
 * Generate breadcrumb items from pathname
 */
function generateBreadcrumbs(pathname: string) {
  const breadcrumbs: Array<{ title: string; href?: string }> = []
  
  // Always start with Studio (links to overview)
  breadcrumbs.push({ title: "Studio", href: "/studio/overview" })
  
  // If we're on the overview page, return just Studio
  if (pathname === "/studio/overview") {
    return breadcrumbs
  }
  
  // Split pathname into segments
  const segments = pathname.split("/").filter(Boolean)
  
  // Remove "studio" from segments if present
  const relevantSegments = segments.filter(seg => seg !== "studio")
  
  // Build breadcrumbs from segments
  let currentPath = "/studio"
  
  for (let i = 0; i < relevantSegments.length; i++) {
    const segment = relevantSegments[i]
    currentPath += `/${segment}`
    
    // Check if this is the last segment (current page)
    const isLast = i === relevantSegments.length - 1
    
    // Special handling for "catalog" and "settings" segments
    let title: string
    if (segment === "catalog") {
      title = "Catalog"
    } else if (segment === "settings") {
      title = "Settings"
    } else {
      // Get title from metadata or generate from segment
      const metadata = pageMetadata[currentPath]
      title = metadata?.title || segment
        .split("-")
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ")
    }
    
    if (isLast) {
      // Last item is the current page (non-clickable)
      breadcrumbs.push({ title })
    } else {
      // Intermediate items are links
      breadcrumbs.push({ title, href: currentPath })
    }
  }
  
  return breadcrumbs
}

/**
 * Dashboard Shell Component
 * 
 * Provides the main layout structure for the dashboard including:
 * - Responsive sidebar navigation
 * - Header with page title
 * - Notification bell
 * - User profile in sidebar
 */
export function DashboardShell({
  children,
  locale,
  studioName,
  onSignOut,
  user,
}: DashboardShellProps) {
  // Get pathname without locale prefix (next-intl provides this)
  const pathname = usePathname()

  // Generate breadcrumbs from pathname
  const breadcrumbs = generateBreadcrumbs(pathname)

  // Navigation items for MyPass studio
  // URLs are relative (without locale) - next-intl Link handles locale
  const navItems = [
    {
      title: "Overview",
      url: "/studio/overview",
      icon: LayoutGrid,
      isActive: pathname === "/studio/overview",
    },
    {
      title: "Schedule",
      url: "/studio/schedule",
      icon: CalendarDays,
      isActive: pathname === "/studio/schedule",
    },
    {
      title: "Catalog",
      url: "/studio/catalog/classes",
      icon: FolderOpen,
      isActive: pathname.startsWith("/studio/catalog"),
      items: [
        {
          title: "Classes",
          url: "/studio/catalog/classes",
          isActive: pathname === "/studio/catalog/classes" || pathname.startsWith("/studio/catalog/classes/"),
        },
        {
          title: "Plans",
          url: "/studio/catalog/plans",
          isActive: pathname === "/studio/catalog/plans",
        },
        {
          title: "Membership",
          url: "/studio/catalog/membership",
          isActive: pathname === "/studio/catalog/membership" || pathname.startsWith("/studio/catalog/membership/"),
        },
        {
          title: "Coupons",
          url: "/studio/catalog/coupons",
          isActive: pathname === "/studio/catalog/coupons",
        },
        {
          title: "Orders",
          url: "/studio/catalog/orders",
          isActive: pathname === "/studio/catalog/orders" || pathname.startsWith("/studio/catalog/orders/"),
        },
      ],
    },
    {
      title: "Clients",
      url: "/studio/clients",
      icon: Users,
      isActive: pathname === "/studio/clients",
    },
    {
      title: "Settings",
      url: "#",
      icon: Settings,
      isActive: pathname.startsWith("/studio/settings"),
      items: [
        {
          title: "Account",
          url: "/studio/settings/account",
          isActive: pathname === "/studio/settings/account",
        },
        {
          title: "Payments",
          url: "/studio/settings/payments",
          isActive: pathname === "/studio/settings/payments",
        },
        {
          title: "Policies",
          url: "/studio/settings/policies",
          isActive: pathname === "/studio/settings/policies",
        },
        {
          title: "Availability",
          url: "/studio/settings/availability",
          isActive: pathname === "/studio/settings/availability",
        },
        {
          title: "Plan & Billing",
          url: "/studio/settings/billing",
          isActive: pathname === "/studio/settings/billing",
        },
        {
          title: "Team",
          url: "/studio/settings/team",
          isActive: pathname === "/studio/settings/team",
        },
        {
          title: "Integrations",
          url: "/studio/settings/integrations",
          isActive: pathname === "/studio/settings/integrations",
        },
        {
          title: "Studio Settings",
          url: "/studio/settings/studio",
          isActive: pathname === "/studio/settings/studio",
        },
      ],
    },
  ]

  return (
    <SidebarProvider>
      <AppSidebar
        locale={locale}
        navItems={navItems}
        user={user}
        studioName={studioName}
        onSignOut={onSignOut}
      />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="h-9 w-9" />
            <Separator
              orientation="vertical"
              className="mr-2 data-[orientation=vertical]:h-4"
            />
            <Breadcrumb>
              <BreadcrumbList>
                {breadcrumbs.map((crumb, index) => {
                  const isLast = index === breadcrumbs.length - 1
                  return (
                    <React.Fragment key={index}>
                      <BreadcrumbItem className={isLast ? "" : "hidden md:block"}>
                        {isLast ? (
                          <BreadcrumbPage>{crumb.title}</BreadcrumbPage>
                        ) : (
                          <BreadcrumbLink asChild>
                            <Link href={crumb.href || "/studio"}>
                              {crumb.title}
                            </Link>
                          </BreadcrumbLink>
                        )}
                      </BreadcrumbItem>
                      {!isLast && (
                        <BreadcrumbSeparator className="hidden md:block" />
                      )}
                    </React.Fragment>
                  )
                })}
              </BreadcrumbList>
            </Breadcrumb>
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