'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { getMuxClient, signMuxPlaybackToken } from '@/lib/mux/client'
import { getStudioAndRoleForUser } from '@/lib/data/studios'
import {
  createVideoClassSchema,
  updateVideoClassSchema,
  deleteVideoClassSchema,
  createVideoUploadSchema,
  createPreviewUploadSchema,
} from '@/lib/validation/video-classes'

export type ActionResult<T = void> =
  | (T extends void ? { success: true } : { success: true; data: T })
  | { success: false; error: string }

function getCorsOrigin() {
  if (process.env.NEXT_PUBLIC_SITE_URL) return process.env.NEXT_PUBLIC_SITE_URL
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`
  return 'http://localhost:3000'
}

export async function createVideoClass(input: unknown): Promise<ActionResult<{ id: number }>> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { success: false, error: 'Unauthorized' }

    const validated = createVideoClassSchema.parse(input)

    const { studio, role } = await getStudioAndRoleForUser(user.id)
    if (!studio || (role !== 'owner' && role !== 'manager')) {
      return { success: false, error: 'Studio not found or you cannot create video classes.' }
    }

    const { data, error } = await supabase
      .from('video_classes')
      .insert({
        studio_id: studio.id,
        title: validated.title,
        description: validated.description ?? null,
        price: validated.price,
        currency: validated.currency,
        access_duration_days: validated.access_duration_days,
        instructor_id: validated.instructor_id ?? null,
        category: validated.category ?? null,
        difficulty_level: validated.difficulty_level ?? null,
        thumbnail_url: validated.thumbnail_url ?? null,
        tags: validated.tags ?? [],
        is_featured: validated.is_featured ?? false,
        sort_order: validated.sort_order ?? 0,
        created_by: user.id,
        mux_status: 'draft',
        is_active: false,
      })
      .select('id')
      .single()

    if (error || !data) {
      return { success: false, error: `Failed to create video class: ${error?.message || 'Unknown error'}` }
    }

    revalidatePath('/studio/video-classes')
    return { success: true, data: { id: data.id } }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Failed to create video class' }
  }
}

export async function updateVideoClass(input: unknown): Promise<ActionResult> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { success: false, error: 'Unauthorized' }

    const validated = updateVideoClassSchema.parse(input)

    const { studio, role } = await getStudioAndRoleForUser(user.id)
    if (!studio || (role !== 'owner' && role !== 'manager')) {
      return { success: false, error: 'Studio not found or you cannot edit video classes.' }
    }

    // Ensure video belongs to the studio
    const { data: existing, error: verifyError } = await supabase
      .from('video_classes')
      .select('id, studio_id')
      .eq('id', validated.id)
      .eq('studio_id', studio.id)
      .single()

    if (verifyError || !existing) {
      return { success: false, error: 'Video class not found or unauthorized' }
    }

    const { id, ...patch } = validated
    const updatePayload: Record<string, unknown> = {}
    Object.entries(patch).forEach(([k, v]) => {
      if (v !== undefined) updatePayload[k] = v
    })
    updatePayload.updated_at = new Date().toISOString()

    const { error } = await supabase
      .from('video_classes')
      .update(updatePayload)
      .eq('id', id)

    if (error) return { success: false, error: `Failed to update video class: ${error.message}` }

    revalidatePath('/studio/video-classes')
    return { success: true }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Failed to update video class' }
  }
}

export async function deleteVideoClass(input: unknown): Promise<ActionResult> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { success: false, error: 'Unauthorized' }

    const validated = deleteVideoClassSchema.parse(input)

    const { studio, role } = await getStudioAndRoleForUser(user.id)
    if (!studio || (role !== 'owner' && role !== 'manager')) {
      return { success: false, error: 'Studio not found or you cannot delete video classes.' }
    }

    const { error } = await supabase
      .from('video_classes')
      .delete()
      .eq('id', validated.id)
      .eq('studio_id', studio.id)

    if (error) return { success: false, error: `Failed to delete video class: ${error.message}` }

    revalidatePath('/studio/video-classes')
    return { success: true }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Failed to delete video class' }
  }
}

/**
 * Create a Mux direct upload endpoint for a video class and store mux_upload_id.
 */
export async function createVideoUpload(input: unknown): Promise<ActionResult<{ uploadUrl: string; uploadId: string }>> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { success: false, error: 'Unauthorized' }

    const validated = createVideoUploadSchema.parse(input)

    const { studio, role } = await getStudioAndRoleForUser(user.id)
    if (!studio || (role !== 'owner' && role !== 'manager')) {
      return { success: false, error: 'Studio not found or you cannot upload videos.' }
    }

    const { data: video, error: videoError } = await supabase
      .from('video_classes')
      .select('id, studio_id')
      .eq('id', validated.video_class_id)
      .single()

    if (videoError || !video || video.studio_id !== studio.id) {
      return { success: false, error: 'Video class not found or unauthorized' }
    }

    const passthrough = JSON.stringify({ video_class_id: video.id, studio_id: studio.id })

    const mux = getMuxClient()
    const corsOrigin = validated.cors_origin ?? getCorsOrigin()
    const upload = await mux.video.uploads.create({
      cors_origin: corsOrigin,
      new_asset_settings: {
        playback_policy: ['signed'],
        passthrough,
      },
    })

    const { error: updateError } = await supabase
      .from('video_classes')
      .update({
        mux_upload_id: upload.id,
        mux_status: 'uploading',
        updated_at: new Date().toISOString(),
      })
      .eq('id', video.id)

    if (updateError) {
      return { success: false, error: `Failed to save upload: ${updateError.message}` }
    }

    revalidatePath('/studio/video-classes')
    return { success: true, data: { uploadUrl: upload.url, uploadId: upload.id } }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Failed to create upload' }
  }
}

/**
 * Create a Mux direct upload endpoint for a preview/trailer clip.
 * Uses public playback policy so anyone can watch the preview.
 */
export async function createPreviewUpload(input: unknown): Promise<ActionResult<{ uploadUrl: string; uploadId: string }>> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { success: false, error: 'Unauthorized' }

    const validated = createPreviewUploadSchema.parse(input)

    const { studio, role } = await getStudioAndRoleForUser(user.id)
    if (!studio || (role !== 'owner' && role !== 'manager')) {
      return { success: false, error: 'Studio not found or you cannot upload previews.' }
    }

    const { data: video, error: videoError } = await supabase
      .from('video_classes')
      .select('id, studio_id')
      .eq('id', validated.video_class_id)
      .single()

    if (videoError || !video || video.studio_id !== studio.id) {
      return { success: false, error: 'Video class not found or unauthorized' }
    }

    const passthrough = JSON.stringify({
      video_class_id: video.id,
      studio_id: studio.id,
      is_preview: true,
    })

    const mux = getMuxClient()
    const corsOrigin = validated.cors_origin ?? getCorsOrigin()
    const upload = await mux.video.uploads.create({
      cors_origin: corsOrigin,
      new_asset_settings: {
        playback_policy: ['public'],
        passthrough,
      },
    })

    const { error: updateError } = await supabase
      .from('video_classes')
      .update({
        preview_mux_upload_id: upload.id,
        updated_at: new Date().toISOString(),
      })
      .eq('id', video.id)

    if (updateError) {
      return { success: false, error: `Failed to save preview upload: ${updateError.message}` }
    }

    revalidatePath('/studio/video-classes')
    return { success: true, data: { uploadUrl: upload.url, uploadId: upload.id } }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Failed to create preview upload' }
  }
}

/**
 * Sync video class status from Mux (upload/asset status). Use when webhooks are not
 * received (e.g. local dev). Studio owner/manager only.
 */
export async function syncVideoClassStatus(videoClassId: number): Promise<ActionResult> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { success: false, error: 'Unauthorized' }

    const { studio, role } = await getStudioAndRoleForUser(user.id)
    if (!studio || (role !== 'owner' && role !== 'manager')) {
      return { success: false, error: 'Unauthorized' }
    }

    const { data: row, error: rowError } = await supabase
      .from('video_classes')
      .select('id, mux_upload_id, mux_asset_id, mux_status')
      .eq('id', videoClassId)
      .eq('studio_id', studio.id)
      .single()

    if (rowError || !row) return { success: false, error: 'Video not found' }

    const mux = getMuxClient()
    let nextStatus = row.mux_status
    let nextAssetId = row.mux_asset_id
    let nextPlaybackId: string | null = null
    let durationSeconds: number | null = null

    // If we have an asset id, fetch asset status and playback id
    if (row.mux_asset_id) {
      const asset = await mux.video.assets.retrieve(row.mux_asset_id)
      nextStatus = asset.status === 'ready' ? 'ready' : asset.status === 'errored' ? 'errored' : 'processing'
      if (asset.playback_ids && asset.playback_ids.length > 0) {
        nextPlaybackId = asset.playback_ids[0].id ?? null
      }
      if (asset.duration) {
        durationSeconds = Math.round(asset.duration)
      }
    } else if (row.mux_upload_id) {
      // No asset yet; check upload (e.g. after direct upload, Mux creates asset async)
      const upload = await mux.video.uploads.retrieve(row.mux_upload_id)
      if (upload.status === 'asset_created' && upload.asset_id) {
        nextAssetId = upload.asset_id
        nextStatus = 'processing'
        const asset = await mux.video.assets.retrieve(upload.asset_id)
        nextStatus = asset.status === 'ready' ? 'ready' : asset.status === 'errored' ? 'errored' : 'processing'
        if (asset.playback_ids && asset.playback_ids.length > 0) {
          nextPlaybackId = asset.playback_ids[0].id ?? null
        }
        if (asset.duration) {
          durationSeconds = Math.round(asset.duration)
        }
      } else if (upload.status === 'errored') {
        nextStatus = 'errored'
      } else if (upload.status === 'timed_out' || upload.status === 'cancelled') {
        nextStatus = 'errored'
      }
    }

    const { error: updateError } = await supabase
      .from('video_classes')
      .update({
        mux_status: nextStatus,
        ...(nextAssetId && { mux_asset_id: nextAssetId }),
        ...(nextPlaybackId && { mux_playback_id: nextPlaybackId }),
        ...(durationSeconds !== null && { duration_seconds: durationSeconds }),
        updated_at: new Date().toISOString(),
      })
      .eq('id', videoClassId)

    if (updateError) return { success: false, error: updateError.message }

    revalidatePath('/studio/video-classes')
    return { success: true }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to sync status',
    }
  }
}

/**
 * Get a signed playback token for previewing a video class (studio owner/manager only).
 */
export async function getVideoPlaybackToken(
  videoClassId: number
): Promise<ActionResult<{ playbackId: string; playbackToken: string }>> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { success: false, error: 'Unauthorized' }

    const { studio, role } = await getStudioAndRoleForUser(user.id)
    if (!studio || (role !== 'owner' && role !== 'manager')) {
      return { success: false, error: 'Unauthorized' }
    }

    const { data: video, error } = await supabase
      .from('video_classes')
      .select('id, mux_playback_id, title')
      .eq('id', videoClassId)
      .eq('studio_id', studio.id)
      .single()

    if (error || !video) return { success: false, error: 'Video not found' }
    if (!video.mux_playback_id) return { success: false, error: 'Video not ready for playback' }

    const playbackToken = await signMuxPlaybackToken(video.mux_playback_id, { expiration: '1h' })
    return {
      success: true,
      data: { playbackId: video.mux_playback_id, playbackToken },
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get playback token',
    }
  }
}
