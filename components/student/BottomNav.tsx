'use client'

import { Link, usePathname } from '@/i18n/routing'
import { CompassIcon, CalendarDaysIcon, CreditCardIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

const items = [
  {
    title: 'Explore',
    href: '/explore',
    icon: CompassIcon,
  },
  {
    title: 'Bookings',
    href: '/student/bookings',
    icon: CalendarDaysIcon,
  },
  {
    title: 'Memberships',
    href: '/student/memberships',
    icon: CreditCardIcon,
  },
]

export function BottomNav() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t bg-background shadow-lg md:hidden">
      <div className="flex h-16 items-center justify-around pb-4">
        {items.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`)
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex min-h-12 min-w-12 flex-col items-center justify-center gap-1 px-3 py-2 transition-colors',
                isActive
                  ? 'text-primary'
                  : 'text-muted-foreground hover:text-foreground active:opacity-70'
              )}
            >
              <item.icon className={cn('h-5 w-5', isActive && 'text-primary')} />
              <span className="text-xs font-medium">{item.title}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
