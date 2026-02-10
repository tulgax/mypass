import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getStudioAndRoleForUser } from '@/lib/data/studios'
import { getStudioInstructorOptions } from '@/lib/data/studio-team'
import { getVideoClassById } from '@/lib/data/video-classes'
import { VideoClassWizard } from '../../_components/VideoClassWizard'

export default async function EditVideoClassPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id: idParam } = await params
  const id = Number(idParam)
  if (!Number.isFinite(id)) notFound()

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) notFound()

  const { studio, role } = await getStudioAndRoleForUser(user.id)
  if (!studio || (role !== 'owner' && role !== 'manager')) {
    notFound()
  }

  const videoClass = await getVideoClassById(id)
  if (!videoClass || videoClass.studio_id !== studio.id) {
    notFound()
  }

  const instructors = await getStudioInstructorOptions(studio.id)

  return <VideoClassWizard instructors={instructors} initial={videoClass} />
}
