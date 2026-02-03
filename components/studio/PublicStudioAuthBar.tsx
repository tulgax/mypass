'use client'

import { useTranslations } from 'next-intl'
import { Link } from '@/i18n/routing'
import { useAuth } from '@/hooks/useAuth'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { ChevronLeft } from 'lucide-react'

export function PublicStudioAuthBar() {
  const { user, profile, loading } = useAuth()
  const tCommon = useTranslations('common')
  const tBooking = useTranslations('landing.bookingPage')

  // Use pathnames without locale; next-intl Link adds the current locale automatically
  const exploreHref = '/student/explore'
  const studentHref = '/student'
  const signInHref = '/auth/signin'

  const fallbackInitial =
    profile?.full_name?.charAt(0)?.toUpperCase() ||
    user?.email?.charAt(0)?.toUpperCase() ||
    '?'

  if (loading) {
    return (
      <div
        className="absolute top-0 left-0 right-0 z-10 flex h-14 items-center justify-between px-4 py-3"
        aria-hidden
      />
    )
  }

  return (
    <div
      className="absolute top-0 left-0 right-0 z-10 flex h-14 items-center justify-between px-4 py-3 bg-black/20 backdrop-blur-sm"
      role="banner"
    >
      {user ? (
        <>
          <Link
            href={exploreHref}
            className="flex min-h-10 min-w-10 touch-manipulation items-center justify-center gap-1.5 rounded-full text-sm font-medium text-white hover:bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50"
          >
            <ChevronLeft className="h-5 w-5" aria-hidden />
            <span className="sr-only sm:not-sr-only sm:inline">{tCommon('back')}</span>
          </Link>
          <Link
            href={studentHref}
            className="flex h-10 w-10 shrink-0 touch-manipulation items-center justify-center rounded-full ring-2 ring-white/30 hover:ring-white/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
            aria-label={profile?.full_name || 'Profile'}
          >
            <Avatar className="h-9 w-9 border-2 border-white/50">
              <AvatarImage src={profile?.avatar_url ?? undefined} alt="" />
              <AvatarFallback className="bg-muted text-muted-foreground text-sm font-medium">
                {fallbackInitial}
              </AvatarFallback>
            </Avatar>
          </Link>
        </>
      ) : (
        <div className="ml-auto">
          <Button
            asChild
            variant="secondary"
            size="sm"
            className="rounded-full bg-white/90 text-foreground hover:bg-white font-medium touch-manipulation"
          >
            <Link href={signInHref}>{tBooking('login')}</Link>
          </Button>
        </div>
      )}
    </div>
  )
}
