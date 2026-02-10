'use client'

import { useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { createVideoPurchase } from '@/lib/actions/video-purchases'

export function BuyVideoButton({ videoClassId }: { videoClassId: number }) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  const handleBuy = () => {
    startTransition(async () => {
      const res = await createVideoPurchase({ video_class_id: videoClassId })
      if (!res.success) {
        toast.error(res.error)
        return
      }
      toast.success('Purchase created (pending)')
      router.refresh()
    })
  }

  return (
    <Button onClick={handleBuy} disabled={isPending}>
      {isPending ? '…' : 'Buy'}
    </Button>
  )
}

