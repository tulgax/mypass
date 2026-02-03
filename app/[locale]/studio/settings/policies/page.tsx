import { notFound } from 'next/navigation'
import { getTranslations } from 'next-intl/server'
import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'

export default async function PoliciesSettingsPage() {
  const t = await getTranslations('studio.settings.policies')
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
          <CardTitle>{t('cancellationPolicy')}</CardTitle>
          <CardDescription>{t('setPolicies')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="cancellation">{t('cancellationPolicy')}</Label>
            <Textarea id="cancellation" placeholder={t('enterPolicy')} rows={6} />
          </div>
          <Button>{t('savePolicy')}</Button>
        </CardContent>
      </Card>
    </div>
  )
}
