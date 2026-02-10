'use client'

import { usePathname, Link } from '@/i18n/routing'
import { useTranslations } from 'next-intl'
import { cn } from '@/lib/utils'
import { Building2, CalendarDays, PlayCircle, CreditCard } from 'lucide-react'

const navItems = [
  { key: 'studios', href: '/explore/studios', icon: Building2 },
  { key: 'classes', href: '/explore/classes', icon: CalendarDays },
  { key: 'videos', href: '/explore/videos', icon: PlayCircle },
  { key: 'memberships', href: '/explore/memberships', icon: CreditCard },
] as const

export function ExploreNav() {
  const pathname = usePathname()
  const t = useTranslations('explore.nav')

  return (
    <nav className="flex items-center gap-0.5 sm:gap-1 overflow-x-auto scrollbar-none py-1.5 sm:py-0 -mx-1 px-1">
      {navItems.map((item) => {
        const isActive =
          pathname === item.href || pathname.startsWith(`${item.href}/`)
        const Icon = item.icon
        return (
          <Link
            key={item.key}
            href={item.href}
            className={cn(
              'flex items-center gap-1 sm:gap-1.5 whitespace-nowrap rounded-full px-2.5 sm:px-3 py-1.5 text-xs sm:text-sm font-medium transition-colors min-h-9 sm:min-h-0',
              isActive
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:bg-muted hover:text-foreground active:bg-muted'
            )}
          >
            <Icon className="h-3.5 w-3.5 shrink-0" />
            <span>{t(item.key)}</span>
          </Link>
        )
      })}
    </nav>
  )
}
