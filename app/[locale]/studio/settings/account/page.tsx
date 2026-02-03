import { notFound } from 'next/navigation'
import { getTranslations } from 'next-intl/server'
import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default async function AccountSettingsPage() {
  const t = await getTranslations('studio.settings.account')
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    notFound()
  }

  const { data: profile } = await supabase
    .from('user_profiles')
    .select('full_name, avatar_url')
    .eq('id', user.id)
    .single()

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">{t('title')}</h1>
        <p className="text-muted-foreground">{t('subtitle')}</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t('profileInfo')}</CardTitle>
          <CardDescription>{t('updateDetails')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">{t('fullName')}</Label>
            <Input id="name" defaultValue={profile?.full_name || ''} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">{t('email')}</Label>
            <Input id="email" type="email" defaultValue={user.email || ''} disabled />
          </div>
          <Button>{t('saveChanges')}</Button>
        </CardContent>
      </Card>
    </div>
  )
}
