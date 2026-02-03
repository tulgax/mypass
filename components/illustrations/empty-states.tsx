'use client'

import { cn } from '@/lib/utils'

const illustrationBase = 'size-full max-h-48 max-w-64 opacity-80' as const

/**
 * Illustration for "no classes" – calendar / class vibe
 */
export function EmptyClassesIllustration({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 200 160"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn(illustrationBase, className)}
      aria-hidden
    >
      <rect
        x="30"
        y="20"
        width="140"
        height="120"
        rx="8"
        className="fill-muted stroke-border stroke-[1.5]"
      />
      <rect x="30" y="20" width="140" height="28" rx="8" className="fill-primary/10" />
      <circle cx="70" cy="34" r="4" className="fill-primary/40" />
      <circle cx="90" cy="34" r="4" className="fill-primary/40" />
      <circle cx="110" cy="34" r="4" className="fill-primary/40" />
      <line x1="40" y1="60" x2="160" y2="60" className="stroke-border stroke-[1]" />
      <line x1="40" y1="80" x2="130" y2="80" className="stroke-muted-foreground/30 stroke-[1]" />
      <line x1="40" y1="100" x2="140" y2="100" className="stroke-muted-foreground/30 stroke-[1]" />
      <rect x="40" y="118" width="50" height="12" rx="4" className="fill-primary/20" />
    </svg>
  )
}

/**
 * Illustration for "no schedule" – calendar + clock
 */
export function EmptyScheduleIllustration({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 200 160"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn(illustrationBase, className)}
      aria-hidden
    >
      <rect
        x="24"
        y="16"
        width="152"
        height="128"
        rx="10"
        className="fill-muted stroke-border stroke-[1.5]"
      />
      <rect x="24" y="16" width="152" height="36" rx="10" className="fill-primary/10" />
      <circle cx="100" cy="34" r="8" className="fill-primary/30" />
      <path
        d="M100 26 v8 l6 4"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        className="stroke-primary/60"
      />
      <line x1="40" y1="68" x2="160" y2="68" className="stroke-border stroke-[1]" />
      <line x1="40" y1="92" x2="120" y2="92" className="stroke-muted-foreground/30 stroke-[1]" />
      <line x1="40" y1="116" x2="140" y2="116" className="stroke-muted-foreground/30 stroke-[1]" />
      <circle cx="170" cy="80" r="20" className="fill-muted stroke-border stroke-[1.5]" />
      <path
        d="M170 70 v12 l6 6"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        className="stroke-muted-foreground/50"
      />
    </svg>
  )
}

/**
 * Illustration for "no memberships" – people / group
 */
export function EmptyMembershipsIllustration({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 200 160"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn(illustrationBase, className)}
      aria-hidden
    >
      <circle cx="100" cy="52" r="24" className="fill-muted stroke-border stroke-[1.5]" />
      <circle cx="100" cy="48" r="8" className="fill-muted-foreground/40" />
      <path
        d="M80 72 Q100 88 120 72"
        className="stroke-muted-foreground/40 stroke-[1.5] fill-none"
      />
      <circle cx="60" cy="100" r="18" className="fill-muted stroke-border stroke-[1.5]" />
      <circle cx="60" cy="97" r="6" className="fill-muted-foreground/40" />
      <path d="M48 110 Q60 120 72 110" className="stroke-muted-foreground/40 stroke-[1] fill-none" />
      <circle cx="140" cy="100" r="18" className="fill-muted stroke-border stroke-[1.5]" />
      <circle cx="140" cy="97" r="6" className="fill-muted-foreground/40" />
      <path d="M128 110 Q140 120 152 110" className="stroke-muted-foreground/40 stroke-[1] fill-none" />
      <path
        d="M76 76 Q100 90 124 76"
        className="stroke-primary/30 stroke-[2] fill-none"
        strokeLinecap="round"
      />
    </svg>
  )
}

/**
 * Illustration for "no clients / no bookings" – clipboard / list
 */
export function EmptyClientsIllustration({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 200 160"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn(illustrationBase, className)}
      aria-hidden
    >
      <rect
        x="40"
        y="20"
        width="120"
        height="120"
        rx="6"
        className="fill-muted stroke-border stroke-[1.5]"
      />
      <rect x="88" y="12" width="24" height="16" rx="4" className="fill-muted stroke-border stroke-[1.5]" />
      <line x1="56" y1="48" x2="144" y2="48" className="stroke-border stroke-[1]" />
      <circle cx="64" cy="48" r="6" className="fill-primary/20 stroke-primary/40 stroke-[1]" />
      <line x1="56" y1="76" x2="136" y2="76" className="stroke-muted-foreground/30 stroke-[1]" />
      <line x1="56" y1="104" x2="140" y2="104" className="stroke-muted-foreground/30 stroke-[1]" />
      <line x1="56" y1="132" x2="120" y2="132" className="stroke-muted-foreground/30 stroke-[1]" />
    </svg>
  )
}

/**
 * Illustration for "no orders" – package / box
 */
export function EmptyOrdersIllustration({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 200 160"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn(illustrationBase, className)}
      aria-hidden
    >
      <path
        d="M40 55 L100 25 L160 55 L160 125 L100 155 L40 125 Z"
        className="fill-muted stroke-border stroke-[1.5]"
      />
      <path d="M100 25 L100 155 M40 55 L100 90 L160 55 M100 90 L40 125 M100 90 L160 125" className="stroke-border stroke-[1]" />
      <circle cx="100" cy="70" r="12" className="fill-primary/20 stroke-primary/40 stroke-[1]" />
    </svg>
  )
}

/**
 * Illustration for "no coupons" – ticket / tag
 */
export function EmptyCouponsIllustration({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 200 160"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn(illustrationBase, className)}
      aria-hidden
    >
      <rect
        x="35"
        y="30"
        width="130"
        height="100"
        rx="8"
        className="fill-muted stroke-border stroke-[1.5]"
      />
      <path
        d="M95 30 L95 130 M125 30 L125 130"
        strokeDasharray="4 4"
        className="stroke-border stroke-[1]"
      />
      <circle cx="95" cy="50" r="6" className="fill-primary/20" />
      <circle cx="125" cy="90" r="6" className="fill-primary/20" />
      <rect x="50" y="60" width="35" height="8" rx="2" className="fill-muted-foreground/20" />
      <rect x="50" y="78" width="25" height="6" rx="2" className="fill-muted-foreground/15" />
    </svg>
  )
}

/**
 * Illustration for "no plans" – layers / stack
 */
export function EmptyPlansIllustration({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 200 160"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn(illustrationBase, className)}
      aria-hidden
    >
      <rect
        x="50"
        y="75"
        width="100"
        height="60"
        rx="6"
        className="fill-muted stroke-border stroke-[1.5]"
      />
      <rect
        x="55"
        y="65"
        width="100"
        height="60"
        rx="6"
        className="fill-muted/80 stroke-border stroke-[1.5]"
      />
      <rect
        x="60"
        y="55"
        width="100"
        height="60"
        rx="6"
        className="fill-primary/10 stroke-border stroke-[1.5]"
      />
      <line x1="75" y1="75" x2="145" y2="75" className="stroke-muted-foreground/30 stroke-[1]" />
      <line x1="75" y1="88" x2="135" y2="88" className="stroke-muted-foreground/20 stroke-[1]" />
    </svg>
  )
}

/**
 * Generic empty state – inbox / folder
 */
export function EmptyGenericIllustration({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 200 160"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn(illustrationBase, className)}
      aria-hidden
    >
      <rect
        x="30"
        y="40"
        width="140"
        height="100"
        rx="8"
        className="fill-muted stroke-border stroke-[1.5]"
      />
      <path
        d="M30 60 L100 35 L170 60"
        className="stroke-border stroke-[1.5] fill-none"
      />
      <rect x="50" y="80" width="100" height="8" rx="2" className="fill-muted-foreground/20" />
      <rect x="50" y="98" width="80" height="8" rx="2" className="fill-muted-foreground/15" />
      <rect x="50" y="116" width="60" height="8" rx="2" className="fill-muted-foreground/10" />
    </svg>
  )
}
