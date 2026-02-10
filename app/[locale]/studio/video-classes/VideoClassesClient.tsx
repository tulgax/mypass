'use client'

import { useEffect, useMemo, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { toast } from 'sonner'
import { Play, Star, Clock, User, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { StudioEmptyState } from '@/components/dashboard/StudioEmptyState'
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { formatAmount } from '@/lib/utils'
import type { VideoClassWithInstructor } from '@/lib/data/video-classes'
import {
  deleteVideoClass,
  getVideoPlaybackToken,
} from '@/lib/actions/video-classes'
import { VideoPurchasesSheet } from './VideoPurchasesSheet'
import { VideoPreviewPlayer } from './VideoPreviewPlayer'

function formatDuration(seconds: number | null): string {
  if (!seconds) return ''
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins}:${String(secs).padStart(2, '0')}`
}

export function VideoClassesClient({
  videoClasses,
}: {
  videoClasses: VideoClassWithInstructor[]
}) {
  const t = useTranslations('studio.videoClasses')
  const tCommon = useTranslations('studio.common')
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [isRefreshing, setIsRefreshing] = useState(false)

  const [purchasesOpen, setPurchasesOpen] = useState(false)
  const [previewOpen, setPreviewOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [selected, setSelected] = useState<VideoClassWithInstructor | null>(
    null
  )
  const [previewToken, setPreviewToken] = useState<{
    playbackId: string
    playbackToken: string
  } | null>(null)
  const [previewLoading, setPreviewLoading] = useState(false)
  const [previewError, setPreviewError] = useState<string | null>(null)

  const sorted = useMemo(() => videoClasses, [videoClasses])

  // Fetch playback token when preview sheet opens for a ready video
  useEffect(() => {
    if (!previewOpen || !selected || selected.mux_status !== 'ready') {
      if (!previewOpen) {
        setPreviewToken(null)
        setPreviewError(null)
      }
      return
    }
    let cancelled = false
    setPreviewLoading(true)
    setPreviewError(null)
    setPreviewToken(null)
    getVideoPlaybackToken(selected.id).then((res) => {
      if (cancelled) return
      setPreviewLoading(false)
      if (res.success) setPreviewToken(res.data)
      else setPreviewError(res.error)
    })
    return () => {
      cancelled = true
    }
  }, [previewOpen, selected])

  const handleSuccess = () => {
    setDeleteOpen(false)
    setSelected(null)
    setIsRefreshing(true)
    router.refresh()
    setTimeout(() => setIsRefreshing(false), 1500)
  }

  const statusBadge = (vc: VideoClassWithInstructor) => {
    const s = vc.mux_status
    if (s === 'ready')
      return <Badge variant="default">{t('status.ready')}</Badge>
    if (s === 'uploading')
      return <Badge variant="secondary">{t('status.uploading')}</Badge>
    if (s === 'processing')
      return <Badge variant="secondary">{t('status.processing')}</Badge>
    if (s === 'errored')
      return <Badge variant="destructive">{t('status.errored')}</Badge>
    return <Badge variant="outline">{t('status.draft')}</Badge>
  }

  const handleDeleteConfirm = () => {
    if (!selected || isPending) return
    startTransition(async () => {
      const res = await deleteVideoClass({ id: selected.id })
      if (!res.success) {
        toast.error(res.error)
        return
      }
      toast.success(t('toast.deleted'))
      handleSuccess()
    })
  }

  const getThumbnailUrl = (vc: VideoClassWithInstructor) => {
    if (vc.thumbnail_url) return vc.thumbnail_url
    if (vc.mux_playback_id) {
      return `https://image.mux.com/${vc.mux_playback_id}/thumbnail.png?width=640&height=360&fit_mode=smartcrop`
    }
    return null
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">{t('title')}</h1>
          <p className="text-sm text-muted-foreground">{t('subtitle')}</p>
        </div>
        <Button asChild>
          <Link href="/studio/video-classes/new">
            <Plus className="mr-1.5 h-4 w-4" />
            {t('createVideo')}
          </Link>
        </Button>
      </div>

      {isPending || isRefreshing ? (
        <Card className="border-0 shadow-none">
          <CardContent className="p-0">
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-48 w-full rounded-lg" />
              ))}
            </div>
          </CardContent>
        </Card>
      ) : sorted.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {sorted.map((vc) => {
            const thumbnailUrl = getThumbnailUrl(vc)
            return (
              <Card key={vc.id} className="overflow-hidden group">
                {/* Thumbnail */}
                {thumbnailUrl ? (
                  <div className="relative aspect-video bg-muted overflow-hidden">
                    <img
                      src={thumbnailUrl}
                      alt={vc.title}
                      className="object-cover w-full h-full"
                    />
                    {/* Duration overlay */}
                    {vc.duration_seconds && (
                      <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-1.5 py-0.5 rounded">
                        {formatDuration(vc.duration_seconds)}
                      </div>
                    )}
                    {/* Featured star */}
                    {vc.is_featured && (
                      <div className="absolute top-2 left-2">
                        <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                      </div>
                    )}
                    {/* Status badge overlay */}
                    <div className="absolute top-2 right-2">
                      {statusBadge(vc)}
                    </div>
                  </div>
                ) : (
                  <div className="relative aspect-video bg-muted flex items-center justify-center">
                    <Play className="h-8 w-8 text-muted-foreground/50" />
                    <div className="absolute top-2 right-2">
                      {statusBadge(vc)}
                    </div>
                    {vc.is_featured && (
                      <div className="absolute top-2 left-2">
                        <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                      </div>
                    )}
                  </div>
                )}

                <CardContent className="p-4 space-y-3">
                  {/* Title & description */}
                  <div className="min-w-0">
                    <div className="font-semibold truncate">{vc.title}</div>
                    {vc.description && (
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {vc.description}
                      </p>
                    )}
                  </div>

                  {/* Metadata row */}
                  <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                    {/* Instructor */}
                    {vc.instructor && (
                      <span className="flex items-center gap-1">
                        <User className="h-3 w-3" />
                        {vc.instructor.full_name ?? t('noInstructor')}
                      </span>
                    )}
                    {/* Duration */}
                    {vc.duration_seconds && (
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {formatDuration(vc.duration_seconds)}
                      </span>
                    )}
                  </div>

                  {/* Category & difficulty badges */}
                  <div className="flex flex-wrap gap-1.5">
                    {vc.category && (
                      <Badge variant="outline" className="text-xs">
                        {t(`categories.${vc.category}`, { defaultValue: vc.category })}
                      </Badge>
                    )}
                    {vc.difficulty_level && (
                      <Badge variant="secondary" className="text-xs">
                        {t(`difficulty.${vc.difficulty_level}`)}
                      </Badge>
                    )}
                    {vc.tags.slice(0, 3).map((tag) => (
                      <Badge key={tag} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                    {vc.tags.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{vc.tags.length - 3}
                      </Badge>
                    )}
                  </div>

                  {/* Price & status */}
                  <div className="text-sm">
                    <span className="font-medium">
                      {formatAmount(Number(vc.price), vc.currency)}
                    </span>
                    <span className="text-muted-foreground">
                      {' '}
                      &bull; {vc.access_duration_days} days
                    </span>
                    {vc.is_active ? (
                      <span className="text-green-600">
                        {' '}
                        &bull; {t('active')}
                      </span>
                    ) : (
                      <span className="text-muted-foreground">
                        {' '}
                        &bull; {t('inactive')}
                      </span>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex flex-wrap items-center gap-2 pt-1">
                    {vc.mux_status === 'ready' && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelected(vc)
                          setPreviewOpen(true)
                        }}
                      >
                        <Play className="mr-1 h-3.5 w-3.5" />
                        {t('preview')}
                      </Button>
                    )}
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/studio/video-classes/${vc.id}/edit`}>
                        {t('edit')}
                      </Link>
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelected(vc)
                        setPurchasesOpen(true)
                      }}
                    >
                      {t('purchases')}
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => {
                        setSelected(vc)
                        setDeleteOpen(true)
                      }}
                    >
                      {t('delete')}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      ) : (
        <Card>
          <CardContent className="p-0">
            <StudioEmptyState
              variant="plans"
              title={t('empty')}
              action={
                <Button asChild>
                  <Link href="/studio/video-classes/new">
                    {t('emptyAction')}
                  </Link>
                </Button>
              }
              embedded
            />
          </CardContent>
        </Card>
      )}

      {/* Delete dialog */}
      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('deleteDialogTitle')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('deleteDialogDescription')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isPending}>
              {tCommon('cancel')}
            </AlertDialogCancel>
            <Button
              variant="destructive"
              onClick={handleDeleteConfirm}
              disabled={isPending}
            >
              {isPending ? t('deleting') : t('delete')}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Purchases sheet */}
      <Sheet open={purchasesOpen} onOpenChange={setPurchasesOpen}>
        <SheetContent side="right" className="w-full sm:max-w-lg overflow-y-auto">
          <SheetHeader>
            <SheetTitle>{t('purchasesSheetTitle')}</SheetTitle>
          </SheetHeader>
          {selected && (
            <div className="pt-4 space-y-3">
              <div className="text-sm font-medium">{selected.title}</div>
              <VideoPurchasesSheet videoClassId={selected.id} />
              <div className="text-xs text-muted-foreground">
                {t('activateHint')}
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>

      {/* Preview sheet */}
      <Sheet open={previewOpen} onOpenChange={setPreviewOpen}>
        <SheetContent
          side="right"
          className="w-full sm:max-w-2xl overflow-y-auto"
        >
          <SheetHeader>
            <SheetTitle>{selected?.title ?? t('preview')}</SheetTitle>
          </SheetHeader>
          {selected && (
            <div className="pt-4">
              {previewLoading && (
                <Skeleton className="w-full aspect-video rounded-lg" />
              )}
              {previewError && (
                <p className="text-sm text-destructive">{previewError}</p>
              )}
              {!previewLoading && previewToken && (
                <VideoPreviewPlayer
                  playbackId={previewToken.playbackId}
                  playbackToken={previewToken.playbackToken}
                  title={selected.title}
                />
              )}
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  )
}
