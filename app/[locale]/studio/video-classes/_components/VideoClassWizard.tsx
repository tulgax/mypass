'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { toast } from 'sonner'
import { Check } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  createVideoClass,
  updateVideoClass,
} from '@/lib/actions/video-classes'
import type { VideoClassWithInstructor } from '@/lib/data/video-classes'
import { UploadStep } from './UploadStep'
import { DetailsStep } from './DetailsStep'
import { PricingStep } from './PricingStep'
import { ReviewStep } from './ReviewStep'

interface InstructorOption {
  id: string
  full_name: string | null
}

export interface WizardFormData {
  id?: number
  title: string
  description: string
  instructor_id: string | null
  category: string | null
  difficulty_level: string | null
  tags: string[]
  price: number
  currency: string
  access_duration_days: number
  thumbnail_url: string | null
  is_featured: boolean
  sort_order: number
  mux_status?: string
  mux_playback_id?: string | null
  preview_mux_playback_id?: string | null
}

const STEPS = ['step1', 'step2', 'step3', 'step4'] as const

export function VideoClassWizard({
  instructors,
  initial,
}: {
  instructors: InstructorOption[]
  initial?: VideoClassWithInstructor
}) {
  const t = useTranslations('studio.videoClasses')
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [currentStep, setCurrentStep] = useState(0)
  const [videoClassId, setVideoClassId] = useState<number | undefined>(
    initial?.id
  )
  const [muxStatus, setMuxStatus] = useState(initial?.mux_status ?? 'draft')
  const [muxPlaybackId, setMuxPlaybackId] = useState(
    initial?.mux_playback_id ?? null
  )
  const [previewPlaybackId, setPreviewPlaybackId] = useState(
    initial?.preview_mux_playback_id ?? null
  )

  const [formData, setFormData] = useState<WizardFormData>({
    id: initial?.id,
    title: initial?.title ?? '',
    description: initial?.description ?? '',
    instructor_id: initial?.instructor_id ?? null,
    category: initial?.category ?? null,
    difficulty_level: initial?.difficulty_level ?? null,
    tags: initial?.tags ?? [],
    price: initial ? Number(initial.price) : 0,
    currency: initial?.currency ?? 'MNT',
    access_duration_days: initial?.access_duration_days ?? 30,
    thumbnail_url: initial?.thumbnail_url ?? null,
    is_featured: initial?.is_featured ?? false,
    sort_order: initial?.sort_order ?? 0,
    mux_status: initial?.mux_status ?? 'draft',
    mux_playback_id: initial?.mux_playback_id ?? null,
    preview_mux_playback_id: initial?.preview_mux_playback_id ?? null,
  })

  const isEditMode = !!initial

  const updateFormData = (patch: Partial<WizardFormData>) => {
    setFormData((prev) => ({ ...prev, ...patch }))
  }

  const handleVideoCreated = (id: number) => {
    setVideoClassId(id)
    updateFormData({ id })
  }

  const handleMuxStatusChange = (status: string, playbackId?: string | null) => {
    setMuxStatus(status)
    if (playbackId !== undefined) setMuxPlaybackId(playbackId)
    updateFormData({ mux_status: status, mux_playback_id: playbackId })
  }

  const handlePreviewReady = (playbackId: string) => {
    setPreviewPlaybackId(playbackId)
    updateFormData({ preview_mux_playback_id: playbackId })
  }

  const handleNext = () => {
    // Step 0 -> 1: just advance (video class may or may not exist yet)
    if (currentStep === 0) {
      setCurrentStep(1)
      return
    }

    // Steps 1+: save progress before advancing
    if (videoClassId) {
      startTransition(async () => {
        const res = await updateVideoClass({
          id: videoClassId,
          title: formData.title,
          description: formData.description || null,
          instructor_id: formData.instructor_id,
          category: formData.category,
          difficulty_level: formData.difficulty_level,
          tags: formData.tags,
          price: formData.price,
          currency: formData.currency,
          access_duration_days: formData.access_duration_days,
          thumbnail_url: formData.thumbnail_url,
          is_featured: formData.is_featured,
          sort_order: formData.sort_order,
        })
        if (!res.success) {
          toast.error(res.error)
          return
        }
        setCurrentStep((s) => Math.min(s + 1, STEPS.length - 1))
      })
      return
    }

    // If no videoClassId yet (user skipped upload), create it now
    startTransition(async () => {
      const res = await createVideoClass({
        title: formData.title || 'Untitled Video',
        description: formData.description || null,
        price: formData.price,
        currency: formData.currency,
        access_duration_days: formData.access_duration_days,
        instructor_id: formData.instructor_id,
        category: formData.category,
        difficulty_level: formData.difficulty_level,
        tags: formData.tags,
        is_featured: formData.is_featured,
        sort_order: formData.sort_order,
      })
      if (!res.success) {
        toast.error(res.error)
        return
      }
      handleVideoCreated(res.data.id)
      setCurrentStep((s) => Math.min(s + 1, STEPS.length - 1))
    })
  }

  const handleBack = () => {
    setCurrentStep((s) => Math.max(s - 1, 0))
  }

  const handlePublish = () => {
    if (!videoClassId) return
    startTransition(async () => {
      const res = await updateVideoClass({
        id: videoClassId,
        title: formData.title,
        description: formData.description || null,
        instructor_id: formData.instructor_id,
        category: formData.category,
        difficulty_level: formData.difficulty_level,
        tags: formData.tags,
        price: formData.price,
        currency: formData.currency,
        access_duration_days: formData.access_duration_days,
        thumbnail_url: formData.thumbnail_url,
        is_featured: formData.is_featured,
        sort_order: formData.sort_order,
        is_active: true,
      })
      if (!res.success) {
        toast.error(res.error)
        return
      }
      toast.success(t('toast.published'))
      router.push('/studio/video-classes')
      router.refresh()
    })
  }

  const handleSaveDraft = () => {
    if (!videoClassId) return
    startTransition(async () => {
      const res = await updateVideoClass({
        id: videoClassId,
        title: formData.title,
        description: formData.description || null,
        instructor_id: formData.instructor_id,
        category: formData.category,
        difficulty_level: formData.difficulty_level,
        tags: formData.tags,
        price: formData.price,
        currency: formData.currency,
        access_duration_days: formData.access_duration_days,
        thumbnail_url: formData.thumbnail_url,
        is_featured: formData.is_featured,
        sort_order: formData.sort_order,
      })
      if (!res.success) {
        toast.error(res.error)
        return
      }
      toast.success(t('toast.draftSaved'))
      router.push('/studio/video-classes')
      router.refresh()
    })
  }

  const stepLabels = STEPS.map((key) => t(`wizard.${key}`))

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold">
          {isEditMode ? t('wizard.editTitle') : t('wizard.title')}
        </h1>
      </div>

      {/* Step indicator */}
      <nav aria-label="Progress">
        <ol className="flex items-center gap-2">
          {stepLabels.map((label, index) => {
            const isCompleted = index < currentStep
            const isCurrent = index === currentStep
            return (
              <li key={index} className="flex items-center gap-2">
                {index > 0 && (
                  <div
                    className={cn(
                      'h-px w-8 sm:w-12',
                      isCompleted ? 'bg-primary' : 'bg-border'
                    )}
                  />
                )}
                <button
                  type="button"
                  onClick={() => {
                    if (isCompleted) setCurrentStep(index)
                  }}
                  disabled={!isCompleted}
                  className={cn(
                    'flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-medium transition-colors',
                    isCurrent && 'bg-primary text-primary-foreground',
                    isCompleted &&
                      'bg-primary/10 text-primary hover:bg-primary/20 cursor-pointer',
                    !isCurrent && !isCompleted && 'bg-muted text-muted-foreground'
                  )}
                >
                  {isCompleted ? (
                    <Check className="h-3.5 w-3.5" />
                  ) : (
                    <span className="text-xs">{index + 1}</span>
                  )}
                  <span className="hidden sm:inline">{label}</span>
                </button>
              </li>
            )
          })}
        </ol>
      </nav>

      {/* Step content */}
      <Card>
        <CardContent className="p-6">
          {currentStep === 0 && (
            <UploadStep
              videoClassId={videoClassId}
              muxStatus={muxStatus}
              onMuxStatusChange={handleMuxStatusChange}
              onVideoCreated={handleVideoCreated}
              onPreviewReady={handlePreviewReady}
              previewPlaybackId={previewPlaybackId}
            />
          )}
          {currentStep === 1 && (
            <DetailsStep
              formData={formData}
              onUpdate={updateFormData}
              instructors={instructors}
            />
          )}
          {currentStep === 2 && (
            <PricingStep
              formData={formData}
              onUpdate={updateFormData}
              muxPlaybackId={muxPlaybackId}
            />
          )}
          {currentStep === 3 && (
            <ReviewStep
              formData={formData}
              instructors={instructors}
              muxStatus={muxStatus}
              muxPlaybackId={muxPlaybackId}
              previewPlaybackId={previewPlaybackId}
            />
          )}
        </CardContent>
      </Card>

      {/* Navigation buttons */}
      <div className="flex items-center justify-between">
        <div>
          {currentStep > 0 && (
            <Button
              variant="outline"
              onClick={handleBack}
              disabled={isPending}
            >
              {t('wizard.back')}
            </Button>
          )}
        </div>
        <div className="flex gap-2">
          {currentStep < STEPS.length - 1 ? (
            <Button onClick={handleNext} disabled={isPending}>
              {isPending ? t('wizard.savingDraft') : t('wizard.next')}
            </Button>
          ) : (
            <>
              <Button
                variant="outline"
                onClick={handleSaveDraft}
                disabled={isPending}
              >
                {isPending ? t('wizard.savingDraft') : t('wizard.saveAsDraft')}
              </Button>
              <Button
                onClick={handlePublish}
                disabled={isPending || muxStatus !== 'ready'}
              >
                {isPending ? t('wizard.publishing') : t('wizard.publish')}
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
