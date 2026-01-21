'use server'

import { cache } from 'react'
import { createClient } from '@/lib/supabase/server'
import type { Tables } from '@/lib/types/database'

// Cache the Supabase client per request
const getSupabaseClient = cache(() => createClient())

type UserProfile = Tables<'user_profiles'>

/**
 * Get all user profiles (for instructor/client selection)
 */
export async function getAllUserProfiles(): Promise<UserProfile[]> {
  const supabase = await getSupabaseClient()
  
  const { data, error } = await supabase
    .from('user_profiles')
    .select('id, full_name, role, avatar_url')
    .order('full_name', { ascending: true })

  if (error) {
    throw new Error(`Failed to fetch user profiles: ${error.message}`)
  }

  return (data || []) as UserProfile[]
}

/**
 * Get user profile by ID
 */
export async function getUserProfileById(userId: string): Promise<UserProfile | null> {
  const supabase = await getSupabaseClient()
  
  const { data, error } = await supabase
    .from('user_profiles')
    .select('id, full_name, role, avatar_url')
    .eq('id', userId)
    .single()

  if (error) {
    if (error.code === 'PGRST116') {
      return null
    }
    throw new Error(`Failed to fetch user profile: ${error.message}`)
  }

  return (data || null) as UserProfile | null
}
