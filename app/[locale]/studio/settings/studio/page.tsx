import { redirect } from 'next/navigation'
import { getTranslations } from 'next-intl/server'
import { createClient } from '@/lib/supabase/server'
import { StudioForm } from '@/components/dashboard/StudioForm'
import { getStudioByOwnerId } from '@/lib/data/studios'

export default async function StudioSettingsPage() {
  const t = await getTranslations('studio.settings.studio')
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/signin')
  }

  // Fetch existing studio if it exists
  const studio = await getStudioByOwnerId(user.id)

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">{t('title')}</h1>
        <p className="text-muted-foreground">
          {studio
            ? t('subtitle')
            : t('subtitleNew')}
        </p>
      </div>
      <StudioForm studio={studio} />
    </div>
  )
}
