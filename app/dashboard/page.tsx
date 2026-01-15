import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatAmount } from '@/lib/utils'
import { Users, Calendar, DollarSign, BookOpen, Clock } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default async function DashboardPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return null

  const { data: studio } = await supabase
    .from('studios')
    .select('id, name')
    .eq('owner_id', user.id)
    .single()

  if (!studio) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>Welcome to MyPass</CardTitle>
            <CardDescription>Get started by creating your studio</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full">
              <Link href="/dashboard/studio/new">Create Your Studio</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Get all classes for this studio
  const { data: classes } = await supabase
    .from('classes')
    .select('id')
    .eq('studio_id', studio.id)

  const classIds = classes?.map((c) => c.id) || []

  // Get all class instances (only if we have classes)
  const { data: classInstances } = classIds.length > 0
    ? await supabase
        .from('class_instances')
        .select('id')
        .in('class_id', classIds)
    : { data: [] }

  const instanceIds = classInstances?.map((ci) => ci.id) || []

  // Get all bookings (only if we have instances)
  const { data: bookings } = instanceIds.length > 0
    ? await supabase
        .from('bookings')
        .select('*, payments(amount, currency)')
        .in('class_instance_id', instanceIds)
    : { data: [] }

  // Get upcoming classes (only if we have classes)
  const { data: upcomingClasses } = classIds.length > 0
    ? await supabase
        .from('class_instances')
        .select('*, classes(name)')
        .in('class_id', classIds)
        .gte('scheduled_at', new Date().toISOString())
        .eq('is_cancelled', false)
        .order('scheduled_at', { ascending: true })
        .limit(5)
    : { data: [] }

  // Calculate stats
  const totalRevenue = bookings?.reduce((sum, booking) => {
    const payment = Array.isArray(booking.payments) ? booking.payments[0] : booking.payments
    return sum + (payment?.amount || 0)
  }, 0) || 0

  const totalBookings = bookings?.length || 0
  const activeClasses = classes?.length || 0
  const uniqueCustomers = new Set(bookings?.map((b) => b.student_id) || []).size

  // Get revenue from payments table
  const { data: payments } = await supabase
    .from('payments')
    .select('amount, currency')
    .in('id', bookings?.map((b) => b.payment_id).filter(Boolean) || [])

  const actualRevenue = payments?.reduce((sum, p) => sum + (p.amount || 0), 0) || 0
  const currency = payments?.[0]?.currency || 'USD'

  return (
    <div className="flex flex-1 flex-col gap-6">
      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardDescription className="font-medium">Total Revenue</CardDescription>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatAmount(actualRevenue, currency)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              From all bookings
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardDescription className="font-medium">Total Bookings</CardDescription>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalBookings}</div>
            <p className="text-xs text-muted-foreground mt-1">
              All time bookings
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardDescription className="font-medium">Active Classes</CardDescription>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeClasses}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Classes in your catalog
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardDescription className="font-medium">Total Customers</CardDescription>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{uniqueCustomers}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Unique students
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Upcoming Classes */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Upcoming Classes</CardTitle>
            <CardDescription>Your next scheduled sessions</CardDescription>
          </CardHeader>
          <CardContent>
            {upcomingClasses && upcomingClasses.length > 0 ? (
              <div className="space-y-4">
                {upcomingClasses
                  .filter((instance: any) => instance.classes?.name) // Only show instances with class names
                  .map((instance: any) => (
                    <div key={instance.id} className="flex items-center justify-between border-b pb-3 last:border-0 last:pb-0">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">
                          {instance.classes?.name || 'Unnamed Class'}
                        </p>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                          <Clock className="h-3 w-3 shrink-0" />
                          <span>
                            {new Date(instance.scheduled_at).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              hour: 'numeric',
                              minute: '2-digit',
                            })}
                          </span>
                        </div>
                      </div>
                      <Badge variant="outline" className="ml-2 shrink-0">
                        {instance.current_bookings || 0} booked
                      </Badge>
                    </div>
                  ))}
                {upcomingClasses.filter((instance: any) => instance.classes?.name).length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No upcoming classes scheduled
                  </p>
                )}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">
                No upcoming classes scheduled
              </p>
            )}
          </CardContent>
          <CardFooter>
            <Button variant="outline" className="w-full" asChild>
              <Link href="/dashboard/schedule">View Full Schedule</Link>
            </Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common tasks and shortcuts</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button variant="outline" className="w-full justify-start" asChild>
              <Link href="/dashboard/classes/new">
                <Calendar className="mr-2 h-4 w-4" />
                Create New Class
              </Link>
            </Button>
            <Button variant="outline" className="w-full justify-start" asChild>
              <Link href="/dashboard/schedule">
                <Clock className="mr-2 h-4 w-4" />
                Schedule Class Session
              </Link>
            </Button>
            <Button variant="outline" className="w-full justify-start" asChild>
              <Link href="/dashboard/bookings">
                <Users className="mr-2 h-4 w-4" />
                View Bookings
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
