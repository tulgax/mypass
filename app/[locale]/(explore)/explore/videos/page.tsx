import { Suspense } from 'react'
import { getTranslations } from 'next-intl/server'
import { Skeleton } from '@/components/ui/skeleton'
import { ExploreSearch } from '@/components/explore/ExploreSearch'
import { VideosContent } from './VideosContent'
import {
  getAllActiveVideoClasses,
  getAllPublicStudios,
} from '@/lib/data/public-explore'

async function VideosData({
  q,
  category,
  difficulty,
  studioId,
}: {
  q?: string
  category?: string
  difficulty?: string
  studioId?: string
}) {
  const [videos, studios] = await Promise.all([
    getAllActiveVideoClasses({
      search: q,
      category,
      difficulty_level: difficulty,
      studioId: studioId ? Number(studioId) : undefined,
    }),
    getAllPublicStudios({ limit: 100 }),
  ])

  const studioOptions = studios.map((s) => ({
    value: String(s.id),
    label: s.name,
  }))

  return <VideosContent videos={videos} studioOptions={studioOptions} />
}

export default async function ExploreVideosPage({
  searchParams,
}: {
  searchParams: Promise<{
    q?: string
    category?: string
    difficulty?: string
    studio?: string
  }>
}) {
  const { q, category, difficulty, studio } = await searchParams
  const t = await getTranslations('explore.videos')

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
          <div className="grid grid-cols-2 gap-2.5 sm:gap-4 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="aspect-video rounded-lg" />
            ))}
          </div>
        }
      >
        <VideosData
          q={q}
          category={category}
          difficulty={difficulty}
          studioId={studio}
        />
      </Suspense>
    </div>
  )
}
