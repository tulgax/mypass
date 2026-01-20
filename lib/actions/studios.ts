'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { updateStudioSchema } from '@/lib/validation/studios'
import { getStudioByOwnerId } from '@/lib/data/studios'

export type ActionResult<T = void> =
  | (T extends void ? { success: true } : { success: true; data: T })
  | { success: false; error: string }

/**
 * Update studio information
 * Only the studio owner can update their studio
 */
export async function updateStudio(input: unknown): Promise<ActionResult> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: 'Unauthorized' }
    }

    const validated = updateStudioSchema.parse(input)

    // Verify the user owns a studio
    const studio = await getStudioByOwnerId(user.id)
    if (!studio) {
      return { success: false, error: 'Studio not found. Please create a studio first.' }
    }

    // Build update object with only provided fields
    const updateData: Record<string, unknown> = {}
    if (validated.name !== undefined) updateData.name = validated.name
    if (validated.description !== undefined) updateData.description = validated.description
    if (validated.address !== undefined) updateData.address = validated.address
    if (validated.phone !== undefined) updateData.phone = validated.phone
    if (validated.email !== undefined) updateData.email = validated.email
    if (validated.logo_url !== undefined) updateData.logo_url = validated.logo_url
    if (validated.cover_image_url !== undefined) updateData.cover_image_url = validated.cover_image_url
    if (validated.latitude !== undefined) updateData.latitude = validated.latitude
    if (validated.longitude !== undefined) updateData.longitude = validated.longitude

    // Add updated_at timestamp
    updateData.updated_at = new Date().toISOString()

    // Update the studio
    const { error } = await supabase
      .from('studios')
      .update(updateData)
      .eq('id', studio.id)

    if (error) {
      return { success: false, error: `Failed to update studio: ${error.message}` }
    }

    // Revalidate relevant paths
    revalidatePath('/studio/settings/studio')
    revalidatePath('/studio/overview')
    revalidatePath(`/${studio.slug}`) // Public studio page
    revalidatePath(`/studio/${studio.slug}`) // Studio dashboard page

    return { success: true }
  } catch (error) {
    if (error instanceof Error) {
      return { success: false, error: error.message }
    }
    return { success: false, error: 'Failed to update studio' }
  }
}
