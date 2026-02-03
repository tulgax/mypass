'use client'

import { useMemo, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { createScheduleWithRepeat } from '@/lib/actions/class-instances'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Clock } from 'lucide-react'

interface ClassOption {
  id: number
  name: string
  duration_minutes: number
  is_active: boolean
}

interface ScheduleFormProps {
  classes: ClassOption[]
  onSuccess?: () => void
  inSheet?: boolean
}

type RepeatOption = 'none' | 'weekly'

const daysOfWeek = [
  { label: 'Mon', value: 1 },
  { label: 'Tue', value: 2 },
  { label: 'Wed', value: 3 },
  { label: 'Thu', value: 4 },
  { label: 'Fri', value: 5 },
  { label: 'Sat', value: 6 },
  { label: 'Sun', value: 0 },
]

export function ScheduleForm({ classes, onSuccess, inSheet = false }: ScheduleFormProps) {
  const t = useTranslations('studio.forms.scheduleForm')
  const tCommon = useTranslations('studio.common')
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [selectedClassId, setSelectedClassId] = useState<string>('')
  const [startDate, setStartDate] = useState('')
  const [startTime, setStartTime] = useState('')
  const [repeat, setRepeat] = useState<RepeatOption>('none')
  const [selectedDays, setSelectedDays] = useState<number[]>([])
  const [error, setError] = useState<string | null>(null)

  const activeClasses = useMemo(
    () => classes.filter((cls) => cls.is_active),
    [classes]
  )

  function buildDateTime(dateStr: string, timeStr: string) {
    const [year, month, day] = dateStr.split('-').map(Number)
    const [hours, minutes] = timeStr.split(':').map(Number)
    return new Date(year, month - 1, day, hours, minutes)
  }

  function toggleDay(dayValue: number) {
    setSelectedDays((prev) =>
      prev.includes(dayValue) ? prev.filter((d) => d !== dayValue) : [...prev, dayValue]
    )
  }

  function buildInstances(classDuration: number) {
    if (!startDate || !startTime) return []

    const instances: { scheduled_at: string; ends_at: string }[] = []
    const start = buildDateTime(startDate, startTime)

    if (repeat === 'none') {
      const endsAt = new Date(start.getTime() + classDuration * 60 * 1000)
      return [
        {
          scheduled_at: start.toISOString(),
          ends_at: endsAt.toISOString(),
        },
      ]
    }

    const startDay = new Date(startDate)
    for (let offset = 0; offset < 28; offset += 1) {
      const current = new Date(startDay)
      current.setDate(startDay.getDate() + offset)
      if (!selectedDays.includes(current.getDay())) continue

      const scheduled = new Date(
        current.getFullYear(),
        current.getMonth(),
        current.getDate(),
        start.getHours(),
        start.getMinutes()
      )
      if (scheduled < start) continue

      const endsAt = new Date(scheduled.getTime() + classDuration * 60 * 1000)
      instances.push({
        scheduled_at: scheduled.toISOString(),
        ends_at: endsAt.toISOString(),
      })
    }

    return instances
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)

    const classId = Number(selectedClassId)
    if (!classId) {
      setError(t('errors.chooseClass'))
      toast.error(t('errors.chooseClass'))
      return
    }

    if (!startDate || !startTime) {
      setError(t('errors.selectDateTime'))
      toast.error(t('errors.selectDateTime'))
      return
    }

    if (repeat === 'weekly' && selectedDays.length === 0) {
      setError(t('errors.selectDays'))
      toast.error(t('errors.selectDays'))
      return
    }

    const selectedClass = classes.find((cls) => cls.id === classId)
    if (!selectedClass) {
      setError(t('errors.classNotAvailable'))
      toast.error(t('errors.classNotAvailable'))
      return
    }

    if (!selectedClass.is_active) {
      setError(t('errors.inactiveClass'))
      toast.error(t('errors.inactiveClass'))
      return
    }

    const instances = buildInstances(selectedClass.duration_minutes)
    if (instances.length === 0) {
      setError(t('errors.noSessions'))
      toast.error(t('errors.noSessions'))
      return
    }

    startTransition(async () => {
      try {
        const result = await createScheduleWithRepeat({
          class_id: classId,
          start_date: startDate,
          start_time: startTime,
          repeat,
          selected_days: repeat === 'weekly' ? selectedDays : undefined,
        })

        if (!result.success) {
          setError(result.error)
          toast.error(result.error)
          return
        }

        toast.success(t('toast.created'))
        setStartDate('')
        setStartTime('')
        setSelectedDays([])
        setRepeat('none')
        setSelectedClassId('')
        
        // Refresh and call onSuccess if provided
        router.refresh()
        if (onSuccess) {
          setTimeout(() => onSuccess(), 100)
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : t('toast.failed')
        setError(errorMessage)
        toast.error(errorMessage)
      }
    })
  }

  // Time picker component
  const TimePicker = ({ value, onChange }: { value: string; onChange: (value: string) => void }) => {
    const [hours, minutes] = value ? value.split(':') : ['09', '00']
    
    const hourOptions = Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, '0'))
    // Common minute intervals: 00, 15, 30, 45
    const minuteOptions = ['00', '15', '30', '45']

    const handleHourChange = (h: string) => {
      onChange(`${h}:${minutes}`)
    }

    const handleMinuteChange = (m: string) => {
      onChange(`${hours}:${m}`)
    }

    return (
      <div className="flex gap-2">
          <Select value={hours} onValueChange={handleHourChange}>
          <SelectTrigger>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <SelectValue placeholder={t('hour')} />
            </div>
          </SelectTrigger>
          <SelectContent className="max-h-[200px]">
            {hourOptions.map((hour) => (
              <SelectItem key={hour} value={hour}>
                {hour}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={minutes} onValueChange={handleMinuteChange}>
          <SelectTrigger>
            <SelectValue placeholder={t('min')} />
          </SelectTrigger>
          <SelectContent>
            {minuteOptions.map((minute) => (
              <SelectItem key={minute} value={minute}>
                {minute}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    )
  }

  const formContent = (
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label>{t('class')}</Label>
            <Select value={selectedClassId} onValueChange={setSelectedClassId}>
              <SelectTrigger>
                <SelectValue placeholder={t('selectClass')} />
              </SelectTrigger>
              <SelectContent>
                {classes.map((cls) => (
                  <SelectItem 
                    key={cls.id} 
                    value={String(cls.id)}
                    disabled={!cls.is_active}
                  >
                    {cls.name} • {cls.duration_minutes} min {!cls.is_active && `(${t('inactive')})`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {classes.length === 0 && (
              <p className="text-sm text-muted-foreground">
                {t('noClasses')}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label>{t('startDate')}</Label>
            <Input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label>{t('startTime')}</Label>
            <TimePicker value={startTime} onChange={setStartTime} />
          </div>

          <div className="space-y-2">
            <Label>{t('repeat')}</Label>
            <Select value={repeat} onValueChange={(value) => setRepeat(value as RepeatOption)}>
              <SelectTrigger>
                <SelectValue placeholder={t('doesNotRepeat')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">{t('doesNotRepeat')}</SelectItem>
                <SelectItem value="weekly">{t('weekly')}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {repeat === 'weekly' && (
            <div className="space-y-2">
              <Label>{t('repeatOn')}</Label>
              <div className="flex flex-wrap gap-2">
                {daysOfWeek.map((day) => (
                  <label
                    key={day.value}
                    className={`cursor-pointer rounded-full border px-4 py-2 text-sm transition-colors ${
                      selectedDays.includes(day.value)
                        ? 'border-primary bg-primary text-primary-foreground'
                        : 'border-border bg-background'
                    }`}
                  >
                    <input
                      type="checkbox"
                      className="sr-only"
                      checked={selectedDays.includes(day.value)}
                      onChange={() => toggleDay(day.value)}
                    />
                    {day.label}
                  </label>
                ))}
              </div>
              <p className="text-xs text-muted-foreground">
                {t('repeatHelp')}
              </p>
            </div>
          )}

          {error && <p className="text-sm text-destructive">{error}</p>}

          <div className="flex gap-2">
            <Button type="submit" disabled={isPending || classes.length === 0}>
              {isPending ? t('saving') : t('addClass')}
            </Button>
          </div>
        </form>
  )

  if (inSheet) {
    return formContent
  }

  return (
    <Card className="max-w-2xl">
      <CardHeader>
        <CardTitle>{t('title')}</CardTitle>
      </CardHeader>
      <CardContent>
        {formContent}
      </CardContent>
    </Card>
  )
}
