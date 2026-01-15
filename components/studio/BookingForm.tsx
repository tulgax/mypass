'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { formatAmount } from '@/lib/utils'
import type { Tables } from '@/lib/types/database'

type Class = Tables<'classes'>

interface BookingFormProps {
  classInstanceId: number
  classData: Class
  onClose: () => void
}

export function BookingForm({ classInstanceId, classData, onClose }: BookingFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        router.push('/auth/signin')
        return
      }

      // Create booking
      const { data: booking, error: bookingError } = await supabase
        .from('bookings')
        .insert({
          student_id: user.id,
          class_instance_id: classInstanceId,
          status: 'pending',
          payment_status: 'pending',
        })
        .select()
        .single()

      if (bookingError) throw bookingError

      // Generate QR code for offline classes
      if (classData.type === 'offline' && booking) {
        await supabase.rpc('generate_qr_code', {
          booking_id_param: booking.id,
        })
      }

      // Update class instance booking count
      await supabase.rpc('check_booking_capacity', {
        class_instance_id_param: classInstanceId,
      })

      router.push(`/student/bookings?booking=${booking.id}`)
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create booking')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Book {classData.name}</DialogTitle>
          <DialogDescription>
            Complete your booking for {formatAmount(classData.price, classData.currency)}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="rounded-md bg-muted p-4">
            <p className="text-sm font-medium">Class Details</p>
            <p className="text-muted-foreground text-sm">{classData.description}</p>
            <p className="mt-2 text-sm">
              Price: <span className="font-medium">{formatAmount(classData.price, classData.currency)}</span>
            </p>
          </div>

          {error && <p className="text-destructive text-sm">{error}</p>}

          <div className="flex gap-2">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="flex-1">
              {loading ? 'Processing...' : 'Confirm Booking'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
