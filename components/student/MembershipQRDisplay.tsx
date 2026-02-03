'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'
import { Copy, Check } from 'lucide-react'

interface MembershipQRDisplayProps {
  membershipId: number
}

export function MembershipQRDisplay({ membershipId }: MembershipQRDisplayProps) {
  const t = useTranslations('student.memberships')
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(String(membershipId))
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Fallback for older browsers
      const input = document.createElement('input')
      input.value = String(membershipId)
      document.body.appendChild(input)
      input.select()
      document.execCommand('copy')
      document.body.removeChild(input)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col items-center gap-4">
        <div className="flex items-center gap-3">
          <span
            className="text-4xl md:text-5xl font-mono font-bold tabular-nums tracking-wider"
            aria-label={`Membership ID: ${membershipId}`}
          >
            {membershipId}
          </span>
          <Button
            variant="outline"
            size="icon"
            onClick={handleCopy}
            className="shrink-0"
            aria-label="Copy membership ID"
          >
            {copied ? (
              <Check className="h-4 w-4 text-green-600" />
            ) : (
              <Copy className="h-4 w-4" />
            )}
          </Button>
        </div>
        <p className="text-sm text-muted-foreground text-center">
          {t('checkInIdInstruction')}
        </p>
      </div>
    </div>
  )
}
