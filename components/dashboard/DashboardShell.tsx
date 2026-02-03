"use client"

import * as React from "react"
import { useTranslations } from "next-intl"
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
 * Path to translation key mapping for breadcrumbs
 */
const pathToNavKey: Record<string, string> = {
  "/studio/overview": "overview",
  "/studio/schedule": "schedule",
  "/studio/catalog": "catalog",
  "/studio/catalog/classes": "classes",
  "/studio/catalog/plans": "plans",
  "/studio/catalog/coupons": "coupons",
  "/studio/catalog/orders": "orders",
  "/studio/catalog/classes/new": "createClass",
  "/studio/catalog/membership": "membership",
  "/studio/clients": "clients",
  "/studio/settings": "settings",
  "/studio/settings/studio": "studioSettings",
  "/studio/settings/account": "account",
  "/studio/settings/payments": "payments",
  "/studio/settings/policies": "policies",
  "/studio/settings/availability": "availability",
  "/studio/settings/billing": "planBilling",
  "/studio/settings/team": "team",
  "/studio/settings/integrations": "integrations",
}

/**
 * Generate breadcrumb items from pathname using translation function
 */
function generateBreadcrumbs(
  pathname: string,
  t: (key: string) => string
): Array<{ title: string; href?: string }> {
  const breadcrumbs: Array<{ title: string; href?: string }> = []

  // Always start with Studio (links to overview)
  breadcrumbs.push({ title: t("studio"), href: "/studio/overview" })

  // If we're on the overview page, return just Studio
  if (pathname === "/studio/overview") {
    return breadcrumbs
  }

  // Split pathname into segments
  const segments = pathname.split("/").filter(Boolean)

  // Remove "studio" from segments if present
  const relevantSegments = segments.filter((seg) => seg !== "studio")

  // Build breadcrumbs from segments
  let currentPath = "/studio"

  for (let i = 0; i < relevantSegments.length; i++) {
    const segment = relevantSegments[i]
    currentPath += `/${segment}`

    // Check if this is the last segment (current page)
    const isLast = i === relevantSegments.length - 1

    const navKey = pathToNavKey[currentPath]
    const title = navKey ? t(navKey) : segment
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ")

    if (isLast) {
      breadcrumbs.push({ title })
    } else {
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
  const t = useTranslations('dashboard.navigation')
  const tHeader = useTranslations('dashboard.header')
  const tSidebar = useTranslations('dashboard.sidebar')
  // Get pathname without locale prefix (next-intl provides this)
  const pathname = usePathname()

  // Generate breadcrumbs from pathname (translated)
  const breadcrumbs = generateBreadcrumbs(pathname, (key) => t(key))

  // Navigation items for MyPass studio
  // URLs are relative (without locale) - next-intl Link handles locale
  const navItems = [
    {
      title: t('overview'),
      url: "/studio/overview",
      icon: LayoutGrid,
      isActive: pathname === "/studio/overview",
    },
    {
      title: t('schedule'),
      url: "/studio/schedule",
      icon: CalendarDays,
      isActive: pathname === "/studio/schedule",
    },
    {
      title: t('catalog'),
      url: "/studio/catalog/classes",
      icon: FolderOpen,
      isActive: pathname.startsWith("/studio/catalog"),
      items: [
        {
          title: t('classes'),
          url: "/studio/catalog/classes",
          isActive: pathname === "/studio/catalog/classes" || pathname.startsWith("/studio/catalog/classes/"),
        },
        {
          title: t('plans'),
          url: "/studio/catalog/plans",
          isActive: pathname === "/studio/catalog/plans",
        },
        {
          title: t('membership'),
          url: "/studio/catalog/membership",
          isActive: pathname === "/studio/catalog/membership" || pathname.startsWith("/studio/catalog/membership/"),
        },
        {
          title: t('coupons'),
          url: "/studio/catalog/coupons",
          isActive: pathname === "/studio/catalog/coupons",
        },
        {
          title: t('orders'),
          url: "/studio/catalog/orders",
          isActive: pathname === "/studio/catalog/orders" || pathname.startsWith("/studio/catalog/orders/"),
        },
      ],
    },
    {
      title: t('clients'),
      url: "/studio/clients",
      icon: Users,
      isActive: pathname === "/studio/clients",
    },
    {
      title: t('settings'),
      url: "#",
      icon: Settings,
      isActive: pathname.startsWith("/studio/settings"),
      items: [
        {
          title: t('account'),
          url: "/studio/settings/account",
          isActive: pathname === "/studio/settings/account",
        },
        {
          title: t('payments'),
          url: "/studio/settings/payments",
          isActive: pathname === "/studio/settings/payments",
        },
        {
          title: t('policies'),
          url: "/studio/settings/policies",
          isActive: pathname === "/studio/settings/policies",
        },
        {
          title: t('availability'),
          url: "/studio/settings/availability",
          isActive: pathname === "/studio/settings/availability",
        },
        {
          title: t('planBilling'),
          url: "/studio/settings/billing",
          isActive: pathname === "/studio/settings/billing",
        },
        {
          title: t('team'),
          url: "/studio/settings/team",
          isActive: pathname === "/studio/settings/team",
        },
        {
          title: t('integrations'),
          url: "/studio/settings/integrations",
          isActive: pathname === "/studio/settings/integrations",
        },
        {
          title: t('studioSettings'),
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
            <SidebarTrigger
              className="h-9 w-9"
              aria-label={tSidebar('toggleSidebar')}
              title={tSidebar('toggleSidebar')}
            />
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
              <span className="sr-only">{tHeader('notifications')}</span>
              <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-primary" />
            </Button>
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4">
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}