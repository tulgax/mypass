import Link from 'next/link'
import Image from 'next/image'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import type { Tables } from '@/lib/types/database'

type Studio = Tables<'studios'> & {
  classes_count?: number
  upcoming_instances_count?: number
}

interface StudioCardProps {
  studio: Studio
}

export function StudioCard({ studio }: StudioCardProps) {
  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      {studio.cover_image_url && (
        <div className="relative h-32 sm:h-40 md:h-48 w-full overflow-hidden bg-muted">
          <Image
            src={studio.cover_image_url}
            alt={studio.name}
            fill
            className="object-cover"
          />
        </div>
      )}
      <CardHeader className="p-4 sm:p-6">
        <div className="flex items-start gap-3 sm:gap-4">
          {studio.logo_url && (
            <div className="relative h-10 w-10 sm:h-12 sm:w-12 md:h-16 md:w-16 shrink-0 overflow-hidden rounded-lg border">
              <Image
                src={studio.logo_url}
                alt={studio.name}
                fill
                className="object-cover"
              />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <CardTitle className="text-base sm:text-lg line-clamp-2">{studio.name}</CardTitle>
            {studio.description && (
              <CardDescription className="mt-1 text-sm sm:text-base line-clamp-2">
                {studio.description}
              </CardDescription>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-4 sm:p-6 pt-0 space-y-3 sm:space-y-4">
        {(studio.address || studio.phone) && (
          <div className="text-muted-foreground space-y-1 text-xs sm:text-sm">
            {studio.address && <p className="line-clamp-1">{studio.address}</p>}
            {studio.phone && <p>Phone: {studio.phone}</p>}
          </div>
        )}

        {(studio.classes_count !== undefined || studio.upcoming_instances_count !== undefined) && (
          <div className="flex flex-wrap gap-2">
            {studio.classes_count !== undefined && (
              <Badge variant="outline" className="text-xs">{studio.classes_count} classes</Badge>
            )}
            {studio.upcoming_instances_count !== undefined && (
              <Badge variant="outline" className="text-xs">{studio.upcoming_instances_count} upcoming</Badge>
            )}
          </div>
        )}

        <Button asChild className="w-full min-h-[44px]">
          <Link href={`/${studio.slug}`}>View Classes</Link>
        </Button>
      </CardContent>
    </Card>
  )
}
