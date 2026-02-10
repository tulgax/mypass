'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { getStudioAndRoleForUser } from '@/lib/data/studios'
import {
  inviteTeamMemberSchema,
  updateTeamMemberRoleSchema,
  removeTeamMemberSchema,
} from '@/lib/validation/team'

export type ActionResult<T = void> =
  | (T extends void ? { success: true } : { success: true; data: T })
  | { success: false; error: string }

/**
 * Invite a team member by email. Only studio owner can invite.
 * User must already have an account (email must exist in auth.users).
 */
export async function inviteTeamMember(input: unknown): Promise<ActionResult> {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: 'Unauthorized' }
    }

    const { studio, role: currentUserRole } = await getStudioAndRoleForUser(user.id)
    if (!studio || currentUserRole !== 'owner') {
      return { success: false, error: 'Only the studio owner can invite team members' }
    }

    const validated = inviteTeamMemberSchema.parse(input)
    const { studio_id, email, role } = validated

    if (studio_id !== studio.id) {
      return { success: false, error: 'Studio not found' }
    }

    const { data: invitedUserId, error: rpcError } = await supabase.rpc(
      'get_user_id_by_email',
      { user_email: email }
    )

    if (rpcError) {
      return { success: false, error: `Failed to look up user: ${rpcError.message}` }
    }
    if (!invitedUserId) {
      return { success: false, error: 'No account found with this email. The person must sign up first.' }
    }

    if (invitedUserId === user.id) {
      return { success: false, error: 'You cannot add yourself as a team member' }
    }

    const { error: insertError } = await supabase.from('studio_team_members').insert({
      studio_id,
      user_id: invitedUserId,
      role,
      invited_by: user.id,
    })

    if (insertError) {
      if (insertError.code === '23505') {
        return { success: false, error: 'This person is already a team member' }
      }
      return { success: false, error: `Failed to add team member: ${insertError.message}` }
    }

    revalidatePath('/studio/settings/team')
    revalidatePath('/studio/instructors')
    return { success: true }
  } catch (error) {
    if (error instanceof Error) {
      return { success: false, error: error.message }
    }
    return { success: false, error: 'Failed to invite team member' }
  }
}

/**
 * Update a team member's role. Only studio owner can update.
 */
export async function updateTeamMemberRole(input: unknown): Promise<ActionResult> {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: 'Unauthorized' }
    }

    const { studio, role: currentUserRole } = await getStudioAndRoleForUser(user.id)
    if (!studio || currentUserRole !== 'owner') {
      return { success: false, error: 'Only the studio owner can update team members' }
    }

    const validated = updateTeamMemberRoleSchema.parse(input)
    const { studio_id, user_id, role } = validated

    if (studio_id !== studio.id) {
      return { success: false, error: 'Studio not found' }
    }

    const { error } = await supabase
      .from('studio_team_members')
      .update({ role, updated_at: new Date().toISOString() })
      .eq('studio_id', studio_id)
      .eq('user_id', user_id)

    if (error) {
      return { success: false, error: `Failed to update role: ${error.message}` }
    }

    revalidatePath('/studio/settings/team')
    revalidatePath('/studio/instructors')
    return { success: true }
  } catch (error) {
    if (error instanceof Error) {
      return { success: false, error: error.message }
    }
    return { success: false, error: 'Failed to update team member' }
  }
}

/**
 * Remove a team member. Only studio owner can remove.
 */
export async function removeTeamMember(input: unknown): Promise<ActionResult> {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: 'Unauthorized' }
    }

    const { studio, role: currentUserRole } = await getStudioAndRoleForUser(user.id)
    if (!studio || currentUserRole !== 'owner') {
      return { success: false, error: 'Only the studio owner can remove team members' }
    }

    const validated = removeTeamMemberSchema.parse(input)
    const { studio_id, user_id } = validated

    if (studio_id !== studio.id) {
      return { success: false, error: 'Studio not found' }
    }

    const { error } = await supabase
      .from('studio_team_members')
      .delete()
      .eq('studio_id', studio_id)
      .eq('user_id', user_id)

    if (error) {
      return { success: false, error: `Failed to remove team member: ${error.message}` }
    }

    revalidatePath('/studio/settings/team')
    revalidatePath('/studio/instructors')
    return { success: true }
  } catch (error) {
    if (error instanceof Error) {
      return { success: false, error: error.message }
    }
    return { success: false, error: 'Failed to remove team member' }
  }
}
