'use client'

import { useRouter, usePathname } from '@/i18n/routing'
import { useSearchParams } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { useTransition } from 'react'
import { SlidersHorizontal, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface FilterOption {
  value: string
  label: string
}

interface FilterConfig {
  key: string
  label: string
  options: FilterOption[]
  allLabel: string
}

interface FilterSheetProps {
  filters: FilterConfig[]
}

export function FilterSheet({ filters }: FilterSheetProps) {
  const t = useTranslations('explore.common')
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()

  const setFilter = (key: string, value: string | null) => {
    startTransition(() => {
      const params = new URLSearchParams(searchParams.toString())
      if (value && value !== 'all') {
        params.set(key, value)
      } else {
        params.delete(key)
      }
      const query = params.toString()
      router.push(`${pathname}${query ? `?${query}` : ''}`)
    })
  }

  const clearAll = () => {
    startTransition(() => {
      const params = new URLSearchParams()
      const q = searchParams.get('q')
      if (q) params.set('q', q)
      const query = params.toString()
      router.push(`${pathname}${query ? `?${query}` : ''}`)
    })
  }

  const hasActiveFilters = filters.some((f) => searchParams.has(f.key))

  // Desktop inline filters
  const inlineFilters = (
    <div className="hidden md:flex items-center gap-2 flex-wrap">
      {filters.map((filter) => (
        <Select
          key={filter.key}
          value={searchParams.get(filter.key) ?? 'all'}
          onValueChange={(v) => setFilter(filter.key, v)}
          disabled={isPending}
        >
          <SelectTrigger className="h-8 w-auto min-w-35 text-xs">
            <SelectValue placeholder={filter.allLabel} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{filter.allLabel}</SelectItem>
            {filter.options.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      ))}
      {hasActiveFilters && (
        <Button
          variant="ghost"
          size="sm"
          className="h-8 text-xs gap-1"
          onClick={clearAll}
          disabled={isPending}
        >
          <X className="h-3 w-3" />
          {t('clearFilters')}
        </Button>
      )}
    </div>
  )

  // Mobile sheet
  const mobileSheet = (
    <div className="md:hidden">
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="outline" size="sm" className="h-9 gap-1.5 text-xs">
            <SlidersHorizontal className="h-3.5 w-3.5" />
            {t('filter')}
            {hasActiveFilters && (
              <span className="ml-1 rounded-full bg-primary text-primary-foreground px-1.5 text-[10px]">
                {filters.filter((f) => searchParams.has(f.key)).length}
              </span>
            )}
          </Button>
        </SheetTrigger>
        <SheetContent side="bottom" className="h-auto max-h-[70vh] rounded-t-2xl">
          <SheetHeader>
            <SheetTitle>{t('filter')}</SheetTitle>
          </SheetHeader>
          <div className="space-y-5 py-4 pb-6">
            {filters.map((filter) => (
              <div key={filter.key} className="space-y-2">
                <label className="text-sm font-medium">{filter.label}</label>
                <Select
                  value={searchParams.get(filter.key) ?? 'all'}
                  onValueChange={(v) => setFilter(filter.key, v)}
                  disabled={isPending}
                >
                  <SelectTrigger className="w-full h-11">
                    <SelectValue placeholder={filter.allLabel} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{filter.allLabel}</SelectItem>
                    {filter.options.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            ))}
            {hasActiveFilters && (
              <Button
                variant="outline"
                className="w-full h-11"
                onClick={clearAll}
                disabled={isPending}
              >
                {t('clearFilters')}
              </Button>
            )}
          </div>
        </SheetContent>
      </Sheet>
    </div>
  )

  return (
    <>
      {inlineFilters}
      {mobileSheet}
    </>
  )
}
