import { Suspense } from 'react'
import { getTranslations } from 'next-intl/server'
import { Skeleton } from '@/components/ui/skeleton'
import { ExploreSearch } from '@/components/explore/ExploreSearch'
import { MembershipsContent } from './MembershipsContent'
import {
  getAllActiveMembershipPlans,
  getAllPublicStudios,
} from '@/lib/data/public-explore'

async function MembershipsData({
  q,
  studioId,
}: {
  q?: string
  studioId?: string
}) {
  const [plans, studios] = await Promise.all([
    getAllActiveMembershipPlans({
      search: q,
      studioId: studioId ? Number(studioId) : undefined,
    }),
    getAllPublicStudios({ limit: 100 }),
  ])

  const studioOptions = studios.map((s) => ({
    value: String(s.id),
    label: s.name,
  }))

  return <MembershipsContent plans={plans} studioOptions={studioOptions} />
}

export default async function ExploreMembershipsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; studio?: string }>
}) {
  const { q, studio } = await searchParams
  const t = await getTranslations('explore.memberships')

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
        <MembershipsData q={q} studioId={studio} />
      </Suspense>
    </div>
  )
}
