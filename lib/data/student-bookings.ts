'use server'

import { cache } from 'react'
import { createClient } from '@/lib/supabase/server'
import type { StudentBookingWithRelations, StudentBookingCounts } from '@/lib/types/student'

// Cache the Supabase client per request
const getSupabaseClient = cache(() => createClient())

/**
 * Get booking counts (upcoming and past) for a student
 * Uses optimized queries with explicit column selection
 */
export async function getStudentBookingsCounts(userId: string): Promise<StudentBookingCounts> {
  const supabase = await getSupabaseClient()
  const now = new Date().toISOString()

  // First, get upcoming class instance IDs
  const { data: upcomingInstances, error: instancesError } = await supabase
    .from('class_instances')
    .select('id')
    .eq('is_cancelled', false)
    .gt('scheduled_at', now)

  if (instancesError) {
    throw new Error(`Failed to fetch upcoming class instances: ${instancesError.message}`)
  }

  const upcomingInstanceIds = (upcomingInstances || []).map((ci: { id: number }) => ci.id)

  // Get upcoming confirmed bookings count
  let upcomingCount = 0
  if (upcomingInstanceIds.length > 0) {
    const { count, error } = await supabase
      .from('bookings')
      .select('id', { count: 'exact', head: true })
      .eq('student_id', userId)
      .eq('status', 'confirmed')
      .in('class_instance_id', upcomingInstanceIds)

    if (error) {
      throw new Error(`Failed to fetch upcoming bookings count: ${error.message}`)
    }
    upcomingCount = count || 0
  }

  // Get past class instance IDs
  const { data: pastInstances, error: pastInstancesError } = await supabase
    .from('class_instances')
    .select('id')
    .eq('is_cancelled', false)
    .lte('scheduled_at', now)

  if (pastInstancesError) {
    throw new Error(`Failed to fetch past class instances: ${pastInstancesError.message}`)
  }

  const pastInstanceIds = (pastInstances || []).map((ci: { id: number }) => ci.id)

  // Get past bookings count
  let pastCount = 0
  if (pastInstanceIds.length > 0) {
    const { count, error } = await supabase
      .from('bookings')
      .select('id', { count: 'exact', head: true })
      .eq('student_id', userId)
      .in('class_instance_id', pastInstanceIds)

    if (error) {
      throw new Error(`Failed to fetch past bookings count: ${error.message}`)
    }
    pastCount = count || 0
  }

  return {
    upcoming: upcomingCount || 0,
    past: pastCount || 0,
  }
}

/**
 * Get all bookings for a student with full relations
 * Returns bookings ordered by creation date (newest first)
 */
export async function getStudentBookings(userId: string): Promise<StudentBookingWithRelations[]> {
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
        id,
        class_id,
        scheduled_at,
        ends_at,
        current_bookings,
        is_cancelled,
        classes (
          id,
          name,
          type,
          duration_minutes,
          price,
          currency,
          capacity,
          is_active,
          description,
          zoom_link,
          studio_id,
          created_at,
          updated_at
        )
      )
    `)
    .eq('student_id', userId)
    .order('created_at', { ascending: false })

  if (error) {
    throw new Error(`Failed to fetch student bookings: ${error.message}`)
  }

  return (data || []) as StudentBookingWithRelations[]
}
