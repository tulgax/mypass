'use client'

import { useState } from 'react'
import dynamic from 'next/dynamic'
import { useTranslations } from 'next-intl'
import { Map, LayoutGrid } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ExploreStudioCard } from '@/components/explore/ExploreStudioCard'
import type { ExploreStudio } from '@/lib/data/public-explore'

const StudioMapView = dynamic(
  () =>
    import('@/components/explore/StudioMapView').then(
      (mod) => mod.StudioMapView
    ),
  { ssr: false, loading: () => <div className="h-[60vh] sm:h-125 rounded-lg border bg-muted animate-pulse" /> }
)

export function StudiosContent({ studios }: { studios: ExploreStudio[] }) {
  const t = useTranslations('explore.studios')
  const [showMap, setShowMap] = useState(false)

  if (studios.length === 0) {
    return (
      <div className="py-10 sm:py-16 text-center px-4">
        <p className="text-muted-foreground text-sm sm:text-base">{t('noResults')}</p>
        <p className="text-xs sm:text-sm text-muted-foreground mt-1">
          {t('noResultsDescription')}
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {studios.length} {t('title').toLowerCase()}
        </p>
        <div className="flex items-center gap-0.5 sm:gap-1 border rounded-lg p-0.5">
          <Button
            variant={showMap ? 'ghost' : 'secondary'}
            size="sm"
            className="h-8 sm:h-7 gap-1 text-xs"
            onClick={() => setShowMap(false)}
          >
            <LayoutGrid className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">{t('gridView')}</span>
          </Button>
          <Button
            variant={showMap ? 'secondary' : 'ghost'}
            size="sm"
            className="h-8 sm:h-7 gap-1 text-xs"
            onClick={() => setShowMap(true)}
          >
            <Map className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">{t('mapView')}</span>
          </Button>
        </div>
      </div>

      {showMap ? (
        <StudioMapView studios={studios} className="h-[60vh] sm:h-125" />
      ) : (
        <div className="grid gap-3 sm:gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {studios.map((studio) => (
            <ExploreStudioCard key={studio.id} studio={studio} />
          ))}
        </div>
      )}
    </div>
  )
}
