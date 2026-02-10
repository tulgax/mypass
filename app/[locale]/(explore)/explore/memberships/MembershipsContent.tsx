'use client'

import { useTranslations } from 'next-intl'
import { ExplorePlanCard } from '@/components/explore/ExplorePlanCard'
import { FilterSheet } from '@/components/explore/FilterSheet'
import type { ExplorePlan } from '@/lib/data/public-explore'

interface MembershipsContentProps {
  plans: ExplorePlan[]
  studioOptions: Array<{ value: string; label: string }>
}

export function MembershipsContent({
  plans,
  studioOptions,
}: MembershipsContentProps) {
  const t = useTranslations('explore.memberships')

  const filters = [
    {
      key: 'studio',
      label: t('filterStudio'),
      allLabel: t('allStudios'),
      options: studioOptions,
    },
  ]

  if (plans.length === 0) {
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
        {plans.map((plan) => (
          <ExplorePlanCard key={plan.id} plan={plan} />
        ))}
      </div>
    </div>
  )
}
