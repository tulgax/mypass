import Image from 'next/image'
import type { Tables } from '@/lib/types/database'

type Studio = Tables<'studios'>

interface StudioHeaderProps {
  studio: Studio
}

export function StudioHeader({ studio }: StudioHeaderProps) {
  return (
    <div className="border-b">
      {studio.cover_image_url && (
        <div className="relative h-48 w-full overflow-hidden bg-muted md:h-64">
          <Image
            src={studio.cover_image_url}
            alt={studio.name}
            fill
            className="object-cover"
          />
        </div>
      )}
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-start gap-4">
          {studio.logo_url && (
            <div className="relative h-16 w-16 overflow-hidden rounded-lg border md:h-20 md:w-20">
              <Image
                src={studio.logo_url}
                alt={studio.name}
                fill
                className="object-cover"
              />
            </div>
          )}
          <div className="flex-1">
            <h1 className="text-2xl font-bold md:text-3xl">{studio.name}</h1>
            {studio.description && (
              <p className="text-muted-foreground mt-2">{studio.description}</p>
            )}
            {(studio.address || studio.phone || studio.email) && (
              <div className="text-muted-foreground mt-4 space-y-1 text-sm">
                {studio.address && <p>{studio.address}</p>}
                {studio.phone && <p>Phone: {studio.phone}</p>}
                {studio.email && <p>Email: {studio.email}</p>}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
