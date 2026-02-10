import { notFound } from 'next/navigation'
import { getTranslations } from 'next-intl/server'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { Clock, User } from 'lucide-react'
import { formatAmount } from '@/lib/utils'
import { getActiveVideoClassesByStudioSlug } from '@/lib/data/video-classes'

const RESERVED_ROUTES = [
  'studio',
  'auth',
  'student',
  'branding',
  'contact',
  'cookies',
  'privacy',
  'terms',
]

function formatDuration(seconds: number | null): string {
  if (!seconds) return ''
  const mins = Math.floor(seconds / 60)
  return `${mins} min`
}

export default async function StudioVideosPage({
  params,
}: {
  params: Promise<{ slug: string; locale: string }>
}) {
  const { slug, locale } = await params
  if (RESERVED_ROUTES.includes(slug)) {
    notFound()
  }

  const t = await getTranslations({
    locale,
    namespace: 'studioPublic.videos',
  })
  const tDiff = await getTranslations({
    locale,
    namespace: 'studio.videoClasses.difficulty',
  })
  const tCat = await getTranslations({
    locale,
    namespace: 'studio.videoClasses.categories',
  })
  const videos = await getActiveVideoClassesByStudioSlug(slug)

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-10 space-y-6">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">{t('title')}</h1>
          <p className="text-sm text-muted-foreground">{t('subtitle')}</p>
        </div>
      </div>

      {videos.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {videos.map((v) => {
            const thumbnailUrl =
              v.thumbnail_url ??
              (v.mux_playback_id
                ? `https://image.mux.com/${v.mux_playback_id}/thumbnail.png?width=640&height=360&fit_mode=smartcrop`
                : null)

            return (
              <Link
                key={v.id}
                href={`/${locale}/${slug}/videos/${v.id}`}
                className="group"
              >
                <Card className="overflow-hidden transition-shadow hover:shadow-md">
                  {/* Thumbnail */}
                  {thumbnailUrl ? (
                    <div className="relative aspect-video bg-muted overflow-hidden">
                      <img
                        src={thumbnailUrl}
                        alt={v.title}
                        className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
                      />
                      {v.duration_seconds && (
                        <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-1.5 py-0.5 rounded">
                          {formatDuration(v.duration_seconds)}
                        </div>
                      )}
                      {v.is_featured && (
                        <Badge className="absolute top-2 left-2" variant="default">
                          Featured
                        </Badge>
                      )}
                    </div>
                  ) : (
                    <div className="aspect-video bg-muted flex items-center justify-center">
                      <span className="text-muted-foreground text-sm">
                        Video
                      </span>
                    </div>
                  )}

                  <CardContent className="p-4 space-y-2">
                    <div className="font-semibold line-clamp-2 group-hover:text-primary transition-colors">
                      {v.title}
                    </div>
                    {v.description && (
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {v.description}
                      </p>
                    )}

                    {/* Metadata */}
                    <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                      {v.instructor && (
                        <span className="flex items-center gap-1">
                          <User className="h-3 w-3" />
                          {v.instructor.full_name}
                        </span>
                      )}
                      {v.duration_seconds && (
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {formatDuration(v.duration_seconds)}
                        </span>
                      )}
                    </div>

                    {/* Badges */}
                    <div className="flex flex-wrap gap-1.5">
                      {v.category && (
                        <Badge variant="outline" className="text-xs">
                          {tCat(v.category, { defaultValue: v.category })}
                        </Badge>
                      )}
                      {v.difficulty_level && (
                        <Badge variant="secondary" className="text-xs">
                          {tDiff(v.difficulty_level)}
                        </Badge>
                      )}
                    </div>

                    {/* Price */}
                    <div className="text-sm pt-1">
                      <span className="font-medium">
                        {formatAmount(Number(v.price), v.currency)}
                      </span>
                      <span className="text-muted-foreground">
                        {' '}
                        &bull; {v.access_duration_days} days
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            )
          })}
        </div>
      ) : (
        <Card>
          <CardContent className="p-8 text-center text-sm text-muted-foreground">
            {t('empty')}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
