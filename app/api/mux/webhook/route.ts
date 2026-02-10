import crypto from 'crypto'
import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

export const runtime = 'nodejs'

type MuxWebhookEvent = {
  type: string
  data: Record<string, unknown>
}

function timingSafeEqual(a: string, b: string) {
  const aBuf = Buffer.from(a, 'utf8')
  const bBuf = Buffer.from(b, 'utf8')
  if (aBuf.length !== bBuf.length) return false
  return crypto.timingSafeEqual(aBuf, bBuf)
}

function verifyMuxSignature(rawBody: string, signatureHeader: string | null, secret: string) {
  if (!signatureHeader) return false

  // header format: t=timestamp,v1=signature[,v1=signature2...]
  const parts = signatureHeader.split(',')
  const tPart = parts.find((p) => p.startsWith('t='))
  const v1Parts = parts.filter((p) => p.startsWith('v1='))
  if (!tPart || v1Parts.length === 0) return false

  const timestamp = tPart.slice(2)
  const payload = `${timestamp}.${rawBody}`
  const expected = crypto.createHmac('sha256', secret).update(payload).digest('hex')

  // Optionally: enforce basic replay protection (5 min tolerance)
  const ts = Number(timestamp)
  if (!Number.isNaN(ts)) {
    const now = Math.floor(Date.now() / 1000)
    if (Math.abs(now - ts) > 5 * 60) {
      return false
    }
  }

  return v1Parts.some((p) => timingSafeEqual(p.slice(3), expected))
}

interface Passthrough {
  video_class_id?: number
  studio_id?: number
  is_preview?: boolean
}

function extractPassthrough(event: MuxWebhookEvent): Passthrough | null {
  const eventData = event?.data as Record<string, unknown> | undefined
  const candidates = [
    eventData?.passthrough,
    (eventData?.upload as Record<string, unknown> | undefined)?.passthrough,
    (eventData?.asset as Record<string, unknown> | undefined)?.passthrough,
  ]
  for (const c of candidates) {
    if (typeof c === 'string' && c.length > 0) {
      try {
        return JSON.parse(c) as Passthrough
      } catch {
        return null
      }
    }
  }
  return null
}

export async function POST(req: Request) {
  const secret = process.env.MUX_WEBHOOK_SECRET
  if (!secret) {
    return NextResponse.json({ error: 'Missing MUX_WEBHOOK_SECRET' }, { status: 500 })
  }

  const rawBody = await req.text()
  const signature =
    req.headers.get('mux-signature') || req.headers.get('Mux-Signature')

  if (!verifyMuxSignature(rawBody, signature, secret)) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
  }

  let event: MuxWebhookEvent
  try {
    event = JSON.parse(rawBody)
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const supabase = createAdminClient()

  // Best-effort mapping: prefer passthrough video_class_id if present
  const passthrough = extractPassthrough(event)
  const videoClassId = passthrough?.video_class_id
    ? Number(passthrough.video_class_id)
    : null
  const isPreview = passthrough?.is_preview === true

  const eventData = event.data as Record<string, unknown>

  try {
    if (event.type === 'video.upload.asset_created') {
      const uploadData = eventData?.upload as Record<string, unknown> | undefined
      const uploadId =
        (eventData?.upload_id as string) || (eventData?.id as string) || (uploadData?.id as string)
      const assetId = (eventData?.asset_id as string) || ((eventData?.asset as Record<string, unknown> | undefined)?.id as string)

      if (isPreview && videoClassId && Number.isFinite(videoClassId)) {
        // Preview asset created
        await supabase
          .from('video_classes')
          .update({
            preview_mux_asset_id: assetId ?? null,
            updated_at: new Date().toISOString(),
          })
          .eq('id', videoClassId)
      } else if (videoClassId && Number.isFinite(videoClassId)) {
        await supabase
          .from('video_classes')
          .update({
            mux_upload_id: uploadId ?? null,
            mux_asset_id: assetId ?? null,
            mux_status: 'processing',
            updated_at: new Date().toISOString(),
          })
          .eq('id', videoClassId)
      } else if (uploadId) {
        // Fallback: match by upload ID for main video
        await supabase
          .from('video_classes')
          .update({
            mux_asset_id: assetId ?? null,
            mux_status: 'processing',
            updated_at: new Date().toISOString(),
          })
          .eq('mux_upload_id', uploadId)
      }
    }

    if (event.type === 'video.asset.ready' || event.type === 'video.asset.created') {
      const assetId = eventData?.id as string | undefined
      const playbackIds = eventData?.playback_ids as Array<{ id?: string; policy?: string }> | undefined
      const playbackId = playbackIds?.[0]?.id || null
      const duration = eventData?.duration as number | undefined
      const durationSeconds = duration ? Math.round(duration) : null

      if (isPreview && videoClassId && Number.isFinite(videoClassId)) {
        // Preview asset ready — store public playback id
        await supabase
          .from('video_classes')
          .update({
            preview_mux_asset_id: assetId ?? null,
            preview_mux_playback_id: playbackId,
            updated_at: new Date().toISOString(),
          })
          .eq('id', videoClassId)
      } else if (videoClassId && Number.isFinite(videoClassId)) {
        await supabase
          .from('video_classes')
          .update({
            mux_asset_id: assetId ?? null,
            mux_playback_id: playbackId,
            mux_status: 'ready',
            ...(durationSeconds !== null && { duration_seconds: durationSeconds }),
            updated_at: new Date().toISOString(),
          })
          .eq('id', videoClassId)
      } else if (assetId) {
        // Fallback: try matching by asset id for main video
        await supabase
          .from('video_classes')
          .update({
            mux_playback_id: playbackId,
            mux_status: 'ready',
            ...(durationSeconds !== null && { duration_seconds: durationSeconds }),
            updated_at: new Date().toISOString(),
          })
          .eq('mux_asset_id', assetId)
      }
    }

    if (event.type === 'video.asset.errored') {
      const assetId = eventData?.id as string | undefined

      if (isPreview && videoClassId && Number.isFinite(videoClassId)) {
        // Preview asset errored — clear preview fields
        await supabase
          .from('video_classes')
          .update({
            preview_mux_asset_id: null,
            preview_mux_playback_id: null,
            preview_mux_upload_id: null,
            updated_at: new Date().toISOString(),
          })
          .eq('id', videoClassId)
      } else if (videoClassId && Number.isFinite(videoClassId)) {
        await supabase
          .from('video_classes')
          .update({ mux_status: 'errored', updated_at: new Date().toISOString() })
          .eq('id', videoClassId)
      } else if (assetId) {
        await supabase
          .from('video_classes')
          .update({ mux_status: 'errored', updated_at: new Date().toISOString() })
          .eq('mux_asset_id', assetId)
      }
    }
  } catch (e) {
    // Return 200 so Mux doesn't retry forever; log server-side details
    console.error('[mux webhook] failed to handle event', event?.type, e)
  }

  return NextResponse.json({ ok: true })
}
