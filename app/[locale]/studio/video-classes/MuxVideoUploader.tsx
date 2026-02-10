'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import MuxUploader from '@mux/mux-uploader-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { createVideoUpload } from '@/lib/actions/video-classes'

export function MuxVideoUploader({ videoClassId }: { videoClassId: number }) {
  const t = useTranslations('studio.videoClasses')
  const router = useRouter()
  const [endpoint, setEndpoint] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const createEndpoint = () => {
    startTransition(async () => {
      const res = await createVideoUpload({
        video_class_id: videoClassId,
        cors_origin: typeof window !== 'undefined' ? window.location.origin : undefined,
      })
      if (!res.success) {
        toast.error(res.error)
        return
      }
      setEndpoint(res.data.uploadUrl)
    })
  }

  if (!endpoint) {
    return (
      <Button onClick={createEndpoint} disabled={isPending}>
        {isPending ? '…' : t('uploadVideo')}
      </Button>
    )
  }

  return (
    <div className="space-y-2">
      <MuxUploader
        endpoint={endpoint}
        onSuccess={() => {
          toast.success(t('toast.uploadComplete'))
          router.refresh()
        }}
        onError={() => toast.error(t('toast.uploadFailed'))}
      />
      <div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setEndpoint(null)}
        >
          {t('reset')}
        </Button>
      </div>
    </div>
  )
}

