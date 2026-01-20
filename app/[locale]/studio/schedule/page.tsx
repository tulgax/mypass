import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { ScheduleClient } from './ScheduleClient'
import { getStudioBasicInfo } from '@/lib/data/studios'
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

  const studio = await getStudioBasicInfo(user.id)

  if (!studio) {
    notFound()
  }

  // Parallel fetch classes and instances
  const [classes, classIds] = await Promise.all([
    getActiveClassesByStudioId(studio.id),
    getClassIdsByStudioId(studio.id),
  ])

  const instances = await getUpcomingClassInstances(classIds)

  return <ScheduleClient instances={instances} classes={classes} />
}
