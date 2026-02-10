'use server'

import { cache } from 'react'
import { createClient } from '@/lib/supabase/server'

const getSupabaseClient = cache(() => createClient())

export type TeamMemberWithProfile = {
  id: number
  studio_id: number
  user_id: string
  role: string
  invited_at: string
  invited_by: string | null
  created_at: string
  updated_at: string
  user_profiles: {
    id: string
    full_name: string | null
    avatar_url: string | null
  } | null
}

/** Extended team member type that includes email (from auth.users via RPC). */
export type TeamMemberRow = {
  user_id: string
  full_name: string | null
  avatar_url: string | null
  email: string | null
  phone: string | null
  role: 'owner' | 'manager' | 'instructor'
  joined_at: string
}

/**
 * Get team members for a studio with profile info.
 * Only returns manager and instructor members (owner is studios.owner_id).
 */
export async function getTeamMembersByStudioId(
  studioId: number
): Promise<TeamMemberWithProfile[]> {
  const supabase = await getSupabaseClient()

  const { data, error } = await supabase
    .from('studio_team_members')
    .select(
      `
      id,
      studio_id,
      user_id,
      role,
      invited_at,
      invited_by,
      created_at,
      updated_at,
      user_profiles!studio_team_members_user_id_fkey (
        id,
        full_name,
        avatar_url
      )
    `
    )
    .eq('studio_id', studioId)
    .order('created_at', { ascending: true })

  if (error) {
    throw new Error(`Failed to fetch team members: ${error.message}`)
  }

  return (data || []) as TeamMemberWithProfile[]
}

/**
 * Get ALL team members including the owner, with email addresses.
 * Uses an RPC function (security definer) to look up emails from auth.users.
 * Returns a unified list with the owner first.
 */
export async function getFullTeamWithEmails(
  studioId: number,
  ownerId: string
): Promise<TeamMemberRow[]> {
  const supabase = await getSupabaseClient()

  // 1) Fetch team members from studio_team_members
  const { data: members, error: membersError } = await supabase
    .from('studio_team_members')
    .select(
      `
      user_id,
      role,
      created_at,
      user_profiles!studio_team_members_user_id_fkey (
        id,
        full_name,
        avatar_url,
        phone
      )
    `
    )
    .eq('studio_id', studioId)
    .order('created_at', { ascending: true })

  if (membersError) {
    throw new Error(`Failed to fetch team members: ${membersError.message}`)
  }

  // 2) Fetch owner profile
  const { data: ownerProfile, error: ownerProfileError } = await supabase
    .from('user_profiles')
    .select('id, full_name, avatar_url, phone')
    .eq('id', ownerId)
    .single()

  if (ownerProfileError) {
    throw new Error(`Failed to fetch owner profile: ${ownerProfileError.message}`)
  }

  // 3) Fetch studio created_at for the owner's "joined" date
  const { data: studioData, error: studioError } = await supabase
    .from('studios')
    .select('created_at')
    .eq('id', studioId)
    .single()

  if (studioError) {
    throw new Error(`Failed to fetch studio: ${studioError.message}`)
  }

  // 4) Collect all user IDs (owner + team members)
  const allUserIds = [
    ownerId,
    ...((members || []) as Array<{ user_id: string }>).map((m) => m.user_id),
  ]

  // 5) Look up emails from auth.users via RPC (security definer function)
  const emailMap = new Map<string, string>()
  const { data: emailRows, error: emailError } = await supabase.rpc(
    'get_emails_by_user_ids',
    { user_ids: allUserIds }
  )

  if (!emailError && emailRows) {
    for (const row of emailRows as Array<{ user_id: string; email: string }>) {
      emailMap.set(row.user_id, row.email)
    }
  }

  // 6) Build result: owner first, then team members
  const rows: TeamMemberRow[] = []

  rows.push({
    user_id: ownerId,
    full_name: ownerProfile.full_name,
    avatar_url: ownerProfile.avatar_url,
    email: emailMap.get(ownerId) ?? null,
    phone: ownerProfile.phone,
    role: 'owner',
    joined_at: studioData.created_at,
  })

  const typedMembers = (members || []) as Array<{
    user_id: string
    role: string
    created_at: string
    user_profiles: {
      id: string
      full_name: string | null
      avatar_url: string | null
      phone: string | null
    } | null
  }>

  for (const m of typedMembers) {
    rows.push({
      user_id: m.user_id,
      full_name: m.user_profiles?.full_name ?? null,
      avatar_url: m.user_profiles?.avatar_url ?? null,
      email: emailMap.get(m.user_id) ?? null,
      phone: m.user_profiles?.phone ?? null,
      role: m.role as 'manager' | 'instructor',
      joined_at: m.created_at,
    })
  }

  return rows
}

/**
 * Get instructor options (id, full_name) for a studio for dropdowns.
 */
export async function getStudioInstructorOptions(
  studioId: number
): Promise<Array<{ id: string; full_name: string | null }>> {
  const supabase = await getSupabaseClient()

  const { data, error } = await supabase
    .from('studio_team_members')
    .select(
      `
      user_id,
      user_profiles!studio_team_members_user_id_fkey (
        id,
        full_name
      )
    `
    )
    .eq('studio_id', studioId)
    .eq('role', 'instructor')
    .order('created_at', { ascending: true })

  if (error) {
    throw new Error(`Failed to fetch instructors: ${error.message}`)
  }

  const rows = (data || []) as Array<{
    user_id: string
    user_profiles: { id: string; full_name: string | null } | null
  }>

  return rows.map((r) => ({
    id: r.user_id,
    full_name: r.user_profiles?.full_name ?? null,
  }))
}
