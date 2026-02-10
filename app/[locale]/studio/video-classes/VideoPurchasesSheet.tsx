'use client'

import { useEffect, useMemo, useState, useTransition } from 'react'
import { useTranslations } from 'next-intl'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { activateVideoPurchase } from '@/lib/actions/video-purchases'

type PurchaseRow = {
  id: number
  student_id: string
  status: string
  purchased_at: string | null
  expires_at: string | null
  created_at: string
}

export function VideoPurchasesSheet({ videoClassId }: { videoClassId: number }) {
  const t = useTranslations('studio.videoClasses')
  const supabase = useMemo(() => createClient(), [])
  const [rows, setRows] = useState<PurchaseRow[]>([])
  const [loading, setLoading] = useState(true)
  const [isPending, startTransition] = useTransition()

  useEffect(() => {
    let mounted = true
    ;(async () => {
      setLoading(true)
      const { data, error } = await supabase
        .from('video_purchases')
        .select('id, student_id, status, purchased_at, expires_at, created_at')
        .eq('video_class_id', videoClassId)
        .order('created_at', { ascending: false })

      if (!mounted) return
      if (error) {
        toast.error(error.message)
        setRows([])
      } else {
        setRows((data || []) as any)
      }
      setLoading(false)
    })()
    return () => {
      mounted = false
    }
  }, [supabase, videoClassId])

  const activate = (purchaseId: number) => {
    startTransition(async () => {
      const res = await activateVideoPurchase({ purchase_id: purchaseId })
      if (!res.success) {
        toast.error(res.error)
        return
      }
      toast.success(t('toast.activated'))
      // Refresh list
      const { data } = await supabase
        .from('video_purchases')
        .select('id, student_id, status, purchased_at, expires_at, created_at')
        .eq('video_class_id', videoClassId)
        .order('created_at', { ascending: false })
      setRows((data || []) as any)
    })
  }

  if (loading) {
    return (
      <div className="space-y-2">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
      </div>
    )
  }

  if (rows.length === 0) {
    return <div className="text-sm text-muted-foreground">{t('purchasesEmpty')}</div>
  }

  return (
    <div className="space-y-2">
      {rows.map((r) => (
        <div key={r.id} className="flex items-center justify-between gap-3 rounded-md border p-3">
          <div className="min-w-0">
            <div className="text-sm font-medium truncate">{r.student_id}</div>
            <div className="text-xs text-muted-foreground">
              {r.status}
              {r.expires_at ? ` • expires ${new Date(r.expires_at).toLocaleDateString()}` : ''}
            </div>
          </div>
          {r.status === 'pending' ? (
            <Button size="sm" onClick={() => activate(r.id)} disabled={isPending}>
              {t('activate')}
            </Button>
          ) : null}
        </div>
      ))}
    </div>
  )
}

