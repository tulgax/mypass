import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { CheckInClient } from './CheckInClient'
import { getStudioBasicInfo } from '@/lib/data/studios'

export default async function CheckInPage() {
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

  return <CheckInClient studioId={studio.id} />
}
