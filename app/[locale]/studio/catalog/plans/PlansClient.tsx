'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatAmount } from '@/lib/utils'
import { MoreHorizontal, Pencil, Trash2 } from 'lucide-react'
import { createPlan, updatePlan, deletePlan } from '@/lib/actions/plans'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
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
import { Skeleton } from '@/components/ui/skeleton'
import type { PlanWithRelations } from '@/lib/data/plans'
import { PlanForm } from './PlanForm'

interface ClassOption {
  id: number
  name: string
}

interface PlansClientProps {
  plans: PlanWithRelations[]
  classes: ClassOption[]
}

export function PlansClient({ plans: initialPlans, classes }: PlansClientProps) {
  const t = useTranslations('studio.catalog.plans')
  const tCommon = useTranslations('studio.common')
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [open, setOpen] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState<PlanWithRelations | null>(null)

  const handleSuccess = () => {
    setOpen(false)
    setEditOpen(false)
    setSelectedPlan(null)
    setIsRefreshing(true)
    router.refresh()
    setTimeout(() => setIsRefreshing(false), 2000)
  }

  const handleEdit = (planId: number) => {
    const planData = initialPlans.find((p) => p.id === planId)
    if (planData) {
      setSelectedPlan(planData)
      setEditOpen(true)
    }
  }

  const handleDeleteClick = (planId: number) => {
    const planData = initialPlans.find((p) => p.id === planId)
    if (planData) {
      setSelectedPlan(planData)
      setDeleteDialogOpen(true)
    }
  }

  const handleDeleteConfirm = async () => {
    if (!selectedPlan || isPending) return

    startTransition(async () => {
      const result = await deletePlan({ id: selectedPlan.id })

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
            <p className="text-sm text-muted-foreground">{t('subtitle')}</p>
          </div>
          <Button onClick={() => setOpen(true)}>{t('createPlan')}</Button>
        </div>

        {isRefreshing ? (
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
        ) : initialPlans.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {initialPlans.map((plan) => (
              <Card key={plan.id} className="relative">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="font-semibold text-lg">{plan.name}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant={plan.payment_type === 'membership' ? 'default' : 'secondary'}>
                          {plan.payment_type === 'membership'
                            ? t('card.membership')
                            : t('card.singlePayment')}
                        </Badge>
                        {plan.billing_period_months && (
                          <span className="text-sm text-muted-foreground">
                            {plan.billing_period_months === 1 && t('card.monthly')}
                            {plan.billing_period_months === 3 && t('card.quarterly')}
                            {plan.billing_period_months === 12 && t('card.yearly')}
                          </span>
                        )}
                      </div>
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
                      <p className="text-sm text-muted-foreground line-clamp-2">{plan.description}</p>
                    )}
                    {plan.plan_items && plan.plan_items.length > 0 && (
                      <p className="text-xs text-muted-foreground">
                        {plan.plan_items
                          .map(
                            (pi) =>
                              `${pi.classes?.name || 'Class'} x${pi.quantity}`
                          )
                          .join(', ')}
                      </p>
                    )}
                    <div className="flex items-center pt-2">
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
                variant="plans"
                title={t('noPlans')}
                action={<Button onClick={() => setOpen(true)}>{t('createFirst')}</Button>}
                embedded
              />
            </CardContent>
          </Card>
        )}
      </div>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="right" className="w-full sm:max-w-lg overflow-y-auto">
          <SheetHeader>
            <SheetTitle>{t('sheet.createTitle')}</SheetTitle>
          </SheetHeader>
          <PlanForm
            classes={classes}
            onSuccess={handleSuccess}
            onCancel={() => setOpen(false)}
          />
        </SheetContent>
      </Sheet>

      <Sheet open={editOpen} onOpenChange={setEditOpen}>
        <SheetContent side="right" className="w-full sm:max-w-lg overflow-y-auto">
          <SheetHeader>
            <SheetTitle>{t('sheet.editTitle')}</SheetTitle>
          </SheetHeader>
          {selectedPlan && (
            <PlanForm
              plan={selectedPlan}
              classes={classes}
              onSuccess={handleSuccess}
              onCancel={() => setEditOpen(false)}
            />
          )}
        </SheetContent>
      </Sheet>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('dialog.deleteTitle')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('dialog.deleteDescription', { name: selectedPlan?.name || '' })}
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
