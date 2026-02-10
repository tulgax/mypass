'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import {
  createMembershipPlanSchema,
  updateMembershipPlanSchema,
  membershipPlanIdSchema,
  purchaseMembershipSchema,
  checkInMembershipSchema,
  getMembershipByQRSchema,
  getMembershipByIdForCheckInSchema,
  expireMembershipSchema,
} from '@/lib/validation/memberships'
import { getStudioAndRoleForUser } from '@/lib/data/studios'
import {
  getMembershipPlanById,
  getMembershipById,
  getMembershipByQR,
} from '@/lib/data/memberships'

export type ActionResult<T = void> =
  | (T extends void ? { success: true } : { success: true; data: T })
  | { success: false; error: string }

/**
 * Create a new membership plan
 */
export async function createMembershipPlan(input: unknown): Promise<ActionResult<{ id: number }>> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: 'Unauthorized' }
    }

    const validated = createMembershipPlanSchema.parse(input)

    const { studio, role } = await getStudioAndRoleForUser(user.id)
    if (!studio || (role !== 'owner' && role !== 'manager')) {
      return { success: false, error: 'Studio not found or you cannot create membership plans.' }
    }

    const { data, error } = await supabase
      .from('membership_plans')
      .insert({
        studio_id: studio.id,
        name: validated.name,
        duration_months: validated.duration_months,
        price: validated.price,
        currency: validated.currency,
        description: validated.description || null,
        is_active: validated.is_active,
      })
      .select('id')
      .single()

    if (error) {
      return { success: false, error: `Failed to create membership plan: ${error.message}` }
    }

    revalidatePath('/studio/catalog/membership')
    revalidatePath('/studio/overview')

    return { success: true, data: { id: data.id } }
  } catch (error) {
    if (error instanceof Error) {
      return { success: false, error: error.message }
    }
    return { success: false, error: 'Failed to create membership plan' }
  }
}

/**
 * Update an existing membership plan
 */
export async function updateMembershipPlan(input: unknown): Promise<ActionResult> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: 'Unauthorized' }
    }

    const validated = updateMembershipPlanSchema.parse(input)
    const { id, ...updateData } = validated

    const { studio, role } = await getStudioAndRoleForUser(user.id)
    if (!studio || (role !== 'owner' && role !== 'manager')) {
      return { success: false, error: 'Studio not found or you cannot edit membership plans' }
    }

    const { error: verifyError } = await supabase
      .from('membership_plans')
      .select('studio_id')
      .eq('id', id)
      .eq('studio_id', studio.id)
      .single()

    if (verifyError) {
      return { success: false, error: 'Membership plan not found or unauthorized' }
    }

    const { error } = await supabase
      .from('membership_plans')
      .update(updateData)
      .eq('id', id)

    if (error) {
      return { success: false, error: `Failed to update membership plan: ${error.message}` }
    }

    revalidatePath('/studio/catalog/membership')
    revalidatePath('/studio/overview')

    return { success: true }
  } catch (error) {
    if (error instanceof Error) {
      return { success: false, error: error.message }
    }
    return { success: false, error: 'Failed to update membership plan' }
  }
}

/**
 * Delete a membership plan
 */
export async function deleteMembershipPlan(input: unknown): Promise<ActionResult> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: 'Unauthorized' }
    }

    const { id } = membershipPlanIdSchema.parse(input)

    const { studio, role } = await getStudioAndRoleForUser(user.id)
    if (!studio || (role !== 'owner' && role !== 'manager')) {
      return { success: false, error: 'Studio not found or you cannot delete membership plans' }
    }

    const { error: verifyError } = await supabase
      .from('membership_plans')
      .select('studio_id')
      .eq('id', id)
      .eq('studio_id', studio.id)
      .single()

    if (verifyError) {
      return { success: false, error: 'Membership plan not found or unauthorized' }
    }

    const { error } = await supabase
      .from('membership_plans')
      .delete()
      .eq('id', id)

    if (error) {
      return { success: false, error: `Failed to delete membership plan: ${error.message}` }
    }

    revalidatePath('/studio/catalog/membership')
    revalidatePath('/studio/overview')

    return { success: true }
  } catch (error) {
    if (error instanceof Error) {
      return { success: false, error: error.message }
    }
    return { success: false, error: 'Failed to delete membership plan' }
  }
}

/**
 * Purchase a membership (student purchases)
 */
export async function purchaseMembership(input: unknown): Promise<ActionResult<{ id: number }>> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: 'Unauthorized' }
    }

    const validated = purchaseMembershipSchema.parse(input)
    const { membership_plan_id, studio_id } = validated

    // Get membership plan details
    const plan = await getMembershipPlanById(membership_plan_id)
    if (!plan) {
      return { success: false, error: 'Membership plan not found' }
    }

    if (!plan.is_active) {
      return { success: false, error: 'Membership plan is not active' }
    }

    // Verify studio exists
    const { data: studio, error: studioError } = await supabase
      .from('studios')
      .select('id')
      .eq('id', studio_id)
      .single()

    if (studioError || !studio) {
      return { success: false, error: 'Studio not found' }
    }

    // Calculate expiration date
    const purchasedAt = new Date()
    const expiresAt = new Date(purchasedAt)
    expiresAt.setMonth(expiresAt.getMonth() + plan.duration_months)

    // Payment creation skipped for now
    // TODO: Update payments table schema to support membership_id
    // The payments table currently requires booking_id, which doesn't apply to memberships
    // In production, you should:
    // 1. Update payments table to have membership_id column (nullable)
    // 2. Or create a separate membership_payments table
    // 3. Integrate with actual payment gateway
    const paymentId: number | null = null

    // Create membership
    const { data: membership, error: membershipError } = await supabase
      .from('memberships')
      .insert({
        student_id: user.id,
        membership_plan_id: plan.id,
        studio_id: studio_id,
        purchased_at: purchasedAt.toISOString(),
        expires_at: expiresAt.toISOString(),
        status: 'active',
        payment_id: paymentId,
      })
      .select('id')
      .single()

    if (membershipError) {
      return { success: false, error: `Failed to create membership: ${membershipError.message}` }
    }

    // Generate QR code
    await supabase.rpc('generate_membership_qr_code', {
      membership_id_param: membership.id,
    })

    revalidatePath('/student/memberships')
    revalidatePath('/studio/memberships')

    return { success: true, data: { id: membership.id } }
  } catch (error) {
    if (error instanceof Error) {
      return { success: false, error: error.message }
    }
    return { success: false, error: 'Failed to purchase membership' }
  }
}

/**
 * Check in a membership (both methods)
 */
export async function checkInMembership(input: unknown): Promise<ActionResult> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: 'Unauthorized' }
    }

    const validated = checkInMembershipSchema.parse(input)
    const { membership_id, check_in_method, checked_by } = validated

    // Get membership and verify it's valid
    const membership = await getMembershipById(membership_id)
    if (!membership) {
      return { success: false, error: 'Membership not found' }
    }

    // Check membership validity using database function
    const { data: isValid, error: validityError } = await supabase.rpc('check_membership_validity', {
      membership_id_param: membership_id,
    })

    if (validityError) {
      return { success: false, error: `Failed to validate membership: ${validityError.message}` }
    }

    if (!isValid) {
      return { success: false, error: 'Membership is not active or has expired' }
    }

    // Create check-in record
    const { error: checkInError } = await supabase
      .from('membership_check_ins')
      .insert({
        membership_id: membership_id,
        check_in_method: check_in_method,
        checked_by: checked_by || (check_in_method === 'student_qr' ? user.id : null),
        checked_in_at: new Date().toISOString(),
      })

    if (checkInError) {
      return { success: false, error: `Failed to create check-in: ${checkInError.message}` }
    }

    revalidatePath('/studio/memberships/checkin')
    revalidatePath('/student/memberships')

    return { success: true }
  } catch (error) {
    if (error instanceof Error) {
      return { success: false, error: error.message }
    }
    return { success: false, error: 'Failed to check in membership' }
  }
}

/**
 * Get membership by QR code (validates membership belongs to the studio)
 */
export async function getMembershipByQRCode(input: unknown): Promise<ActionResult<{ id: number; student_name: string | null }>> {
  try {
    const { qr_code, studio_id } = getMembershipByQRSchema.parse(input)

    const membership = await getMembershipByQR(qr_code)
    if (!membership) {
      return { success: false, error: 'Membership not found' }
    }

    if (membership.studio_id !== studio_id) {
      return { success: false, error: 'Membership is not for this studio' }
    }

    return {
      success: true,
      data: {
        id: membership.id,
        student_name: membership.user_profiles?.full_name || null,
      },
    }
  } catch (error) {
    if (error instanceof Error) {
      return { success: false, error: error.message }
    }
    return { success: false, error: 'Failed to get membership by QR code' }
  }
}

/**
 * Get membership by ID for check-in (validates membership belongs to the studio)
 */
export async function getMembershipByIdForCheckIn(input: unknown): Promise<ActionResult<{ id: number; student_name: string | null }>> {
  try {
    const { membership_id, studio_id } = getMembershipByIdForCheckInSchema.parse(input)

    const membership = await getMembershipById(membership_id)
    if (!membership) {
      return { success: false, error: 'Membership not found' }
    }

    if (membership.studio_id !== studio_id) {
      return { success: false, error: 'Membership is not for this studio' }
    }

    return {
      success: true,
      data: {
        id: membership.id,
        student_name: membership.user_profiles?.full_name || null,
      },
    }
  } catch (error) {
    if (error instanceof Error) {
      return { success: false, error: error.message }
    }
    return { success: false, error: 'Failed to get membership' }
  }
}

/**
 * Manually expire a membership
 */
export async function expireMembership(input: unknown): Promise<ActionResult> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: 'Unauthorized' }
    }

    const { id } = expireMembershipSchema.parse(input)

    const { studio, role } = await getStudioAndRoleForUser(user.id)
    if (!studio || (role !== 'owner' && role !== 'manager')) {
      return { success: false, error: 'Studio not found or you cannot expire memberships' }
    }

    const { error: verifyError } = await supabase
      .from('memberships')
      .select('studio_id')
      .eq('id', id)
      .eq('studio_id', studio.id)
      .single()

    if (verifyError) {
      return { success: false, error: 'Membership not found or unauthorized' }
    }

    const { error } = await supabase
      .from('memberships')
      .update({ status: 'expired' })
      .eq('id', id)

    if (error) {
      return { success: false, error: `Failed to expire membership: ${error.message}` }
    }

    revalidatePath('/studio/memberships')
    revalidatePath('/student/memberships')

    return { success: true }
  } catch (error) {
    if (error instanceof Error) {
      return { success: false, error: error.message }
    }
    return { success: false, error: 'Failed to expire membership' }
  }
}
