import { Suspense } from 'react'
import { notFound } from 'next/navigation'
import { getTranslations } from 'next-intl/server'
import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { formatAmount } from '@/lib/utils'
import { Users, Calendar, DollarSign, BookOpen, Clock } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { getStudioAndRoleForUser } from '@/lib/data/studios'
import { getClassIdsByStudioId } from '@/lib/data/classes'
import { getClassInstanceIdsByClassIds } from '@/lib/data/class-instances'
import { getBookingsByInstanceIds, getPaymentsByBookingIds } from '@/lib/data/bookings'
import { getUpcomingClassInstances } from '@/lib/data/class-instances'
import type { BookingWithRelations } from '@/lib/data/bookings'

async function OverviewStats() {
  const t = await getTranslations('studio.overview')
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return null
  }

  const { studio } = await getStudioAndRoleForUser(user.id)
  if (!studio) {
    return null
  }

  // Parallel queries for better performance
  const classIds = await getClassIdsByStudioId(studio.id)
  
  const [instanceIds, upcomingClasses] = await Promise.all([
    getClassInstanceIdsByClassIds(classIds),
    getUpcomingClassInstances(classIds, 5),
  ])

  // Fetch bookings and payments in parallel
  const bookings = await getBookingsByInstanceIds(instanceIds)
  const bookingIds = bookings.map((b) => b.id)
  const payments = await getPaymentsByBookingIds(bookingIds)

  // Calculate stats with proper typing
  const actualRevenue = payments.reduce((sum, p) => sum + (p.amount || 0), 0)
  const currency = payments[0]?.currency || 'USD'
  const totalBookings = bookings.length
  const activeClasses = classIds.length
  const uniqueCustomers = new Set(bookings.map((b) => b.student_id)).size

  return (
    <>
      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardDescription className="font-medium">{t('stats.totalRevenue')}</CardDescription>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatAmount(actualRevenue, currency)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {t('stats.totalRevenueDesc')}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardDescription className="font-medium">{t('stats.totalBookings')}</CardDescription>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalBookings}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {t('stats.totalBookingsDesc')}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardDescription className="font-medium">{t('stats.activeClasses')}</CardDescription>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeClasses}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {t('stats.activeClassesDesc')}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardDescription className="font-medium">{t('stats.totalCustomers')}</CardDescription>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{uniqueCustomers}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {t('stats.totalCustomersDesc')}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Upcoming Classes */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>{t('upcomingClasses.title')}</CardTitle>
            <CardDescription>{t('upcomingClasses.description')}</CardDescription>
          </CardHeader>
          <CardContent>
            {upcomingClasses && upcomingClasses.length > 0 ? (
              <div className="space-y-4">
                {upcomingClasses
                  .filter((instance) => instance.classes?.name)
                  .map((instance) => (
                    <div key={instance.id} className="flex items-center justify-between border-b pb-3 last:border-0 last:pb-0">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">
                          {instance.classes?.name || t('upcomingClasses.unnamedClass')}
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
                        {instance.current_bookings || 0} {t('upcomingClasses.booked')}
                      </Badge>
                    </div>
                  ))}
                {upcomingClasses.filter((instance) => instance.classes?.name).length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    {t('upcomingClasses.noUpcoming')}
                  </p>
                )}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">
                {t('upcomingClasses.noUpcoming')}
              </p>
            )}
          </CardContent>
          <CardFooter>
            <Button variant="outline" className="w-full" asChild>
              <Link href="/studio/schedule">{t('upcomingClasses.viewFullSchedule')}</Link>
            </Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t('quickActions.title')}</CardTitle>
            <CardDescription>{t('quickActions.description')}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button variant="outline" className="w-full justify-start" asChild>
              <Link href="/studio/catalog/classes/new">
                <Calendar className="mr-2 h-4 w-4" />
                {t('quickActions.createClass')}
              </Link>
            </Button>
            <Button variant="outline" className="w-full justify-start" asChild>
              <Link href="/studio/schedule">
                <Clock className="mr-2 h-4 w-4" />
                {t('quickActions.scheduleSession')}
              </Link>
            </Button>
            <Button variant="outline" className="w-full justify-start" asChild>
              <Link href="/studio/clients">
                <Users className="mr-2 h-4 w-4" />
                {t('quickActions.viewBookings')}
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </>
  )
}

function StatsSkeleton() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <Card key={i}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-4 rounded" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-8 w-32 mb-2" />
            <Skeleton className="h-3 w-40" />
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

export default async function OverviewPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    notFound()
  }

  const { studio } = await getStudioAndRoleForUser(user.id)

  if (!studio) {
    notFound()
  }

  return (
    <div className="flex flex-1 flex-col gap-6">
      <Suspense fallback={<StatsSkeleton />}>
        <OverviewStats />
      </Suspense>
    </div>
  )
}
