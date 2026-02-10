'use server'

import { cache } from 'react'
import { createClient } from '@/lib/supabase/server'
import type { Tables } from '@/lib/types/database'

// Cache the Supabase client per request
const getSupabaseClient = cache(() => createClient())

type Studio = Tables<'studios'>

/**
 * Get studio by owner ID
 * Returns null if not found, throws on error
 */
export async function getStudioByOwnerId(ownerId: string): Promise<Studio | null> {
  const supabase = await getSupabaseClient()
  
  const { data, error } = await supabase
    .from('studios')
    .select('id, slug, name, owner_id, description, address, phone, email, logo_url, cover_image_url, latitude, longitude, created_at, updated_at')
    .eq('owner_id', ownerId)
    .single()

  if (error) {
    if (error.code === 'PGRST116') {
      return null
    }
    throw new Error(`Failed to fetch studio: ${error.message}`)
  }

  return data
}

/**
 * Get studio by slug
 * Returns null if not found, throws on error
 */
export async function getStudioBySlug(slug: string): Promise<Studio | null> {
  const supabase = await getSupabaseClient()
  
  const { data, error } = await supabase
    .from('studios')
    .select('id, slug, name, owner_id, description, address, phone, email, logo_url, cover_image_url, latitude, longitude, created_at, updated_at')
    .eq('slug', slug)
    .single()

  if (error) {
    if (error.code === 'PGRST116') {
      return null
    }
    throw new Error(`Failed to fetch studio: ${error.message}`)
  }

  return data
}

/**
 * Get studio basic info by owner ID (lightweight query)
 */
export async function getStudioBasicInfo(ownerId: string): Promise<Pick<Studio, 'id' | 'slug' | 'name'> | null> {
  const supabase = await getSupabaseClient()
  
  const { data, error } = await supabase
    .from('studios')
    .select('id, slug, name')
    .eq('owner_id', ownerId)
    .single()

  if (error) {
    if (error.code === 'PGRST116') {
      return null
    }
    throw new Error(`Failed to fetch studio: ${error.message}`)
  }

  return data
}

export type StudioRole = 'owner' | 'manager' | 'instructor'

/**
 * Get studio and role for user (owner or team member).
 * Returns the studio the user can access and their role.
 * Owner: user is studios.owner_id. Manager/Instructor: user has a studio_team_members row.
 */
export async function getStudioAndRoleForUser(
  userId: string
): Promise<{ studio: Pick<Studio, 'id' | 'slug' | 'name'> | null; role: StudioRole | null }> {
  const supabase = await getSupabaseClient()

  // Check if user is studio owner
  const { data: ownedStudio, error: ownerError } = await supabase
    .from('studios')
    .select('id, slug, name')
    .eq('owner_id', userId)
    .maybeSingle()

  if (ownerError) {
    throw new Error(`Failed to fetch studio: ${ownerError.message}`)
  }
  if (ownedStudio) {
    return { studio: ownedStudio, role: 'owner' }
  }

  // Check if user is a team member (manager or instructor)
  const { data: membership, error: memberError } = await supabase
    .from('studio_team_members')
    .select('studio_id, role')
    .eq('user_id', userId)
    .order('studio_id', { ascending: true })
    .limit(1)
    .maybeSingle()

  if (memberError) {
    throw new Error(`Failed to fetch team membership: ${memberError.message}`)
  }
  if (!membership) {
    return { studio: null, role: null }
  }

  const { data: studio, error: studioError } = await supabase
    .from('studios')
    .select('id, slug, name')
    .eq('id', membership.studio_id)
    .single()

  if (studioError || !studio) {
    return { studio: null, role: null }
  }

  const role: StudioRole = membership.role === 'manager' || membership.role === 'instructor'
    ? membership.role
    : 'instructor'
  return { studio, role }
}
