import Image from 'next/image'
import { Link } from '@/i18n/routing'
import { useTranslations } from 'next-intl'
import { Clock, Users, Wifi, MapPin } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import type { ExploreClass } from '@/lib/data/public-explore'

function formatTime(dateStr: string) {
  return new Date(dateStr).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  })
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString([], {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  })
}

export function ExploreClassCard({ cls }: { cls: ExploreClass }) {
  const t = useTranslations('explore.classes')
  const spotsLeft = cls.class_capacity - cls.current_bookings
  const isFull = spotsLeft <= 0

  return (
    <Card className="overflow-hidden hover:shadow-md transition-shadow">
      <CardContent className="p-3 sm:p-4">
        <div className="flex items-start gap-2.5 sm:gap-3">
          {cls.studio_logo_url && (
            <div className="relative h-8 w-8 sm:h-9 sm:w-9 shrink-0 overflow-hidden rounded-md border">
              <Image
                src={cls.studio_logo_url}
                alt={cls.studio_name}
                fill
                className="object-cover"
              />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-semibold truncate">{cls.class_name}</h3>
            <p className="text-xs text-muted-foreground truncate">
              {cls.studio_name}
            </p>
          </div>
          <Badge
            variant={cls.class_type === 'online' ? 'default' : 'secondary'}
            className="text-[10px] shrink-0"
          >
            {cls.class_type === 'online' ? (
              <><Wifi className="mr-1 h-3 w-3" />{t('typeOnline')}</>
            ) : (
              <><MapPin className="mr-1 h-3 w-3" />{t('typeOffline')}</>
            )}
          </Badge>
        </div>

        <div className="mt-2.5 sm:mt-3 flex flex-wrap items-center gap-x-3 sm:gap-x-4 gap-y-1 text-xs text-muted-foreground">
          <span className="font-medium text-foreground">
            {formatDate(cls.scheduled_at)}
          </span>
          <span className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {formatTime(cls.scheduled_at)} &middot; {cls.class_duration_minutes}min
          </span>
          <span className="flex items-center gap-1">
            <Users className="h-3 w-3" />
            {isFull ? (
              <span className="text-destructive font-medium">{t('full')}</span>
            ) : (
              t('spotsLeft', { count: spotsLeft })
            )}
          </span>
        </div>

        <div className="mt-2.5 sm:mt-3 flex items-center justify-between">
          <span className="text-sm font-semibold">
            {cls.class_price > 0
              ? `${cls.class_price.toLocaleString()} ${cls.class_currency}`
              : t('typeOnline')}
          </span>
          <Button
            asChild
            size="sm"
            className="h-8 sm:h-7 text-xs px-3"
            disabled={isFull}
          >
            <Link href={`/${cls.studio_slug}`}>{t('bookNow')}</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
