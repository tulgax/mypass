import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getStudioAndRoleForUser } from '@/lib/data/studios'
import { getFullTeamWithEmails } from '@/lib/data/studio-team'
import { getInstructorStatsByStudioId } from '@/lib/data/instructors'
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
  if (!studio || (role !== 'owner' && role !== 'manager')) {
    notFound()
  }

  const [teamRows, instructorStats] = await Promise.all([
    getFullTeamWithEmails(studio.id, user.id),
    getInstructorStatsByStudioId(studio.id),
  ])

  // Build a map of instructor stats by user_id
  const statsMap: Record<string, { classesTaught: number; hoursTaught: number }> = {}
  for (const stat of instructorStats) {
    statsMap[stat.user_id] = {
      classesTaught: stat.classes_taught_count,
      hoursTaught: stat.hours_taught,
    }
  }

  return (
    <TeamClient
      studioId={studio.id}
      currentUserId={user.id}
      teamRows={teamRows}
      instructorStatsMap={statsMap}
      canManageTeam={role === 'owner'}
    />
  )
}
