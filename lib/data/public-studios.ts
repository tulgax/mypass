'use server'

import { cache } from 'react'
import { createClient } from '@/lib/supabase/server'
import { getStudioBySlug } from './studios'
import { getClassIdsByStudioId } from './classes'
import { getUpcomingClassInstances } from './class-instances'
import type { PublicStudioWithInstances } from '@/lib/types/public'
import type { ClassInstanceWithClass as BaseClassInstanceWithClass } from './class-instances'
import type { Tables } from '@/lib/types/database'

// Cache the Supabase client per request
const getSupabaseClient = cache(() => createClient())

type Class = Tables<'classes'>

/**
 * Get public studio with upcoming class instances for booking
 * Optimized single-function call that fetches all required data
 * Filters active classes at database level
 */
export async function getPublicStudioWithUpcomingInstances(
  slug: string
): Promise<PublicStudioWithInstances | null> {
  const supabase = await getSupabaseClient()
  
  // Fetch studio with latitude and longitude
  const { data: studio, error: studioError } = await supabase
    .from('studios')
    .select('id, slug, name, owner_id, description, address, phone, email, logo_url, cover_image_url, latitude, longitude, created_at, updated_at')
    .eq('slug', slug)
    .single()

  if (studioError || !studio) {
    return null
  }

  // Get active class IDs for this studio
  const classIds = await getClassIdsByStudioId(studio.id)
  
  // If no active classes, return studio with empty instances
  if (classIds.length === 0) {
    return {
      ...studio,
      classInstances: [],
    }
  }

  // Fetch upcoming class instances with class details
  // Note: getUpcomingClassInstances already filters by active classes via classIds
  // (getClassIdsByStudioId only returns active classes)
  const instances = await getUpcomingClassInstances(classIds)

  // Filter instances where class exists (safety check)
  // Since we already filtered by active class IDs, all instances should have active classes
  const validInstances = instances
    .filter((inst: BaseClassInstanceWithClass): inst is BaseClassInstanceWithClass & { classes: NonNullable<BaseClassInstanceWithClass['classes']> } => {
      return inst.classes !== null
    })
    .map((inst) => ({
      ...inst,
      classes: inst.classes as Class, // Type assertion safe because we filtered nulls
    }))

  return {
    ...studio,
    classInstances: validInstances,
  }
}
