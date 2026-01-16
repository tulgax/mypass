import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatDateTime } from '@/lib/utils'

export default async function ClientsPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return null

  const { data: studio } = await supabase
    .from('studios')
    .select('id')
    .eq('owner_id', user.id)
    .single()

  // Get all class instances for this studio
  const { data: classInstances } = await supabase
    .from('class_instances')
    .select('id')
    .in(
      'class_id',
      studio
        ? (
            await supabase.from('classes').select('id').eq('studio_id', studio.id)
          ).data?.map((c: { id: number }) => c.id) || []
        : []
    )

  // Get bookings for these instances
  const { data: bookings } = await supabase
    .from('bookings')
    .select(`
      *,
      class_instances (
        *,
        classes (*)
      ),
      user_profiles (*)
    `)
    .in(
      'class_instance_id',
      classInstances?.map((ci: { id: number }) => ci.id) || []
    )
    .order('created_at', { ascending: false })

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Clients</h1>
        <p className="text-muted-foreground">Manage all bookings for your classes</p>
      </div>

      {bookings && bookings.length > 0 ? (
        <div className="space-y-4">
          {bookings.map((booking: any) => (
            <Card key={booking.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>
                    {booking.user_profiles?.full_name || 'Student'}
                  </CardTitle>
                  <div className="flex gap-2">
                    <Badge variant="outline">{booking.status}</Badge>
                    <Badge variant="outline">{booking.payment_status}</Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm">
                  <span className="font-medium">Class:</span>{' '}
                  {booking.class_instances?.classes?.name}
                </p>
                <p className="text-muted-foreground text-sm">
                  {formatDateTime(booking.class_instances?.scheduled_at)}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">No bookings yet</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
