'use client'

import { useRouter, usePathname } from '@/i18n/routing'
import { useSearchParams } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { useState, useTransition } from 'react'
import { Search, X } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

interface ExploreSearchProps {
  placeholder?: string
  className?: string
}

export function ExploreSearch({ placeholder, className }: ExploreSearchProps) {
  const t = useTranslations('explore.hub')
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()
  const [value, setValue] = useState(searchParams.get('q') ?? '')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    startTransition(() => {
      const params = new URLSearchParams(searchParams.toString())
      if (value.trim()) {
        params.set('q', value.trim())
      } else {
        params.delete('q')
      }
      const query = params.toString()
      router.push(`${pathname}${query ? `?${query}` : ''}`)
    })
  }

  const handleClear = () => {
    setValue('')
    startTransition(() => {
      const params = new URLSearchParams(searchParams.toString())
      params.delete('q')
      const query = params.toString()
      router.push(`${pathname}${query ? `?${query}` : ''}`)
    })
  }

  return (
    <form onSubmit={handleSubmit} className={className}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder={placeholder ?? t('searchPlaceholder')}
          className="h-10 sm:h-9 pl-9 pr-20 text-sm"
          disabled={isPending}
        />
        <div className="absolute right-1.5 top-1/2 -translate-y-1/2 flex items-center gap-1">
          {value && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={handleClear}
            >
              <X className="h-3.5 w-3.5" />
            </Button>
          )}
          <Button type="submit" size="sm" className="h-7 px-2.5" disabled={isPending}>
            <Search className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
    </form>
  )
}
