import { Suspense } from 'react'
import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Link } from '@/i18n/routing'
import { Button } from '@/components/ui/button'
import { getStudentBookingsCounts } from '@/lib/data/student-bookings'
import { getStudentMemberships } from '@/lib/data/memberships'
import StudentLoading from './loading'

async function OverviewStats() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return null

  const [counts, memberships] = await Promise.all([
    getStudentBookingsCounts(user.id),
    getStudentMemberships(user.id),
  ])

  const activeMembershipCount = memberships.filter(
    (m) => m.status === 'active' && new Date(m.expires_at) > new Date()
  ).length

  return (
    <div className="grid gap-4 md:grid-cols-3">
      <Card>
        <CardHeader className="p-4 sm:p-6">
          <CardTitle className="text-base sm:text-lg">Upcoming Bookings</CardTitle>
        </CardHeader>
        <CardContent className="p-4 sm:p-6 pt-0">
          <p className="text-2xl font-bold">{counts.upcoming}</p>
          <Button variant="outline" className="mt-4 w-full sm:w-auto" asChild>
            <Link href="/student/bookings">View All</Link>
          </Button>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="p-4 sm:p-6">
          <CardTitle className="text-base sm:text-lg">Past Bookings</CardTitle>
        </CardHeader>
        <CardContent className="p-4 sm:p-6 pt-0">
          <p className="text-2xl font-bold">{counts.past}</p>
          <Button variant="outline" className="mt-4 w-full sm:w-auto" asChild>
            <Link href="/student/bookings">View All</Link>
          </Button>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="p-4 sm:p-6">
          <CardTitle className="text-base sm:text-lg">My Memberships</CardTitle>
        </CardHeader>
        <CardContent className="p-4 sm:p-6 pt-0">
          <p className="text-2xl font-bold">{activeMembershipCount}</p>
          <p className="text-sm text-muted-foreground mt-1">
            {activeMembershipCount === 1 ? 'Active membership' : 'Active memberships'}
          </p>
          <Button variant="outline" className="mt-4 w-full sm:w-auto" asChild>
            <Link href="/student/memberships">View All</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

export default async function StudentPage() {
  return (
    <div className="space-y-4 sm:space-y-6 md:space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold">Welcome Back</h1>
        <p className="text-sm sm:text-base text-muted-foreground">Here's your booking overview</p>
      </div>

      <Suspense fallback={<StudentLoading />}>
        <OverviewStats />
      </Suspense>

      <Card>
        <CardHeader className="p-4 sm:p-6">
          <CardTitle className="text-base sm:text-lg">Explore Studios</CardTitle>
        </CardHeader>
        <CardContent className="p-4 sm:p-6 pt-0">
          <p className="text-sm sm:text-base text-muted-foreground mb-4">
            Browse available studios and book your next class
          </p>
          <Button className="w-full sm:w-auto" asChild>
            <Link href="/student/explore">Browse Studios</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
