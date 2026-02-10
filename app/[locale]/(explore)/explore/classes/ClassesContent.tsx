'use client'

import { useTranslations } from 'next-intl'
import { ExploreClassCard } from '@/components/explore/ExploreClassCard'
import { FilterSheet } from '@/components/explore/FilterSheet'
import type { ExploreClass } from '@/lib/data/public-explore'

interface ClassesContentProps {
  classes: ExploreClass[]
  studioOptions: Array<{ value: string; label: string }>
}

export function ClassesContent({
  classes,
  studioOptions,
}: ClassesContentProps) {
  const t = useTranslations('explore.classes')

  const filters = [
    {
      key: 'type',
      label: t('filterType'),
      allLabel: t('allTypes'),
      options: [
        { value: 'online', label: t('typeOnline') },
        { value: 'offline', label: t('typeOffline') },
      ],
    },
    {
      key: 'studio',
      label: t('filterStudio'),
      allLabel: t('allStudios'),
      options: studioOptions,
    },
  ]

  if (classes.length === 0) {
    return (
      <div className="space-y-4">
        <FilterSheet filters={filters} />
        <div className="py-10 sm:py-16 text-center px-4">
          <p className="text-muted-foreground text-sm sm:text-base">{t('noResults')}</p>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            {t('noResultsDescription')}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <FilterSheet filters={filters} />
      <div className="grid gap-3 sm:gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {classes.map((cls) => (
          <ExploreClassCard key={cls.id} cls={cls} />
        ))}
      </div>
    </div>
  )
}
