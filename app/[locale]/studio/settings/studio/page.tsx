import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { StudioForm } from '@/components/dashboard/StudioForm'
import { getStudioByOwnerId } from '@/lib/data/studios'

export default async function StudioSettingsPage() {
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
        <h1 className="text-3xl font-bold">Studio Settings</h1>
        <p className="text-muted-foreground">
          {studio
            ? 'Manage your studio profile and information'
            : 'Set up your studio profile to start taking bookings'}
        </p>
      </div>
      <StudioForm studio={studio} />
    </div>
  )
}
