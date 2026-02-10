import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getStudioAndRoleForUser } from '@/lib/data/studios'
import { getFullTeamWithEmails } from '@/lib/data/studio-team'
import { TeamClient } from './TeamClient'

export default async function TeamSettingsPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    notFound()
  }

  const { studio, role } = await getStudioAndRoleForUser(user.id)
  if (!studio || role !== 'owner') {
    notFound()
  }

  const teamRows = await getFullTeamWithEmails(studio.id, user.id)

  return (
    <TeamClient
      studioId={studio.id}
      currentUserId={user.id}
      teamRows={teamRows}
    />
  )
}
