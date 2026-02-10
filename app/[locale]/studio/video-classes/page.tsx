import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getStudioAndRoleForUser } from '@/lib/data/studios'
import { getVideoClassesByStudioId } from '@/lib/data/video-classes'
import { VideoClassesClient } from './VideoClassesClient'

export default async function StudioVideoClassesPage() {
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

  const videoClasses = await getVideoClassesByStudioId(studio.id)

  return <VideoClassesClient videoClasses={videoClasses} />
}
