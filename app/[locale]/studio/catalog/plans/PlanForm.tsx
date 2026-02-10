'use client'

import { useState, useTransition } from 'react'
import { useTranslations } from 'next-intl'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { createPlan, updatePlan } from '@/lib/actions/plans'
import { Plus, X } from 'lucide-react'
import type { PlanWithRelations } from '@/lib/data/plans'

interface ClassOption {
  id: number
  name: string
}

interface PlanFormProps {
  plan?: PlanWithRelations | null
  classes: ClassOption[]
  onSuccess: () => void
  onCancel: () => void
}

export function PlanForm({ plan, classes, onSuccess, onCancel }: PlanFormProps) {
  const t = useTranslations('studio.catalog.plans')
  const tCommon = useTranslations('studio.common')
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const isEditMode = !!plan

  const initialClassId = classes[0]?.id ?? 0
  const [items, setItems] = useState<Array<{ class_id: number; quantity: number }>>(() => {
    if (plan?.plan_items && plan.plan_items.length > 0) {
      return plan.plan_items.map((pi) => ({ class_id: pi.class_id, quantity: pi.quantity }))
    }
    return [{ class_id: initialClassId, quantity: 1 }]
  })
  const [benefits, setBenefits] = useState<string[]>(
    plan?.plan_benefits?.map((b) => b.benefit_text) ?? []
  )
  const [currency, setCurrency] = useState<string>(plan?.currency ?? 'MNT')
  const [billingPeriod, setBillingPeriod] = useState<string>(
    String(plan?.billing_period_months ?? 1)
  )

  const formatPrice = (n: number) =>
    new Intl.NumberFormat('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 }).format(n)
  const parsePrice = (s: string) => parseFloat(String(s).replace(/,/g, '')) || 0

  const [priceDisplay, setPriceDisplay] = useState<string>(() =>
    plan?.price != null ? formatPrice(plan.price) : ''
  )

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/[^0-9.]/g, '')
    setPriceDisplay(raw === '' ? '' : raw)
  }

  const handlePriceBlur = () => {
    if (priceDisplay === '') return
    const parsed = parsePrice(priceDisplay)
    setPriceDisplay(formatPrice(parsed))
  }

  const addItem = () => {
    setItems((prev) => [...prev, { class_id: classes[0]?.id ?? 0, quantity: 1 }])
  }

  const removeItem = (index: number) => {
    setItems((prev) => prev.filter((_, i) => i !== index))
  }

  const updateItem = (index: number, field: 'class_id' | 'quantity', value: number) => {
    setItems((prev) => {
      const next = [...prev]
      next[index] = { ...next[index], [field]: value }
      return next
    })
  }

  const addBenefit = () => {
    setBenefits((prev) => [...prev, ''])
  }

  const removeBenefit = (index: number) => {
    setBenefits((prev) => prev.filter((_, i) => i !== index))
  }

  const updateBenefit = (index: number, value: string) => {
    setBenefits((prev) => {
      const next = [...prev]
      next[index] = value
      return next
    })
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)

    const formData = new FormData(e.currentTarget)
    const name = (formData.get('name') as string)?.trim()
    const description = (formData.get('description') as string)?.trim() || null
    const payment_type = formData.get('payment_type') as 'membership' | 'single'
    const price = parsePrice(priceDisplay)
    const billing_period_months = payment_type === 'membership'
      ? parseInt(billingPeriod, 10)
      : null
    const is_active = formData.get('is_active') === 'on'

    const validItems = items.filter((i) => i.class_id > 0 && i.quantity > 0)
    if (validItems.length === 0) {
      setError(t('form.itemsRequired'))
      return
    }

    const validBenefits = benefits.filter((b) => b.trim().length > 0)

    const payload = {
      ...(isEditMode ? { id: plan.id } : {}),
      name: name || '',
      description,
      payment_type,
      price,
      currency,
      billing_period_months: payment_type === 'membership' ? billing_period_months ?? 1 : null,
      is_active,
      items: validItems,
      benefits: validBenefits,
    }

    startTransition(async () => {
      try {
        const result = isEditMode
          ? await updatePlan(payload)
          : await createPlan(payload)

        if (!result.success) {
          setError(result.error)
          toast.error(result.error)
          return
        }

        toast.success(isEditMode ? t('toast.updated') : t('toast.created'))
        onSuccess()
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Failed to save plan'
        setError(msg)
        toast.error(msg)
      }
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 mt-6">
      <div className="space-y-2">
        <Label htmlFor="name">{t('form.name')}</Label>
        <Input
          id="name"
          name="name"
          defaultValue={plan?.name ?? ''}
          placeholder={t('form.namePlaceholder')}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">{t('form.description')}</Label>
        <Textarea
          id="description"
          name="description"
          defaultValue={plan?.description ?? ''}
          placeholder={t('form.descriptionPlaceholder')}
          rows={3}
        />
      </div>

      <div className="space-y-3">
        <Label>{t('form.pricing')}</Label>
        <div className="flex gap-4">
          <label className="flex items-center gap-2">
            <input
              type="radio"
              name="payment_type"
              value="membership"
              defaultChecked={!plan || plan.payment_type === 'membership'}
              className="h-4 w-4"
            />
            <span className="text-sm">{t('form.membership')}</span>
          </label>
          <label className="flex items-center gap-2">
            <input
              type="radio"
              name="payment_type"
              value="single"
              defaultChecked={plan?.payment_type === 'single'}
              className="h-4 w-4"
            />
            <span className="text-sm">{t('form.singlePayment')}</span>
          </label>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="price">{t('form.price')}</Label>
            <Input
              id="price"
              type="text"
              inputMode="decimal"
              value={priceDisplay}
              onChange={handlePriceChange}
              onBlur={handlePriceBlur}
              placeholder="0"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="currency">{t('form.currency')}</Label>
            <Select value={currency} onValueChange={setCurrency}>
              <SelectTrigger id="currency">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="MNT">{t('form.currencyMNT')}</SelectItem>
                <SelectItem value="USD">{t('form.currencyUSD')}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="billing_period_months">{t('form.billingPeriod')}</Label>
          <Select value={billingPeriod} onValueChange={setBillingPeriod}>
            <SelectTrigger id="billing_period_months">
              <SelectValue placeholder={t('form.selectBilling')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1">{t('form.monthly')}</SelectItem>
              <SelectItem value="3">{t('form.quarterly')}</SelectItem>
              <SelectItem value="12">{t('form.yearly')}</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label>{t('form.classes')}</Label>
          <Button type="button" variant="secondary" size="sm" onClick={addItem}>
            <Plus className="h-4 w-4 mr-1" />
            {t('form.addClass')}
          </Button>
        </div>
        <div className="space-y-2">
          {items.map((item, index) => (
            <div key={index} className="flex gap-2 items-center">
              <Select
                value={item.class_id ? String(item.class_id) : ''}
                onValueChange={(v) => updateItem(index, 'class_id', parseInt(v, 10))}
              >
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder={t('form.classPlaceholder')} />
                </SelectTrigger>
                <SelectContent>
                  {classes.map((c) => (
                    <SelectItem key={c.id} value={String(c.id)}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Input
                type="number"
                min="1"
                className="w-20"
                value={item.quantity}
                onChange={(e) => updateItem(index, 'quantity', parseInt(e.target.value, 10) || 1)}
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => removeItem(index)}
                disabled={items.length <= 1}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label>{t('form.benefits')}</Label>
          <Button type="button" variant="secondary" size="sm" onClick={addBenefit}>
            <Plus className="h-4 w-4 mr-1" />
            {t('form.addBenefit')}
          </Button>
        </div>
        <div className="space-y-2">
          {benefits.map((benefit, index) => (
            <div key={index} className="flex gap-2">
              <Input
                value={benefit}
                onChange={(e) => updateBenefit(index, e.target.value)}
                placeholder={t('form.benefitPlaceholder')}
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => removeBenefit(index)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <input
          type="checkbox"
          id="is_active"
          name="is_active"
          defaultChecked={plan?.is_active !== false}
          className="h-4 w-4 rounded border-gray-300"
        />
        <Label htmlFor="is_active">{t('form.isActive')}</Label>
      </div>

      {error && <p className="text-destructive text-sm">{error}</p>}

      <div className="flex gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          className="flex-1"
          disabled={isPending}
        >
          {tCommon('cancel')}
        </Button>
        <Button type="submit" className="flex-1" disabled={isPending}>
          {isPending ? t('form.saving') : isEditMode ? t('form.updatePlan') : t('form.createPlan')}
        </Button>
      </div>
    </form>
  )
}
