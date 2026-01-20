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
