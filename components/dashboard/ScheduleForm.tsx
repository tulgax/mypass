'use client'

import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
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
  const router = useRouter()
  const [selectedClassId, setSelectedClassId] = useState<string>('')
  const [startDate, setStartDate] = useState('')
  const [startTime, setStartTime] = useState('')
  const [repeat, setRepeat] = useState<RepeatOption>('none')
  const [selectedDays, setSelectedDays] = useState<number[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

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
    setSuccess(null)

    const classId = Number(selectedClassId)
    if (!classId) {
      setError('Please choose a class')
      return
    }

    if (!startDate || !startTime) {
      setError('Please select a start date and time')
      return
    }

    if (repeat === 'weekly' && selectedDays.length === 0) {
      setError('Please select at least one day for weekly repeats')
      return
    }

    const selectedClass = classes.find((cls) => cls.id === classId)
    if (!selectedClass) {
      setError('Selected class is not available')
      return
    }

    if (!selectedClass.is_active) {
      setError('Cannot schedule inactive classes. Please activate the class first.')
      return
    }

    const instances = buildInstances(selectedClass.duration_minutes)
    if (instances.length === 0) {
      setError('No upcoming sessions generated')
      return
    }

    setLoading(true)
    try {
      const supabase = createClient()
      const { error: instancesError } = await supabase.from('class_instances').insert(
        instances.map((instance) => ({
          class_id: classId,
          scheduled_at: instance.scheduled_at,
          ends_at: instance.ends_at,
        }))
      )

      if (instancesError) throw instancesError

      if (repeat === 'weekly') {
        const endTime = new Date(
          buildDateTime(startDate, startTime).getTime() +
            selectedClass.duration_minutes * 60 * 1000
        )
        const endTimeString = `${endTime.getHours().toString().padStart(2, '0')}:${endTime
          .getMinutes()
          .toString()
          .padStart(2, '0')}`

        const { error: scheduleError } = await supabase.from('class_schedules').insert(
          selectedDays.map((day) => ({
            class_id: classId,
            day_of_week: day,
            start_time: startTime,
            end_time: endTimeString,
            is_active: true,
          }))
        )

        if (scheduleError) throw scheduleError
      }

      setSuccess('Schedule created successfully')
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
      setError(err instanceof Error ? err.message : 'Failed to create schedule')
    } finally {
      setLoading(false)
    }
  }

  const formContent = (
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label>Class</Label>
            <Select value={selectedClassId} onValueChange={setSelectedClassId}>
              <SelectTrigger>
                <SelectValue placeholder="Select a class" />
              </SelectTrigger>
              <SelectContent>
                {classes.map((cls) => (
                  <SelectItem 
                    key={cls.id} 
                    value={String(cls.id)}
                    disabled={!cls.is_active}
                  >
                    {cls.name} • {cls.duration_minutes} min {!cls.is_active && '(Inactive)'}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {classes.length === 0 && (
              <p className="text-sm text-muted-foreground">
                You need to create a class before scheduling.
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Start time</Label>
            <div className="grid gap-3 sm:grid-cols-2">
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
              <Input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Repeat</Label>
            <Select value={repeat} onValueChange={(value) => setRepeat(value as RepeatOption)}>
              <SelectTrigger>
                <SelectValue placeholder="Does not repeat" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Does not repeat</SelectItem>
                <SelectItem value="weekly">Weekly</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {repeat === 'weekly' && (
            <div className="space-y-2">
              <Label>Repeat on</Label>
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
                We’ll create sessions for the next 4 weeks.
              </p>
            </div>
          )}

          {error && <p className="text-sm text-destructive">{error}</p>}
          {success && <p className="text-sm text-emerald-600">{success}</p>}

          <div className="flex gap-2">
            <Button type="submit" disabled={loading || classes.length === 0}>
              {loading ? 'Saving...' : 'Add class'}
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
        <CardTitle>Add to schedule</CardTitle>
      </CardHeader>
      <CardContent>
        {formContent}
      </CardContent>
    </Card>
  )
}
