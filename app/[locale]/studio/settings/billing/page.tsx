import { notFound } from 'next/navigation'
import { getTranslations } from 'next-intl/server'
import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

export default async function BillingSettingsPage() {
  const t = await getTranslations('studio.settings.billing')
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
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>{t('currentPlan')}</CardTitle>
              <CardDescription>{t('activeSubscription')}</CardDescription>
            </div>
            <Badge>{t('freeTrial')}</Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-sm text-muted-foreground">{t('planExpires', { days: 12 })}</p>
          </div>
          <Button>{t('upgradePlan')}</Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t('billingHistory')}</CardTitle>
          <CardDescription>{t('viewInvoices')}</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">{t('noHistory')}</p>
        </CardContent>
      </Card>
    </div>
  )
}
