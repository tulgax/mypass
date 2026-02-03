import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { CheckInClient } from './CheckInClient'
import { getStudioBasicInfo } from '@/lib/data/studios'

export default async function CheckInPage({
  searchParams,
}: {
  searchParams: Promise<{ id?: string }>
}) {
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

  const params = await searchParams
  const initialMembershipId = params.id ?? undefined

  return (
    <CheckInClient
      studioId={studio.id}
      initialMembershipId={initialMembershipId}
    />
  )
}
