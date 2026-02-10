'use server'

import { cache } from 'react'
import { createClient } from '@/lib/supabase/server'
import type { Tables } from '@/lib/types/database'

const getSupabaseClient = cache(() => createClient())

export type Plan = Tables<'plans'>
export type PlanItem = Tables<'plan_items'>
export type PlanBenefit = Tables<'plan_benefits'>

export type PlanItemWithClass = PlanItem & {
  classes: Pick<Tables<'classes'>, 'id' | 'name' | 'duration_minutes' | 'price' | 'currency'> | null
}

export type PlanWithRelations = Plan & {
  plan_items: PlanItemWithClass[]
  plan_benefits: PlanBenefit[]
}

/**
 * Get all plans for a studio with items and benefits
 */
export async function getPlans(studioId: number): Promise<PlanWithRelations[]> {
  const supabase = await getSupabaseClient()

  const { data, error } = await supabase
    .from('plans')
    .select(`
      *,
      plan_items (
        id,
        plan_id,
        class_id,
        quantity,
        classes (
          id,
          name,
          duration_minutes,
          price,
          currency
        )
      ),
      plan_benefits (
        id,
        plan_id,
        benefit_text,
        sort_order
      )
    `)
    .eq('studio_id', studioId)
    .order('created_at', { ascending: false })

  if (error) {
    throw new Error(`Failed to fetch plans: ${error.message}`)
  }

  return (data || []) as PlanWithRelations[]
}

/**
 * Get a single plan by ID with relations
 */
export async function getPlanById(planId: number): Promise<PlanWithRelations | null> {
  const supabase = await getSupabaseClient()

  const { data, error } = await supabase
    .from('plans')
    .select(`
      *,
      plan_items (
        id,
        plan_id,
        class_id,
        quantity,
        classes (
          id,
          name,
          duration_minutes,
          price,
          currency
        )
      ),
      plan_benefits (
        id,
        plan_id,
        benefit_text,
        sort_order
      )
    `)
    .eq('id', planId)
    .single()

  if (error) {
    if (error.code === 'PGRST116') {
      return null
    }
    throw new Error(`Failed to fetch plan: ${error.message}`)
  }

  return data as PlanWithRelations
}
