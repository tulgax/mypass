'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatDateTime } from '@/lib/utils'
import { Tables } from '@/lib/types/database'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetClose,
} from '@/components/ui/sheet'
import { ScheduleForm } from '@/components/dashboard/ScheduleForm'
import { X } from 'lucide-react'

type ClassInstanceWithClass = Tables<'class_instances'> & {
  classes: {
    name: string
    capacity: number
    type: string
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
  const [open, setOpen] = useState(false)

  const handleSuccess = () => {
    setOpen(false)
    router.refresh()
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
    </>
  )
}
