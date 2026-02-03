'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatAmount } from '@/lib/utils'
import { MoreHorizontal, X, Pencil, Trash2, Users, Calendar } from 'lucide-react'
import {
  deleteMembershipPlan,
  createMembershipPlan,
  updateMembershipPlan,
} from '@/lib/actions/memberships'
import {
  createMembershipPlanSchema,
  updateMembershipPlanSchema,
} from '@/lib/validation/memberships'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetClose,
} from '@/components/ui/sheet'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { StudioEmptyState } from '@/components/dashboard/StudioEmptyState'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Skeleton } from '@/components/ui/skeleton'

interface MembershipPlan {
  id: number
  name: string
  duration_months: number
  price: number
  currency: string
  description?: string | null
  is_active: boolean
  active_members_count?: number
}

interface MembershipClientProps {
  plans: MembershipPlan[]
}

export function MembershipClient({ plans }: MembershipClientProps) {
  const t = useTranslations('studio.memberships.plans')
  const tCommon = useTranslations('studio.common')
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [open, setOpen] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState<MembershipPlan | null>(null)

  const handleSuccess = () => {
    setOpen(false)
    setEditOpen(false)
    setIsRefreshing(true)
    router.refresh()
    setTimeout(() => setIsRefreshing(false), 2000)
  }

  const handleEdit = (planId: number) => {
    const planData = plans.find((p) => p.id === planId)
    if (planData) {
      setSelectedPlan(planData)
      setEditOpen(true)
    }
  }

  const handleDeleteClick = (planId: number) => {
    const planData = plans.find((p) => p.id === planId)
    if (planData) {
      setSelectedPlan(planData)
      setDeleteDialogOpen(true)
    }
  }

  const handleDeleteConfirm = async () => {
    if (!selectedPlan || isPending) return

    startTransition(async () => {
      const result = await deleteMembershipPlan({ id: selectedPlan.id })

      if (!result.success) {
        toast.error(result.error)
        return
      }

      toast.success(t('toast.deleted'))
      setIsRefreshing(true)
      router.refresh()
      await new Promise((resolve) => setTimeout(resolve, 300))
      setDeleteDialogOpen(false)
      setSelectedPlan(null)
      setTimeout(() => setIsRefreshing(false), 2000)
    })
  }

  return (
    <>
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold">{t('title')}</h1>
            <p className="text-sm text-muted-foreground">
              {t('subtitle')}
            </p>
          </div>
          <Button onClick={() => setOpen(true)}>{t('createPlan')}</Button>
        </div>

        {(isPending || isRefreshing) ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Card key={i}>
                <CardContent className="p-6">
                  <Skeleton className="h-6 w-32 mb-2" />
                  <Skeleton className="h-4 w-24 mb-4" />
                  <Skeleton className="h-8 w-20 mb-2" />
                  <Skeleton className="h-3 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : plans.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {plans.map((plan) => (
              <Card key={plan.id} className="relative">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="font-semibold text-lg">{plan.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {plan.duration_months} {plan.duration_months === 1 ? t('card.month') : t('card.months')}
                      </p>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleEdit(plan.id)}>
                          <Pencil className="h-4 w-4 mr-2" />
                          {tCommon('edit')}
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => handleDeleteClick(plan.id)}
                          className="text-destructive"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          {tCommon('delete')}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  <div className="space-y-2">
                    <div className="text-2xl font-bold">
                      {formatAmount(plan.price, plan.currency)}
                    </div>
                    {plan.description && (
                      <p className="text-sm text-muted-foreground">{plan.description}</p>
                    )}
                    <div className="flex items-center gap-4 pt-2 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1.5">
                        <Users className="h-3.5 w-3.5" />
                        <span>{plan.active_members_count || 0} {t('card.active')}</span>
                      </div>
                      {plan.is_active ? (
                        <Badge variant="default">{t('card.activeBadge')}</Badge>
                      ) : (
                        <Badge variant="secondary">{t('card.inactiveBadge')}</Badge>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="p-0">
              <StudioEmptyState
                variant="memberships"
                title={t('empty.noPlans')}
                action={<Button onClick={() => setOpen(true)}>{t('empty.createFirst')}</Button>}
                embedded
              />
            </CardContent>
          </Card>
        )}
      </div>

      {/* Create Plan Sheet */}
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="right" className="w-full sm:max-w-lg">
          <SheetHeader>
            <div className="flex items-center justify-between">
              <SheetTitle>{t('sheet.createTitle')}</SheetTitle>
              <SheetClose asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <X className="h-4 w-4" />
                </Button>
              </SheetClose>
            </div>
          </SheetHeader>
          <MembershipPlanForm
            onSuccess={handleSuccess}
            onCancel={() => setOpen(false)}
          />
        </SheetContent>
      </Sheet>

      {/* Edit Plan Sheet */}
      <Sheet open={editOpen} onOpenChange={setEditOpen}>
        <SheetContent side="right" className="w-full sm:max-w-lg">
          <SheetHeader>
            <div className="flex items-center justify-between">
              <SheetTitle>{t('sheet.editTitle')}</SheetTitle>
              <SheetClose asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <X className="h-4 w-4" />
                </Button>
              </SheetClose>
            </div>
          </SheetHeader>
          {selectedPlan && (
            <MembershipPlanForm
              plan={selectedPlan}
              onSuccess={handleSuccess}
              onCancel={() => setEditOpen(false)}
            />
          )}
        </SheetContent>
      </Sheet>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('dialog.deleteTitle')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('dialog.deleteDescription', { name: selectedPlan?.name || '' })}
              {selectedPlan && selectedPlan.active_members_count && selectedPlan.active_members_count > 0 && (
                <span className="block mt-2 text-destructive">
                  {t('dialog.warning', { count: selectedPlan.active_members_count })}
                </span>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isPending}>{tCommon('cancel')}</AlertDialogCancel>
            <Button
              variant="destructive"
              onClick={handleDeleteConfirm}
              disabled={isPending}
            >
              {isPending ? t('dialog.deleting') : tCommon('delete')}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

function MembershipPlanForm({
  plan,
  onSuccess,
  onCancel,
}: {
  plan?: MembershipPlan | null
  onSuccess: () => void
  onCancel: () => void
}) {
  const t = useTranslations('studio.memberships.plans')
  const tCommon = useTranslations('studio.common')
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  const isEditMode = !!plan

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)

    const formData = new FormData(e.currentTarget)
    const name = formData.get('name') as string
    const duration_months = parseInt(formData.get('duration_months') as string, 10)
    const price = parseFloat(formData.get('price') as string)
    const currency = (formData.get('currency') as string) || 'MNT'
    const description = formData.get('description') as string
    const is_active = formData.get('is_active') === 'on'

    startTransition(async () => {
      try {
        if (isEditMode && plan) {
          const result = await updateMembershipPlan({
            id: plan.id,
            name,
            duration_months,
            price,
            currency,
            description: description || null,
            is_active,
          })

          if (!result.success) {
            setError(result.error)
            return
          }
        } else {
          const result = await createMembershipPlan({
            name,
            duration_months,
            price,
            currency,
            description: description || null,
            is_active,
          })

          if (!result.success) {
            setError(result.error)
            return
          }
        }

        onSuccess()
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to save plan')
      }
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 mt-6">
      <div className="space-y-2">
        <Label htmlFor="name">{t('form.planName')}</Label>
        <Input
          id="name"
          name="name"
          defaultValue={plan?.name || ''}
          placeholder={t('form.planNamePlaceholder')}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="duration_months">{t('form.durationMonths')}</Label>
        <Input
          id="duration_months"
          name="duration_months"
          type="number"
          min="1"
          max="120"
          defaultValue={plan?.duration_months || 1}
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="price">{t('form.price')}</Label>
          <Input
            id="price"
            name="price"
            type="number"
            step="0.01"
            min="0"
            defaultValue={plan?.price || 0}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="currency">{t('form.currency')}</Label>
          <Input
            id="currency"
            name="currency"
            defaultValue={plan?.currency || 'MNT'}
            maxLength={3}
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">{t('form.description')}</Label>
        <Textarea
          id="description"
          name="description"
          defaultValue={plan?.description || ''}
          placeholder={t('form.descriptionPlaceholder')}
          rows={3}
        />
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
        <Button type="button" variant="outline" onClick={onCancel} className="flex-1" disabled={isPending}>
          {tCommon('cancel')}
        </Button>
        <Button type="submit" className="flex-1" disabled={isPending}>
          {isPending ? t('form.saving') : isEditMode ? t('form.updatePlan') : t('form.createPlan')}
        </Button>
      </div>
    </form>
  )
}
