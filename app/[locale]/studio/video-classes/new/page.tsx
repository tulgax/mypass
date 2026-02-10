import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getStudioAndRoleForUser } from '@/lib/data/studios'
import { getStudioInstructorOptions } from '@/lib/data/studio-team'
import { VideoClassWizard } from '../_components/VideoClassWizard'

export default async function NewVideoClassPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) notFound()

  const { studio, role } = await getStudioAndRoleForUser(user.id)
  if (!studio || (role !== 'owner' && role !== 'manager')) {
    notFound()
  }

  const instructors = await getStudioInstructorOptions(studio.id)

  return <VideoClassWizard instructors={instructors} />
}
