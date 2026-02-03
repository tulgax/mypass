'use client'

import { useState, useTransition, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { getDayName, formatDate } from '@/lib/utils'
import { Tables } from '@/lib/types/database'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetClose,
} from '@/components/ui/sheet'
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { ScheduleForm } from '@/components/dashboard/ScheduleForm'
import { deleteClassInstance } from '@/lib/actions/class-instances'
import { AnimatedTabs } from '@/components/custom/AnimatedTabs'
import { StudioEmptyState } from '@/components/dashboard/StudioEmptyState'
import type { BookingWithRelations } from '@/lib/data/bookings'
import { createClient } from '@/lib/supabase/client'
import { X, Clock, MapPin, Users, Ban, Calendar } from 'lucide-react'

type ClassInstanceWithClass = Tables<'class_instances'> & {
  classes: {
    name: string
    capacity: number
    type: string
    duration_minutes?: number
  } | null
}

interface ClassOption {
  id: number
  name: string
  duration_minutes: number
  is_active: boolean
}

interface ScheduleClientProps {
  instances: ClassInstanceWithClass[]
  classes: ClassOption[]
}

export function ScheduleClient({ instances, classes }: ScheduleClientProps) {
  const t = useTranslations('studio.schedule')
  const tCommon = useTranslations('studio.common')
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [open, setOpen] = useState(false)
  const [viewOpen, setViewOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedInstance, setSelectedInstance] = useState<ClassInstanceWithClass | null>(null)
  const [bookings, setBookings] = useState<BookingWithRelations[]>([])
  const [loadingBookings, setLoadingBookings] = useState(false)
  const [activeTab, setActiveTab] = useState<'upcoming' | 'past'>('upcoming')

  const handleSuccess = () => {
    setOpen(false)
    setIsRefreshing(true)
    router.refresh()
    // Reset refreshing state after data should be loaded (1-2 seconds)
    setTimeout(() => setIsRefreshing(false), 2000)
  }

  const handleView = async (instanceId: number) => {
    const instance = instances.find((i) => i.id === instanceId)
    if (instance) {
      setSelectedInstance(instance)
      setViewOpen(true)
      setLoadingBookings(true)
      try {
        const supabase = createClient()

        // Fetch bookings
        const { data: bookingsData, error: bookingsError } = await supabase
          .from('bookings')
          .select(`
            id,
            student_id,
            class_instance_id,
            status,
            payment_status,
            payment_id,
            qr_code,
            checked_in_at,
            created_at,
            updated_at
          `)
          .eq('class_instance_id', instanceId)
          .order('created_at', { ascending: false })

        if (bookingsError) {
          console.error('Failed to fetch bookings:', bookingsError)
          throw new Error(bookingsError.message || 'Failed to fetch bookings')
        }

        if (!bookingsData || bookingsData.length === 0) {
          setBookings([])
          return
        }

        // Fetch user profiles for all student IDs
        const studentIds = [...new Set(bookingsData.map((b: { student_id: string }) => b.student_id))]
        const { data: profilesData, error: profilesError } = await supabase
          .from('user_profiles')
          .select('id, full_name')
          .in('id', studentIds)

        if (profilesError) {
          console.error('Failed to fetch user profiles:', profilesError)
          // Continue without profiles rather than failing completely
        }

        // Merge bookings with user profiles
        const profilesMap = new Map(
          (profilesData || []).map((p: { id: string; full_name: string | null }) => [p.id, p])
        )

        const bookingsWithProfiles = bookingsData.map((booking: { student_id: string;[key: string]: unknown }) => ({
          ...booking,
          user_profiles: profilesMap.get(booking.student_id) || null,
        })) as BookingWithRelations[]

        setBookings(bookingsWithProfiles)
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to load bookings'
        console.error('Failed to fetch bookings:', errorMessage, error)
        toast.error(errorMessage)
        setBookings([])
      } finally {
        setLoadingBookings(false)
      }
    }
  }

  const handleDeleteConfirm = async (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault()
      e.stopPropagation()
    }

    if (!selectedInstance || isPending) return

    const instanceIdToDelete = selectedInstance.id

    startTransition(async () => {
      const result = await deleteClassInstance({ id: instanceIdToDelete })

      if (!result.success) {
        // Keep dialog open on error
        toast.error(result.error)
        return
      }

      // Show success toast
      const bookingCount = selectedInstance.current_bookings || 0
      toast.success(
        bookingCount > 0
          ? t('toast.scheduleCancelled')
          : t('toast.scheduleDeleted')
      )

      // Set refreshing state to show skeleton
      setIsRefreshing(true)

      // Refresh data - this will cause the component to re-render with updated instances
      router.refresh()

      // Wait for the refresh to complete and UI to update, then close dialog
      // We wait a bit longer to ensure the item is removed from the table
      await new Promise(resolve => setTimeout(resolve, 300))

      setDeleteDialogOpen(false)
      setSelectedInstance(null)

      // Reset refreshing state after data should be loaded (1-2 seconds)
      setTimeout(() => setIsRefreshing(false), 2000)
    })
  }

  // Filter instances into upcoming and past
  const { upcomingInstances, pastInstances } = useMemo(() => {
    const now = new Date()
    const upcoming = instances.filter(i => {
      const scheduledDate = new Date(i.scheduled_at)
      return scheduledDate >= now && !i.is_cancelled
    })
    const past = instances.filter(i => {
      const scheduledDate = new Date(i.scheduled_at)
      return scheduledDate < now || i.is_cancelled
    })
    return { upcomingInstances: upcoming, pastInstances: past }
  }, [instances])

  // Group instances by date
  const groupInstancesByDate = (instancesList: ClassInstanceWithClass[]) => {
    const grouped = new Map<string, ClassInstanceWithClass[]>()

    instancesList.forEach(instance => {
      const date = new Date(instance.scheduled_at)
      const dateKey = date.toISOString().split('T')[0]

      if (!grouped.has(dateKey)) {
        grouped.set(dateKey, [])
      }
      grouped.get(dateKey)!.push(instance)
    })

    // Sort dates chronologically
    const sortedDates = Array.from(grouped.keys()).sort((a, b) => {
      return new Date(a).getTime() - new Date(b).getTime()
    })

    return sortedDates.map(dateKey => ({
      dateKey,
      date: new Date(dateKey),
      instances: grouped.get(dateKey)!.sort((a, b) => {
        return new Date(a.scheduled_at).getTime() - new Date(b.scheduled_at).getTime()
      })
    }))
  }

  const displayedInstances = activeTab === 'upcoming' ? upcomingInstances : pastInstances
  const groupedInstances = groupInstancesByDate(displayedInstances)

  // Format date header (e.g., "Monday Jan 26")
  const formatDateHeader = (date: Date) => {
    const dayName = getDayName(date)
    const dateStr = formatDate(date)
    // Extract "Jan 26" from "Jan 26, 2024"
    const datePart = dateStr.split(',')[0]
    return `${dayName} ${datePart}`
  }

  // Format time in 24-hour format (e.g., "09:00")
  const formatTime24 = (date: Date | string) => {
    const d = typeof date === 'string' ? new Date(date) : date
    const hours = d.getHours().toString().padStart(2, '0')
    const minutes = d.getMinutes().toString().padStart(2, '0')
    return `${hours}:${minutes}`
  }

  // Format time in 24-hour format helper (for use in ScheduleInstanceView)
  const formatTime24Helper = (date: Date | string) => {
    const d = typeof date === 'string' ? new Date(date) : date
    const hours = d.getHours().toString().padStart(2, '0')
    const minutes = d.getMinutes().toString().padStart(2, '0')
    return `${hours}:${minutes}`
  }

  return (
    <>
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold">{t('title')}</h1>
            <p className="text-sm text-muted-foreground">{t('subtitle')}</p>
          </div>
          <Button onClick={() => setOpen(true)}>{t('createSchedule')}</Button>
        </div>

        {/* Tabs */}
        <AnimatedTabs
          tabs={[
            { id: 'upcoming', label: t('tabs.upcoming') },
            { id: 'past', label: t('tabs.past') },
          ]}
          activeTab={activeTab}
          onTabChange={(tab) => setActiveTab(tab as 'upcoming' | 'past')}
        />

        {/* List View */}
        {(isPending || isRefreshing) ? (
          <Card className="border-0 shadow-none">
            <CardContent className="p-0">
              <div className="space-y-4">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="space-y-2">
                    <Skeleton className="h-5 w-32" />
                    <div className="space-y-2">
                      <Skeleton className="h-20 w-full" />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ) : groupedInstances.length > 0 ? (
          <Card className="border-0 shadow-none">
            <CardContent className="p-0">
              <div className="space-y-6">
                {groupedInstances.map(({ dateKey, date, instances: dateInstances }) => (
                  <div key={dateKey} className="space-y-3">
                    <h3 className="text-sm font-medium text-muted-foreground">
                      {formatDateHeader(date)}
                    </h3>
                    <div className="space-y-2">
                      {dateInstances.map((instance) => {
                        const classData = instance.classes
                        if (!classData) return null

                        const scheduledDate = new Date(instance.scheduled_at)
                        const endDate = new Date(instance.ends_at)
                        const timeRange = `${formatTime24(scheduledDate)} — ${formatTime24(endDate)}`
                        const location = 'Ulaanbaatar Mongolia' // Default location, can be enhanced later
                        const participants = `${instance.current_bookings || 0}/${classData.capacity}`

                        return (
                          <div
                            key={instance.id}
                            onClick={() => handleView(instance.id)}
                            className="relative rounded-lg bg-blue-50 dark:bg-blue-950/20 cursor-pointer transition-all hover:bg-blue-100 dark:hover:bg-blue-950/30"
                          >
                            <div className="flex items-start justify-between gap-4 p-4">
                              <div className="flex-1 min-w-0">
                                <div className="font-semibold text-sm mb-2">
                                  {classData.name}
                                </div>
                                <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                                  <div className="flex items-center gap-1.5">
                                    <Clock className="h-3.5 w-3.5" />
                                    <span>{timeRange}</span>
                                  </div>
                                  <div className="flex items-center gap-1.5">
                                    <MapPin className="h-3.5 w-3.5" />
                                    <span>{location}</span>
                                  </div>
                                  <div className="flex items-center gap-1.5">
                                    <Users className="h-3.5 w-3.5" />
                                    <span>{participants}</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="border-0 shadow-none">
            <CardContent className="p-0">
              <StudioEmptyState
                variant="schedule"
                title={activeTab === 'upcoming' ? t('empty.upcoming') : t('empty.past')}
                action={
                  activeTab === 'upcoming' ? (
                    <Button onClick={() => setOpen(true)}>{t('empty.createFirst')}</Button>
                  ) : undefined
                }
                embedded
              />
            </CardContent>
          </Card>
        )}
      </div>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="right" className="w-full sm:max-w-lg flex flex-col p-0 [&>button]:hidden">
          <div className="p-6 border-b">
            <SheetHeader>
              <div className="flex items-center justify-between">
                <SheetTitle>{t('sheet.addToSchedule')}</SheetTitle>
                <SheetClose asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <X className="h-4 w-4" />
                    <span className="sr-only">{tCommon('close')}</span>
                  </Button>
                </SheetClose>
              </div>
            </SheetHeader>
          </div>
          <div className="flex-1 overflow-y-auto p-6">
            <ScheduleForm classes={classes} onSuccess={handleSuccess} inSheet />
          </div>
        </SheetContent>
      </Sheet>

      {selectedInstance && (
        <Sheet open={viewOpen} onOpenChange={setViewOpen}>
          <SheetContent side="right" className="w-full sm:max-w-lg flex flex-col p-0 [&>button]:hidden">
            <div className="p-6 border-b">
              <SheetHeader>
                <div className="flex items-center justify-between">
                  <SheetTitle>{t('sheet.bookingDetails')}</SheetTitle>
                  <SheetClose asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <X className="h-4 w-4" />
                      <span className="sr-only">{tCommon('close')}</span>
                    </Button>
                  </SheetClose>
                </div>
              </SheetHeader>
            </div>
            <div className="flex-1 overflow-y-auto p-6">
              <ScheduleInstanceView
                instance={selectedInstance}
                bookings={bookings}
                loadingBookings={loadingBookings}
                onRefresh={() => {
                  router.refresh()
                  if (selectedInstance) {
                    handleView(selectedInstance.id)
                  }
                }}
                onCancel={() => {
                  setViewOpen(false)
                  setSelectedInstance(null)
                  router.refresh()
                }}
                formatTime24={formatTime24Helper}
              />
            </div>
          </SheetContent>
        </Sheet>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={deleteDialogOpen}
        onOpenChange={(open) => {
          // Prevent closing while deleting
          if (!isPending) {
            setDeleteDialogOpen(open)
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {selectedInstance && selectedInstance.current_bookings > 0
                ? t('dialog.cancelSchedule')
                : t('dialog.deleteSchedule')}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {selectedInstance && selectedInstance.current_bookings > 0
                ? t('dialog.cancelScheduleDescription', { count: selectedInstance.current_bookings })
                : t('dialog.deleteScheduleDescription')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isPending}>{tCommon('cancel')}</AlertDialogCancel>
            <Button
              variant="destructive"
              onClick={handleDeleteConfirm}
              disabled={isPending}
            >
              {isPending ? t('dialog.deleting') : selectedInstance && selectedInstance.current_bookings > 0 ? t('dialog.cancelScheduleButton') : tCommon('delete')}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

function ScheduleInstanceView({
  instance,
  bookings,
  loadingBookings,
  onRefresh,
  onCancel,
  formatTime24
}: {
  instance: ClassInstanceWithClass
  bookings: BookingWithRelations[]
  loadingBookings: boolean
  onRefresh: () => void
  onCancel: () => void
  formatTime24: (date: Date | string) => string
}) {
  const t = useTranslations('studio.schedule')
  const tCommon = useTranslations('studio.common')
  const [isPending, startTransition] = useTransition()
  const [clientTab, setClientTab] = useState<'attending' | 'cancelled'>('attending')
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false)
  const [recurringSchedule, setRecurringSchedule] = useState<{ day_of_week: number; start_time: string } | null>(null)
  const [loadingSchedule, setLoadingSchedule] = useState(false)

  const classData = instance.classes

  if (!classData) {
    return <p className="text-sm text-muted-foreground">{t('instanceView.classInfoNotAvailable')}</p>
  }

  const handleOpenCancelDialog = async () => {
    setCancelDialogOpen(true)
    // Check if this class has a recurring schedule
    setLoadingSchedule(true)
    try {
      const supabase = await createClient()
      const { data: schedules } = await supabase
        .from('class_schedules')
        .select('day_of_week, start_time')
        .eq('class_id', instance.class_id)
        .eq('is_active', true)
        .limit(1)
        .single()

      if (schedules) {
        setRecurringSchedule(schedules)
      }
    } catch (error) {
      // No recurring schedule found or error
      setRecurringSchedule(null)
    } finally {
      setLoadingSchedule(false)
    }
  }

  const handleCancelThisClass = () => {
    startTransition(async () => {
      const result = await deleteClassInstance({ id: instance.id })

      if (!result.success) {
        toast.error(result.error)
        return
      }

      toast.success(t('toast.classCancelled'))
      setCancelDialogOpen(false)
      onCancel()
    })
  }

  const handleCancelAllFuture = () => {
    startTransition(async () => {
      // Cancel this instance and deactivate the recurring schedule
      const supabase = await createClient()
      
      // First, cancel this instance
      const result = await deleteClassInstance({ id: instance.id })
      if (!result.success) {
        toast.error(result.error)
        return
      }

      // Then deactivate the recurring schedule
      const { error: scheduleError } = await supabase
        .from('class_schedules')
        .update({ is_active: false })
        .eq('class_id', instance.class_id)
        .eq('is_active', true)

      if (scheduleError) {
        console.error('Failed to deactivate schedule:', scheduleError)
        // Continue anyway since the instance is cancelled
      }

      toast.success(t('toast.allFutureCancelled'))
      setCancelDialogOpen(false)
      onCancel()
    })
  }

  // Format date and time separately
  const scheduledDate = new Date(instance.scheduled_at)
  const endDate = new Date(instance.ends_at)
  // Format date as "Monday, Jan 26" (day name, month day)
  const dayName = getDayName(scheduledDate)
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  const month = monthNames[scheduledDate.getMonth()]
  const day = scheduledDate.getDate()
  const dateDisplay = `${dayName}, ${month} ${day}`
  const timeDisplay = `${formatTime24(scheduledDate)} — ${formatTime24(endDate)}`
  const location = 'Ulaanbaatar Mongolia' // Default location

  // Format recurring schedule text
  const formatRecurringSchedule = () => {
    if (!recurringSchedule) return ''
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
    const dayName = dayNames[recurringSchedule.day_of_week]
    // start_time is already in "HH:MM" format
    return t('instanceView.weeklyOn', { day: dayName, time: recurringSchedule.start_time })
  }

  // Filter bookings by status
  const attendingBookings = bookings.filter(b => b.status === 'confirmed')
  const cancelledBookings = bookings.filter(b => b.status === 'cancelled')

  const displayedBookings = clientTab === 'attending' ? attendingBookings : cancelledBookings

  return (
    <div className="space-y-8">
      {/* Service Section (Read-only) */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-muted-foreground mb-4">{t('instanceView.service')}</label>
        <div className="relative rounded-lg bg-blue-50 dark:bg-blue-950/20 border-l-4 border-l-blue-500 p-4">
          <div className="text-sm font-semibold mb-2">{classData.name}</div>
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5" />
              <span>{classData.duration_minutes || tCommon('na')} {t('instanceView.min')}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5" />
              <span>{location}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Date & Time Section (Read-only) */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-muted-foreground">{t('instanceView.dateTime')}</label>
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center gap-1.5 text-sm">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span>{dateDisplay}</span>
          </div>
          <div className="flex items-center gap-1.5 text-sm">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span>{timeDisplay}</span>
          </div>
        </div>
      </div>

      {/* Clients Section */}
      <div className="space-y-3">
        <label className="text-sm font-medium text-muted-foreground">{t('instanceView.clients')}</label>

        <AnimatedTabs
          tabs={[
            { id: 'attending', label: `${t('instanceView.attending')} ${attendingBookings.length}` },
            { id: 'cancelled', label: `${t('instanceView.cancelled')} ${cancelledBookings.length}` },
          ]}
          activeTab={clientTab}
          onTabChange={(tab) => setClientTab(tab as 'attending' | 'cancelled')}
        />

        {loadingBookings ? (
          <div className="space-y-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        ) : displayedBookings.length > 0 ? (
          <div className="space-y-2">
            {displayedBookings.map((booking) => (
              <div
                key={booking.id}
                className="flex items-center justify-between p-3 rounded-md border bg-muted/50"
              >
                <div className="text-sm">
                  {booking.user_profiles?.full_name || t('instanceView.unknownClient')}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-12 text-center space-y-3">
            <div className="flex justify-center">
              <div className="relative">
                <Users className="h-16 w-16 text-muted-foreground/20" />
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium">
                {clientTab === 'attending'
                  ? t('instanceView.noParticipants')
                  : t('instanceView.noCancelledBookings')}
              </p>
              {clientTab === 'attending' && (
                <p className="text-xs text-muted-foreground">
                  {t('instanceView.clientsJoinInfo')}
                </p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Cancel Booking Button */}
      <div className="pt-4 border-t">
        <Button
          variant="secondary"
          className="w-full"
          onClick={handleOpenCancelDialog}
          disabled={isPending}
        >
          <Ban className="h-4 w-4 mr-2" />
          {t('instanceView.cancelBooking')}
        </Button>
      </div>

      {/* Cancel Booking Confirmation Dialog */}
      <AlertDialog
        open={cancelDialogOpen}
        onOpenChange={(open) => {
          // Prevent closing while cancelling
          if (!isPending && !loadingSchedule) {
            setCancelDialogOpen(open)
          }
        }}
      >
        <AlertDialogContent className="sm:max-w-md">
          <button
            onClick={() => !isPending && !loadingSchedule && setCancelDialogOpen(false)}
            className="absolute right-4 top-4 rounded-full bg-muted p-1.5 opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none"
            disabled={isPending || loadingSchedule}
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </button>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-left">{t('dialog.cancelClassTitle')}</AlertDialogTitle>
            <AlertDialogDescription className="text-left pt-2">
              {t('dialog.cancelClassDescription')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex flex-col gap-3 w-full">
            <Button
              variant="destructive"
              className="w-full justify-center text-white"
              onClick={handleCancelThisClass}
              disabled={isPending || loadingSchedule}
            >
              {t('dialog.cancelThisClass')}
            </Button>
            {recurringSchedule && (
              <Button
                variant="secondary"
                className="w-full justify-center"
                onClick={handleCancelAllFuture}
                disabled={isPending || loadingSchedule}
              >
                {t('dialog.cancelAllFuture')}
              </Button>
            )}
            <Button
              variant="secondary"
              className="w-full justify-center"
              onClick={() => setCancelDialogOpen(false)}
              disabled={isPending || loadingSchedule}
            >
              {t('dialog.dismiss')}
            </Button>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

