'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { getStudioAndRoleForUser } from '@/lib/data/studios'
import { createVideoPurchaseSchema, activateVideoPurchaseSchema } from '@/lib/validation/video-purchases'

export type ActionResult<T = void> =
  | (T extends void ? { success: true } : { success: true; data: T })
  | { success: false; error: string }

export async function createVideoPurchase(input: unknown): Promise<ActionResult<{ purchaseId: number }>> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { success: false, error: 'Unauthorized' }

    const { video_class_id } = createVideoPurchaseSchema.parse(input)

    // Ensure video exists and is active/ready (public)
    const { data: video, error: videoError } = await supabase
      .from('video_classes')
      .select('id, is_active, mux_status')
      .eq('id', video_class_id)
      .single()

    if (videoError || !video) return { success: false, error: 'Video not found' }
    if (!video.is_active || video.mux_status !== 'ready') {
      return { success: false, error: 'This video is not available yet' }
    }

    // Insert pending (or reuse existing)
    const { data: existing } = await supabase
      .from('video_purchases')
      .select('id, status')
      .eq('video_class_id', video_class_id)
      .eq('student_id', user.id)
      .maybeSingle()

    if (existing) {
      return { success: true, data: { purchaseId: existing.id } }
    }

    const { data, error } = await supabase
      .from('video_purchases')
      .insert({
        video_class_id,
        student_id: user.id,
        status: 'pending',
      })
      .select('id')
      .single()

    if (error || !data) {
      return { success: false, error: `Failed to create purchase: ${error?.message || 'Unknown error'}` }
    }

    revalidatePath('/student')
    return { success: true, data: { purchaseId: data.id } }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Failed to create purchase' }
  }
}

/**
 * Dev/admin action: activate a pending purchase (simulates payment success).
 * Owner/manager of the studio can activate.
 */
export async function activateVideoPurchase(input: unknown): Promise<ActionResult> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { success: false, error: 'Unauthorized' }

    const { purchase_id } = activateVideoPurchaseSchema.parse(input)

    const { studio, role } = await getStudioAndRoleForUser(user.id)
    if (!studio || (role !== 'owner' && role !== 'manager')) {
      return { success: false, error: 'Studio not found or you cannot activate purchases' }
    }

    const { data: purchase, error: pErr } = await supabase
      .from('video_purchases')
      .select('id, video_class_id')
      .eq('id', purchase_id)
      .single()

    if (pErr || !purchase) return { success: false, error: 'Purchase not found' }

    const { data: video, error: vErr } = await supabase
      .from('video_classes')
      .select('id, studio_id, price, currency, access_duration_days')
      .eq('id', purchase.video_class_id)
      .single()

    if (vErr || !video || video.studio_id !== studio.id) {
      return { success: false, error: 'Unauthorized' }
    }

    const purchasedAt = new Date()
    const expiresAt = new Date(purchasedAt.getTime() + Number(video.access_duration_days) * 24 * 60 * 60 * 1000)

    const { error } = await supabase
      .from('video_purchases')
      .update({
        status: 'active',
        amount: video.price,
        currency: video.currency,
        purchased_at: purchasedAt.toISOString(),
        expires_at: expiresAt.toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', purchase_id)

    if (error) return { success: false, error: `Failed to activate: ${error.message}` }

    revalidatePath('/studio/video-classes')
    return { success: true }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Failed to activate purchase' }
  }
}

