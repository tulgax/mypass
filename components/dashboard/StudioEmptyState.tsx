'use client'

import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/components/ui/empty'
import {
  EmptyClassesIllustration,
  EmptyClientsIllustration,
  EmptyCouponsIllustration,
  EmptyGenericIllustration,
  EmptyMembershipsIllustration,
  EmptyOrdersIllustration,
  EmptyPlansIllustration,
  EmptyScheduleIllustration,
} from '@/components/illustrations/empty-states'
import { cn } from '@/lib/utils'

export type EmptyStateVariant =
  | 'classes'
  | 'schedule'
  | 'memberships'
  | 'clients'
  | 'orders'
  | 'coupons'
  | 'plans'
  | 'generic'

const illustrations: Record<EmptyStateVariant, React.ComponentType<{ className?: string }>> = {
  classes: EmptyClassesIllustration,
  schedule: EmptyScheduleIllustration,
  memberships: EmptyMembershipsIllustration,
  clients: EmptyClientsIllustration,
  orders: EmptyOrdersIllustration,
  coupons: EmptyCouponsIllustration,
  plans: EmptyPlansIllustration,
  generic: EmptyGenericIllustration,
}

export interface StudioEmptyStateProps {
  variant: EmptyStateVariant
  title: string
  description?: string
  action?: React.ReactNode
  className?: string
  /** Use inside Card; no border/background, reduced padding */
  embedded?: boolean
}

export function StudioEmptyState({
  variant,
  title,
  description,
  action,
  className,
  embedded = false,
}: StudioEmptyStateProps) {
  const Illustration = illustrations[variant]

  return (
    <Empty
      className={cn(
        embedded
          ? 'border-0 bg-transparent py-8'
          : 'rounded-xl border border-dashed bg-muted/30 py-12 md:py-16',
        className
      )}
    >
      <EmptyHeader>
        <EmptyMedia variant="default" className="mb-4 size-auto min-h-32 w-full max-w-56">
          <Illustration className="mx-auto" />
        </EmptyMedia>
        <EmptyTitle>{title}</EmptyTitle>
        {description ? <EmptyDescription>{description}</EmptyDescription> : null}
      </EmptyHeader>
      {action ? <EmptyContent>{action}</EmptyContent> : null}
    </Empty>
  )
}
