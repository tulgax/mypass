'use server'

import { cache } from 'react'
import { createClient } from '@/lib/supabase/server'
import type { Tables } from '@/lib/types/database'

// Cache the Supabase client per request
const getSupabaseClient = cache(() => createClient())

type ClassInstance = Tables<'class_instances'>

export type ClassInstanceWithClass = ClassInstance & {
  classes: Pick<Tables<'classes'>, 'name' | 'capacity' | 'type' | 'duration_minutes' | 'studio_id'> | null
}

/**
 * Get class instances by class IDs
 */
export async function getClassInstancesByClassIds(classIds: number[]): Promise<ClassInstance[]> {
  if (classIds.length === 0) {
    return []
  }

  const supabase = await getSupabaseClient()
  
  const { data, error } = await supabase
    .from('class_instances')
    .select('id, class_id, scheduled_at, ends_at, current_bookings, is_cancelled')
    .in('class_id', classIds)

  if (error) {
    throw new Error(`Failed to fetch class instances: ${error.message}`)
  }

  return data || []
}

/**
 * Get upcoming class instances for class IDs (not cancelled, in future)
 */
export async function getUpcomingClassInstances(classIds: number[], limit?: number): Promise<ClassInstanceWithClass[]> {
  if (classIds.length === 0) {
    return []
  }

  const supabase = await getSupabaseClient()
  const now = new Date().toISOString()
  
  let query = supabase
    .from('class_instances')
    .select(`
      id,
      class_id,
      scheduled_at,
      ends_at,
      current_bookings,
      instructor_id,
      is_cancelled,
      classes (
        name,
        capacity,
        type,
        duration_minutes,
        studio_id
      )
    `)
    .in('class_id', classIds)
    .eq('is_cancelled', false)
    .gte('scheduled_at', now)
    .order('scheduled_at', { ascending: true })

  if (limit) {
    query = query.limit(limit)
  }

  const { data, error } = await query

  if (error) {
    throw new Error(`Failed to fetch upcoming class instances: ${error.message}`)
  }

  return (data || []) as ClassInstanceWithClass[]
}

/**
 * Get class instance IDs by class IDs (lightweight query)
 */
export async function getClassInstanceIdsByClassIds(classIds: number[]): Promise<number[]> {
  if (classIds.length === 0) {
    return []
  }

  const supabase = await getSupabaseClient()
  
  const { data, error } = await supabase
    .from('class_instances')
    .select('id')
    .in('class_id', classIds)

  if (error) {
    throw new Error(`Failed to fetch class instance IDs: ${error.message}`)
  }

  return (data || []).map((ci: { id: number }) => ci.id)
}

/**
 * Get class instance by ID with full class details
 */
export async function getClassInstanceById(instanceId: number): Promise<ClassInstanceWithClass | null> {
  const supabase = await getSupabaseClient()
  
  const { data, error } = await supabase
    .from('class_instances')
    .select(`
      id,
      class_id,
      scheduled_at,
      ends_at,
      current_bookings,
      instructor_id,
      is_cancelled,
      classes (
        name,
        capacity,
        type,
        duration_minutes,
        studio_id
      )
    `)
    .eq('id', instanceId)
    .single()

  if (error) {
    if (error.code === 'PGRST116') {
      return null
    }
    throw new Error(`Failed to fetch class instance: ${error.message}`)
  }

  return (data || null) as ClassInstanceWithClass | null
}
