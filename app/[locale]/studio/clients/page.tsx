import { notFound } from 'next/navigation'
import { getTranslations } from 'next-intl/server'
import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { StudioEmptyState } from '@/components/dashboard/StudioEmptyState'
import { formatDateTime } from '@/lib/utils'
import { getStudioBasicInfo } from '@/lib/data/studios'
import { getClassIdsByStudioId } from '@/lib/data/classes'
import { getClassInstanceIdsByClassIds } from '@/lib/data/class-instances'
import { getBookingsForStudio } from '@/lib/data/bookings'
import type { BookingWithRelations } from '@/lib/data/bookings'

export default async function ClientsPage() {
  const t = await getTranslations('studio.clients')
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    notFound()
  }

  const studio = await getStudioBasicInfo(user.id)

  if (!studio) {
    notFound()
  }

  // Get class IDs and instance IDs
  const classIds = await getClassIdsByStudioId(studio.id)
  const instanceIds = await getClassInstanceIdsByClassIds(classIds)

  // Get bookings for these instances
  const bookings = await getBookingsForStudio(instanceIds)

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">{t('title')}</h1>
        <p className="text-muted-foreground">{t('subtitle')}</p>
      </div>

      {bookings && bookings.length > 0 ? (
        <div className="space-y-4">
          {bookings.map((booking) => (
            <Card key={booking.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>
                    {booking.user_profiles?.full_name || t('student')}
                  </CardTitle>
                  <div className="flex gap-2">
                    <Badge variant="outline">{booking.status}</Badge>
                    <Badge variant="outline">{booking.payment_status}</Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm">
                  <span className="font-medium">{t('class')}</span>{' '}
                  {booking.class_instances?.classes?.name || t('unknown', { defaultValue: 'Unknown' })}
                </p>
                <p className="text-muted-foreground text-sm">
                  {booking.class_instances?.scheduled_at 
                    ? formatDateTime(booking.class_instances.scheduled_at)
                    : t('dateNotAvailable')}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="p-0">
            <StudioEmptyState
              variant="clients"
              title={t('noBookings')}
              embedded
            />
          </CardContent>
        </Card>
      )}
    </div>
  )
}
