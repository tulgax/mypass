'use server'

import { cache } from 'react'
import { createClient } from '@/lib/supabase/server'
import type { Tables } from '@/lib/types/database'

const getSupabaseClient = cache(() => createClient())

export type VideoClass = Tables<'video_classes'>

export type VideoClassWithInstructor = VideoClass & {
  instructor: {
    id: string
    full_name: string | null
    avatar_url: string | null
  } | null
}

/**
 * Select columns for video classes including all metadata.
 * Joins instructor profile via instructor_id -> user_profiles.
 */
const VIDEO_CLASS_SELECT = `
  id,
  studio_id,
  title,
  description,
  price,
  currency,
  access_duration_days,
  instructor_id,
  category,
  difficulty_level,
  thumbnail_url,
  tags,
  is_featured,
  sort_order,
  duration_seconds,
  mux_upload_id,
  mux_asset_id,
  mux_playback_id,
  mux_status,
  preview_mux_upload_id,
  preview_mux_asset_id,
  preview_mux_playback_id,
  is_active,
  created_by,
  created_at,
  updated_at,
  instructor:user_profiles!video_classes_instructor_id_fkey (
    id,
    full_name,
    avatar_url
  )
` as const

export async function getVideoClassesByStudioId(studioId: number): Promise<VideoClassWithInstructor[]> {
  const supabase = await getSupabaseClient()
  const { data, error } = await supabase
    .from('video_classes')
    .select(VIDEO_CLASS_SELECT)
    .eq('studio_id', studioId)
    .order('sort_order', { ascending: true })
    .order('created_at', { ascending: false })

  if (error) throw new Error(`Failed to fetch video classes: ${error.message}`)
  return (data || []) as unknown as VideoClassWithInstructor[]
}

export async function getVideoClassById(id: number): Promise<VideoClassWithInstructor | null> {
  const supabase = await getSupabaseClient()
  const { data, error } = await supabase
    .from('video_classes')
    .select(VIDEO_CLASS_SELECT)
    .eq('id', id)
    .maybeSingle()

  if (error) throw new Error(`Failed to fetch video class: ${error.message}`)
  return (data || null) as unknown as VideoClassWithInstructor | null
}

export async function getActiveVideoClassesByStudioSlug(slug: string): Promise<VideoClassWithInstructor[]> {
  const supabase = await getSupabaseClient()
  const { data: studio, error: studioError } = await supabase
    .from('studios')
    .select('id')
    .eq('slug', slug)
    .maybeSingle()

  if (studioError) throw new Error(`Failed to fetch studio: ${studioError.message}`)
  if (!studio) return []

  const { data, error } = await supabase
    .from('video_classes')
    .select(VIDEO_CLASS_SELECT)
    .eq('studio_id', studio.id)
    .eq('is_active', true)
    .order('is_featured', { ascending: false })
    .order('sort_order', { ascending: true })
    .order('created_at', { ascending: false })

  if (error) throw new Error(`Failed to fetch video classes: ${error.message}`)
  return (data || []) as unknown as VideoClassWithInstructor[]
}

export async function getActiveVideoClassByStudioSlugAndId(
  slug: string,
  id: number
): Promise<VideoClassWithInstructor | null> {
  const supabase = await getSupabaseClient()
  const { data: studio, error: studioError } = await supabase
    .from('studios')
    .select('id')
    .eq('slug', slug)
    .maybeSingle()

  if (studioError) throw new Error(`Failed to fetch studio: ${studioError.message}`)
  if (!studio) return null

  const { data, error } = await supabase
    .from('video_classes')
    .select(VIDEO_CLASS_SELECT)
    .eq('id', id)
    .eq('studio_id', studio.id)
    .eq('is_active', true)
    .maybeSingle()

  if (error) throw new Error(`Failed to fetch video class: ${error.message}`)
  return (data || null) as unknown as VideoClassWithInstructor | null
}
