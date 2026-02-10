'use server'

import { cache } from 'react'
import { createClient } from '@/lib/supabase/server'

const getSupabaseClient = cache(() => createClient())

export type InstructorStats = {
  user_id: string
  full_name: string | null
  avatar_url: string | null
  classes_taught_count: number
  hours_taught: number
}

/**
 * Get instructors for a studio (team members with role instructor) with teaching stats:
 * - classes_taught_count: past, non-cancelled class instances where they were assigned
 * - hours_taught: sum of class duration_minutes for those instances / 60
 */
export async function getInstructorStatsByStudioId(
  studioId: number
): Promise<InstructorStats[]> {
  const supabase = await getSupabaseClient()

  const { data, error: membersError } = await supabase
    .from('studio_team_members')
    .select(
      `
      user_id,
      user_profiles!studio_team_members_user_id_fkey (
        id,
        full_name,
        avatar_url
      )
    `
    )
    .eq('studio_id', studioId)
    .eq('role', 'instructor')

  if (membersError) {
    throw new Error(`Failed to fetch instructors: ${membersError.message}`)
  }

  const instructors = (data || []) as Array<{
    user_id: string
    user_profiles: { id: string; full_name: string | null; avatar_url: string | null } | null
  }>

  if (!instructors.length) {
    return []
  }

  const userIds = instructors.map((r) => r.user_id)

  const { data: classIdsData, error: classesError } = await supabase
    .from('classes')
    .select('id')
    .eq('studio_id', studioId)

  if (classesError) {
    throw new Error(`Failed to fetch studio classes: ${classesError.message}`)
  }

  const classIds = (classIdsData || []).map((c: { id: number }) => c.id)
  if (classIds.length === 0) {
    return instructors.map((r) => ({
      user_id: r.user_id,
      full_name: (r.user_profiles as { full_name: string | null } | null)?.full_name ?? null,
      avatar_url: (r.user_profiles as { avatar_url: string | null } | null)?.avatar_url ?? null,
      classes_taught_count: 0,
      hours_taught: 0,
    }))
  }

  const now = new Date().toISOString()
  const { data: instances, error: instancesError } = await supabase
    .from('class_instances')
    .select(
      `
      instructor_id,
      classes (
        duration_minutes
      )
    `
    )
    .in('class_id', classIds)
    .not('instructor_id', 'is', null)
    .lt('scheduled_at', now)
    .eq('is_cancelled', false)

  if (instancesError) {
    throw new Error(`Failed to fetch class instances: ${instancesError.message}`)
  }

  const statsByUser: Record<
    string,
    { count: number; minutes: number }
  > = {}
  for (const uid of userIds) {
    statsByUser[uid] = { count: 0, minutes: 0 }
  }
  for (const row of instances || []) {
    const uid = (row as { instructor_id: string }).instructor_id
    if (!uid || !userIds.includes(uid)) continue
    const cls = (row as { classes: { duration_minutes: number } | null }).classes
    const mins = cls?.duration_minutes ?? 0
    statsByUser[uid].count += 1
    statsByUser[uid].minutes += mins
  }

  return instructors.map((r) => {
    const profile = r.user_profiles as { full_name: string | null; avatar_url: string | null } | null
    const s = statsByUser[r.user_id] ?? { count: 0, minutes: 0 }
    return {
      user_id: r.user_id,
      full_name: profile?.full_name ?? null,
      avatar_url: profile?.avatar_url ?? null,
      classes_taught_count: s.count,
      hours_taught: Math.round((s.minutes / 60) * 10) / 10,
    }
  })
}
