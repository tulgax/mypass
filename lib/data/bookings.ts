'use server'

import { cache } from 'react'
import { createClient } from '@/lib/supabase/server'
import type { Tables } from '@/lib/types/database'

// Cache the Supabase client per request
const getSupabaseClient = cache(() => createClient())

type Booking = Tables<'bookings'>
type Payment = Tables<'payments'>

export type BookingWithRelations = Booking & {
  payments?: Payment[]
  class_instances?: {
    scheduled_at: string
    classes?: {
      name: string
    } | null
  } | null
  user_profiles?: {
    full_name: string | null
  } | null
}

/**
 * Get bookings by instance IDs
 */
export async function getBookingsByInstanceIds(instanceIds: number[]): Promise<BookingWithRelations[]> {
  if (instanceIds.length === 0) {
    return []
  }

  const supabase = await getSupabaseClient()
  
  const { data, error } = await supabase
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
    .in('class_instance_id', instanceIds)

  if (error) {
    throw new Error(`Failed to fetch bookings: ${error.message}`)
  }

  return (data || []) as BookingWithRelations[]
}

/**
 * Get bookings with full relations for studio view
 */
export async function getBookingsForStudio(instanceIds: number[]): Promise<BookingWithRelations[]> {
  if (instanceIds.length === 0) {
    return []
  }

  const supabase = await getSupabaseClient()
  
  const { data, error } = await supabase
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
      updated_at,
      class_instances (
        scheduled_at,
        classes (
          name
        )
      ),
      user_profiles (
        full_name
      )
    `)
    .in('class_instance_id', instanceIds)
    .order('created_at', { ascending: false })

  if (error) {
    throw new Error(`Failed to fetch bookings: ${error.message}`)
  }

  return (data || []) as BookingWithRelations[]
}

/**
 * Get payments by booking IDs
 */
export async function getPaymentsByBookingIds(bookingIds: number[]): Promise<Payment[]> {
  if (bookingIds.length === 0) {
    return []
  }

  const supabase = await getSupabaseClient()
  
  // Get payment IDs from bookings first
  const { data: bookings, error: bookingsError } = await supabase
    .from('bookings')
    .select('payment_id')
    .in('id', bookingIds)
    .not('payment_id', 'is', null)

  if (bookingsError) {
    throw new Error(`Failed to fetch payment IDs: ${bookingsError.message}`)
  }

  const paymentIds = (bookings || [])
    .map((b: { payment_id: number | null }) => b.payment_id)
    .filter((id: number | null): id is number => id !== null)

  if (paymentIds.length === 0) {
    return []
  }

  const { data: payments, error: paymentsError } = await supabase
    .from('payments')
    .select('id, amount, currency, booking_id, status, gateway, gateway_transaction_id, created_at, updated_at')
    .in('id', paymentIds)

  if (paymentsError) {
    throw new Error(`Failed to fetch payments: ${paymentsError.message}`)
  }

  return payments || []
}

/**
 * Get bookings for a specific class instance with user profiles
 */
export async function getBookingsByInstanceId(instanceId: number): Promise<BookingWithRelations[]> {
  const supabase = await getSupabaseClient()
  
  const { data, error } = await supabase
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
      updated_at,
      user_profiles (
        id,
        full_name
      )
    `)
    .eq('class_instance_id', instanceId)
    .order('created_at', { ascending: false })

  if (error) {
    throw new Error(`Failed to fetch bookings: ${error.message}`)
  }

  return (data || []) as BookingWithRelations[]
}
