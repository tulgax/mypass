import Image from 'next/image'
import { Link } from '@/i18n/routing'
import { useTranslations } from 'next-intl'
import { Clock, Star } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import type { ExploreVideo } from '@/lib/data/public-explore'

function formatDuration(seconds: number | null) {
  if (!seconds) return null
  const mins = Math.floor(seconds / 60)
  return `${mins}min`
}

export function ExploreVideoCard({ video }: { video: ExploreVideo }) {
  const t = useTranslations('explore.videos')

  const thumbnailSrc =
    video.thumbnail_url ??
    (video.mux_playback_id
      ? `https://image.mux.com/${video.mux_playback_id}/thumbnail.webp?width=480&height=270&fit_mode=smartcrop`
      : null)

  return (
    <Card className="overflow-hidden hover:shadow-md transition-shadow group">
      <div className="relative aspect-video bg-muted overflow-hidden">
        {thumbnailSrc ? (
          <Image
            src={thumbnailSrc}
            alt={video.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="h-full w-full flex items-center justify-center text-muted-foreground text-sm">
            No thumbnail
          </div>
        )}
        {video.is_featured && (
          <Badge className="absolute top-2 left-2 gap-1 text-[10px]">
            <Star className="h-3 w-3" />
            {t('featured')}
          </Badge>
        )}
        {video.duration_seconds && (
          <span className="absolute bottom-2 right-2 rounded bg-black/70 px-1.5 py-0.5 text-[10px] text-white">
            {formatDuration(video.duration_seconds)}
          </span>
        )}
      </div>
      <CardContent className="p-2.5 sm:p-3">
        <div className="flex items-start gap-2">
          {video.studio_logo_url && (
            <div className="relative h-7 w-7 shrink-0 overflow-hidden rounded-full border">
              <Image
                src={video.studio_logo_url}
                alt={video.studio_name}
                fill
                className="object-cover"
              />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-semibold line-clamp-2 leading-snug">
              {video.title}
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              {video.studio_name}
            </p>
          </div>
        </div>

        <div className="mt-2 flex flex-wrap gap-1">
          {video.category && (
            <Badge variant="secondary" className="text-[10px]">
              {video.category}
            </Badge>
          )}
          {video.difficulty_level && (
            <Badge variant="outline" className="text-[10px]">
              {t(video.difficulty_level as 'beginner' | 'intermediate' | 'advanced')}
            </Badge>
          )}
        </div>

        <div className="mt-2 flex items-center justify-between">
          <span className="text-sm font-semibold">
            {video.price > 0
              ? `${video.price.toLocaleString()} ${video.currency}`
              : t('free')}
          </span>
          <Button asChild size="sm" variant="outline" className="h-8 sm:h-7 text-xs px-3">
            <Link href={`/${video.studio_slug}/videos/${video.id}`}>
              {t('watch')}
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
