'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { formatDateTime } from '@/lib/utils'
import { Tables } from '@/lib/types/database'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetClose,
} from '@/components/ui/sheet'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ScheduleForm } from '@/components/dashboard/ScheduleForm'
import { updateClassInstance, deleteClassInstance } from '@/lib/actions/class-instances'
import { updateClassInstanceSchema } from '@/lib/validation/class-instances'
import { MoreHorizontal, X, Eye, Pencil, Trash2, Clock } from 'lucide-react'

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
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [open, setOpen] = useState(false)
  const [viewOpen, setViewOpen] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedInstance, setSelectedInstance] = useState<ClassInstanceWithClass | null>(null)

  const handleSuccess = () => {
    setOpen(false)
    toast.success('Schedule created successfully')
    router.refresh()
  }

  const handleView = (instanceId: number) => {
    const instance = instances.find((i) => i.id === instanceId)
    if (instance) {
      setSelectedInstance(instance)
      setViewOpen(true)
    }
  }

  const handleEdit = (instanceId: number) => {
    const instance = instances.find((i) => i.id === instanceId)
    if (instance) {
      setSelectedInstance(instance)
      setEditOpen(true)
    }
  }

  const handleDeleteClick = (instanceId: number) => {
    const instance = instances.find((i) => i.id === instanceId)
    if (instance) {
      setSelectedInstance(instance)
      setDeleteDialogOpen(true)
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
          ? 'Schedule cancelled successfully'
          : 'Schedule deleted successfully'
      )
      
      // Refresh data - this will cause the component to re-render with updated instances
      router.refresh()
      
      // Wait for the refresh to complete and UI to update, then close dialog
      // We wait a bit longer to ensure the item is removed from the table
      await new Promise(resolve => setTimeout(resolve, 300))
      
      setDeleteDialogOpen(false)
      setSelectedInstance(null)
    })
  }

  return (
    <>
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold">Schedule</h1>
            <p className="text-sm text-muted-foreground">View your upcoming classes</p>
          </div>
          <Button onClick={() => setOpen(true)}>Create Schedule</Button>
        </div>

      {instances && instances.length > 0 ? (
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="h-10 px-4 text-left align-middle text-xs font-medium text-muted-foreground">Class</th>
                  <th className="h-10 px-4 text-center align-middle text-xs font-medium text-muted-foreground">Date & Time</th>
                  <th className="h-10 px-4 text-center align-middle text-xs font-medium text-muted-foreground">Bookings</th>
                  <th className="h-10 px-4 text-right align-middle text-xs font-medium text-muted-foreground"></th>
                </tr>
              </thead>
              <tbody>
                {instances.map((instance) => {
                  const classData = instance.classes
                  if (!classData) return null

                  return (
                    <tr key={instance.id} className="border-b transition-colors hover:bg-muted/50">
                      <td className="p-4 align-middle">
                        <div className="flex items-center gap-3">
                          <div className="h-2 w-2 rounded-full bg-blue-500 shrink-0" />
                          <div>
                            <div className="font-medium text-sm">{classData.name}</div>
                            <div className="text-xs text-muted-foreground mt-0.5">
                              <Badge variant="outline" className="text-xs">
                                {classData.type === 'online' ? 'Online' : 'Offline'}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 align-middle text-center text-sm">
                        {formatDateTime(instance.scheduled_at)}
                      </td>
                      <td className="p-4 align-middle text-center text-sm">
                        {instance.current_bookings || 0} / {classData.capacity}
                      </td>
                      <td className="p-4 align-middle text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreHorizontal className="h-4 w-4" />
                              <span className="sr-only">More options</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-40">
                            <DropdownMenuItem onClick={() => handleView(instance.id)}>
                              <Eye className="h-4 w-4 mr-2" />
                              View
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleEdit(instance.id)}>
                              <Pencil className="h-4 w-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => handleDeleteClick(instance.id)}
                              className="text-destructive focus:text-destructive"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              {instance.current_bookings > 0 ? 'Cancel' : 'Delete'}
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </Card>
      ) : (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground mb-4">No upcoming classes scheduled</p>
            <Button onClick={() => setOpen(true)}>Create your first schedule</Button>
          </CardContent>
        </Card>
      )}
      </div>

      <Sheet open={open} onOpenChange={setOpen}>
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
            <ScheduleForm classes={classes} onSuccess={handleSuccess} inSheet />
          </div>
        </SheetContent>
      </Sheet>

      {selectedInstance && (
        <>
          {/* View Sheet */}
          <Sheet open={viewOpen} onOpenChange={setViewOpen}>
            <SheetContent side="right" className="w-full sm:max-w-lg flex flex-col p-0 [&>button]:hidden">
              <div className="p-6 border-b">
                <SheetHeader>
                  <div className="flex items-center justify-between">
                    <SheetTitle>View Schedule</SheetTitle>
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
                <ScheduleInstanceView instance={selectedInstance} />
              </div>
            </SheetContent>
          </Sheet>

          {/* Edit Sheet */}
          <Sheet open={editOpen} onOpenChange={setEditOpen}>
            <SheetContent side="right" className="w-full sm:max-w-lg flex flex-col p-0 [&>button]:hidden">
              <div className="p-6 border-b">
                <SheetHeader>
                  <div className="flex items-center justify-between">
                    <SheetTitle>Edit Schedule</SheetTitle>
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
                <ScheduleInstanceEdit
                  instance={selectedInstance}
                  onSuccess={() => {
                    setEditOpen(false)
                    router.refresh()
                  }}
                  onCancel={() => setEditOpen(false)}
                />
              </div>
            </SheetContent>
          </Sheet>
        </>
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
                ? 'Cancel Schedule?'
                : 'Delete Schedule?'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {selectedInstance && selectedInstance.current_bookings > 0
                ? `This instance has ${selectedInstance.current_bookings} booking(s). It will be cancelled but not deleted. This action cannot be undone.`
                : 'Are you sure you want to delete this scheduled class? This action cannot be undone.'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
            <Button
              variant="destructive"
              onClick={handleDeleteConfirm}
              disabled={isPending}
            >
              {isPending ? 'Deleting...' : selectedInstance && selectedInstance.current_bookings > 0 ? 'Cancel Schedule' : 'Delete'}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

function ScheduleInstanceView({ instance }: { instance: ClassInstanceWithClass }) {
  const classData = instance.classes

  if (!classData) {
    return <p className="text-sm text-muted-foreground">Class information not available</p>
  }

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div>
          <label className="text-sm font-medium mb-3 block text-muted-foreground">Class</label>
          <div className="p-3 rounded-md border bg-muted/50 text-sm">
            <div className="font-medium">{classData.name}</div>
            <div className="mt-1">
              <Badge variant="outline" className="text-xs">
                {classData.type === 'online' ? 'Online' : 'Offline'}
              </Badge>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Scheduled Date & Time</label>
          <div className="p-3 rounded-md border bg-muted/50 text-sm">
            {formatDateTime(instance.scheduled_at)}
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">End Time</label>
          <div className="p-3 rounded-md border bg-muted/50 text-sm">
            {formatDateTime(instance.ends_at)}
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Duration</label>
          <div className="p-3 rounded-md border bg-muted/50 text-sm">
            {classData.duration_minutes || 'N/A'} minutes
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Bookings</label>
          <div className="p-3 rounded-md border bg-muted/50 text-sm">
            {instance.current_bookings || 0} / {classData.capacity}
          </div>
        </div>

        {instance.is_cancelled && (
          <div className="space-y-2">
            <label className="text-sm font-medium">Status</label>
            <div className="p-3 rounded-md border bg-muted/50 text-sm">
              <Badge variant="destructive">Cancelled</Badge>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function ScheduleInstanceEdit({
  instance,
  onSuccess,
  onCancel,
}: {
  instance: ClassInstanceWithClass
  onSuccess: () => void
  onCancel: () => void
}) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})

  const classData = instance.classes
  if (!classData) {
    return <p className="text-sm text-muted-foreground">Class information not available</p>
  }

  const durationMinutes = classData.duration_minutes || 60

  // Parse current scheduled time
  const scheduledDate = new Date(instance.scheduled_at)
  const startDate = scheduledDate.toISOString().split('T')[0]
  const startTime = `${scheduledDate.getHours().toString().padStart(2, '0')}:${scheduledDate.getMinutes().toString().padStart(2, '0')}`

  const [date, setDate] = useState(startDate)
  const [time, setTime] = useState(startTime)

  // Calculate end time based on duration
  const calculateEndTime = (dateStr: string, timeStr: string) => {
    if (!dateStr || !timeStr) return ''
    const [year, month, day] = dateStr.split('-').map(Number)
    const [hours, minutes] = timeStr.split(':').map(Number)
    const start = new Date(year, month - 1, day, hours, minutes)
    const end = new Date(start.getTime() + durationMinutes * 60 * 1000)
    return end.toISOString()
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    setFieldErrors({})

    if (!date || !time) {
      setError('Please select both date and time')
      return
    }

    // Build datetime strings
    const [year, month, day] = date.split('-').map(Number)
    const [hours, minutes] = time.split(':').map(Number)
    const scheduledAt = new Date(year, month - 1, day, hours, minutes)
    const endsAt = new Date(scheduledAt.getTime() + durationMinutes * 60 * 1000)

    // Validate with Zod
    const input = {
      id: instance.id,
      scheduled_at: scheduledAt.toISOString(),
      ends_at: endsAt.toISOString(),
    }

    const validationResult = updateClassInstanceSchema.safeParse(input)

    if (!validationResult.success) {
      const zodErrors = validationResult.error.flatten().fieldErrors
      const errors: Record<string, string> = {}
      Object.keys(zodErrors).forEach((key) => {
        const errorMessages = zodErrors[key as keyof typeof zodErrors]
        if (errorMessages && errorMessages.length > 0) {
          errors[key] = errorMessages[0]
        }
      })
      setFieldErrors(errors)
      return
    }

    startTransition(async () => {
      try {
        const result = await updateClassInstance(validationResult.data)

        if (!result.success) {
          setError(result.error)
          toast.error(result.error)
          return
        }

        toast.success('Schedule updated successfully')
        onSuccess()
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to update schedule'
        setError(errorMessage)
        toast.error(errorMessage)
      }
    })
  }

  const endTimeDisplay = calculateEndTime(date, time)
    ? formatDateTime(calculateEndTime(date, time))
    : 'N/A'

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
              <SelectValue placeholder="Hour" />
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
            <SelectValue placeholder="Min" />
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

  return (
    <form onSubmit={handleSubmit} className="space-y-6" noValidate>
      <div className="space-y-4">
        <div>
          <label className="text-sm font-medium mb-3 block text-muted-foreground">Class</label>
          <div className="p-3 rounded-md border bg-muted/50 text-sm">
            <div className="font-medium">{classData.name}</div>
            <div className="text-xs text-muted-foreground mt-1">
              Duration: {classData.duration_minutes || 'N/A'} minutes
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="date">Scheduled Date</Label>
          <Input
            id="date"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className={fieldErrors.scheduled_at ? 'border-destructive' : ''}
            required
          />
          {fieldErrors.scheduled_at && (
            <p className="text-sm text-destructive">{fieldErrors.scheduled_at}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="time">Scheduled Time</Label>
          <TimePicker value={time} onChange={setTime} />
          {fieldErrors.scheduled_at && (
            <p className="text-sm text-destructive">{fieldErrors.scheduled_at}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label>End Time (auto-calculated)</Label>
          <div className="p-3 rounded-md border bg-muted/50 text-sm flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            {endTimeDisplay}
          </div>
        </div>

        {error && <p className="text-destructive text-sm">{error}</p>}
        {fieldErrors.ends_at && (
          <p className="text-sm text-destructive">{fieldErrors.ends_at}</p>
        )}

        <div className="flex gap-2 pt-4 border-t">
          <Button type="button" variant="outline" onClick={onCancel} className="flex-1" disabled={isPending}>
            Cancel
          </Button>
          <Button type="submit" disabled={isPending} className="flex-1">
            {isPending ? 'Updating...' : 'Update Schedule'}
          </Button>
        </div>
      </div>
    </form>
  )
}
