'use client'

import Image from 'next/image'
import { Link } from '@/i18n/routing'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { CalendarDays, CreditCard, LayoutDashboard, LogOut } from 'lucide-react'
import { ExploreNav } from './ExploreNav'

interface ExploreHeaderProps {
  user?: {
    name: string
    email: string
    avatar?: string
    role?: string
  } | null
  onSignOut?: () => void
}

function getInitials(name: string) {
  return (
    name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2) || 'U'
  )
}

export function ExploreHeader({ user, onSignOut }: ExploreHeaderProps) {
  const t = useTranslations('landing.header')

  const dashboardHref =
    user?.role === 'studio_owner' ? '/studio/overview' : '/student/bookings'

  return (
    <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
      {/* Top bar: logo + auth */}
      <div className="mx-auto flex h-12 sm:h-14 max-w-7xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="flex items-center shrink-0">
          <Image
            src="https://gbrvxbmbemvhajerdixh.supabase.co/storage/v1/object/public/Branding/Logo/symbol%20black.svg"
            alt="MyPass"
            width={32}
            height={24}
            className="h-5 w-auto sm:hidden"
            priority
          />
          <Image
            src="https://gbrvxbmbemvhajerdixh.supabase.co/storage/v1/object/public/Branding/Logo/black.svg"
            alt="MyPass"
            width={100}
            height={24}
            className="h-5 w-auto hidden sm:block"
            priority
          />
        </Link>

        {/* Desktop: nav inline */}
        <div className="hidden sm:block">
          <ExploreNav />
        </div>

        {/* Auth area */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  className="flex items-center gap-2 rounded-full p-0.5 hover:ring-2 hover:ring-primary/20 transition-all focus:outline-none focus:ring-2 focus:ring-primary/30"
                  aria-label="User menu"
                >
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user.avatar} alt={user.name} />
                    <AvatarFallback className="text-xs font-medium">
                      {getInitials(user.name)}
                    </AvatarFallback>
                  </Avatar>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-56"
                side="bottom"
                align="end"
                sideOffset={8}
              >
                <DropdownMenuLabel className="p-0 font-normal">
                  <div className="flex items-center gap-2 px-2 py-2 text-left text-sm">
                    <Avatar className="h-8 w-8 shrink-0">
                      <AvatarImage src={user.avatar} alt={user.name} />
                      <AvatarFallback className="text-xs font-medium">
                        {getInitials(user.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col min-w-0">
                      <span className="truncate font-medium">{user.name}</span>
                      <span className="truncate text-xs text-muted-foreground">
                        {user.email}
                      </span>
                    </div>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                  <DropdownMenuItem asChild>
                    <Link href={dashboardHref} className="cursor-pointer">
                      <LayoutDashboard className="mr-2 h-4 w-4" />
                      Dashboard
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/student/bookings" className="cursor-pointer">
                      <CalendarDays className="mr-2 h-4 w-4" />
                      My Bookings
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/student/memberships" className="cursor-pointer">
                      <CreditCard className="mr-2 h-4 w-4" />
                      My Memberships
                    </Link>
                  </DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                {onSignOut && (
                  <form action={onSignOut}>
                    <DropdownMenuItem asChild>
                      <button
                        type="submit"
                        className="w-full cursor-pointer text-red-600 focus:text-red-600"
                      >
                        <LogOut className="mr-2 h-4 w-4" />
                        Sign Out
                      </button>
                    </DropdownMenuItem>
                  </form>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <>
              <Link href="/auth/signin">
                <Button variant="ghost" size="sm" className="h-8 text-xs sm:text-sm">
                  {t('signIn')}
                </Button>
              </Link>
              <Link href="/auth/signup">
                <Button size="sm" className="h-8 text-xs sm:text-sm">
                  {t('signUp')}
                </Button>
              </Link>
            </>
          )}
        </div>
      </div>

      {/* Mobile: nav on its own row */}
      <div className="sm:hidden border-t">
        <div className="mx-auto max-w-7xl px-4">
          <ExploreNav />
        </div>
      </div>
    </header>
  )
}
