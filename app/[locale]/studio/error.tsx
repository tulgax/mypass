'use client'

import { useEffect } from 'react'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertCircle } from 'lucide-react'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  const t = useTranslations('studio.error')
  useEffect(() => {
    // Log error to monitoring service
    console.error('Studio dashboard error:', error)
  }, [error])

  return (
    <div className="flex flex-1 items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-destructive" />
            <CardTitle>{t('title')}</CardTitle>
          </div>
          <CardDescription>
            {t('description')}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {process.env.NODE_ENV === 'development' && (
            <div className="rounded-md bg-muted p-3 text-sm">
              <p className="font-medium">{t('errorDetails')}</p>
              <p className="mt-1 text-muted-foreground">{error.message}</p>
            </div>
          )}
          <Button onClick={reset} className="w-full">
            {t('tryAgain')}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
