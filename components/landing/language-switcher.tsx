"use client"

import { useLocale } from 'next-intl'
import { usePathname, useRouter } from '@/i18n/routing'
import { useTransition } from 'react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export function LanguageSwitcher() {
  const locale = useLocale()
  const router = useRouter()
  const pathname = usePathname() // This returns pathname without locale (e.g., "/dashboard" or "/")
  const [isPending, startTransition] = useTransition()

  function onSelectChange(newLocale: string) {
    startTransition(() => {
      // Get the current full pathname from browser
      const currentPath = window.location.pathname
      
      // Split the path into segments
      const segments = currentPath.split('/').filter(Boolean) // ['mn'] or ['mn', 'dashboard']
      
      // Find and remove the locale segment
      const localeIndex = segments.findIndex(seg => seg === locale)
      const pathSegments = localeIndex !== -1 
        ? segments.slice(localeIndex + 1) // Remove locale and everything before it
        : segments // No locale found, use all segments
      
      // Construct the new path
      const newPath = pathSegments.length === 0
        ? `/${newLocale}` // Root path: /en or /mn
        : `/${newLocale}/${pathSegments.join('/')}` // Subpath: /en/dashboard
      
      window.location.href = newPath
    })
  }

  return (
    <Select value={locale} onValueChange={onSelectChange} disabled={isPending}>
      <SelectTrigger className="w-[140px]">
        <SelectValue placeholder="Language" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="en">English</SelectItem>
        <SelectItem value="mn">Монгол</SelectItem>
      </SelectContent>
    </Select>
  )
}
