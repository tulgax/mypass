"use client"

import * as React from "react"
import { useTranslations } from "next-intl"
import { usePathname } from "@/i18n/routing"
import { Link } from "@/i18n/routing"
import {
  CalendarDays,
  CreditCard,
  Video,
  LayoutGrid,
  Users,
  Settings,
  Package,
  Bell,
  UserCog,
  BookOpen,
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

export type StudioRole = 'owner' | 'manager' | 'instructor'

interface DashboardShellProps {
  children: React.ReactNode
  locale: Locale
  studioName?: string | null
  studioId?: number
  studioRole?: StudioRole
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
  "/studio/products": "products",
  "/studio/products/classes": "classes",
  "/studio/products/classes/new": "createClass",
  "/studio/products/plans": "plans",
  "/studio/products/memberships": "membershipPlans",
  "/studio/products/videos": "videoClasses",
  "/studio/customers": "customers",
  "/studio/customers/bookings": "bookings",
  "/studio/customers/members": "members",
  "/studio/team": "team",
  "/studio/settings": "settings",
  "/studio/settings/studio": "studioSettings",
  "/studio/settings/account": "account",
  "/studio/settings/billing": "billing",
  "/studio/settings/integrations": "integrations",
  // Legacy path support for breadcrumbs
  "/studio/catalog": "products",
  "/studio/catalog/classes": "classes",
  "/studio/catalog/plans": "plans",
  "/studio/catalog/membership": "membershipPlans",
  "/studio/clients": "bookings",
  "/studio/memberships": "members",
  "/studio/memberships/checkin": "checkIn",
  "/studio/instructors": "team",
  "/studio/video-classes": "videoClasses",
  "/studio/settings/payments": "billing",
  "/studio/settings/policies": "studioSettings",
  "/studio/settings/availability": "studioSettings",
  "/studio/settings/team": "team",
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
  studioId,
  studioRole = 'owner',
  onSignOut,
  user,
}: DashboardShellProps) {
  const t = useTranslations('dashboard.navigation')
  const tHeader = useTranslations('dashboard.header')
  const tSidebar = useTranslations('dashboard.sidebar')
  const pathname = usePathname()
  const breadcrumbs = generateBreadcrumbs(pathname, (key) => t(key))

  const canEditProducts = studioRole === 'owner' || studioRole === 'manager'
  const canSeeSettings = studioRole === 'owner'
  const canSeeTeam = studioRole === 'owner' || studioRole === 'manager'

  const navItems = React.useMemo(() => {
    const items: Array<{
      title: string
      url: string
      icon: typeof LayoutGrid
      isActive?: boolean
      items?: Array< { title: string; url: string; isActive: boolean }>
    }> = [
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
    ]

    if (canEditProducts) {
      items.push({
        title: t('products'),
        url: "/studio/catalog/classes",
        icon: Package,
        isActive: pathname.startsWith("/studio/catalog") || pathname.startsWith("/studio/video-classes"),
        items: [
          { title: t('classes'), url: "/studio/catalog/classes", isActive: pathname === "/studio/catalog/classes" || pathname.startsWith("/studio/catalog/classes/") },
          { title: t('plans'), url: "/studio/catalog/plans", isActive: pathname === "/studio/catalog/plans" },
          { title: t('membershipPlans'), url: "/studio/catalog/membership", isActive: pathname === "/studio/catalog/membership" || pathname.startsWith("/studio/catalog/membership/") },
          { title: t('videoClasses'), url: "/studio/video-classes", isActive: pathname.startsWith("/studio/video-classes") },
        ],
      })
    }

    items.push({
      title: t('customers'),
      url: "/studio/clients",
      icon: BookOpen,
      isActive: pathname.startsWith("/studio/clients") || pathname.startsWith("/studio/memberships"),
      items: [
        { title: t('bookings'), url: "/studio/clients", isActive: pathname === "/studio/clients" },
        { title: t('members'), url: "/studio/memberships", isActive: pathname.startsWith("/studio/memberships") },
      ],
    })

    if (canSeeTeam) {
      items.push({
        title: t('team'),
        url: "/studio/settings/team",
        icon: UserCog,
        isActive: pathname === "/studio/settings/team" || pathname === "/studio/instructors",
      })
    }

    if (canSeeSettings) {
      items.push({
        title: t('settings'),
        url: "#",
        icon: Settings,
        isActive: pathname.startsWith("/studio/settings") && pathname !== "/studio/settings/team",
        items: [
          { title: t('studioSettings'), url: "/studio/settings/studio", isActive: pathname === "/studio/settings/studio" || pathname === "/studio/settings/policies" || pathname === "/studio/settings/availability" },
          { title: t('account'), url: "/studio/settings/account", isActive: pathname === "/studio/settings/account" },
          { title: t('billing'), url: "/studio/settings/billing", isActive: pathname === "/studio/settings/billing" || pathname === "/studio/settings/payments" },
          { title: t('integrations'), url: "/studio/settings/integrations", isActive: pathname === "/studio/settings/integrations" },
        ],
      })
    }

    return items
  }, [pathname, studioRole, canEditProducts, canSeeSettings, canSeeTeam, t])

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
