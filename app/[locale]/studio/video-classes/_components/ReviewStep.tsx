'use client'

import { useTranslations } from 'next-intl'
import {
  CheckCircle,
  Clock,
  AlertCircle,
  Star,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { formatAmount } from '@/lib/utils'
import type { WizardFormData } from './VideoClassWizard'

interface InstructorOption {
  id: string
  full_name: string | null
}

interface ReviewStepProps {
  formData: WizardFormData
  instructors: InstructorOption[]
  muxStatus: string
  muxPlaybackId: string | null
  previewPlaybackId: string | null
}

export function ReviewStep({
  formData,
  instructors,
  muxStatus,
  muxPlaybackId,
  previewPlaybackId,
}: ReviewStepProps) {
  const t = useTranslations('studio.videoClasses')

  const instructorName = formData.instructor_id
    ? instructors.find((i) => i.id === formData.instructor_id)?.full_name ??
      t('noInstructor')
    : t('noInstructor')

  const thumbnailUrl =
    formData.thumbnail_url ??
    (muxPlaybackId
      ? `https://image.mux.com/${muxPlaybackId}/thumbnail.png?width=640&height=360&fit_mode=smartcrop`
      : null)

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">{t('wizard.reviewTitle')}</h3>
        <p className="text-sm text-muted-foreground">
          {t('wizard.reviewDescription')}
        </p>
      </div>

      {/* Video status banner */}
      <div className="rounded-lg border p-4">
        {muxStatus === 'ready' ? (
          <div className="flex items-center gap-3 text-green-700">
            <CheckCircle className="h-5 w-5" />
            <span className="text-sm font-medium">
              {t('wizard.publishReady')}
            </span>
          </div>
        ) : muxStatus === 'processing' || muxStatus === 'uploading' ? (
          <div className="flex items-center gap-3 text-amber-600">
            <Clock className="h-5 w-5" />
            <span className="text-sm font-medium">
              {t('wizard.videoProcessing')}
            </span>
          </div>
        ) : (
          <div className="flex items-center gap-3 text-muted-foreground">
            <AlertCircle className="h-5 w-5" />
            <span className="text-sm font-medium">
              {t('wizard.noVideoUploaded')}
            </span>
          </div>
        )}
      </div>

      {/* Thumbnail preview */}
      {thumbnailUrl && (
        <div className="rounded-lg overflow-hidden border max-w-sm">
          <img
            src={thumbnailUrl}
            alt={formData.title || 'Video thumbnail'}
            className="w-full aspect-video object-cover"
          />
        </div>
      )}

      {/* Details summary */}
      <div className="grid gap-4 sm:grid-cols-2">
        <ReviewField
          label={t('form.titleLabel')}
          value={formData.title || '—'}
        />
        <ReviewField
          label={t('form.instructorLabel')}
          value={instructorName}
        />
        <ReviewField
          label={t('form.categoryLabel')}
          value={
            formData.category ? t(`categories.${formData.category}`) : '—'
          }
        />
        <ReviewField
          label={t('form.difficultyLabel')}
          value={
            formData.difficulty_level
              ? t(`difficulty.${formData.difficulty_level}`)
              : '—'
          }
        />
        <ReviewField
          label={t('form.priceLabel')}
          value={formatAmount(formData.price, formData.currency)}
        />
        <ReviewField
          label={t('form.accessDaysLabel')}
          value={`${formData.access_duration_days} days`}
        />
        <ReviewField
          label={t('form.sortOrderLabel')}
          value={String(formData.sort_order)}
        />
        <ReviewField
          label={t('form.featuredLabel')}
          value={
            formData.is_featured ? (
              <span className="flex items-center gap-1">
                <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                Yes
              </span>
            ) : (
              'No'
            )
          }
        />
      </div>

      {/* Description */}
      {formData.description && (
        <div className="space-y-1">
          <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            {t('form.descriptionLabel')}
          </div>
          <p className="text-sm">{formData.description}</p>
        </div>
      )}

      {/* Tags */}
      {formData.tags.length > 0 && (
        <div className="space-y-1">
          <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            {t('form.tagsLabel')}
          </div>
          <div className="flex flex-wrap gap-1.5">
            {formData.tags.map((tag) => (
              <Badge key={tag} variant="secondary">
                {tag}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Preview clip */}
      {previewPlaybackId && (
        <div className="space-y-1">
          <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            {t('wizard.uploadPreviewTitle')}
          </div>
          <Badge variant="outline">
            <CheckCircle className="mr-1 h-3 w-3 text-green-600" />
            {t('wizard.previewUploaded')}
          </Badge>
        </div>
      )}
    </div>
  )
}

function ReviewField({
  label,
  value,
}: {
  label: string
  value: React.ReactNode
}) {
  return (
    <div className="space-y-1">
      <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
        {label}
      </div>
      <div className="text-sm font-medium">{value}</div>
    </div>
  )
}
