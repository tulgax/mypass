'use server'

import { cache } from 'react'
import { createClient } from '@/lib/supabase/server'
import type { Tables } from '@/lib/types/database'

// Cache the Supabase client per request
const getSupabaseClient = cache(() => createClient())

type Class = Tables<'classes'>

export type ClassWithInstances = Class & {
  class_instances: Tables<'class_instances'>[]
}

/**
 * Get all classes for a studio
 */
export async function getClassesByStudioId(studioId: number): Promise<Class[]> {
  const supabase = await getSupabaseClient()
  
  const { data, error } = await supabase
    .from('classes')
    .select('id, name, type, duration_minutes, price, currency, capacity, is_active, description, zoom_link, studio_id, created_at, updated_at')
    .eq('studio_id', studioId)
    .order('created_at', { ascending: false })

  if (error) {
    throw new Error(`Failed to fetch classes: ${error.message}`)
  }

  return data || []
}

/**
 * Get class by ID
 */
export async function getClassById(classId: number): Promise<Class | null> {
  const supabase = await getSupabaseClient()
  
  const { data, error } = await supabase
    .from('classes')
    .select('id, name, type, duration_minutes, price, currency, capacity, is_active, description, zoom_link, studio_id, created_at, updated_at')
    .eq('id', classId)
    .single()

  if (error) {
    if (error.code === 'PGRST116') {
      return null
    }
    throw new Error(`Failed to fetch class: ${error.message}`)
  }

  return data
}

/**
 * Get active classes for a studio (for forms/dropdowns)
 */
export async function getActiveClassesByStudioId(studioId: number): Promise<Array<Pick<Class, 'id' | 'name' | 'duration_minutes' | 'is_active'>>> {
  const supabase = await getSupabaseClient()
  
  const { data, error } = await supabase
    .from('classes')
    .select('id, name, duration_minutes, is_active')
    .eq('studio_id', studioId)
    .eq('is_active', true)
    .order('created_at', { ascending: false })

  if (error) {
    throw new Error(`Failed to fetch active classes: ${error.message}`)
  }

  return data || []
}

/**
 * Get class IDs for a studio (lightweight query)
 */
export async function getClassIdsByStudioId(studioId: number): Promise<number[]> {
  const supabase = await getSupabaseClient()
  
  const { data, error } = await supabase
    .from('classes')
    .select('id')
    .eq('studio_id', studioId)

  if (error) {
    throw new Error(`Failed to fetch class IDs: ${error.message}`)
  }

  return (data || []).map((c: { id: number }) => c.id)
}
