'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Plus, Clock, MapPin, Users, X } from 'lucide-react'
import { AnimatedTabs, type TabItem } from '@/components/custom/AnimatedTabs'
import { ScheduleForm } from '@/components/dashboard/ScheduleForm'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetClose,
} from '@/components/ui/sheet'
import { format, isToday, isTomorrow, isPast, parseISO, startOfDay } from 'date-fns'

interface Class {
  id: number
  name: string
  duration_minutes: number
  is_active: boolean
}

interface ClassInstance {
  id: number
  class_id: number
  scheduled_at: string
  ends_at: string
  current_bookings: number
  is_cancelled: boolean
  classes?: {
    name: string
    capacity: number
    type?: string
  }
}

interface ScheduleClientProps {
  classes: Class[]
  instances: ClassInstance[]
}

export function ScheduleClient({ classes, instances }: ScheduleClientProps) {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<'upcoming' | 'past'>('upcoming')
  const [showForm, setShowForm] = useState(false)

  const tabs: TabItem[] = [
    { id: 'upcoming', label: 'Upcoming' },
    { id: 'past', label: 'Past' },
  ]

  // Group instances by date
  const groupedInstances = useMemo(() => {
    const now = new Date()
    const filtered = instances.filter((instance) => {
      const scheduledDate = parseISO(instance.scheduled_at)
      if (activeTab === 'upcoming') {
        return !instance.is_cancelled && scheduledDate >= now
      } else {
        return isPast(scheduledDate) || instance.is_cancelled
      }
    })

    // Sort by scheduled_at
    const sorted = filtered.sort((a, b) => {
      const dateA = parseISO(a.scheduled_at)
      const dateB = parseISO(b.scheduled_at)
      return activeTab === 'upcoming' 
        ? dateA.getTime() - dateB.getTime()
        : dateB.getTime() - dateA.getTime()
    })

    // Group by date
    const grouped: Record<string, ClassInstance[]> = {}
    sorted.forEach((instance) => {
      const date = startOfDay(parseISO(instance.scheduled_at))
      const dateKey = date.toISOString()
      if (!grouped[dateKey]) {
        grouped[dateKey] = []
      }
      grouped[dateKey].push(instance)
    })

    return grouped
  }, [instances, activeTab])

  const formatDateHeader = (dateString: string) => {
    const date = parseISO(dateString)
    if (isToday(date)) {
      return 'Today'
    }
    if (isTomorrow(date)) {
      return `Tomorrow ${format(date, 'EEEE, MMM d')}`
    }
    return format(date, 'EEEE MMM d')
  }

  // Refresh when form closes (assuming ScheduleForm will trigger router.refresh on success)
  const handleOpenChange = (open: boolean) => {
    setShowForm(open)
    if (!open) {
      router.refresh()
    }
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Schedule</h1>
          <p className="text-sm text-muted-foreground">Manage your class sessions</p>
        </div>
        <Button onClick={() => setShowForm(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Create schedule
        </Button>
      </div>

      {/* Tabs */}
      <AnimatedTabs
        tabs={tabs}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        layoutId="scheduleTabs"
      />

      {/* Content */}
      <div className="space-y-8">
        {Object.keys(groupedInstances).length === 0 ? (
          <div className="py-12 text-center">
            <p className="text-muted-foreground mb-4">
              {activeTab === 'upcoming' 
                ? 'No upcoming sessions' 
                : 'No past sessions'}
            </p>
            {activeTab === 'upcoming' && (
              <Button onClick={() => setShowForm(true)}>Create your first session</Button>
            )}
          </div>
        ) : (
          Object.entries(groupedInstances).map(([dateKey, dayInstances]) => (
            <div key={dateKey} className="space-y-4">
              <h2 className="text-sm font-medium text-muted-foreground">
                {formatDateHeader(dateKey)}
              </h2>
              <div className="space-y-3">
                {dayInstances.map((instance) => {
                  const classData = instance.classes
                  if (!classData) return null

                  const startTime = format(parseISO(instance.scheduled_at), 'HH:mm')
                  const endTime = format(parseISO(instance.ends_at), 'HH:mm')
                  const availability = `${instance.current_bookings}/${classData.capacity}`

                  return (
                    <div
                      key={instance.id}
                      className="relative flex items-start gap-4 rounded-lg border bg-card p-4 hover:bg-muted/50 transition-colors"
                    >
                      {/* Left indicator */}
                      <div className="absolute left-0 top-0 bottom-0 w-1 rounded-l-lg bg-blue-500" />
                      
                      {/* Content */}
                      <div className="flex-1 min-w-0 pl-3">
                        <h3 className="font-medium text-sm mb-2">{classData.name}</h3>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground flex-wrap">
                          <div className="flex items-center gap-1.5">
                            <Clock className="h-3.5 w-3.5" />
                            <span>{startTime} — {endTime}</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <MapPin className="h-3.5 w-3.5" />
                            <span>Ulaanbaatar Mongolia</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Users className="h-3.5 w-3.5" />
                            <span>{availability}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Form Sheet */}
      <Sheet open={showForm} onOpenChange={handleOpenChange}>
        <SheetContent side="right" className="w-full sm:max-w-lg flex flex-col p-0 [&>button]:hidden">
          <div className="p-6 border-b">
            <SheetHeader>
              <div className="flex items-center justify-between">
                <SheetTitle>Add to schedule</SheetTitle>
                <SheetClose asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <X className="h-4 w-4" />
                    <span className="sr-only">Close</span>
                  </Button>
                </SheetClose>
              </div>
            </SheetHeader>
          </div>
          <div className="flex-1 overflow-y-auto p-6">
            <ScheduleForm 
              classes={classes} 
              inSheet={true}
              onSuccess={() => setShowForm(false)}
            />
          </div>
        </SheetContent>
      </Sheet>
    </div>
  )
}
