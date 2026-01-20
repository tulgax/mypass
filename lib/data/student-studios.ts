'use server'

import { cache } from 'react'
import { createClient } from '@/lib/supabase/server'
import type { StudioForStudent } from '@/lib/types/student'
import type { Tables } from '@/lib/types/database'

// Cache the Supabase client per request
const getSupabaseClient = cache(() => createClient())

type Studio = Tables<'studios'>
type ClassInstance = Tables<'class_instances'>

type ClassWithInstances = Tables<'classes'> & {
  class_instances: ClassInstance[]
}

type StudioWithRelations = Studio & {
  classes: ClassWithInstances[]
}

/**
 * Get studios for student browsing with available classes and instances
 * Processes data server-side to calculate counts
 */
export async function getStudiosForStudent(search?: string): Promise<StudioForStudent[]> {
  const supabase = await getSupabaseClient()
  const now = new Date().toISOString()

  // Build query with explicit column selection
  let query = supabase
    .from('studios')
    .select(`
      id,
      slug,
      name,
      owner_id,
      description,
      address,
      phone,
      email,
      logo_url,
      cover_image_url,
      created_at,
      updated_at,
      classes (
        id,
        capacity,
        is_active,
        class_instances (
          id,
          scheduled_at,
          is_cancelled,
          current_bookings
        )
      )
    `)

  // Apply search filter if provided
  if (search) {
    query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`)
  }

  const { data: studios, error } = await query

  if (error) {
    throw new Error(`Failed to fetch studios: ${error.message}`)
  }

  // Process studios to calculate counts (server-side processing)
  const processedStudios: StudioForStudent[] = (studios || []).map((studio: StudioWithRelations) => {
    // Filter active classes
    const activeClasses = (studio.classes || []).filter((cls: ClassWithInstances) => cls.is_active)

    // Count upcoming instances with available spots
    let upcomingCount = 0
    activeClasses.forEach((cls: ClassWithInstances) => {
      const instances = cls.class_instances || []
      instances.forEach((instance: ClassInstance) => {
        if (
          !instance.is_cancelled &&
          instance.scheduled_at > now &&
          instance.current_bookings < cls.capacity
        ) {
          upcomingCount++
        }
      })
    })

    return {
      id: studio.id,
      slug: studio.slug,
      name: studio.name,
      owner_id: studio.owner_id,
      description: studio.description,
      address: studio.address,
      phone: studio.phone,
      email: studio.email,
      logo_url: studio.logo_url,
      cover_image_url: studio.cover_image_url,
      created_at: studio.created_at,
      updated_at: studio.updated_at,
      classes_count: activeClasses.length,
      upcoming_instances_count: upcomingCount,
    }
  })

  return processedStudios
}
