import Image from 'next/image'
import { Link } from '@/i18n/routing'
import { useTranslations } from 'next-intl'
import { MapPin } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import type { ExploreStudio } from '@/lib/data/public-explore'

export function ExploreStudioCard({ studio }: { studio: ExploreStudio }) {
  const t = useTranslations('explore.studios')

  return (
    <Card className="overflow-hidden hover:shadow-md transition-shadow group">
      {studio.cover_image_url ? (
        <div className="relative h-28 sm:h-36 w-full overflow-hidden bg-muted">
          <Image
            src={studio.cover_image_url}
            alt={studio.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </div>
      ) : (
        <div className="h-16 sm:h-20 w-full bg-linear-to-r from-primary/10 to-primary/5" />
      )}
      <CardContent className="p-3 sm:p-4">
        <div className="flex items-start gap-2.5 sm:gap-3">
          {studio.logo_url && (
            <div className="relative h-9 w-9 sm:h-10 sm:w-10 shrink-0 overflow-hidden rounded-lg border bg-background -mt-7 sm:-mt-8 shadow-sm">
              <Image
                src={studio.logo_url}
                alt={studio.name}
                fill
                className="object-cover"
              />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-semibold truncate">{studio.name}</h3>
            {studio.address && (
              <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5 truncate">
                <MapPin className="h-3 w-3 shrink-0" />
                {studio.address}
              </p>
            )}
          </div>
        </div>

        {studio.description && (
          <p className="text-xs text-muted-foreground mt-2 line-clamp-2">
            {studio.description}
          </p>
        )}

        <div className="flex items-center justify-between mt-2.5 sm:mt-3">
          <div className="flex gap-1.5 flex-wrap">
            {studio.classes_count > 0 && (
              <Badge variant="secondary" className="text-[10px]">
                {t('classesCount', { count: studio.classes_count })}
              </Badge>
            )}
            {studio.upcoming_count > 0 && (
              <Badge variant="outline" className="text-[10px]">
                {t('upcomingCount', { count: studio.upcoming_count })}
              </Badge>
            )}
          </div>
          <Button asChild size="sm" variant="outline" className="h-8 sm:h-7 text-xs shrink-0">
            <Link href={`/${studio.slug}`}>{t('viewStudio')}</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
