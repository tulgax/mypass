'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { formatAmount, formatDateTime } from '@/lib/utils'
import { BookingForm } from './BookingForm'
import type { Tables } from '@/lib/types/database'

type Class = Tables<'classes'> & {
  class_instances: Array<
    Tables<'class_instances'> & {
      bookings: Array<{ id: number }>
    }
  >
}

interface ClassCardProps {
  classData: Class
  studioSlug: string
}

export function ClassCard({ classData, studioSlug }: ClassCardProps) {
  const [selectedInstance, setSelectedInstance] = useState<number | null>(null)

  const availableSpots = (instance: Class['class_instances'][0]) => {
    return classData.capacity - instance.current_bookings
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>{classData.name}</CardTitle>
          <CardDescription>{classData.description}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline">{classData.type}</Badge>
            <Badge variant="outline">{classData.duration_minutes} min</Badge>
            <Badge variant="outline">{formatAmount(classData.price, classData.currency)}</Badge>
          </div>

          {classData.class_instances.length > 0 ? (
            <div className="space-y-2">
              <p className="text-sm font-medium">Upcoming Sessions:</p>
              <div className="space-y-2">
                {classData.class_instances.slice(0, 3).map((instance) => (
                  <div
                    key={instance.id}
                    className="flex items-center justify-between rounded-md border p-2 text-sm"
                  >
                    <div>
                      <p className="font-medium">{formatDateTime(instance.scheduled_at)}</p>
                      <p className="text-muted-foreground text-xs">
                        {availableSpots(instance)} spots available
                      </p>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => setSelectedInstance(instance.id)}
                      disabled={availableSpots(instance) === 0}
                    >
                      Book
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <p className="text-muted-foreground text-sm">No upcoming sessions</p>
          )}
        </CardContent>
      </Card>

      {selectedInstance && (
        <BookingForm
          classInstanceId={selectedInstance}
          classData={classData}
          onClose={() => setSelectedInstance(null)}
        />
      )}
    </>
  )
}
