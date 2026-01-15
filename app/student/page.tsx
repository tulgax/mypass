import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default async function StudentPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return null

  const { count: upcomingCount } = await supabase
    .from('bookings')
    .select('*', { count: 'exact', head: true })
    .eq('student_id', user.id)
    .eq('status', 'confirmed')
    .in(
      'class_instance_id',
      (
        await supabase
          .from('class_instances')
          .select('id')
          .gt('scheduled_at', new Date().toISOString())
      ).data?.map((ci) => ci.id) || []
    )

  const { count: pastCount } = await supabase
    .from('bookings')
    .select('*', { count: 'exact', head: true })
    .eq('student_id', user.id)
    .in(
      'class_instance_id',
      (
        await supabase
          .from('class_instances')
          .select('id')
          .lt('scheduled_at', new Date().toISOString())
      ).data?.map((ci) => ci.id) || []
    )

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Welcome Back</h1>
        <p className="text-muted-foreground">Here's your booking overview</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Upcoming Bookings</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{upcomingCount || 0}</p>
            <Button variant="outline" className="mt-4" asChild>
              <Link href="/student/bookings">View All</Link>
            </Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Past Bookings</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{pastCount || 0}</p>
            <Button variant="outline" className="mt-4" asChild>
              <Link href="/student/bookings">View All</Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Explore Studios</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4">
            Browse available studios and book your next class
          </p>
          <Button asChild>
            <Link href="/student/explore">Browse Studios</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
