'use client'

import { useTranslations } from 'next-intl'
import { ExploreVideoCard } from '@/components/explore/ExploreVideoCard'
import { FilterSheet } from '@/components/explore/FilterSheet'
import type { ExploreVideo } from '@/lib/data/public-explore'

interface VideosContentProps {
  videos: ExploreVideo[]
  studioOptions: Array<{ value: string; label: string }>
}

export function VideosContent({ videos, studioOptions }: VideosContentProps) {
  const t = useTranslations('explore.videos')

  const filters = [
    {
      key: 'category',
      label: t('filterCategory'),
      allLabel: t('allCategories'),
      options: [
        { value: 'yoga', label: 'Yoga' },
        { value: 'pilates', label: 'Pilates' },
        { value: 'hiit', label: 'HIIT' },
        { value: 'strength', label: 'Strength' },
        { value: 'dance', label: 'Dance' },
        { value: 'boxing', label: 'Boxing' },
        { value: 'crossfit', label: 'CrossFit' },
        { value: 'meditation', label: 'Meditation' },
      ],
    },
    {
      key: 'difficulty',
      label: t('filterDifficulty'),
      allLabel: t('allDifficulties'),
      options: [
        { value: 'beginner', label: t('beginner') },
        { value: 'intermediate', label: t('intermediate') },
        { value: 'advanced', label: t('advanced') },
      ],
    },
    {
      key: 'studio',
      label: t('filterStudio'),
      allLabel: t('allStudios'),
      options: studioOptions,
    },
  ]

  if (videos.length === 0) {
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
      <div className="grid grid-cols-2 gap-2.5 sm:gap-4 lg:grid-cols-3">
        {videos.map((video) => (
          <ExploreVideoCard key={video.id} video={video} />
        ))}
      </div>
    </div>
  )
}
