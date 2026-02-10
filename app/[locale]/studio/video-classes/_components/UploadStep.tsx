'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { toast } from 'sonner'
import { Upload, CheckCircle, RefreshCw, Film } from 'lucide-react'
import MuxUploader from '@mux/mux-uploader-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  createVideoClass,
  createVideoUpload,
  createPreviewUpload,
  syncVideoClassStatus,
} from '@/lib/actions/video-classes'

interface UploadStepProps {
  videoClassId?: number
  muxStatus: string
  onMuxStatusChange: (status: string, playbackId?: string | null) => void
  onPreviewReady: (playbackId: string) => void
  onVideoCreated: (id: number) => void
  previewPlaybackId: string | null
}

export function UploadStep({
  videoClassId,
  muxStatus,
  onMuxStatusChange,
  onVideoCreated,
  onPreviewReady,
  previewPlaybackId,
}: UploadStepProps) {
  const t = useTranslations('studio.videoClasses')
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [mainEndpoint, setMainEndpoint] = useState<string | null>(null)
  const [previewEndpoint, setPreviewEndpoint] = useState<string | null>(null)
  const [mainUploaded, setMainUploaded] = useState(
    muxStatus === 'uploading' ||
      muxStatus === 'processing' ||
      muxStatus === 'ready'
  )
  const [previewUploaded, setPreviewUploaded] = useState(!!previewPlaybackId)
  // Keep local ref to videoClassId since it may be created during this step
  const [localVideoClassId, setLocalVideoClassId] = useState(videoClassId)

  const effectiveVideoClassId = localVideoClassId ?? videoClassId

  const handleStartUpload = () => {
    startTransition(async () => {
      let vcId = effectiveVideoClassId

      // If no video class exists yet, create one first
      if (!vcId) {
        const createRes = await createVideoClass({
          title: 'Untitled Video',
          price: 0,
          currency: 'MNT',
          access_duration_days: 30,
        })
        if (!createRes.success) {
          toast.error(createRes.error)
          return
        }
        vcId = createRes.data.id
        setLocalVideoClassId(vcId)
        onVideoCreated(vcId)
      }

      // Now create the Mux upload endpoint
      const uploadRes = await createVideoUpload({
        video_class_id: vcId,
        cors_origin:
          typeof window !== 'undefined' ? window.location.origin : undefined,
      })
      if (!uploadRes.success) {
        toast.error(uploadRes.error)
        return
      }
      setMainEndpoint(uploadRes.data.uploadUrl)
    })
  }

  const createPreviewEndpointFn = () => {
    if (!effectiveVideoClassId) return
    startTransition(async () => {
      const res = await createPreviewUpload({
        video_class_id: effectiveVideoClassId!,
        cors_origin:
          typeof window !== 'undefined' ? window.location.origin : undefined,
      })
      if (!res.success) {
        toast.error(res.error)
        return
      }
      setPreviewEndpoint(res.data.uploadUrl)
    })
  }

  const handleRefreshStatus = () => {
    if (!effectiveVideoClassId) return
    startTransition(async () => {
      const res = await syncVideoClassStatus(effectiveVideoClassId!)
      if (res.success) {
        router.refresh()
      } else {
        toast.error(res.error)
      }
    })
  }

  const statusBadge = () => {
    if (muxStatus === 'ready')
      return <Badge variant="default">{t('status.ready')}</Badge>
    if (muxStatus === 'uploading')
      return <Badge variant="secondary">{t('status.uploading')}</Badge>
    if (muxStatus === 'processing')
      return <Badge variant="secondary">{t('status.processing')}</Badge>
    if (muxStatus === 'errored')
      return <Badge variant="destructive">{t('status.errored')}</Badge>
    return <Badge variant="outline">{t('status.draft')}</Badge>
  }

  return (
    <div className="space-y-8">
      {/* Main video upload */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-medium">{t('wizard.uploadTitle')}</h3>
            <p className="text-sm text-muted-foreground">
              {t('wizard.uploadDescription')}
            </p>
          </div>
          {effectiveVideoClassId && statusBadge()}
        </div>

        {mainUploaded && muxStatus === 'ready' ? (
          /* Video is fully ready */
          <div className="flex items-center gap-3 rounded-lg border p-4 bg-muted/50">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <div className="flex-1">
              <div className="text-sm font-medium">{t('playbackReady')}</div>
              <div className="text-xs text-muted-foreground">
                {t('wizard.publishReady')}
              </div>
            </div>
          </div>
        ) : mainEndpoint ? (
          /* Mux uploader is active */
          <div className="space-y-3">
            <MuxUploader
              endpoint={mainEndpoint}
              onSuccess={() => {
                toast.success(t('toast.uploadComplete'))
                setMainUploaded(true)
                onMuxStatusChange('uploading')
                router.refresh()
              }}
              onError={() => toast.error(t('toast.uploadFailed'))}
            />
            {(muxStatus === 'uploading' || muxStatus === 'processing') && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleRefreshStatus}
                disabled={isPending}
                className="text-muted-foreground"
              >
                <RefreshCw
                  className={`mr-1 h-3.5 w-3.5 ${isPending ? 'animate-spin' : ''}`}
                />
                {t('refreshStatus')}
              </Button>
            )}
          </div>
        ) : mainUploaded ? (
          /* Upload completed but still processing */
          <div className="flex items-center gap-3 rounded-lg border p-4">
            <Film className="h-5 w-5 text-muted-foreground" />
            <div className="flex-1">
              <div className="text-sm font-medium">
                {muxStatus === 'processing'
                  ? t('status.processing')
                  : muxStatus === 'uploading'
                    ? t('status.uploading')
                    : t('status.draft')}
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleRefreshStatus}
              disabled={isPending}
            >
              <RefreshCw
                className={`mr-1 h-3.5 w-3.5 ${isPending ? 'animate-spin' : ''}`}
              />
              {t('refreshStatus')}
            </Button>
          </div>
        ) : (
          /* Initial state: show upload button */
          <Button
            onClick={handleStartUpload}
            disabled={isPending}
            className="w-full h-32 flex-col gap-2"
            variant="outline"
          >
            <Upload className="h-6 w-6" />
            {isPending ? '...' : t('uploadVideo')}
          </Button>
        )}
      </div>

      {/* Preview clip upload — only show after video class is created */}
      {effectiveVideoClassId && (
        <div className="space-y-4 border-t pt-6">
          <div>
            <h3 className="text-lg font-medium">
              {t('wizard.uploadPreviewTitle')}
            </h3>
            <p className="text-sm text-muted-foreground">
              {t('wizard.uploadPreviewDescription')}
            </p>
          </div>

          {previewUploaded || previewPlaybackId ? (
            <div className="flex items-center gap-3 rounded-lg border p-4 bg-muted/50">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <div className="text-sm font-medium">
                {t('wizard.previewUploaded')}
              </div>
            </div>
          ) : previewEndpoint ? (
            <MuxUploader
              endpoint={previewEndpoint}
              onSuccess={() => {
                toast.success(t('toast.previewUploadComplete'))
                setPreviewUploaded(true)
                router.refresh()
              }}
              onError={() => toast.error(t('toast.previewUploadFailed'))}
            />
          ) : (
            <Button
              onClick={createPreviewEndpointFn}
              disabled={isPending}
              variant="outline"
              size="sm"
            >
              <Upload className="mr-1.5 h-3.5 w-3.5" />
              {isPending ? '...' : t('uploadPreview')}
            </Button>
          )}
        </div>
      )}
    </div>
  )
}
