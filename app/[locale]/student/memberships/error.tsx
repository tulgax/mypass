'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <Card>
        <CardContent className="p-6 text-center space-y-4">
          <h2 className="text-xl font-semibold">Something went wrong!</h2>
          <p className="text-muted-foreground">{error.message}</p>
          <Button onClick={reset}>Try again</Button>
        </CardContent>
      </Card>
    </div>
  )
}
