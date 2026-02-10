import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { ScheduleClient } from './ScheduleClient'
import { getStudioAndRoleForUser } from '@/lib/data/studios'
import { getStudioInstructorOptions } from '@/lib/data/studio-team'
import { getActiveClassesByStudioId, getClassIdsByStudioId } from '@/lib/data/classes'
import { getUpcomingClassInstances } from '@/lib/data/class-instances'

export default async function SchedulePage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    notFound()
  }

  const { studio, role } = await getStudioAndRoleForUser(user.id)
  if (!studio) {
    notFound()
  }

  const canEditSchedule = role === 'owner' || role === 'manager'

  const [classes, classIds, instructors] = await Promise.all([
    getActiveClassesByStudioId(studio.id),
    getClassIdsByStudioId(studio.id),
    getStudioInstructorOptions(studio.id),
  ])

  const instances = await getUpcomingClassInstances(classIds)

  return (
    <ScheduleClient
      instances={instances}
      classes={classes}
      instructors={instructors}
      canEditSchedule={canEditSchedule}
    />
  )
}
