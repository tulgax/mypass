import { Suspense } from 'react'
import { getTranslations } from 'next-intl/server'
import { Skeleton } from '@/components/ui/skeleton'
import { ExploreSearch } from '@/components/explore/ExploreSearch'
import { ClassesContent } from './ClassesContent'
import {
  getAllUpcomingClasses,
  getAllPublicStudios,
} from '@/lib/data/public-explore'

async function ClassesData({
  q,
  type,
  studioId,
}: {
  q?: string
  type?: string
  studioId?: string
}) {
  const [classes, studios] = await Promise.all([
    getAllUpcomingClasses({
      search: q,
      type,
      studioId: studioId ? Number(studioId) : undefined,
    }),
    getAllPublicStudios({ limit: 100 }),
  ])

  const studioOptions = studios.map((s) => ({
    value: String(s.id),
    label: s.name,
  }))

  return <ClassesContent classes={classes} studioOptions={studioOptions} />
}

export default async function ExploreClassesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; type?: string; studio?: string }>
}) {
  const { q, type, studio } = await searchParams
  const t = await getTranslations('explore.classes')

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-4 sm:py-6 space-y-4 sm:space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-semibold">{t('title')}</h1>
          <p className="text-xs sm:text-sm text-muted-foreground">{t('subtitle')}</p>
        </div>
        <ExploreSearch className="sm:w-72" />
      </div>

      <Suspense
        fallback={
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-40 rounded-lg" />
            ))}
          </div>
        }
      >
        <ClassesData q={q} type={type} studioId={studio} />
      </Suspense>
    </div>
  )
}
