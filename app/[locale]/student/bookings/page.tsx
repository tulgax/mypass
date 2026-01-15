import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatDateTime } from '@/lib/utils'
import { QRCodeDisplay } from '@/components/student/QRCodeDisplay'

export default async function StudentBookingsPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return null

  const { data: bookings } = await supabase
    .from('bookings')
    .select(`
      *,
      class_instances (
        *,
        classes (*)
      )
    `)
    .eq('student_id', user.id)
    .order('created_at', { ascending: false })

  const now = new Date()
  const upcoming = bookings?.filter(
    (b: any) => new Date(b.class_instances?.scheduled_at) > now
  )
  const past = bookings?.filter((b: any) => new Date(b.class_instances?.scheduled_at) <= now)

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">My Bookings</h1>
        <p className="text-muted-foreground">View and manage your class bookings</p>
      </div>

      {upcoming && upcoming.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Upcoming</h2>
          {upcoming.map((booking: any) => (
            <Card key={booking.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>{booking.class_instances?.classes?.name}</CardTitle>
                  <div className="flex gap-2">
                    <Badge variant="outline">{booking.status}</Badge>
                    <Badge variant="outline">{booking.payment_status}</Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm">
                  <span className="font-medium">Date & Time:</span>{' '}
                  {formatDateTime(booking.class_instances?.scheduled_at)}
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
                        className="text-primary hover:underline text-sm"
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

      {past && past.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Past</h2>
          {past.map((booking: any) => (
            <Card key={booking.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>{booking.class_instances?.classes?.name}</CardTitle>
                  <Badge variant="outline">{booking.status}</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm">
                  <span className="font-medium">Date & Time:</span>{' '}
                  {formatDateTime(booking.class_instances?.scheduled_at)}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {(!bookings || bookings.length === 0) && (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">No bookings yet</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
