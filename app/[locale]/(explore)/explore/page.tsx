import { Suspense } from 'react'
import { getTranslations } from 'next-intl/server'
import { Link } from '@/i18n/routing'
import { ArrowRight, Building2, CalendarDays, PlayCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { ExploreSearch } from '@/components/explore/ExploreSearch'
import { ExploreStudioCard } from '@/components/explore/ExploreStudioCard'
import {
  getAllPublicStudios,
  getExploreStats,
} from '@/lib/data/public-explore'

async function FeaturedStudios() {
  const studios = await getAllPublicStudios({ limit: 6 })
  // Sort by upcoming class count (most active first)
  const sorted = studios.sort((a, b) => b.upcoming_count - a.upcoming_count)

  if (sorted.length === 0) return null

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {sorted.map((studio) => (
        <ExploreStudioCard key={studio.id} studio={studio} />
      ))}
    </div>
  )
}

async function StatsSection() {
  const t = await getTranslations('explore.hub.stats')
  const stats = await getExploreStats()

  const items = [
    { label: t('studios'), value: stats.studioCount, icon: Building2 },
    { label: t('upcomingClasses'), value: stats.classCount, icon: CalendarDays },
    { label: t('videoClasses'), value: stats.videoCount, icon: PlayCircle },
  ]

  return (
    <div className="grid grid-cols-3 gap-2 sm:gap-3">
      {items.map((item) => (
        <Card key={item.label}>
          <CardContent className="flex flex-col items-center p-3 sm:p-4 text-center">
            <item.icon className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground mb-1" />
            <span className="text-xl sm:text-2xl font-bold">{item.value}</span>
            <span className="text-[10px] sm:text-xs text-muted-foreground">{item.label}</span>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

const CATEGORIES = [
  'yoga',
  'pilates',
  'hiit',
  'strength',
  'dance',
  'boxing',
  'crossfit',
  'meditation',
] as const

export default async function ExploreHubPage() {
  const t = await getTranslations('explore.hub')

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-5 sm:py-8 space-y-6 sm:space-y-10">
      {/* Hero */}
      <section className="text-center space-y-3 sm:space-y-4 py-4 sm:py-8">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight">
          {t('title')}
        </h1>
        <p className="text-muted-foreground text-sm sm:text-base md:text-lg max-w-xl mx-auto">
          {t('subtitle')}
        </p>
        <ExploreSearch className="max-w-lg mx-auto" />
      </section>

      {/* Stats */}
      <Suspense
        fallback={
          <div className="grid grid-cols-3 gap-2 sm:gap-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-20 sm:h-24 rounded-lg" />
            ))}
          </div>
        }
      >
        <StatsSection />
      </Suspense>

      {/* Categories */}
      <section className="space-y-3">
        <h2 className="text-lg font-semibold">{t('categories.title')}</h2>
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map((cat) => (
            <Link key={cat} href={`/explore/videos?category=${cat}`}>
              <Badge
                variant="secondary"
                className="px-3 py-1.5 text-sm cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors"
              >
                {t(`categories.${cat}`)}
              </Badge>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Studios */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">{t('featuredStudios')}</h2>
          <Button asChild variant="ghost" size="sm" className="gap-1 text-sm">
            <Link href="/explore/studios">
              {t('viewAll')}
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </Button>
        </div>
        <Suspense
          fallback={
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-56 rounded-lg" />
              ))}
            </div>
          }
        >
          <FeaturedStudios />
        </Suspense>
      </section>
    </div>
  )
}
