'use client'

import { useState, useTransition } from 'react'
import { useTranslations } from 'next-intl'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'

type SubmitResult = { success: true; data?: any } | { success: false; error: string }

export function VideoClassForm({
  initial,
  onSubmit,
  onSuccess,
  canToggleActive = false,
}: {
  initial?: {
    id?: number
    title: string
    description: string | null
    price: number
    currency: string
    access_duration_days: number
    is_active?: boolean
  }
  canToggleActive?: boolean
  onSubmit: (values: any) => Promise<SubmitResult>
  onSuccess: () => void
}) {
  const t = useTranslations('studio.videoClasses')
  const [isPending, startTransition] = useTransition()
  const [title, setTitle] = useState(initial?.title ?? '')
  const [description, setDescription] = useState(initial?.description ?? '')
  const [price, setPrice] = useState(String(initial?.price ?? 0))
  const [currency, setCurrency] = useState(initial?.currency ?? 'MNT')
  const [days, setDays] = useState(String(initial?.access_duration_days ?? 30))
  const [isActive, setIsActive] = useState(Boolean(initial?.is_active ?? false))

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    startTransition(async () => {
      const payload: any = {
        title,
        description: description ? description : null,
        price: Number(price),
        currency,
        access_duration_days: Number(days),
      }
      if (initial?.id) payload.id = initial.id
      if (initial?.id && canToggleActive) payload.is_active = isActive

      const res = await onSubmit(payload)
      if (!res.success) {
        toast.error(res.error)
        return
      }
      toast.success(initial?.id ? t('toast.updated') : t('toast.created'))
      onSuccess()
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5 pt-4">
      <div className="space-y-2">
        <Label>{t('form.titleLabel')}</Label>
        <Input value={title} onChange={(e) => setTitle(e.target.value)} disabled={isPending} />
      </div>
      <div className="space-y-2">
        <Label>{t('form.descriptionLabel')}</Label>
        <Textarea value={description} onChange={(e) => setDescription(e.target.value)} disabled={isPending} />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>{t('form.priceLabel')}</Label>
          <Input
            type="number"
            min={0}
            step="0.01"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            disabled={isPending}
          />
        </div>
        <div className="space-y-2">
          <Label>{t('form.currencyLabel')}</Label>
          <Select value={currency} onValueChange={setCurrency} disabled={isPending}>
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

      <div className="space-y-2">
        <Label>{t('form.accessDaysLabel')}</Label>
        <Input
          type="number"
          min={1}
          step="1"
          value={days}
          onChange={(e) => setDays(e.target.value)}
          disabled={isPending}
        />
      </div>

      {initial?.id && canToggleActive && (
        <div className="flex items-center justify-between rounded-lg border p-3">
          <div>
            <div className="text-sm font-medium">{t('form.activeLabel')}</div>
            <div className="text-xs text-muted-foreground">{t('form.activeDescription')}</div>
          </div>
          <Switch checked={isActive} onCheckedChange={setIsActive} disabled={isPending} />
        </div>
      )}

      <div className="flex gap-2">
        <Button type="submit" disabled={isPending || !title.trim()}>
          {isPending ? t('form.saving') : t('form.save')}
        </Button>
      </div>
    </form>
  )
}

