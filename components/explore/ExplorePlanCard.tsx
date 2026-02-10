import Image from 'next/image'
import { Link } from '@/i18n/routing'
import { useTranslations } from 'next-intl'
import { CalendarDays } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import type { ExplorePlan } from '@/lib/data/public-explore'

export function ExplorePlanCard({ plan }: { plan: ExplorePlan }) {
  const t = useTranslations('explore.memberships')

  return (
    <Card className="overflow-hidden hover:shadow-md transition-shadow">
      <CardContent className="p-3 sm:p-4">
        <div className="flex items-start gap-2.5 sm:gap-3">
          {plan.studio_logo_url && (
            <div className="relative h-8 w-8 sm:h-9 sm:w-9 shrink-0 overflow-hidden rounded-md border">
              <Image
                src={plan.studio_logo_url}
                alt={plan.studio_name}
                fill
                className="object-cover"
              />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-semibold truncate">{plan.name}</h3>
            <p className="text-xs text-muted-foreground truncate">
              {plan.studio_name}
            </p>
          </div>
        </div>

        {plan.description && (
          <p className="text-xs text-muted-foreground mt-2 line-clamp-2">
            {plan.description}
          </p>
        )}

        <div className="mt-2.5 sm:mt-3 flex items-center gap-2">
          <Badge variant="secondary" className="gap-1 text-xs">
            <CalendarDays className="h-3 w-3" />
            {t('months', { count: plan.duration_months })}
          </Badge>
        </div>

        <div className="mt-2.5 sm:mt-3 flex items-center justify-between">
          <div>
            <span className="text-base sm:text-lg font-bold">
              {plan.price.toLocaleString()}
            </span>
            <span className="text-[10px] sm:text-xs text-muted-foreground ml-1">
              {plan.currency}{t('perMonth')}
            </span>
          </div>
          <Button asChild size="sm" className="h-8 sm:h-7 text-xs px-3">
            <Link href={`/${plan.studio_slug}`}>{t('viewPlan')}</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
