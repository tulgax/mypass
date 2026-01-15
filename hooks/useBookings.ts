'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Tables } from '@/lib/types/database'

type Booking = Tables<'bookings'> & {
  class_instances: Tables<'class_instances'> & {
    classes: Tables<'classes'>
  }
}

export function useBookings(userId?: string) {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    async function fetchBookings() {
      if (!userId) {
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        const supabase = createClient()

        const { data, error: fetchError } = await supabase
          .from('bookings')
          .select(`
            *,
            class_instances (
              *,
              classes (*)
            )
          `)
          .eq('student_id', userId)
          .order('created_at', { ascending: false })

        if (fetchError) throw fetchError

        setBookings((data || []) as Booking[])
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to fetch bookings'))
      } finally {
        setLoading(false)
      }
    }

    fetchBookings()
  }, [userId])

  return { bookings, loading, error, refetch: () => {} }
}
