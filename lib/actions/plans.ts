'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import {
  createPlanSchema,
  updatePlanSchema,
  deletePlanSchema,
} from '@/lib/validation/plans'
import { getStudioAndRoleForUser } from '@/lib/data/studios'

export type ActionResult<T = void> =
  | (T extends void ? { success: true } : { success: true; data: T })
  | { success: false; error: string }

/**
 * Create a new plan (class bundle)
 */
export async function createPlan(input: unknown): Promise<ActionResult<{ id: number }>> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: 'Unauthorized' }
    }

    const validated = createPlanSchema.parse(input)

    const { studio, role } = await getStudioAndRoleForUser(user.id)
    if (!studio || (role !== 'owner' && role !== 'manager')) {
      return { success: false, error: 'Studio not found or you cannot create plans.' }
    }

    const { data: plan, error: planError } = await supabase
      .from('plans')
      .insert({
        studio_id: studio.id,
        name: validated.name,
        description: validated.description || null,
        image_url: validated.image_url || null,
        payment_type: validated.payment_type,
        price: validated.price,
        currency: validated.currency,
        billing_period_months:
          validated.payment_type === 'membership' ? validated.billing_period_months : null,
        is_active: validated.is_active,
      })
      .select('id')
      .single()

    if (planError || !plan) {
      return { success: false, error: `Failed to create plan: ${planError?.message || 'Unknown error'}` }
    }

    // Insert plan items
    if (validated.items.length > 0) {
      const { error: itemsError } = await supabase.from('plan_items').insert(
        validated.items.map((item: { class_id: number; quantity: number }) => ({
          plan_id: plan.id,
          class_id: item.class_id,
          quantity: item.quantity,
        }))
      )
      if (itemsError) {
        await supabase.from('plans').delete().eq('id', plan.id)
        return { success: false, error: `Failed to add plan items: ${itemsError.message}` }
      }
    }

    // Insert plan benefits
    if (validated.benefits && validated.benefits.length > 0) {
      const { error: benefitsError } = await supabase.from('plan_benefits').insert(
        validated.benefits
          .filter((b) => b.trim().length > 0)
          .map((benefit_text, i) => ({
            plan_id: plan.id,
            benefit_text: benefit_text.trim(),
            sort_order: i,
          }))
      )
      if (benefitsError) {
        // Non-fatal; plan and items are created
        console.warn('Failed to add plan benefits:', benefitsError)
      }
    }

    revalidatePath('/studio/catalog/plans')
    revalidatePath('/studio/overview')

    return { success: true, data: { id: plan.id } }
  } catch (error) {
    if (error instanceof Error) {
      return { success: false, error: error.message }
    }
    return { success: false, error: 'Failed to create plan' }
  }
}

/**
 * Update an existing plan
 */
export async function updatePlan(input: unknown): Promise<ActionResult> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: 'Unauthorized' }
    }

    const validated = updatePlanSchema.parse(input)
    const { id, items, benefits, ...planData } = validated

    const { studio, role } = await getStudioAndRoleForUser(user.id)
    if (!studio || (role !== 'owner' && role !== 'manager')) {
      return { success: false, error: 'Studio not found or you cannot edit plans' }
    }

    const { error: verifyError } = await supabase
      .from('plans')
      .select('studio_id')
      .eq('id', id)
      .eq('studio_id', studio.id)
      .single()

    if (verifyError) {
      return { success: false, error: 'Plan not found or unauthorized' }
    }

    const updatePayload: Record<string, unknown> = {}
    Object.entries(planData).forEach(([k, v]) => {
      if (v !== undefined) updatePayload[k] = v
    })
    if (updatePayload.payment_type === 'single') {
      updatePayload.billing_period_months = null
    }

    if (Object.keys(updatePayload).length > 0) {
      const { error: updateError } = await supabase
        .from('plans')
        .update(updatePayload)
        .eq('id', id)

      if (updateError) {
        return { success: false, error: `Failed to update plan: ${updateError.message}` }
      }
    }

    if (items !== undefined) {
      await supabase.from('plan_items').delete().eq('plan_id', id)
      if (items.length > 0) {
        const { error: itemsError } = await supabase.from('plan_items').insert(
          items.map((item: { class_id: number; quantity: number }) => ({
            plan_id: id,
            class_id: item.class_id,
            quantity: item.quantity,
          }))
        )
        if (itemsError) {
          return { success: false, error: `Failed to update plan items: ${itemsError.message}` }
        }
      }
    }

    if (benefits !== undefined) {
      await supabase.from('plan_benefits').delete().eq('plan_id', id)
      const toInsert = benefits.filter((b: string) => b.trim().length > 0)
      if (toInsert.length > 0) {
        await supabase.from('plan_benefits').insert(
          toInsert.map((benefit_text: string, i: number) => ({
            plan_id: id,
            benefit_text: benefit_text.trim(),
            sort_order: i,
          }))
        )
      }
    }

    revalidatePath('/studio/catalog/plans')
    revalidatePath('/studio/overview')

    return { success: true }
  } catch (error) {
    if (error instanceof Error) {
      return { success: false, error: error.message }
    }
    return { success: false, error: 'Failed to update plan' }
  }
}

/**
 * Delete a plan
 */
export async function deletePlan(input: unknown): Promise<ActionResult> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: 'Unauthorized' }
    }

    const { id } = deletePlanSchema.parse(input)

    const { studio, role } = await getStudioAndRoleForUser(user.id)
    if (!studio || (role !== 'owner' && role !== 'manager')) {
      return { success: false, error: 'Studio not found or you cannot delete plans' }
    }

    const { error: verifyError } = await supabase
      .from('plans')
      .select('studio_id')
      .eq('id', id)
      .eq('studio_id', studio.id)
      .single()

    if (verifyError) {
      return { success: false, error: 'Plan not found or unauthorized' }
    }

    const { error } = await supabase.from('plans').delete().eq('id', id)

    if (error) {
      return { success: false, error: `Failed to delete plan: ${error.message}` }
    }

    revalidatePath('/studio/catalog/plans')
    revalidatePath('/studio/overview')

    return { success: true }
  } catch (error) {
    if (error instanceof Error) {
      return { success: false, error: error.message }
    }
    return { success: false, error: 'Failed to delete plan' }
  }
}
