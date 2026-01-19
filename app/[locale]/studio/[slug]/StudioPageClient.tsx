'use client'

import { useState, useMemo } from 'react'
import Image from 'next/image'
import { useTranslations, useLocale } from 'next-intl'
import { motion, AnimatePresence } from 'motion/react'
import { ChevronRight, ChevronLeft, Calendar, Clock, MapPin, Phone, Mail, Users } from 'lucide-react'
import { BookingForm } from '@/components/studio/BookingForm'
import { formatTime, formatAmount } from '@/lib/utils'
import type { Tables } from '@/lib/types/database'

type Studio = Tables<'studios'>
type Class = Tables<'classes'>
type ClassInstance = Tables<'class_instances'> & {
  classes: Class
}

interface StudioPageClientProps {
  studio: Studio
  classInstances: ClassInstance[]
}

type ScheduleDay = {
  day: string
  date: number
  displayDate: string
  dateObj: Date
  status: string
  available: boolean
  slotCount: number
  sessions: Array<{
    id: number
    name: string
    time: string
    spots: string
    available: boolean
    instance: ClassInstance
  }>
}

export function StudioPageClient({ studio, classInstances }: StudioPageClientProps) {
  const t = useTranslations('landing.bookingPage')
  const locale = useLocale()
  const [activeTab, setActiveTab] = useState<'schedule' | 'pricing' | 'contact'>('schedule')
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [selectedInstance, setSelectedInstance] = useState<number | null>(null)
  const [currentWeekStart, setCurrentWeekStart] = useState(() => {
    const today = new Date()
    const day = today.getDay()
    const diff = today.getDate() - day + (day === 0 ? -6 : 1) // Monday as first day
    const monday = new Date(today.setDate(diff))
    monday.setHours(0, 0, 0, 0)
    return monday
  })

  // Group instances by date
  const instancesByDate = useMemo(() => {
    const grouped = new Map<string, ClassInstance[]>()
    const now = new Date()
    
    classInstances.forEach((instance) => {
      if (instance.is_cancelled) return
      const instanceDate = new Date(instance.scheduled_at)
      if (instanceDate < now) return
      
      const dateKey = instanceDate.toISOString().split('T')[0]
      if (!grouped.has(dateKey)) {
        grouped.set(dateKey, [])
      }
      grouped.get(dateKey)!.push(instance)
    })
    
    return grouped
  }, [classInstances])

  // Generate weekly schedule data
  const scheduleData: ScheduleDay[] = useMemo(() => {
    const days: ScheduleDay[] = []
    const dayNames = [
      t('days.mon'),
      t('days.tue'),
      t('days.wed'),
      t('days.thu'),
      t('days.fri'),
      t('days.sat'),
      t('days.sun'),
    ]

    for (let i = 0; i < 7; i++) {
      const date = new Date(currentWeekStart)
      date.setDate(currentWeekStart.getDate() + i)
      date.setHours(0, 0, 0, 0)
      
      const dateKey = date.toISOString().split('T')[0]
      const instances = instancesByDate.get(dateKey) || []
      const availableInstances = instances.filter(
        (inst) => inst.current_bookings < inst.classes.capacity
      )

      const sessions = availableInstances.map((instance) => {
        const scheduledAt = new Date(instance.scheduled_at)
        const endsAt = new Date(instance.ends_at)
        const availableSpots = instance.classes.capacity - instance.current_bookings
        
        return {
          id: instance.id,
          name: instance.classes.name,
          time: `${formatTime(scheduledAt)} - ${formatTime(endsAt)}`,
          spots: `${availableSpots}/${instance.classes.capacity}`,
          available: availableSpots > 0,
          instance,
        }
      })

      const slotCount = availableInstances.length
      days.push({
        day: dayNames[date.getDay() === 0 ? 6 : date.getDay() - 1],
        date: date.getDate(),
        displayDate: date.getDate().toString(),
        dateObj: date,
        status: slotCount > 0 ? `${slotCount} ${t('status.slots')}` : t('status.unavailable'),
        available: slotCount > 0,
        slotCount,
        sessions,
      })
    }

    return days
  }, [currentWeekStart, instancesByDate, t])

  // Set initial selected date to first available day or today
  const firstSelectedDate = useMemo(() => {
    if (selectedDate) return selectedDate
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const todayDay = scheduleData.find((d) => {
      const dDate = d.dateObj
      return (
        dDate.getDate() === today.getDate() &&
        dDate.getMonth() === today.getMonth() &&
        dDate.getFullYear() === today.getFullYear()
      )
    })
    if (todayDay && todayDay.available) {
      return todayDay.dateObj
    }
    const firstAvailable = scheduleData.find((d) => d.available)
    return firstAvailable ? firstAvailable.dateObj : scheduleData[0]?.dateObj || today
  }, [scheduleData, selectedDate])

  const selectedDayData = useMemo(() => {
    const selected = selectedDate || firstSelectedDate
    if (!selected) return null
    
    const selectedKey = selected.toISOString().split('T')[0]
    return scheduleData.find((d) => d.dateObj.toISOString().split('T')[0] === selectedKey) || null
  }, [selectedDate, firstSelectedDate, scheduleData])

  const handlePreviousWeek = () => {
    setCurrentWeekStart((prev) => {
      const newDate = new Date(prev)
      newDate.setDate(prev.getDate() - 7)
      return newDate
    })
    setSelectedDate(null)
  }

  const handleNextWeek = () => {
    setCurrentWeekStart((prev) => {
      const newDate = new Date(prev)
      newDate.setDate(prev.getDate() + 7)
      return newDate
    })
    setSelectedDate(null)
  }

  const formatDateRange = () => {
    const start = scheduleData[0]?.dateObj
    const end = scheduleData[6]?.dateObj
    if (!start || !end) return ''

    const formatter = new Intl.DateTimeFormat(locale === 'mn' ? 'mn' : 'en-US', {
      month: 'long',
      day: 'numeric',
    })
    return `${formatter.format(start)} - ${formatter.format(end)}`
  }

  return (
    <>
      <main className="min-h-screen bg-background text-foreground">
        <section className="bg-background">
          {/* Header Banner */}
          <div
            className="relative h-48 md:h-64 w-full bg-muted bg-cover bg-center"
            style={{
              backgroundImage: studio.cover_image_url
                ? `url(${studio.cover_image_url})`
                : undefined,
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
          </div>

          {/* Content */}
          <div className="px-4 md:px-6 lg:px-8 py-6 md:py-8 space-y-6">
            {/* Studio Profile */}
            <div className="flex items-start gap-4 -mt-16 md:-mt-20 relative z-10">
                  <div className="flex h-16 w-16 md:h-20 md:w-20 items-center justify-center rounded-lg bg-background border-2 border-background overflow-hidden shadow-lg shrink-0">
                    {studio.logo_url ? (
                      <Image
                        src={studio.logo_url}
                        alt={studio.name}
                        width={80}
                        height={80}
                        className="object-cover"
                      />
                    ) : (
                      <div className="h-full w-full bg-muted flex items-center justify-center">
                        <span className="text-2xl md:text-3xl font-bold">{studio.name.charAt(0)}</span>
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h1 className="text-2xl md:text-3xl font-semibold">{studio.name}</h1>
                    </div>
                    {studio.description && (
                      <p className="mt-2 text-sm md:text-base text-muted-foreground">{studio.description}</p>
                    )}
                  </div>
                </div>

            {/* Navigation Tabs */}
            <div className="flex gap-6 border-b border-border relative">
              {(['schedule', 'pricing', 'contact'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`relative pb-3 text-sm md:text-base font-medium transition-colors ${
                    activeTab === tab
                      ? 'text-foreground'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {t(`tabs.${tab}`)}
                  {activeTab === tab && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-foreground"
                      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                    />
                  )}
                </button>
              ))}
            </div>

            {/* Tab Content */}
            <div className="min-h-[400px]">
              <AnimatePresence mode="wait">
                          {activeTab === 'schedule' && (
                            <motion.div
                              key="schedule"
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -10 }}
                              transition={{ duration: 0.2 }}
                            >
                              <div className="mb-4 flex items-center justify-between">
                                <h4 className="text-sm font-medium">{formatDateRange()}</h4>
                                <div className="flex items-center gap-1 text-muted-foreground">
                                  <button
                                    onClick={handlePreviousWeek}
                                    className="rounded-full p-1 hover:bg-muted hover:text-foreground transition-colors"
                                  >
                                    <ChevronLeft className="h-4 w-4" />
                                  </button>
                                  <button className="rounded-full p-1 hover:bg-muted hover:text-foreground transition-colors">
                                    <Calendar className="h-4 w-4" />
                                  </button>
                                  <button
                                    onClick={handleNextWeek}
                                    className="rounded-full p-1 hover:bg-muted hover:text-foreground transition-colors"
                                  >
                                    <ChevronRight className="h-4 w-4" />
                                  </button>
                                </div>
                              </div>

                              {/* Weekly Schedule */}
                              <div className="mb-6 overflow-x-auto -mx-6 px-6 md:mx-0 md:px-0">
                                <div className="grid grid-cols-7 gap-2 min-w-[500px] md:min-w-0">
                                  {scheduleData.map((item, i) => {
                                    const isSelected =
                                      (selectedDate || firstSelectedDate)?.toISOString().split('T')[0] ===
                                      item.dateObj.toISOString().split('T')[0]
                                    return (
                                      <motion.div
                                        key={`${item.day}-${item.date}`}
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ delay: i * 0.05 }}
                                        onClick={() => setSelectedDate(item.dateObj)}
                                        className={`rounded-lg border p-1.5 md:p-2 text-center cursor-pointer transition-colors ${
                                          isSelected
                                            ? 'border-transparent bg-muted'
                                            : 'border-border/50 hover:bg-muted/50'
                                        }`}
                                      >
                                        <div className="text-[10px] md:text-xs text-muted-foreground">
                                          {item.day}
                                        </div>
                                        <div className="mt-0.5 md:mt-1 text-xs md:text-sm font-medium">
                                          {item.displayDate}
                                        </div>
                                        <div className="mt-0.5 md:mt-1 text-[10px] md:text-xs text-muted-foreground">
                                          {!item.available ? (
                                            <span className="text-muted-foreground/60">
                                              {t('status.unavailable')}
                                            </span>
                                          ) : (
                                            <span className="flex items-center justify-center gap-0.5 md:gap-1">
                                              <span className="h-1 w-1 md:h-1.5 md:w-1.5 rounded-full bg-green-500"></span>
                                              <span className="hidden sm:inline">
                                                {item.slotCount > 0 ? `${item.slotCount} ${t('status.slots')}` : item.status}
                                              </span>
                                              <span className="sm:hidden">{item.slotCount > 0 ? item.slotCount : ''}</span>
                                            </span>
                                          )}
                                        </div>
                                      </motion.div>
                                    )
                                  })}
                                </div>
                              </div>

                              {/* Class Listings */}
                              <div className="space-y-4 md:space-y-6">
                                <AnimatePresence mode="wait">
                                  {selectedDayData?.sessions && selectedDayData.sessions.length > 0 ? (
                                    <motion.div
                                      key={selectedDayData.dateObj.toISOString()}
                                      initial={{ opacity: 0, y: 10 }}
                                      animate={{ opacity: 1, y: 0 }}
                                      exit={{ opacity: 0, y: -10 }}
                                      className="space-y-4 md:space-y-6"
                                    >
                                      {selectedDayData.sessions.map((session, index) => (
                                        <motion.div
                                          key={`${session.id}-${index}`}
                                          initial={{ opacity: 0, x: -10 }}
                                          animate={{ opacity: 1, x: 0 }}
                                          transition={{ delay: index * 0.1 }}
                                          className="group"
                                        >
                                          <div className="flex items-center justify-between gap-2 md:gap-4">
                                            <div className="flex-1 space-y-1 md:space-y-2 min-w-0">
                                              <h4 className="text-xs md:text-sm font-medium leading-none">
                                                {session.name}
                                              </h4>

                                              <div className="flex items-center gap-3 md:gap-6 text-[10px] md:text-xs text-muted-foreground flex-wrap">
                                                <div className="flex items-center gap-1 md:gap-1.5">
                                                  <Clock className="h-3 w-3 md:h-3.5 md:w-3.5" />
                                                  <span>{session.time}</span>
                                                </div>

                                                {studio.address && (
                                                  <div className="flex items-center gap-1 md:gap-1.5">
                                                    <MapPin className="h-3 w-3 md:h-3.5 md:w-3.5" />
                                                    <span className="hidden sm:inline">{studio.name}</span>
                                                    <span className="sm:hidden">
                                                      {studio.name.split(' ')[0]}
                                                    </span>
                                                  </div>
                                                )}

                                                <div className="flex items-center gap-1 md:gap-1.5">
                                                  <Users className="h-3 w-3 md:h-3.5 md:w-3.5" />
                                                  <span>{session.spots}</span>
                                                </div>
                                              </div>
                                            </div>

                                            <motion.button
                                              whileHover={{ scale: 1.05 }}
                                              whileTap={{ scale: 0.95 }}
                                              onClick={() => setSelectedInstance(session.id)}
                                              disabled={!session.available}
                                              className="h-7 md:h-8 rounded-full bg-muted px-3 md:px-5 text-[10px] md:text-xs font-medium transition-colors hover:bg-foreground hover:text-background shrink-0 disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                              {t('book')}
                                            </motion.button>
                                          </div>
                                          {index < selectedDayData.sessions.length - 1 && (
                                            <div className="mt-4 md:mt-6 h-px w-full bg-border/50" />
                                          )}
                                        </motion.div>
                                      ))}
                                    </motion.div>
                                  ) : (
                                    <motion.div
                                      key="empty"
                                      initial={{ opacity: 0 }}
                                      animate={{ opacity: 1 }}
                                      exit={{ opacity: 0 }}
                                      className="flex h-32 md:h-40 flex-col items-center justify-center rounded-lg border border-dashed border-border p-4 md:p-8 text-center text-muted-foreground"
                                    >
                                      <p className="text-xs md:text-sm">{t('noClasses')}</p>
                                    </motion.div>
                                  )}
                                </AnimatePresence>
                              </div>
                            </motion.div>
                          )}

                          {/* Pricing Content */}
                          {activeTab === 'pricing' && (
                            <motion.div
                              key="pricing"
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -10 }}
                              transition={{ duration: 0.2 }}
                              className="space-y-3 md:space-y-4"
                            >
                              {/* Get unique classes for pricing display */}
                              {Array.from(
                                new Map(classInstances.map((inst) => [inst.classes.id, inst.classes])).values()
                              ).map((cls) => (
                                <motion.div
                                  key={cls.id}
                                  whileHover={{ scale: 1.02 }}
                                  className="flex items-center gap-2 md:gap-4 rounded-xl p-1.5 md:p-2 hover:bg-muted/50 cursor-pointer transition-colors"
                                >
                                  <div className="relative h-12 w-12 md:h-20 md:w-20 shrink-0 overflow-hidden rounded-lg bg-muted">
                                    {studio.logo_url ? (
                                      <Image
                                        src={studio.logo_url}
                                        alt={cls.name}
                                        fill
                                        className="object-cover"
                                      />
                                    ) : (
                                      <div className="h-full w-full flex items-center justify-center">
                                        <span className="text-2xl">{cls.name.charAt(0)}</span>
                                      </div>
                                    )}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <h4 className="text-xs md:text-sm font-medium">{cls.name}</h4>
                                    <p className="mt-0.5 md:mt-1 text-xs md:text-sm font-medium">
                                      {formatAmount(cls.price, cls.currency)}
                                    </p>
                                    {cls.description && (
                                      <p className="mt-0.5 md:mt-1 text-[10px] md:text-xs text-muted-foreground line-clamp-2">
                                        {cls.description}
                                      </p>
                                    )}
                                  </div>
                                </motion.div>
                              ))}
                              {classInstances.length === 0 && (
                                <div className="flex h-32 md:h-40 flex-col items-center justify-center rounded-lg border border-dashed border-border p-4 md:p-8 text-center text-muted-foreground">
                                  <p className="text-xs md:text-sm">No pricing available</p>
                                </div>
                              )}
                            </motion.div>
                          )}

                          {/* Contact Content */}
                          {activeTab === 'contact' && (
                            <motion.div
                              key="contact"
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -10 }}
                              transition={{ duration: 0.2 }}
                              className="space-y-4 md:space-y-6"
                            >
                              {studio.address && (
                                <motion.div
                                  whileHover={{ x: 5 }}
                                  className="flex items-start gap-2 md:gap-4"
                                >
                                  <div className="flex h-8 w-8 md:h-10 md:w-10 shrink-0 items-center justify-center rounded-lg bg-muted">
                                    <MapPin className="h-4 w-4 md:h-5 md:w-5 text-foreground/60" />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <h4 className="text-xs md:text-sm font-medium">{t('contact.location')}</h4>
                                    <p className="mt-0.5 md:mt-1 text-[10px] md:text-xs text-muted-foreground">
                                      {studio.address}
                                    </p>
                                  </div>
                                </motion.div>
                              )}

                              {studio.phone && (
                                <motion.div
                                  whileHover={{ x: 5 }}
                                  className="flex items-start gap-2 md:gap-4"
                                >
                                  <div className="flex h-8 w-8 md:h-10 md:w-10 shrink-0 items-center justify-center rounded-lg bg-muted">
                                    <Phone className="h-4 w-4 md:h-5 md:w-5 text-foreground/60" />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <h4 className="text-xs md:text-sm font-medium">{t('contact.phone')}</h4>
                                    <p className="mt-0.5 md:mt-1 text-[10px] md:text-xs text-muted-foreground">
                                      <a
                                        href={`tel:${studio.phone}`}
                                        className="hover:text-foreground transition-colors"
                                      >
                                        {studio.phone}
                                      </a>
                                    </p>
                                  </div>
                                </motion.div>
                              )}

                              {studio.email && (
                                <motion.div
                                  whileHover={{ x: 5 }}
                                  className="flex items-start gap-2 md:gap-4"
                                >
                                  <div className="flex h-8 w-8 md:h-10 md:w-10 shrink-0 items-center justify-center rounded-lg bg-muted">
                                    <Mail className="h-4 w-4 md:h-5 md:w-5 text-foreground/60" />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <h4 className="text-xs md:text-sm font-medium">{t('contact.email')}</h4>
                                    <p className="mt-0.5 md:mt-1 text-[10px] md:text-xs text-muted-foreground">
                                      <a
                                        href={`mailto:${studio.email}`}
                                        className="hover:text-foreground transition-colors break-all"
                                      >
                                        {studio.email}
                                      </a>
                                    </p>
                                  </div>
                                </motion.div>
                              )}

                              {!studio.address && !studio.phone && !studio.email && (
                                <div className="flex h-32 md:h-40 flex-col items-center justify-center rounded-lg border border-dashed border-border p-4 md:p-8 text-center text-muted-foreground">
                                  <p className="text-xs md:text-sm">No contact information available</p>
                                </div>
                              )}
                            </motion.div>
                          )}
              </AnimatePresence>
            </div>
          </div>
        </section>
      </main>

      {/* Booking Form Modal */}
      {selectedInstance && (
        <BookingForm
          classInstanceId={selectedInstance}
          classData={
            classInstances.find((inst) => inst.id === selectedInstance)?.classes ||
            ({} as Class)
          }
          onClose={() => setSelectedInstance(null)}
        />
      )}
    </>
  )
}
