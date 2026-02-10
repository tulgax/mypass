'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { createClassSchema, updateClassSchema, classIdSchema } from '@/lib/validation/classes'
import { getStudioAndRoleForUser } from '@/lib/data/studios'

export type ActionResult<T = void> =
  | (T extends void ? { success: true } : { success: true; data: T })
  | { success: false; error: string }

/**
 * Create a new class
 */
export async function createClass(input: unknown): Promise<ActionResult<{ id: number }>> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: 'Unauthorized' }
    }

    const validated = createClassSchema.parse(input)

    const { studio, role } = await getStudioAndRoleForUser(user.id)
    if (!studio || (role !== 'owner' && role !== 'manager')) {
      return { success: false, error: 'Studio not found or you cannot create classes.' }
    }

    const { data, error } = await supabase
      .from('classes')
      .insert({
        studio_id: studio.id,
        name: validated.name,
        description: validated.description || null,
        type: validated.type,
        price: validated.price,
        currency: validated.currency,
        capacity: validated.capacity,
        duration_minutes: validated.duration_minutes,
        zoom_link: validated.zoom_link || null,
        is_active: validated.is_active,
      })
      .select('id')
      .single()

    if (error) {
      return { success: false, error: `Failed to create class: ${error.message}` }
    }

    revalidatePath('/studio/catalog/classes')
    revalidatePath('/studio/overview')
    
    return { success: true, data: { id: data.id } }
  } catch (error) {
    if (error instanceof Error) {
      return { success: false, error: error.message }
    }
    return { success: false, error: 'Failed to create class' }
  }
}

/**
 * Update an existing class
 */
export async function updateClass(input: unknown): Promise<ActionResult> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: 'Unauthorized' }
    }

    const validated = updateClassSchema.parse(input)
    const { id, ...updateData } = validated

    const { studio, role } = await getStudioAndRoleForUser(user.id)
    if (!studio || (role !== 'owner' && role !== 'manager')) {
      return { success: false, error: 'Studio not found or you cannot edit classes' }
    }

    const { error: verifyError } = await supabase
      .from('classes')
      .select('studio_id')
      .eq('id', id)
      .eq('studio_id', studio.id)
      .single()

    if (verifyError) {
      return { success: false, error: 'Class not found or unauthorized' }
    }

    const { error } = await supabase
      .from('classes')
      .update(updateData)
      .eq('id', id)

    if (error) {
      return { success: false, error: `Failed to update class: ${error.message}` }
    }

    revalidatePath('/studio/catalog/classes')
    revalidatePath('/studio/overview')
    revalidatePath(`/studio/catalog/classes/${id}`)

    return { success: true }
  } catch (error) {
    if (error instanceof Error) {
      return { success: false, error: error.message }
    }
    return { success: false, error: 'Failed to update class' }
  }
}

/**
 * Delete a class
 */
export async function deleteClass(input: unknown): Promise<ActionResult> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: 'Unauthorized' }
    }

    const { id } = classIdSchema.parse(input)

    const { studio, role } = await getStudioAndRoleForUser(user.id)
    if (!studio || (role !== 'owner' && role !== 'manager')) {
      return { success: false, error: 'Studio not found or you cannot delete classes' }
    }

    const { error: verifyError } = await supabase
      .from('classes')
      .select('studio_id')
      .eq('id', id)
      .eq('studio_id', studio.id)
      .single()

    if (verifyError) {
      return { success: false, error: 'Class not found or unauthorized' }
    }

    const { error } = await supabase
      .from('classes')
      .delete()
      .eq('id', id)

    if (error) {
      return { success: false, error: `Failed to delete class: ${error.message}` }
    }

    revalidatePath('/studio/catalog/classes')
    revalidatePath('/studio/overview')

    return { success: true }
  } catch (error) {
    if (error instanceof Error) {
      return { success: false, error: error.message }
    }
    return { success: false, error: 'Failed to delete class' }
  }
}
