import { Suspense } from 'react'
import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatDateTime } from '@/lib/utils'
import { QRCodeDisplay } from '@/components/student/QRCodeDisplay'
import { getStudentBookings } from '@/lib/data/student-bookings'
import type { StudentBookingWithRelations } from '@/lib/types/student'
import BookingsLoading from './loading'

async function BookingsList() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return null

  const bookings = await getStudentBookings(user.id)

  const now = new Date()
  const upcoming = bookings.filter(
    (b: StudentBookingWithRelations) =>
      b.class_instances && new Date(b.class_instances.scheduled_at) > now
  )
  const past = bookings.filter(
    (b: StudentBookingWithRelations) =>
      b.class_instances && new Date(b.class_instances.scheduled_at) <= now
  )

  return (
    <>
      {upcoming.length > 0 && (
        <div className="space-y-3 sm:space-y-4">
          <h2 className="text-lg sm:text-xl font-semibold">Upcoming</h2>
          {upcoming.map((booking: StudentBookingWithRelations) => (
            <Card key={booking.id}>
              <CardHeader className="p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <CardTitle className="text-base sm:text-lg">
                    {booking.class_instances?.classes?.name}
                  </CardTitle>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="outline" className="text-xs">{booking.status}</Badge>
                    <Badge variant="outline" className="text-xs">{booking.payment_status}</Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-4 sm:p-6 pt-0 space-y-3 sm:space-y-4">
                <p className="text-sm sm:text-base">
                  <span className="font-medium">Date & Time:</span>{' '}
                  {booking.class_instances?.scheduled_at
                    ? formatDateTime(booking.class_instances.scheduled_at)
                    : 'N/A'}
                </p>
                {booking.class_instances?.classes?.type === 'offline' && booking.qr_code && (
                  <QRCodeDisplay qrCode={booking.qr_code} bookingId={booking.id} />
                )}
                {booking.class_instances?.classes?.type === 'online' &&
                  booking.class_instances?.classes?.zoom_link && (
                    <div>
                      <p className="text-sm font-medium mb-2">Zoom Link:</p>
                      <a
                        href={booking.class_instances.classes.zoom_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline text-sm break-all"
                      >
                        {booking.class_instances.classes.zoom_link}
                      </a>
                    </div>
                  )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {past.length > 0 && (
        <div className="space-y-3 sm:space-y-4">
          <h2 className="text-lg sm:text-xl font-semibold">Past</h2>
          {past.map((booking: StudentBookingWithRelations) => (
            <Card key={booking.id}>
              <CardHeader className="p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <CardTitle className="text-base sm:text-lg">
                    {booking.class_instances?.classes?.name}
                  </CardTitle>
                  <Badge variant="outline" className="text-xs w-fit">{booking.status}</Badge>
                </div>
              </CardHeader>
              <CardContent className="p-4 sm:p-6 pt-0">
                <p className="text-sm sm:text-base">
                  <span className="font-medium">Date & Time:</span>{' '}
                  {booking.class_instances?.scheduled_at
                    ? formatDateTime(booking.class_instances.scheduled_at)
                    : 'N/A'}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {bookings.length === 0 && (
        <Card>
          <CardContent className="p-4 sm:p-6 py-12 text-center">
            <p className="text-sm sm:text-base text-muted-foreground">No bookings yet</p>
          </CardContent>
        </Card>
      )}
    </>
  )
}

export default async function StudentBookingsPage() {
  return (
    <div className="space-y-4 sm:space-y-6 md:space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold">My Bookings</h1>
        <p className="text-sm sm:text-base text-muted-foreground">View and manage your class bookings</p>
      </div>

      <Suspense fallback={<BookingsLoading />}>
        <BookingsList />
      </Suspense>
    </div>
  )
}
