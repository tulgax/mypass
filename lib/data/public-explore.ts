'use server'

import { cache } from 'react'
import { createClient } from '@/lib/supabase/server'

const getSupabaseClient = cache(() => createClient())

// ---------- Types ----------

export type ExploreStudio = {
  id: number
  slug: string
  name: string
  description: string | null
  address: string | null
  phone: string | null
  logo_url: string | null
  cover_image_url: string | null
  latitude: number | null
  longitude: number | null
  classes_count: number
  upcoming_count: number
}

export type ExploreClass = {
  id: number
  scheduled_at: string
  ends_at: string
  current_bookings: number
  is_cancelled: boolean
  instructor_id: string | null
  class_name: string
  class_type: string
  class_description: string | null
  class_price: number
  class_currency: string
  class_duration_minutes: number
  class_capacity: number
  studio_id: number
  studio_slug: string
  studio_name: string
  studio_logo_url: string | null
}

export type ExploreVideo = {
  id: number
  title: string
  description: string | null
  price: number
  currency: string
  category: string | null
  difficulty_level: string | null
  tags: string[]
  thumbnail_url: string | null
  duration_seconds: number | null
  is_featured: boolean
  mux_playback_id: string | null
  preview_mux_playback_id: string | null
  studio_id: number
  studio_slug: string
  studio_name: string
  studio_logo_url: string | null
}

export type ExplorePlan = {
  id: number
  name: string
  description: string | null
  price: number
  currency: string
  duration_months: number
  studio_id: number
  studio_slug: string
  studio_name: string
  studio_logo_url: string | null
}

// ---------- Filters ----------

export type StudioFilters = {
  search?: string
  limit?: number
  offset?: number
}

export type ClassFilters = {
  search?: string
  type?: string
  studioId?: number
  limit?: number
  offset?: number
}

export type VideoFilters = {
  search?: string
  category?: string
  difficulty_level?: string
  studioId?: number
  limit?: number
  offset?: number
}

export type PlanFilters = {
  search?: string
  studioId?: number
  limit?: number
  offset?: number
}

// ---------- Data Functions ----------

/**
 * Get all public studios with class counts.
 */
export async function getAllPublicStudios(
  filters: StudioFilters = {}
): Promise<ExploreStudio[]> {
  const supabase = await getSupabaseClient()
  const now = new Date().toISOString()
  const { search, limit = 50, offset = 0 } = filters

  let query = supabase
    .from('studios')
    .select(`
      id, slug, name, description, address, phone,
      logo_url, cover_image_url, latitude, longitude,
      classes (
        id, is_active, capacity,
        class_instances ( id, scheduled_at, is_cancelled, current_bookings )
      )
    `)
    .range(offset, offset + limit - 1)

  if (search) {
    query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`)
  }

  const { data, error } = await query

  if (error) {
    throw new Error(`Failed to fetch studios: ${error.message}`)
  }

  return (data || []).map((s: any): ExploreStudio => {
    const activeClasses = (s.classes || []).filter((c: any) => c.is_active)
    let upcoming = 0
    activeClasses.forEach((c: any) => {
      (c.class_instances || []).forEach((i: any) => {
        if (!i.is_cancelled && i.scheduled_at > now && i.current_bookings < c.capacity) {
          upcoming++
        }
      })
    })
    return {
      id: s.id,
      slug: s.slug,
      name: s.name,
      description: s.description,
      address: s.address,
      phone: s.phone,
      logo_url: s.logo_url,
      cover_image_url: s.cover_image_url,
      latitude: s.latitude,
      longitude: s.longitude,
      classes_count: activeClasses.length,
      upcoming_count: upcoming,
    }
  })
}

/**
 * Get upcoming class instances across all studios.
 */
export async function getAllUpcomingClasses(
  filters: ClassFilters = {}
): Promise<ExploreClass[]> {
  const supabase = await getSupabaseClient()
  const now = new Date().toISOString()
  const { search, type, studioId, limit = 50, offset = 0 } = filters

  // We query class_instances and join classes + studios
  let query = supabase
    .from('class_instances')
    .select(`
      id, scheduled_at, ends_at, current_bookings, is_cancelled, instructor_id,
      classes!inner (
        id, name, type, description, price, currency, duration_minutes, capacity, is_active,
        studios!inner ( id, slug, name, logo_url )
      )
    `)
    .eq('is_cancelled', false)
    .gte('scheduled_at', now)
    .order('scheduled_at', { ascending: true })
    .range(offset, offset + limit - 1)

  if (studioId) {
    query = query.eq('classes.studios.id', studioId)
  }

  const { data, error } = await query

  if (error) {
    throw new Error(`Failed to fetch classes: ${error.message}`)
  }

  let results: ExploreClass[] = (data || [])
    .filter((row: any) => row.classes?.is_active && row.classes?.studios)
    .map((row: any): ExploreClass => ({
      id: row.id,
      scheduled_at: row.scheduled_at,
      ends_at: row.ends_at,
      current_bookings: row.current_bookings,
      is_cancelled: row.is_cancelled,
      instructor_id: row.instructor_id,
      class_name: row.classes.name,
      class_type: row.classes.type,
      class_description: row.classes.description,
      class_price: row.classes.price,
      class_currency: row.classes.currency,
      class_duration_minutes: row.classes.duration_minutes,
      class_capacity: row.classes.capacity,
      studio_id: row.classes.studios.id,
      studio_slug: row.classes.studios.slug,
      studio_name: row.classes.studios.name,
      studio_logo_url: row.classes.studios.logo_url,
    }))

  // Client-side filters that can't be done in Supabase easily
  if (type) {
    results = results.filter((c) => c.class_type === type)
  }
  if (search) {
    const q = search.toLowerCase()
    results = results.filter(
      (c) =>
        c.class_name.toLowerCase().includes(q) ||
        c.studio_name.toLowerCase().includes(q) ||
        c.class_description?.toLowerCase().includes(q)
    )
  }

  return results
}

/**
 * Get all active video classes across studios.
 */
export async function getAllActiveVideoClasses(
  filters: VideoFilters = {}
): Promise<ExploreVideo[]> {
  const supabase = await getSupabaseClient()
  const { search, category, difficulty_level, studioId, limit = 50, offset = 0 } = filters

  let query = supabase
    .from('video_classes')
    .select(`
      id, title, description, price, currency, category,
      difficulty_level, tags, thumbnail_url, duration_seconds,
      is_featured, mux_playback_id, preview_mux_playback_id,
      studios!inner ( id, slug, name, logo_url )
    `)
    .eq('is_active', true)
    .order('is_featured', { ascending: false })
    .order('sort_order', { ascending: true })
    .range(offset, offset + limit - 1)

  if (category) {
    query = query.eq('category', category)
  }
  if (difficulty_level) {
    query = query.eq('difficulty_level', difficulty_level)
  }
  if (studioId) {
    query = query.eq('studio_id', studioId)
  }
  if (search) {
    query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`)
  }

  const { data, error } = await query

  if (error) {
    throw new Error(`Failed to fetch video classes: ${error.message}`)
  }

  return (data || [])
    .filter((row: any) => row.studios)
    .map((row: any): ExploreVideo => ({
      id: row.id,
      title: row.title,
      description: row.description,
      price: row.price,
      currency: row.currency,
      category: row.category,
      difficulty_level: row.difficulty_level,
      tags: row.tags || [],
      thumbnail_url: row.thumbnail_url,
      duration_seconds: row.duration_seconds,
      is_featured: row.is_featured,
      mux_playback_id: row.mux_playback_id,
      preview_mux_playback_id: row.preview_mux_playback_id,
      studio_id: row.studios.id,
      studio_slug: row.studios.slug,
      studio_name: row.studios.name,
      studio_logo_url: row.studios.logo_url,
    }))
}

/**
 * Get all active membership plans across studios.
 */
export async function getAllActiveMembershipPlans(
  filters: PlanFilters = {}
): Promise<ExplorePlan[]> {
  const supabase = await getSupabaseClient()
  const { search, studioId, limit = 50, offset = 0 } = filters

  let query = supabase
    .from('membership_plans')
    .select(`
      id, name, description, price, currency, duration_months,
      studios!inner ( id, slug, name, logo_url )
    `)
    .eq('is_active', true)
    .order('price', { ascending: true })
    .range(offset, offset + limit - 1)

  if (studioId) {
    query = query.eq('studio_id', studioId)
  }
  if (search) {
    query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`)
  }

  const { data, error } = await query

  if (error) {
    throw new Error(`Failed to fetch membership plans: ${error.message}`)
  }

  return (data || [])
    .filter((row: any) => row.studios)
    .map((row: any): ExplorePlan => ({
      id: row.id,
      name: row.name,
      description: row.description,
      price: row.price,
      currency: row.currency,
      duration_months: row.duration_months,
      studio_id: row.studios.id,
      studio_slug: row.studios.slug,
      studio_name: row.studios.name,
      studio_logo_url: row.studios.logo_url,
    }))
}

/**
 * Get quick stats for the explore hub page.
 */
export async function getExploreStats(): Promise<{
  studioCount: number
  classCount: number
  videoCount: number
}> {
  const supabase = await getSupabaseClient()

  const [studiosRes, classesRes, videosRes] = await Promise.all([
    supabase.from('studios').select('id', { count: 'exact', head: true }),
    supabase
      .from('class_instances')
      .select('id', { count: 'exact', head: true })
      .eq('is_cancelled', false)
      .gte('scheduled_at', new Date().toISOString()),
    supabase
      .from('video_classes')
      .select('id', { count: 'exact', head: true })
      .eq('is_active', true),
  ])

  return {
    studioCount: studiosRes.count ?? 0,
    classCount: classesRes.count ?? 0,
    videoCount: videosRes.count ?? 0,
  }
}
