'use client'

import { useTranslations } from 'next-intl'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { WizardFormData } from './VideoClassWizard'

interface PricingStepProps {
  formData: WizardFormData
  onUpdate: (patch: Partial<WizardFormData>) => void
  muxPlaybackId: string | null
}

export function PricingStep({
  formData,
  onUpdate,
  muxPlaybackId,
}: PricingStepProps) {
  const t = useTranslations('studio.videoClasses')

  // Generate Mux auto-thumbnail URL
  const autoThumbnailUrl = muxPlaybackId
    ? `https://image.mux.com/${muxPlaybackId}/thumbnail.png?width=640&height=360&fit_mode=smartcrop`
    : null

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">{t('wizard.pricingTitle')}</h3>
        <p className="text-sm text-muted-foreground">
          {t('wizard.pricingDescription')}
        </p>
      </div>

      {/* Price & Currency */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="price">{t('form.priceLabel')}</Label>
          <Input
            id="price"
            type="number"
            min={0}
            step="0.01"
            value={String(formData.price)}
            onChange={(e) => onUpdate({ price: Number(e.target.value) })}
          />
        </div>
        <div className="space-y-2">
          <Label>{t('form.currencyLabel')}</Label>
          <Select
            value={formData.currency}
            onValueChange={(v) => onUpdate({ currency: v })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="MNT">MNT</SelectItem>
              <SelectItem value="USD">USD</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Access Duration */}
      <div className="space-y-2">
        <Label htmlFor="accessDays">{t('form.accessDaysLabel')}</Label>
        <Input
          id="accessDays"
          type="number"
          min={1}
          step="1"
          value={String(formData.access_duration_days)}
          onChange={(e) =>
            onUpdate({ access_duration_days: Number(e.target.value) })
          }
        />
      </div>

      {/* Featured Toggle */}
      <div className="flex items-center justify-between rounded-lg border p-3">
        <div>
          <div className="text-sm font-medium">{t('form.featuredLabel')}</div>
          <div className="text-xs text-muted-foreground">
            {t('form.featuredDescription')}
          </div>
        </div>
        <Switch
          checked={formData.is_featured}
          onCheckedChange={(v) => onUpdate({ is_featured: v })}
        />
      </div>

      {/* Sort Order */}
      <div className="space-y-2">
        <Label htmlFor="sortOrder">{t('form.sortOrderLabel')}</Label>
        <Input
          id="sortOrder"
          type="number"
          min={0}
          step="1"
          value={String(formData.sort_order)}
          onChange={(e) => onUpdate({ sort_order: Number(e.target.value) })}
        />
        <p className="text-xs text-muted-foreground">
          {t('form.sortOrderHelp')}
        </p>
      </div>

      {/* Thumbnail */}
      <div className="space-y-2">
        <Label htmlFor="thumbnail">{t('form.thumbnailLabel')}</Label>
        <Input
          id="thumbnail"
          value={formData.thumbnail_url ?? ''}
          onChange={(e) =>
            onUpdate({
              thumbnail_url: e.target.value.trim() || null,
            })
          }
          placeholder={t('form.thumbnailPlaceholder')}
        />
        <p className="text-xs text-muted-foreground">
          {t('form.thumbnailHelp')}
        </p>
        {/* Show auto-thumbnail preview */}
        {autoThumbnailUrl && !formData.thumbnail_url && (
          <div className="mt-2">
            <img
              src={autoThumbnailUrl}
              alt="Auto-generated thumbnail"
              className="rounded-lg max-w-xs border"
            />
          </div>
        )}
        {formData.thumbnail_url && (
          <div className="mt-2">
            <img
              src={formData.thumbnail_url}
              alt="Custom thumbnail"
              className="rounded-lg max-w-xs border"
            />
          </div>
        )}
      </div>
    </div>
  )
}
