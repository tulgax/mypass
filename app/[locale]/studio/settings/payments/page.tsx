import { notFound } from 'next/navigation'
import { getTranslations } from 'next-intl/server'
import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export default async function PaymentsSettingsPage() {
  const t = await getTranslations('studio.settings.payments')
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    notFound()
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">{t('title')}</h1>
        <p className="text-muted-foreground">{t('subtitle')}</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t('paymentMethods')}</CardTitle>
          <CardDescription>{t('addRemove')}</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4">{t('noMethods')}</p>
          <Button>{t('addMethod')}</Button>
        </CardContent>
      </Card>
    </div>
  )
}
