'use server'

import { cache } from 'react'
import { createClient } from '@/lib/supabase/server'
import { Tables } from '@/lib/types/database'

// Cache the Supabase client per request
const getSupabaseClient = cache(() => createClient())

export type MembershipPlan = Tables<'membership_plans'>
export type Membership = Tables<'memberships'>
export type MembershipCheckIn = Tables<'membership_check_ins'>

export type MembershipPlanWithCount = MembershipPlan & {
  active_members_count?: number
}

export type MembershipWithRelations = Membership & {
  membership_plans: MembershipPlan | null
  user_profiles: {
    id: string
    full_name: string | null
  } | null
  studios: {
    id: number
    name: string
    slug: string
  } | null
}

export type MembershipCheckInWithRelations = MembershipCheckIn & {
  memberships: MembershipWithRelations | null
  checked_by_profile: {
    id: string
    full_name: string | null
  } | null
}

/**
 * Get all membership plans for a studio
 */
export async function getMembershipPlans(studioId: number): Promise<MembershipPlanWithCount[]> {
  const supabase = await getSupabaseClient()

  const { data, error } = await supabase
    .from('membership_plans')
    .select('*')
    .eq('studio_id', studioId)
    .order('duration_months', { ascending: true })

  if (error) {
    throw new Error(`Failed to fetch membership plans: ${error.message}`)
  }

  // Get active members count for each plan
  const plansWithCount = await Promise.all(
    (data || []).map(async (plan: MembershipPlan) => {
      const { count } = await supabase
        .from('memberships')
        .select('*', { count: 'exact', head: true })
        .eq('membership_plan_id', plan.id)
        .eq('status', 'active')

      return {
        ...plan,
        active_members_count: count || 0,
      }
    })
  )

  return plansWithCount as MembershipPlanWithCount[]
}

/**
 * Get active memberships for a studio
 */
export async function getActiveMemberships(studioId: number): Promise<MembershipWithRelations[]> {
  const supabase = await getSupabaseClient()

  const { data, error } = await supabase
    .from('memberships')
    .select(`
      *,
      membership_plans (*),
      user_profiles (
        id,
        full_name
      ),
      studios (
        id,
        name,
        slug
      )
    `)
    .eq('studio_id', studioId)
    .order('expires_at', { ascending: true })

  if (error) {
    throw new Error(`Failed to fetch memberships: ${error.message}`)
  }

  return (data || []) as MembershipWithRelations[]
}

/**
 * Get all memberships for a student
 */
export async function getStudentMemberships(studentId: string): Promise<MembershipWithRelations[]> {
  const supabase = await getSupabaseClient()

  const { data, error } = await supabase
    .from('memberships')
    .select(`
      *,
      membership_plans (*),
      studios (
        id,
        name,
        slug
      )
    `)
    .eq('student_id', studentId)
    .order('expires_at', { ascending: false })

  if (error) {
    throw new Error(`Failed to fetch student memberships: ${error.message}`)
  }

  return (data || []) as MembershipWithRelations[]
}

/**
 * Get check-in history for a membership
 */
export async function getMembershipCheckIns(membershipId: number): Promise<MembershipCheckInWithRelations[]> {
  const supabase = await getSupabaseClient()

  const { data, error } = await supabase
    .from('membership_check_ins')
    .select(`
      *,
      memberships (
        *,
        membership_plans (*),
        user_profiles (
          id,
          full_name
        ),
        studios (
          id,
          name,
          slug
        )
      ),
      checked_by_profile:user_profiles!membership_check_ins_checked_by_fkey (
        id,
        full_name
      )
    `)
    .eq('membership_id', membershipId)
    .order('checked_in_at', { ascending: false })

  if (error) {
    throw new Error(`Failed to fetch check-ins: ${error.message}`)
  }

  return (data || []) as MembershipCheckInWithRelations[]
}

/**
 * Get single membership by ID with relations
 */
export async function getMembershipById(id: number): Promise<MembershipWithRelations | null> {
  const supabase = await getSupabaseClient()

  const { data, error } = await supabase
    .from('memberships')
    .select(`
      *,
      membership_plans (*),
      user_profiles (
        id,
        full_name
      ),
      studios (
        id,
        name,
        slug
      )
    `)
    .eq('id', id)
    .single()

  if (error) {
    if (error.code === 'PGRST116') {
      return null
    }
    throw new Error(`Failed to fetch membership: ${error.message}`)
  }

  return data as MembershipWithRelations
}

/**
 * Get membership by QR code
 */
export async function getMembershipByQR(qrCode: string): Promise<MembershipWithRelations | null> {
  const supabase = await getSupabaseClient()

  const { data, error } = await supabase
    .from('memberships')
    .select(`
      *,
      membership_plans (*),
      user_profiles (
        id,
        full_name
      ),
      studios (
        id,
        name,
        slug
      )
    `)
    .eq('qr_code', qrCode)
    .single()

  if (error) {
    if (error.code === 'PGRST116') {
      return null
    }
    throw new Error(`Failed to fetch membership by QR: ${error.message}`)
  }

  return data as MembershipWithRelations
}

/**
 * Get membership plan by ID
 */
export async function getMembershipPlanById(id: number): Promise<MembershipPlan | null> {
  const supabase = await getSupabaseClient()

  const { data, error } = await supabase
    .from('membership_plans')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    if (error.code === 'PGRST116') {
      return null
    }
    throw new Error(`Failed to fetch membership plan: ${error.message}`)
  }

  return data as MembershipPlan
}
