'use client'

import Image from 'next/image'
import { Link } from '@/i18n/routing'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'
import { ExploreNav } from './ExploreNav'

export function ExploreHeader() {
  const t = useTranslations('landing.header')

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

        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
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
